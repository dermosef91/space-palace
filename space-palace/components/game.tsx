"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useAnimate } from "framer-motion"
import { shuffle } from "@/lib/utils"
import {
  sortCardsByRank,
  CARD_VALUES,
  SPECIAL_CARDS,
  canPlayCard as checkCanPlayCard,
  generateCardId,
} from "@/lib/game-utils"
import { computerTurn, playComputerLowestCard } from "@/lib/computer-ai"
import type { CardType, Suit, Rank, GameState, PlayerType } from "@/types/game-types"
import Card from "@/components/card"
import PlayerHand from "@/components/player-hand"
import ComputerHand from "@/components/computer-hand"
import Pile from "@/components/pile"
import WinCelebration from "@/components/win-celebration"
import Tutorial from "@/components/tutorial"
import VHSOverlay from "@/components/vhs-overlay"
import DevToolsToggle from "@/components/dev-tools-toggle"
import CardDescription from "@/components/card-description"

// Add imports for round-based gameplay
import { opponents, type OpponentCharacter } from "@/lib/opponents"
import RoundIntro from "@/components/round-intro"
import RoundTracker from "@/components/round-tracker"

export type { Suit, Rank, CardType }

export default function Game() {
  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================

  // Card collections
  const [deck, setDeck] = useState<CardType[]>([])
  const [playerHand, setPlayerHand] = useState<CardType[]>([])
  const [playerFaceDown, setPlayerFaceDown] = useState<CardType[]>([])
  const [playerFaceUp, setPlayerFaceUp] = useState<CardType[]>([])
  const [computerHand, setComputerHand] = useState<CardType[]>([])
  const [computerFaceDown, setComputerFaceDown] = useState<CardType[]>([])
  const [computerFaceUp, setComputerFaceUp] = useState<CardType[]>([])
  const [pile, setPile] = useState<CardType[]>([])
  const [burnedCards, setBurnedCards] = useState<CardType[]>([]) // Cards removed from game (for 2s, etc.)

  // Add these new state variables for round-based gameplay
  const [currentRound, setCurrentRound] = useState<number>(1)
  const [showRoundIntro, setShowRoundIntro] = useState<boolean>(true)
  const [currentOpponent, setCurrentOpponent] = useState<OpponentCharacter>(opponents[0])
  const [totalRounds] = useState<number>(5)

  // Game state
  const [currentPlayer, setCurrentPlayer] = useState<PlayerType>("player")
  const [gameState, setGameState] = useState<GameState>("setup")
  const [message, setMessage] = useState<string>("Game starting...")
  const [winner, setWinner] = useState<PlayerType | null>(null)
  const [showTutorial, setShowTutorial] = useState<boolean>(true)

  // Glitch effect state
  const [glitchActive, setGlitchActive] = useState<boolean>(false)
  const [scope, animate] = useAnimate()

  // Card selection for swapping
  const [selectedHandCard, setSelectedHandCard] = useState<CardType | null>(null)
  const [selectedFaceUpCard, setSelectedFaceUpCard] = useState<CardType | null>(null)
  const [computerPlayedAce, setComputerPlayedAce] = useState<boolean>(false) // Track if computer played an ace
  // Add a new state for the hovered card
  const [hoveredCard, setHoveredCard] = useState<CardType | null>(null)

  // Add state for showing computer cards (for debugging)
  const [showComputerCards, setShowComputerCards] = useState<boolean>(false)

  // Add state for previewing win/lose screens
  const [previewWinner, setPreviewWinner] = useState<PlayerType | null>(null)

  const [drawAnimation, setDrawAnimation] = useState<boolean>(false)

  // Add state for revealing face down cards
  const [revealingFaceDownCard, setRevealingFaceDownCard] = useState<CardType | null>(null)
  const [revealingCardPosition, setRevealingCardPosition] = useState<{ top: number; left: number } | null>(null)

  // =========================================================================
  // REFS FOR MANAGING ASYNC OPERATIONS
  // =========================================================================

  // Ref to track if a special card action is in progress
  const specialCardActionInProgress = useRef(false)

  // Ref to track if a draw operation is in progress
  const drawInProgress = useRef(false)

  // Ref to track if the computer's turn is in progress
  const computerTurnInProgress = useRef(false)

  // =========================================================================
  // EFFECTS
  // =========================================================================

  // Modify the useEffect for game initialization to handle rounds
  useEffect(() => {
    if (gameState === "setup" && !showTutorial && !showRoundIntro) {
      initializeGame()
    }
  }, [gameState, showTutorial, showRoundIntro])

  // Add an initialization effect for first load
  useEffect(() => {
    // On initial load, set up the first round
    startNewRound()
  }, [])

  // Computer's turn - Modified to use the extracted AI module
  useEffect(() => {
    if (
      currentPlayer === "computer" &&
      gameState === "playing" &&
      !specialCardActionInProgress.current &&
      !computerTurnInProgress.current &&
      !revealingFaceDownCard // Don't start computer's turn if we're revealing a card
    ) {
      computerTurnInProgress.current = true
      const timeoutId = setTimeout(() => {
        // Create the game state object for the AI
        const gameStateForAI = {
          computerHand,
          computerFaceUp,
          computerFaceDown,
          pile,
          deck,
        }

        // Create the callbacks object for the AI
        const aiCallbacks = {
          setComputerHand,
          setComputerFaceUp,
          setComputerFaceDown,
          setPile,
          setDeck,
          setBurnedCards,
          setMessage,
          setGlitchActive,
          endTurn,
          setWinner,
          setGameState,
          revealComputerFaceDownCard,
        }

        // Call the extracted computerTurn function
        computerTurn(gameStateForAI, aiCallbacks, specialCardActionInProgress, computerTurnInProgress)
      }, 1000)

      // Add a safety timeout to reset flags if something goes wrong
      const safetyTimeoutId = setTimeout(() => {
        if (computerTurnInProgress.current) {
          console.log("Safety timeout triggered - resetting flags")
          computerTurnInProgress.current = false
          specialCardActionInProgress.current = false
        }
      }, 5000)

      return () => {
        clearTimeout(timeoutId)
        clearTimeout(safetyTimeoutId)
        computerTurnInProgress.current = false
      }
    }
  }, [currentPlayer, gameState, computerHand, computerFaceUp, computerFaceDown, pile, deck, revealingFaceDownCard])

  // Add this new function above the useEffect
  const autoDrawCards = (player: PlayerType) => {
    const currentHand = player === "player" ? playerHand : computerHand

    // Check if player has less than 3 cards and there are cards in the deck
    // AND ensure we're not already in the middle of a draw operation
    if (currentHand.length < 3 && deck.length > 0 && !drawInProgress.current) {
      // Set flag to prevent multiple draws
      drawInProgress.current = true

      // Trigger draw animation
      triggerDrawAnimation()

      // Draw cards
      const cardsNeeded = 3 - currentHand.length
      const cardsToDraw = Math.min(cardsNeeded, deck.length)
      const drawnCards = deck.slice(0, cardsToDraw)
      const newDeck = deck.slice(cardsToDraw)

      // Update the appropriate hand
      if (player === "player") {
        setPlayerHand((prevHand) => {
          // Only draw if we still need cards (double-check)
          if (prevHand.length < 3) {
            setDeck(newDeck)
            // Don't show "Drew cards" message, will be overridden by turn message
            return sortCardsByRank([...prevHand, ...drawnCards])
          }
          return prevHand
        })
      } else {
        setComputerHand((prevHand) => {
          // Only draw if we still need cards (double-check)
          if (prevHand.length < 3) {
            setDeck(newDeck)
            return [...prevHand, ...drawnCards]
          }
          return prevHand
        })
      }

      // Reset the flag after a short delay to allow state to settle
      setTimeout(() => {
        drawInProgress.current = false
      }, 100)
    }
  }

  // Auto-draw cards for player when hand is low
  useEffect(() => {
    // Only check if it's the player's turn and we're in playing state
    if (gameState === "playing") {
      if (currentPlayer === "player") {
        autoDrawCards("player")
      }
    }
  }, [currentPlayer, gameState, playerHand.length, deck.length])

  // Add this new useEffect after the player auto-draw useEffect
  // Auto-draw cards for computer at the end of its turn
  useEffect(() => {
    // Only check after the computer's turn has ended and we're in playing state
    if (
      currentPlayer === "player" && // Computer's turn just ended
      gameState === "playing" &&
      !computerTurnInProgress.current &&
      !specialCardActionInProgress.current
    ) {
      // Use a small timeout to ensure all state updates from the computer's turn have settled
      const timeoutId = setTimeout(() => {
        autoDrawCards("computer")
      }, 300)

      return () => clearTimeout(timeoutId)
    }
  }, [currentPlayer, gameState, computerHand.length, deck.length])

  useEffect(() => {
    // Scroll to player's hand when game starts or when swapping phase begins
    if (gameState === "swapping" && !showTutorial) {
      // Use a small timeout to ensure the DOM has updated
      const timeoutId = setTimeout(() => {
        // Find the player's hand area and scroll to it
        const playerArea = document.querySelector(".player-area")
        if (playerArea) {
          playerArea.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 300)

      return () => clearTimeout(timeoutId)
    }
  }, [gameState, showTutorial])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up any pending timers when component unmounts
      specialCardActionInProgress.current = false
      computerTurnInProgress.current = false
    }
  }, [])

  // =========================================================================
  // GAME INITIALIZATION
  // =========================================================================

  /**
   * Start a new round
   */
  const startNewRound = (roundNumber?: number) => {
    // Use the provided roundNumber if available, otherwise use currentRound
    const round = roundNumber !== undefined ? roundNumber : currentRound

    // Set the current opponent based on the round
    setCurrentOpponent(opponents[round - 1])

    // Show the round intro
    setShowRoundIntro(true)

    // Reset game state for new round
    setGameState("setup")
    setWinner(null)
    setPreviewWinner(null)
    setMessage("Round starting...")
  }

  /**
   * Advance to the next round after winning
   */
  const nextRound = () => {
    // Calculate the new round number
    const newRound = currentRound + 1

    // Update the round state
    setCurrentRound(newRound)

    // Start the new round with the new round number
    startNewRound(newRound)
  }

  /**
   * Initialize the game - Create deck, deal cards, and set up initial state
   */
  const initializeGame = () => {
    // Create and shuffle the deck
    const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"]
    const ranks: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "j", "q", "k", "a"]

    const newDeck: CardType[] = []

    // Create cards with unique IDs
    let cardIndex = 0
    for (const suit of suits) {
      for (const rank of ranks) {
        newDeck.push({
          id: generateCardId(suit, rank, cardIndex++),
          suit,
          rank,
          value: CARD_VALUES[rank],
          faceUp: false,
        })
      }
    }

    // Add the special glitch card with round-specific probability
    const glitchCardProbability =
      currentRound === 1
        ? 0
        : currentRound === 2
          ? 0
          : currentRound === 3
            ? 0
            : currentRound === 4
              ? 0
              : currentRound === 5
                ? 0.1
                : 0

    if (Math.random() < glitchCardProbability) {
      newDeck.push({
        id: generateCardId("spades", "glitch", cardIndex++),
        suit: "spades",
        rank: "glitch",
        value: CARD_VALUES["glitch"],
        faceUp: false,
      })
      console.log(`Glitch card added to the deck! (${glitchCardProbability * 100}% chance in round ${currentRound})`)
    }

    // Add the black hole card with round-specific probability
    const blackHoleProbability =
      currentRound === 1
        ? 0
        : currentRound === 2
          ? 0.1
          : currentRound === 3
            ? 0.2
            : currentRound === 4
              ? 0.3
              : currentRound === 5
                ? 0.4
                : 0

    if (Math.random() < blackHoleProbability) {
      newDeck.push({
        id: generateCardId("special", "black-hole", cardIndex++),
        suit: "special",
        rank: "black-hole",
        value: CARD_VALUES["black-hole"],
        faceUp: false,
      })
      console.log(`Black Hole card added to the deck! (${blackHoleProbability * 100}% chance in round ${currentRound})`)
    }

    // After the black hole card probability section, add the following code:

    // Add the wormhole card with round-specific probability
    const wormholeProbability =
      currentRound === 1
        ? 0
        : currentRound === 2
          ? 0.2
          : currentRound === 3
            ? 0.2
            : currentRound === 4
              ? 0.3
              : currentRound === 5
                ? 0.4
                : 0

    if (Math.random() < wormholeProbability) {
      newDeck.push({
        id: generateCardId("special", "wormhole", cardIndex++),
        suit: "special",
        rank: "wormhole",
        value: CARD_VALUES["wormhole"],
        faceUp: false,
      })
      console.log(`Wormhole card added to the deck! (${wormholeProbability * 100}% chance in round ${currentRound})`)
    }

    // Add the supernova card with round-specific probability
    const supernovaProbability =
      currentRound === 1
        ? 0
        : currentRound === 2
          ? 0.1
          : currentRound === 3
            ? 0.2
            : currentRound === 4
              ? 0.3
              : currentRound === 5
                ? 0.4
                : 0

    if (Math.random() < supernovaProbability) {
      newDeck.push({
        id: generateCardId("special", "supernova", cardIndex++),
        suit: "special",
        rank: "supernova",
        value: CARD_VALUES["supernova"],
        faceUp: false,
      })
      console.log(`Supernova card added to the deck! (${supernovaProbability * 100}% chance in round ${currentRound})`)
    }

    // Add the asteroid field card with round-specific probability
    const asteroidFieldProbability =
      currentRound === 1
        ? 0
        : currentRound === 2
          ? 0.2
          : currentRound === 3
            ? 0.3
            : currentRound === 4
              ? 0.4
              : currentRound === 5
                ? 0.5
                : 0

    if (Math.random() < asteroidFieldProbability) {
      newDeck.push({
        id: generateCardId("special", "asteroid-field", cardIndex++),
        suit: "special",
        rank: "asteroid-field",
        value: CARD_VALUES["asteroid-field"],
        faceUp: false,
      })
      console.log(
        `Asteroid Field card added to the deck! (${asteroidFieldProbability * 100}% chance in round ${currentRound})`,
      )
    }

    const shuffledDeck = shuffle([...newDeck])

    // Remove 15 random cards to make the game shorter
    const removedCards = shuffledDeck.splice(0, 15)
    console.log(`Removed ${removedCards.length} cards to make the game shorter`)

    // Deal cards
    const newPlayerHand = shuffledDeck.splice(0, 3)
    const newPlayerFaceDown = shuffledDeck.splice(0, 3)
    const newPlayerFaceUp = shuffledDeck.splice(0, 3).map((card) => ({ ...card, faceUp: true }))

    const newComputerHand = shuffledDeck.splice(0, 3)
    const newComputerFaceDown = shuffledDeck.splice(0, 3)
    const newComputerFaceUp = shuffledDeck.splice(0, 3).map((card) => ({ ...card, faceUp: true }))

    // Sort hands by value
    const sortedPlayerHand = sortCardsByRank(newPlayerHand)
    const sortedComputerHand = sortCardsByRank(newComputerHand)

    // Set initial game state
    setDeck(shuffledDeck)
    setPlayerHand(sortedPlayerHand.map((card) => ({ ...card, faceUp: true }))) // Make hand cards face up
    setPlayerFaceDown(newPlayerFaceDown)
    setPlayerFaceUp(newPlayerFaceUp)
    setComputerHand(sortedComputerHand.map((card) => ({ ...card, faceUp: true }))) // Make computer hand cards face up too (for internal logic)
    setComputerFaceDown(newComputerFaceDown)
    setComputerFaceUp(newComputerFaceUp)
    setPile([])
    setBurnedCards([])
    setComputerPlayedAce(false)
    specialCardActionInProgress.current = false
    computerTurnInProgress.current = false

    // In the real game, players can swap cards between hand and face-up
    setGameState("swapping")
    setMessage(
      "Swap your hand cards with the cards in your Palace area. Place your strongest cards in your Palace area for later.",
    )
    setSelectedHandCard(null)
    setSelectedFaceUpCard(null)

    // Computer swaps its cards strategically - NEW STRATEGY
    // Put special cards and high value cards in face-up position
    const computerSwappedHand = [...sortedComputerHand]
    const computerSwappedFaceUp = [...newComputerFaceUp]

    // Define which cards are considered "best" (special cards and high ranks)
    const isBestCard = (card: CardType) => {
      // Special cards (2, 3, A)
      if (card.rank === "2" || card.rank === "3" || card.rank === "a") {
        return true
      }
      // High value cards (J, Q, K)
      if (card.rank === "j" || card.rank === "q" || card.rank === "k") {
        return true
      }
      // Glitch card
      if (card.rank === "glitch") {
        return true
      }
      return false
    }

    // First, identify best cards in hand
    const bestCardsInHand = computerSwappedHand.filter(isBestCard)
    const normalCardsInHand = computerSwappedHand.filter((card) => !isBestCard(card))

    // Identify best cards in face-up
    const bestCardsInFaceUp = computerSwappedFaceUp.filter(isBestCard)
    const normalCardsInFaceUp = computerSwappedFaceUp.filter((card) => !isBestCard(card))

    // Create new arrays for the swapped cards
    let newHand: CardType[] = []
    let newFaceUp: CardType[] = []

    // Put best cards from hand into face-up
    newFaceUp = [...bestCardsInFaceUp, ...bestCardsInHand]
    // Put normal cards into hand
    newHand = [...normalCardsInHand, ...normalCardsInFaceUp]

    // If we have too many face-up cards, move the lowest value ones to hand
    while (newFaceUp.length > 3) {
      // Sort by value and move the lowest value card to hand
      newFaceUp.sort((a, b) => a.value - b.value)
      newHand.push(newFaceUp.shift()!)
    }

    // If we have too many hand cards, move the highest value ones to face-up
    while (newHand.length > 3) {
      // Sort by value and move the highest value card to face-up
      newHand.sort((a, b) => b.value - a.value)
      newFaceUp.push(newHand.shift()!)
    }

    // Ensure we have exactly 3 cards in each
    while (newHand.length < 3 && newFaceUp.length > 3) {
      newHand.push(newFaceUp.pop()!)
    }
    while (newFaceUp.length < 3 && newHand.length > 3) {
      newFaceUp.push(newHand.pop()!)
    }

    // Ensure all face-up cards have faceUp=true
    const finalComputerHand = newHand.map((card) => ({ ...card, faceUp: true }))
    const finalComputerFaceUp = newFaceUp.map((card) => ({ ...card, faceUp: true }))

    setComputerHand(finalComputerHand)
    setComputerFaceUp(finalComputerFaceUp)
  }

  // =========================================================================
  // TUTORIAL HANDLING
  // =========================================================================

  /**
   * Close the tutorial and start the game
   */
  const closeTutorial = () => {
    setShowTutorial(false)
  }

  // =========================================================================
  // CARD SWAPPING DURING SETUP
  // =========================================================================

  /**
   * Handle swapping cards between hand and face-up during setup phase
   */
  const handleCardSwap = (card: CardType, type: "hand" | "faceUp") => {
    if (gameState !== "swapping") return

    if (type === "hand") {
      setSelectedHandCard(selectedHandCard?.id === card.id ? null : card)
    } else {
      setSelectedFaceUpCard(selectedFaceUpCard?.id === card.id ? null : card)
    }

    // If both a hand card and face-up card are selected, swap them
    if ((type === "hand" && selectedFaceUpCard) || (type === "faceUp" && selectedHandCard)) {
      const handCardToSwap = type === "hand" ? card : selectedHandCard!
      const faceUpCardToSwap = type === "faceUp" ? card : selectedFaceUpCard!

      // Update hand and face-up cards
      const newHand = playerHand.map((c) => (c.id === handCardToSwap.id ? { ...faceUpCardToSwap, faceUp: true } : c))
      const newFaceUp = playerFaceUp.map((c) =>
        c.id === faceUpCardToSwap.id ? { ...handCardToSwap, faceUp: true } : c,
      )

      // Sort the hand cards by rank
      const sortedHand = sortCardsByRank(newHand)

      // Update state with sorted hand
      setPlayerHand(sortedHand)
      setPlayerFaceUp(newFaceUp)

      // Reset selections
      setSelectedHandCard(null)
      setSelectedFaceUpCard(null)
    }
  }

  /**
   * Finish swapping phase and start the game
   */
  const finishSwapping = () => {
    // Clear any remaining card selections
    setSelectedHandCard(null)
    setSelectedFaceUpCard(null)

    // Update game state
    setGameState("playing")
    setMessage("Your turn - play any card to start")
  }

  // =========================================================================
  // PLAYER CARD PLAYING LOGIC
  // =========================================================================

  /**
   * Play cards from player's hand
   * Handles multiple cards of the same rank
   */
  const playCards = (cards: CardType[]) => {
    if (currentPlayer !== "player" || gameState !== "playing" || cards.length === 0) return

    // All cards must be of the same rank to play multiple
    const firstRank = cards[0].rank
    if (!cards.every((card) => card.rank === firstRank)) {
      setMessage("Can only play multiple cards of the same rank")
      return
    }

    // Check if the first card can be played (all have same rank, so if one can be played, all can)
    if (canPlayCard(cards[0])) {
      // Remove the played cards from hand
      const newHand = playerHand.filter((c) => !cards.some((card) => card.id === c.id))

      // For aces, don't add to pile (they go straight to burned)
      if (firstRank === "a") {
        setPlayerHand(newHand)
        // Handle each ace individually
        cards.forEach((card, index) => {
          // Add a small delay between each ace to make it more visible
          setTimeout(() => {
            handleSpecialCard(card, index === cards.length - 1)
          }, index * 300)
        })
      } else if (firstRank === "glitch") {
        // Handle glitch card - trigger screen shake and activate glitch effect
        setPlayerHand(newHand)

        // Add card to pile
        addCardToPile(cards[0])

        // Activate the global glitch effect
        setGlitchActive(true)

        // Set message
        setMessage("Glitch card played - reality distorted!")

        // Handle like a 3 (special card)
        handleSpecialCard(cards[0])
      } else if (firstRank === "black-hole") {
        // Remove the black hole card from hand
        setPlayerHand(newHand)

        // Handle black hole effects
        handleBlackHoleCard(cards[0])
      } else if (firstRank === "wormhole") {
        // Remove the wormhole card from hand
        setPlayerHand(newHand)
        // Handle wormhole effects
        handleWormholeCard(cards[0])
      } else if (firstRank === "supernova") {
        // Remove the supernova card from hand
        setPlayerHand(newHand)
        // Handle supernova effects
        handleSupernovaCard(cards[0])
      } else if (firstRank === "asteroid-field") {
        // Remove the asteroid field card from hand
        setPlayerHand(newHand)
        // Handle asteroid field effects
        handleAsteroidFieldCard(cards[0])
      } else {
        // Add cards to the pile
        cards.forEach((card) => addCardToPile(card))
        setPlayerHand(newHand)

        // NEW RULE: If four cards of the same rank are played, burn the pile
        if (cards.length === 4) {
          // Set a message
          setMessage(`Four ${firstRank}s played - pile burned!`)

          // Move the pile to burned cards (after a short delay to show the cards being played)
          setTimeout(() => {
            setBurnedCards((prev) => [...prev, ...pile])
            setPile([])
          }, 1000)
        }
        // Check if special card (except aces which were handled above)
        else if (SPECIAL_CARDS[firstRank] && firstRank !== "a") {
          handleSpecialCard(cards[0])
        } else {
          // Check if player hand is empty and needs to draw
          if (newHand.length < 3 && deck.length > 0) {
            drawCards("player", 3 - newHand.length)
          } else {
            endTurn()
          }
        }
      }

      // Check for win condition
      if (newHand.length === 0 && playerFaceUp.length === 0 && playerFaceDown.length === 0) {
        setWinner("player")
        setGameState("gameOver")
        setMessage(currentRound === totalRounds ? "You've won the game!" : "Round complete!")
      }
    } else {
      setMessage("Can't play that card")
    }
  }

  /**
   * Play cards from player's face up cards
   * Handles multiple cards of the same rank
   */
  const playFaceUpCards = (cards: CardType[]) => {
    console.log(
      "playFaceUpCards called with:",
      cards.map((c) => `${c.rank}-${c.suit}`),
    )
    console.log(
      "Current playerFaceUp:",
      playerFaceUp.map((c) => `${c.rank}-${c.suit}`),
    )

    if (
      currentPlayer !== "player" ||
      gameState !== "playing" ||
      (playerHand.length > 0 && deck.length === 0) ||
      cards.length === 0
    )
      return

    // All cards must be of the same rank to play multiple
    const firstRank = cards[0].rank
    if (!cards.every((card) => card.rank === firstRank)) {
      setMessage("Can only play multiple cards of the same rank")
      return
    }

    // Check if the first card can be played (all have same rank, so if one can be played, all can)
    if (canPlayCard(cards[0])) {
      // Remove the played cards from face up
      const newFaceUp = playerFaceUp.filter((c) => !cards.some((card) => card.id === c.id))
      console.log(
        "New face up after filtering:",
        newFaceUp.map((c) => `${c.rank}-${c.suit}`),
      )

      // For aces, don't add to pile (they go straight to burned)
      if (firstRank === "a") {
        setPlayerFaceUp(newFaceUp)
        // Handle each ace individually
        cards.forEach((card, index) => {
          // Add a small delay between each ace to make it more visible
          setTimeout(() => {
            handleSpecialCard(card, index === cards.length - 1)
          }, index * 300)
        })
      } else if (firstRank === "glitch") {
        // Handle glitch card - trigger screen shake and activate glitch effect
        setPlayerFaceUp(newFaceUp)

        // Add card to pile
        addCardToPile(cards[0])

        // Activate the global glitch effect
        setGlitchActive(true)

        // Set message
        setMessage("Glitch card played - reality distorted!")

        // Handle like a 3 (special card)
        handleSpecialCard(cards[0])
      } else if (firstRank === "black-hole") {
        // Remove the black hole card from face up
        setPlayerFaceUp(newFaceUp)

        // Handle black hole effects
        handleBlackHoleCard(cards[0])
      } else if (firstRank === "wormhole") {
        // Remove the wormhole card from face up
        setPlayerFaceUp(newFaceUp)
        // Handle wormhole effects
        handleWormholeCard(cards[0])
      } else if (firstRank === "supernova") {
        // Remove the supernova card from face up
        setPlayerFaceUp(newFaceUp)
        // Handle supernova effects
        handleSupernovaCard(cards[0])
      } else if (firstRank === "asteroid-field") {
        // Remove the asteroid field card from face up
        setPlayerFaceUp(newFaceUp)
        // Handle asteroid field effects
        handleAsteroidFieldCard(cards[0])
      } else {
        // Add cards to the pile
        cards.forEach((card) => addCardToPile(card))

        // Update the face up cards state
        setPlayerFaceUp(newFaceUp)
        console.log(
          "Setting playerFaceUp to:",
          newFaceUp.map((c) => `${c.rank}-${c.suit}`),
        )

        // NEW RULE: If four cards of the same rank are played, burn the pile
        if (cards.length === 4) {
          // Set a message
          setMessage(`Four ${firstRank}s played - pile burned!`)

          // Move the pile to burned cards (after a short delay to show the cards being played)
          setTimeout(() => {
            setBurnedCards((prev) => [...prev, ...pile])
            setPile([])
          }, 1000)
        }
        // Check if special card (except aces which were handled above)
        else if (SPECIAL_CARDS[firstRank] && firstRank !== "a") {
          handleSpecialCard(cards[0])
        } else {
          endTurn()
        }
      }

      // Check for win condition
      if (newFaceUp.length === 0 && playerFaceDown.length === 0 && playerHand.length === 0) {
        setWinner("player")
        setGameState("gameOver")
        setMessage(currentRound === totalRounds ? "You've won the game!" : "Round complete!")
      }
    } else {
      setMessage("Can't play that card")
    }
  }

  /**
   * Function to reveal a face down card before playing it
   */
  const revealPlayerFaceDownCard = (card: CardType, cardElement: HTMLElement) => {
    // Get the position of the card element
    const rect = cardElement.getBoundingClientRect()
    const position = {
      top: rect.top,
      left: rect.left,
    }

    // Create a revealed version of the card
    const revealedCard = { ...card, faceUp: true }

    // Set the revealing card state
    setRevealingFaceDownCard(revealedCard)
    setRevealingCardPosition(position)

    // Set a message to show what card was revealed
    setMessage(`You revealed: ${getDisplayRank(revealedCard.rank)}`)

    // After a delay, process the card
    setTimeout(() => {
      // Clear the revealing card state
      setRevealingFaceDownCard(null)
      setRevealingCardPosition(null)

      // Now process the card
      processFaceDownCard(revealedCard)
    }, 1500) // Show the card for 1.5 seconds
  }

  /**
   * Function to reveal a computer face down card before playing it
   */
  const revealComputerFaceDownCard = (card: CardType, index: number) => {
    // Find the card element
    const cardElements = document.querySelectorAll(".computer-facedown-card")
    if (cardElements.length <= index) return

    const cardElement = cardElements[index] as HTMLElement
    if (!cardElement) return

    // Get the position of the card element
    const rect = cardElement.getBoundingClientRect()
    const position = {
      top: rect.top,
      left: rect.left,
    }

    // Create a revealed version of the card
    const revealedCard = { ...card, faceUp: true }

    // Set the revealing card state
    setRevealingFaceDownCard(revealedCard)
    setRevealingCardPosition(position)

    // Set a message to show what card was revealed
    setMessage(`Computer revealed: ${getDisplayRank(revealedCard.rank)}`)

    // Return a promise that resolves after the reveal animation
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Clear the revealing card state
        setRevealingFaceDownCard(null)
        setRevealingCardPosition(null)
        resolve()
      }, 1500) // Show the card for 1.5 seconds
    })
  }

  /**
   * Process a face down card after it has been revealed
   */
  const processFaceDownCard = (revealedCard: CardType) => {
    if (currentPlayer !== "player" || gameState !== "playing" || playerHand.length > 0 || playerFaceUp.length > 0)
      return

    // Remove the card from face down
    const newFaceDown = playerFaceDown.filter((c) => c.id !== revealedCard.id)

    if (canPlayCard(revealedCard)) {
      // For aces, don't add to pile (they go straight to burned)
      if (revealedCard.rank === "a") {
        setPlayerFaceDown(newFaceDown)
        handleSpecialCard(revealedCard)
      } else if (revealedCard.rank === "glitch") {
        // Handle glitch card - trigger screen shake and activate glitch effect
        setPlayerFaceDown(newFaceDown)

        // Add card to pile
        addCardToPile(revealedCard)

        // Activate the global glitch effect
        setGlitchActive(true)

        // Set message
        setMessage("Glitch card played - reality distorted!")

        // Handle like a 3 (special card)
        handleSpecialCard(revealedCard)
      } else if (revealedCard.rank === "black-hole") {
        // Remove the black hole card from face down
        setPlayerFaceDown(newFaceDown)

        // Handle black hole effects
        handleBlackHoleCard(revealedCard)
      } else if (revealedCard.rank === "wormhole") {
        // Remove the wormhole card from face down
        setPlayerFaceDown(newFaceDown)
        // Handle wormhole effects
        handleWormholeCard(revealedCard)
      } else if (revealedCard.rank === "supernova") {
        // Remove the supernova card from face down
        setPlayerFaceDown(newFaceDown)
        // Handle supernova effects
        handleSupernovaCard(revealedCard)
      } else if (revealedCard.rank === "asteroid-field") {
        // Remove the asteroid field card from face down
        setPlayerFaceDown(newFaceDown)
        // Handle asteroid field effects
        handleAsteroidFieldCard(revealedCard)
      } else {
        addCardToPile(revealedCard)
        setPlayerFaceDown(newFaceDown)

        // Check if special card (except aces which were handled above)
        if (SPECIAL_CARDS[revealedCard.rank] && revealedCard.rank !== "a") {
          handleSpecialCard(revealedCard)
        } else {
          endTurn()
        }
      }

      // Check for win condition
      if (newFaceDown.length === 0 && playerHand.length === 0) {
        setWinner("player")
        setGameState("gameOver")
        setMessage(currentRound === totalRounds ? "You've won the game!" : "Round complete!")
      }
    } else {
      // Player must pick up the pile
      setMessage("Can't play that card! Picking up pile")
      const newPlayerHand = sortCardsByRank([...playerHand, revealedCard, ...pile])
      setPlayerHand(newPlayerHand)
      setPlayerFaceDown(newFaceDown)
      setPile([])
      endTurn()
    }
  }

  /**
   * Play a card from player's face down cards
   */
  const playFaceDownCard = (card: CardType, cardElement: HTMLElement) => {
    if (currentPlayer !== "player" || gameState !== "playing" || playerHand.length > 0 || playerFaceUp.length > 0)
      return

    // First reveal the card
    revealPlayerFaceDownCard(card, cardElement)
  }

  /**
   * Trigger screen shake animation when glitch card is played
   */
  const triggerScreenShake = () => {
    // Use Framer Motion's animate function to create a screen shake effect
    animate(scope.current, { x: [0, -10, 12, -8, 6, -4, 2, -1, 0] }, { duration: 0.5, ease: "easeInOut" })
  }

  // =========================================================================
  // SHARED GAME FUNCTIONS
  // =========================================================================

  /**
   * Draw cards for a player
   */
  const drawCards = (player: PlayerType, count: number) => {
    if (deck.length === 0) {
      endTurn()
      return
    }

    // Check if player already has 3 or more cards
    if (player === "player" && playerHand.length >= 3) {
      endTurn()
      return
    }

    // Check if computer already has 3 or more cards
    if (player === "computer" && computerHand.length >= 3) {
      endTurn()
      return
    }

    // Trigger draw animation
    triggerDrawAnimation()

    const cardsToDraw = Math.min(count, deck.length)
    const drawnCards = deck.slice(0, cardsToDraw)
    const newDeck = deck.slice(cardsToDraw)

    if (player === "player") {
      setPlayerHand(sortCardsByRank([...playerHand, ...drawnCards]))
    } else {
      setComputerHand([...computerHand, ...drawnCards])
    }

    setDeck(newDeck)
    endTurn()
  }

  /**
   * Check if a card can be played on the current pile
   * Wrapper around the utility function
   */
  const canPlayCard = (card: CardType): boolean => {
    return checkCanPlayCard(card, pile)
  }

  /**
   * Handle special card effects
   * Updated to handle multiple aces
   */
  const handleSpecialCard = (card: CardType, isLastAce = true) => {
    // Set flag to prevent multiple triggers
    specialCardActionInProgress.current = true

    if (card.rank === "2") {
      // 2 removes all cards below it from the game
      setMessage("2 played - all cards below removed from the game!")
      // Move current pile (except the 2) to burned cards
      setBurnedCards((prev) => [...prev, ...pile])
      // Reset pile with just the 2
      setPile([{ ...card, faceUp: true }])
      // Move to next player's turn (2 doesn't give another turn)
      specialCardActionInProgress.current = false
      endTurn()
    } else if (card.rank === "3" || card.rank === "glitch") {
      // Check if the 3 is played on top of a 7
      if (card.rank === "3" && pile.length >= 1 && pile[pile.length - 1].rank === "7") {
        setMessage("3 played on 7 - next card must be LOWER than 7!")
      } else if (card.rank === "3") {
        if (pile.length >= 2) {
          const cardBelow = pile[pile.length - 2]
          setMessage(`3 played - takes value of ${getDisplayRank(cardBelow.rank)} below!`)
        } else {
          setMessage("3 played - takes value of card below!")
        }
      } else if (card.rank === "glitch") {
        if (pile.length >= 2) {
          const cardBelow = pile[pile.length - 2]
          setMessage(`Glitch card played - takes value of ${getDisplayRank(cardBelow.rank)} below!`)
        } else {
          setMessage("Glitch card played - reality distorted!")
        }
      }
      // 3 and glitch are transparent cards - no special action needed here
      // The canPlayCard logic handles their special properties
      specialCardActionInProgress.current = false
      endTurn()
    } else if (card.rank === "7") {
      setMessage("7 played - next card must be LOWER than 7!")
      // Next player must play a card lower than 7
      specialCardActionInProgress.current = false
      endTurn()
    } else if (card.rank === "a") {
      // A clears the pile and player gets another turn
      setMessage("Ace played - pile cleared!")

      // Move pile to burned cards and add the ace with a unique ID to avoid key conflicts
      const aceWithUniqueId = {
        ...card,
        id: `${card.id}-burned-${Date.now()}-${Math.random()}`, // Ensure truly unique ID
        faceUp: true,
      }

      // Add all cards to burned in a single update
      setBurnedCards((prev) => [...prev, ...pile, aceWithUniqueId])

      // Clear the pile
      setPile([])

      // Only reset the flag and show message if this is the last ace in a sequence
      if (isLastAce) {
        // Current player gets another turn
        if (currentPlayer === "player") {
          setTimeout(() => {
            setMessage("Your turn again!")
            specialCardActionInProgress.current = false
          }, 1000)
        } else {
          // This should never happen as computer aces are handled by handleComputerAce
          // But just in case, we'll handle it properly
          setTimeout(() => {
            setMessage("Computer's turn again!")
            specialCardActionInProgress.current = false

            // Create the game state object for the AI
            const gameStateForAI = {
              computerHand,
              computerFaceUp,
              computerFaceDown,
              pile,
              deck,
            }

            // Create the callbacks object for the AI
            const aiCallbacks = {
              setComputerHand,
              setComputerFaceUp,
              setComputerFaceDown,
              setPile,
              setDeck,
              setBurnedCards,
              setMessage,
              setGlitchActive,
              endTurn,
              setWinner,
              setGameState,
              revealComputerFaceDownCard,
            }

            playComputerLowestCard(gameStateForAI, aiCallbacks, computerTurnInProgress)
          }, 1000)
        }
      } else {
        // Add this else block to ensure the flag is reset even if it's not the last ace
        setTimeout(() => {
          specialCardActionInProgress.current = false
        }, 300)
      }
    } else if (card.rank === "wormhole") {
      handleWormholeCard(card)
    } else if (card.rank === "supernova") {
      handleSupernovaCard(card)
    } else if (card.rank === "asteroid-field") {
      handleAsteroidFieldCard(card)
    }
  }

  // Add this function to handle adding a card to the player's hand
  const addCardToPlayerHand = (card: CardType) => {
    setPlayerHand((prevHand) => sortCardsByRank([...prevHand, card]))

    // Show a more descriptive message
    const cardName = card.rank === "black-hole" ? "Black Hole" : getDisplayRank(card.rank)
    setMessage(`Added ${cardName} to your hand`)

    // Trigger draw animation for visual feedback
    triggerDrawAnimation()
  }

  // Add this function to handle adding a card to the computer's hand
  const addCardToComputerHand = (card: CardType) => {
    setComputerHand((prevHand) => [...prevHand, card])

    // Show a message
    const cardName = card.rank === "black-hole" ? "Black Hole" : getDisplayRank(card.rank)
    setMessage(`Added ${cardName} to computer's hand`)

    // Trigger draw animation for visual feedback
    triggerDrawAnimation()
  }

  /**
   * Handle the black hole card effects
   */
  const handleBlackHoleCard = (card: CardType) => {
    // Set flag to prevent multiple triggers
    specialCardActionInProgress.current = true

    // Set message
    setMessage("Black Hole played - cosmic distortion activated!")

    // After a delay to perform the effects
    setTimeout(() => {
      // 1. Burn the play pile
      setBurnedCards((prev) => [...prev, ...pile])
      setPile([])

      // 2. Remove all remaining cards from the deck
      setBurnedCards((prev) => [...prev, ...deck])
      setDeck([])

      // 3. Remove the black hole card from the game
      // (It's already removed from the player's hand when played)

      // Reset the flag
      specialCardActionInProgress.current = false

      // End the turn
      endTurn()
    }, 1000) // Shorter delay since we're not waiting for animation
  }

  /**
   * Handle Wormhole card effect - swap hand cards between players
   */
  const handleWormholeCard = (card: CardType) => {
    // Set flag to prevent multiple triggers
    specialCardActionInProgress.current = true

    // Set message
    setMessage("Wormhole played - swapping hand cards between players!")

    // Swap the hand cards
    const playerHandCopy = [...playerHand]
    const computerHandCopy = [...computerHand]

    // Update both hands
    setPlayerHand(computerHandCopy)
    setComputerHand(playerHandCopy)

    // Burn the wormhole card
    setBurnedCards((prev) => [...prev, card])

    // End the turn after a delay to allow animation
    setTimeout(() => {
      specialCardActionInProgress.current = false
      endTurn()
    }, 1000)
  }

  /**
   * Handle Supernova card effect - burn all cards in both players' palaces
   */
  const handleSupernovaCard = (card: CardType) => {
    // Set flag to prevent multiple triggers
    specialCardActionInProgress.current = true

    // Set message
    setMessage("Supernova played - burning all palace cards!")

    // Collect all palace cards
    const allPalaceCards = [...playerFaceUp, ...playerFaceDown, ...computerFaceUp, ...computerFaceDown]

    // Add the supernova card itself
    allPalaceCards.push(card)

    // Burn all collected cards
    setBurnedCards((prev) => [...prev, ...allPalaceCards])

    // Clear the palace areas
    setPlayerFaceUp([])
    setPlayerFaceDown([])
    setComputerFaceUp([])
    setComputerFaceDown([])

    // End the turn after a delay to allow animation
    setTimeout(() => {
      specialCardActionInProgress.current = false
      endTurn()
    }, 1000)
  }

  /**
   * Handle Asteroid Field card effect - next player must draw two cards
   */
  const handleAsteroidFieldCard = (card: CardType) => {
    // Set flag to prevent multiple triggers
    specialCardActionInProgress.current = true

    // Determine the next player
    const nextPlayer = currentPlayer === "player" ? "computer" : "player"

    // Set message
    setMessage(`Asteroid Field played - ${nextPlayer === "player" ? "you" : "computer"} must draw two cards!`)

    // Burn the asteroid field card
    setBurnedCards((prev) => [...prev, card])

    // Force the next player to draw two cards
    if (nextPlayer === "player") {
      // Draw cards for the player
      if (deck.length > 0) {
        const cardsToDraw = Math.min(2, deck.length)
        const drawnCards = deck.slice(0, cardsToDraw)
        const newDeck = deck.slice(cardsToDraw)

        setPlayerHand(sortCardsByRank([...playerHand, ...drawnCards]))
        setDeck(newDeck)
      }
    } else {
      // Draw cards for the computer
      if (deck.length > 0) {
        const cardsToDraw = Math.min(2, deck.length)
        const drawnCards = deck.slice(cardsToDraw)
        const newDeck = deck.slice(cardsToDraw)

        setComputerHand([...computerHand, ...drawnCards])
        setDeck(newDeck)
      }
    }

    // End the turn after a delay to allow animation
    setTimeout(() => {
      specialCardActionInProgress.current = false
      endTurn()
    }, 1000)
  }

  /**
   * Add card to pile
   */
  const addCardToPile = (card: CardType) => {
    setPile((prev) => [...prev, { ...card, faceUp: true }])
  }

  /**
   * End the current turn and switch players
   */
  const endTurn = () => {
    // Check for win conditions before switching players
    if (computerHand.length === 0 && computerFaceUp.length === 0 && computerFaceDown.length === 0) {
      setWinner("computer")
      setGameState("gameOver")
      setMessage("Computer wins!")
      return
    }

    if (playerHand.length === 0 && playerFaceUp.length === 0 && playerFaceDown.length === 0) {
      setWinner("player")
      setGameState("gameOver")
      setMessage(currentRound === totalRounds ? "You've won the game!" : "Round complete!")
      return
    }

    // Switch the current player
    setCurrentPlayer(currentPlayer === "player" ? "computer" : "player")

    // Only set message for computer's turn
    if (currentPlayer === "player") {
      // Computer's turn next
      setMessage("Computer's turn")
    }
    // For player's turn, we'll update the message in a useEffect
  }

  /**
   * Update the instruction message based on the current pile state
   */
  const updatePlayerInstructionMessage = () => {
    if (currentPlayer !== "player" || gameState !== "playing") return

    if (pile.length === 0) {
      setMessage("Your turn - play any card to start")
    } else {
      const topCard = pile[pile.length - 1]

      // Special case: If top card is a 7
      if (topCard.rank === "7") {
        setMessage(`Your turn - play a card LOWER than 7`)
      }
      // Special case: If top card is a 3 or glitch, look at the card below
      else if ((topCard.rank === "3" || topCard.rank === "glitch") && pile.length >= 2) {
        const cardBelow = pile[pile.length - 2]

        // If card below the 3/glitch is a 7, apply the 7's rule
        if (cardBelow.rank === "7") {
          setMessage(`Your turn - play a card LOWER than 7`)
        } else {
          setMessage(`Your turn - play a card higher than or equal to ${getDisplayRank(cardBelow.rank)}`)
        }
      }
      // Normal case
      else {
        setMessage(`Your turn - play a card higher than ${getDisplayRank(topCard.rank)}`)
      }
    }
  }

  // Add this helper function if it doesn't already exist in the file
  // (It might already be imported from game-utils.ts)
  const getDisplayRank = (rank: Rank): string => {
    switch (rank) {
      case "j":
        return "Jack"
      case "q":
        return "Queen"
      case "k":
        return "King"
      case "a":
        return "Ace"
      case "glitch":
        return "Glitch Card"
      default:
        return rank.toUpperCase()
    }
  }

  /**
   * Player picks up the pile
   */
  const pickUpPile = () => {
    if (currentPlayer !== "player" || gameState !== "playing") return

    // Add the pile to the player's hand and sort it
    const newHand = sortCardsByRank([...playerHand, ...pile])
    setPlayerHand(newHand)
    setMessage("You picked up the pile")
    setPile([])
    endTurn()
  }

  // Update the restartGame function to reset to round 1
  const restartGame = () => {
    // Always reset to round 1 when restarting from game over screen
    setCurrentRound(1)
    startNewRound()
  }

  /**
   * Toggle showing computer cards for debugging
   */
  const toggleComputerCardsVisible = () => {
    setShowComputerCards((prev) => !prev)
  }

  /**
   * Preview win screen
   */
  const previewWinScreen = () => {
    setPreviewWinner("player")
  }

  /**
   * Preview lose screen
   */
  const previewLoseScreen = () => {
    setPreviewWinner("computer")
  }

  // Add this function to trigger the draw animation:
  const triggerDrawAnimation = () => {
    setDrawAnimation(true)
    setTimeout(() => setDrawAnimation(false), 500)
  }

  // Now, let's add a useEffect to update the player's instruction message when it becomes their turn:

  // Add this useEffect after the other useEffects:
  useEffect(() => {
    // Only update the message when it's the player's turn and we're in playing state
    if (currentPlayer === "player" && gameState === "playing") {
      // Small delay to ensure pile state is updated after computer's action
      const timeoutId = setTimeout(() => {
        updatePlayerInstructionMessage()
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [currentPlayer, gameState, pile])

  // Add this useEffect after the other useEffects
  useEffect(() => {
    // Check for win conditions at the end of each turn
    if (gameState === "playing" && !specialCardActionInProgress.current && !computerTurnInProgress.current) {
      // Check if computer has won (no cards left)
      if (computerHand.length === 0 && computerFaceUp.length === 0 && computerFaceDown.length === 0) {
        console.log("Computer win condition detected: no cards left")
        setWinner("computer")
        setGameState("gameOver")
        setMessage("Computer wins!")
      }

      // Check if player has won (no cards left)
      if (playerHand.length === 0 && playerFaceUp.length === 0 && playerFaceDown.length === 0) {
        console.log("Player win condition detected: no cards left")
        setWinner("player")
        setGameState("gameOver")
        setMessage(currentRound === totalRounds ? "You've won the game!" : "Round complete!")
      }
    }
  }, [
    currentPlayer,
    gameState,
    computerHand.length,
    computerFaceUp.length,
    computerFaceDown.length,
    playerHand.length,
    playerFaceUp.length,
    playerFaceDown.length,
    currentRound,
    totalRounds,
  ])

  // =========================================================================
  // RENDER GAME UI
  // =========================================================================

  // Declare beginRound here
  const beginRound = () => {
    setShowRoundIntro(false)
  }

  // Add a new function for skipping to the win state
  const skipToWin = () => {
    // Set the winner to player
    setWinner("player")
    // Set game state to gameOver
    setGameState("gameOver")
    // Set appropriate message based on whether this is the last round
    setMessage(currentRound === totalRounds ? "You've won the game!" : "Round complete!")
  }

  return (
    <div ref={scope} className="w-full flex flex-col items-center gap-4 relative pb-16">
      {/* VHS Glitch overlay when active - positioned at the very beginning of the component */}
      {glitchActive && <VHSOverlay />}

      {/* Show tutorial if needed */}
      {showTutorial && <Tutorial startGame={closeTutorial} />}

      {/* Show round intro if needed */}
      {!showTutorial && showRoundIntro && (
        <RoundIntro round={currentRound} opponent={currentOpponent} onBeginRound={beginRound} />
      )}

      {/* Round tracker - only show during gameplay */}
      {!showTutorial && !showRoundIntro && <RoundTracker currentRound={currentRound} totalRounds={totalRounds} />}

      {/* Computer's area */}
      <div className="w-full flex flex-col items-center gap-2">
        {/* Display current opponent name */}
        {!showTutorial && !showRoundIntro && (
          <div className="text-white text-sm bg-black/40 px-3 py-1 rounded-full mb-2 border border-[#FE7B2A]/30">
            Opponent: {currentOpponent.name}
          </div>
        )}

        <ComputerHand
          hand={computerHand}
          faceUp={computerFaceUp}
          faceDown={computerFaceDown}
          currentPlayer={currentPlayer}
          glitchActive={glitchActive}
          showComputerCards={showComputerCards}
        />
      </div>

      {/* Game area */}
      <div className="w-full my-4 flex justify-center items-center gap-8">
        {/* Deck */}
        <div className="relative">
          {deck.length > 0 && (
            <motion.div
              className="relative"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card
                card={{ id: "deck-back", suit: "hearts", rank: "2", value: 2, faceUp: false }}
                glitchActive={glitchActive}
              />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 1 }}
                animate={drawAnimation ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-black/70 text-white px-3 py-1 rounded-full border border-[#FE7B2A] text-sm font-medium shadow-lg">
                  {deck.length}
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Pile */}
        <Pile pile={pile} />
      </div>

      {/* Player's area */}
      <div className="w-full flex flex-col items-center gap-4 player-area">
        <PlayerHand
          hand={playerHand}
          faceUp={playerFaceUp}
          faceDown={playerFaceDown}
          playCards={playCards}
          playFaceUpCards={playFaceUpCards}
          playFaceDownCard={playFaceDownCard}
          pickUpPile={pickUpPile}
          gameState={gameState}
          currentPlayer={currentPlayer}
          pile={pile}
          handleCardSwap={handleCardSwap}
          selectedHandCard={selectedHandCard}
          selectedFaceUpCard={selectedFaceUpCard}
          deck={deck} // Pass the deck prop
          finishSwapping={finishSwapping} // Pass the finishSwapping function
          onHoverCard={setHoveredCard}
        />
      </div>

      {/* Update the Win/Lose celebration overlay */}
      {(winner || previewWinner) && (
        <WinCelebration
          winner={winner || previewWinner}
          restartGame={restartGame}
          round={currentRound}
          totalRounds={totalRounds}
          nextRound={winner === "player" && currentRound < totalRounds ? nextRound : undefined}
          isLastRound={currentRound === totalRounds}
        />
      )}

      {/* Fixed footer for game messages - hidden during tutorial */}
      {!showTutorial && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 bg-[#343344] text-white py-3 px-4 text-center font-light z-50 shadow-lg fixed-footer"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          key={message}
        >
          {message}
        </motion.div>
      )}

      {/* Add the DevToolsToggle here */}
      <DevToolsToggle
        toggleVHSOverlay={() => setGlitchActive((prev) => !prev)}
        toggleComputerCardsVisible={toggleComputerCardsVisible}
        isComputerCardsVisible={showComputerCards}
        previewWinScreen={previewWinScreen}
        previewLoseScreen={previewLoseScreen}
        onAddCardToPlayer={addCardToPlayerHand}
        onAddCardToComputer={addCardToComputerHand}
        skipToWin={skipToWin}
      />

      {/* Card description for special cards */}
      {hoveredCard && <CardDescription rank={hoveredCard.rank} />}

      {/* Revealing card animation */}
      {revealingFaceDownCard && revealingCardPosition && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: revealingCardPosition.top,
            left: revealingCardPosition.left,
          }}
        >
          <motion.div initial={{ scale: 1, y: 0 }} animate={{ scale: 1.2, y: -20 }} transition={{ duration: 0.3 }}>
            <Card card={revealingFaceDownCard} />
          </motion.div>
        </div>
      )}
    </div>
  )
}

