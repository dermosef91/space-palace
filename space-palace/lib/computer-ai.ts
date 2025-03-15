import type { CardType, PlayerType } from "@/types/game-types"
import { SPECIAL_CARDS, sortCardsByRank } from "@/lib/game-utils"

// =========================================================================
// TYPES AND INTERFACES
// =========================================================================

/**
 * Interface for the game state needed by the AI
 */
export interface GameStateForAI {
  computerHand: CardType[]
  computerFaceUp: CardType[]
  computerFaceDown: CardType[]
  pile: CardType[]
  deck: CardType[]
}

/**
 * Interface for callbacks to update game state
 */
export interface AICallbacks {
  setComputerHand: (hand: CardType[]) => void
  setComputerFaceUp: (faceUp: CardType[]) => void
  setComputerFaceDown: (faceDown: CardType[]) => void
  setPile: (pile: CardType[]) => void
  setDeck: (deck: CardType[]) => void
  setBurnedCards: (callback: (prev: CardType[]) => CardType[]) => void
  setMessage: (message: string) => void
  setGlitchActive: (active: boolean) => void
  endTurn: () => void
  setWinner: (player: PlayerType | null) => void
  setGameState: (state: string) => void
}

// =========================================================================
// MAIN AI FUNCTIONS
// =========================================================================

/**
 * Main function to handle the computer's turn
 * Determines the best move based on current game state
 */
export const computerTurn = (
  gameState: GameStateForAI,
  callbacks: AICallbacks,
  specialCardActionInProgress: { current: boolean },
  computerTurnInProgress: { current: boolean },
) => {
  // Destructure gameState for easier access
  const { computerHand, computerFaceUp, computerFaceDown, pile, deck } = gameState

  // Destructure callbacks for easier access
  const {
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
  } = callbacks

  // Prevent multiple executions if a special card action is in progress
  if (specialCardActionInProgress.current) {
    computerTurnInProgress.current = false
    return
  }

  // First, check if computer needs to draw cards (only if pile is empty)
  if (computerHand.length < 3 && deck.length > 0 && pile.length === 0) {
    handleComputerDraw(gameState, callbacks, computerTurnInProgress)
    return
  }

  // Determine which card collection to play from based on game rules
  if (computerHand.length > 0) {
    // Play from hand if there are cards in hand
    handlePlayFromHand(gameState, callbacks, specialCardActionInProgress, computerTurnInProgress)
  } else if (computerHand.length === 0 && deck.length === 0) {
    // If hand is empty and deck is empty, play from face up or face down
    if (computerFaceUp.length > 0) {
      handlePlayFromFaceUp(gameState, callbacks, specialCardActionInProgress, computerTurnInProgress)
    } else if (computerFaceDown.length > 0) {
      handlePlayFromFaceDown(gameState, callbacks, specialCardActionInProgress, computerTurnInProgress)
    } else {
      // No cards left to play
      computerTurnInProgress.current = false
      endTurn()
    }
  } else {
    // Computer needs to wait for more cards
    computerTurnInProgress.current = false
    endTurn()
  }
}

/**
 * Safety fallback function for computer's turn
 * Used to gracefully end the computer's turn if other methods fail
 */
export const playComputerLowestCard = (
  gameState: GameStateForAI,
  callbacks: AICallbacks,
  computerTurnInProgress: { current: boolean },
) => {
  // This function is now just a safety fallback
  // End the computer's turn to prevent any potential infinite loops
  computerTurnInProgress.current = false
  callbacks.endTurn()
}

// =========================================================================
// CARD PLAYING STRATEGIES
// =========================================================================

/**
 * Handle computer drawing cards
 */
const handleComputerDraw = (
  gameState: GameStateForAI,
  callbacks: AICallbacks,
  computerTurnInProgress: { current: boolean },
) => {
  const { computerHand, deck } = gameState
  const { setComputerHand, setDeck, setMessage, endTurn } = callbacks

  const cardsNeeded = 3 - computerHand.length
  const cardsToDraw = Math.min(cardsNeeded, deck.length)
  const drawnCards = deck.slice(0, cardsToDraw)
  const newDeck = deck.slice(cardsToDraw)

  setComputerHand([...computerHand, ...drawnCards])
  setDeck(newDeck)
  setMessage("Computer drew cards")

  // End turn after drawing
  setTimeout(() => {
    computerTurnInProgress.current = false
    endTurn()
  }, 1000)
}

/**
 * Handle playing cards from computer's hand
 */
const handlePlayFromHand = (
  gameState: GameStateForAI,
  callbacks: AICallbacks,
  specialCardActionInProgress: { current: boolean },
  computerTurnInProgress: { current: boolean },
) => {
  const { computerHand, pile } = gameState
  const { setComputerHand, setPile, setMessage, endTurn } = callbacks

  // Group cards by rank
  const cardsByRank = groupCardsByRank(computerHand)

  // Find playable card groups
  const playableGroups = findPlayableGroups(cardsByRank, pile)

  if (playableGroups.length > 0) {
    // Choose the best cards to play
    const { cardsToPlay, isSpecial } = chooseBestCardsToPlay(playableGroups)

    // Remove played cards from hand
    const newHand = computerHand.filter((c) => !cardsToPlay.some((card) => card.id === c.id))

    // Handle the play based on card type
    if (isSpecial) {
      handleSpecialCardPlay(
        cardsToPlay[0],
        newHand,
        gameState,
        callbacks,
        specialCardActionInProgress,
        computerTurnInProgress,
        "hand",
      )
    } else {
      // Play normal cards
      playNormalCards(cardsToPlay, newHand, gameState, callbacks, computerTurnInProgress, "hand")
    }
  } else {
    // Must pick up the pile if there are cards in the pile
    if (pile.length > 0) {
      pickUpPile(gameState, callbacks, computerTurnInProgress)
    } else {
      // If pile is empty and no playable cards, just end turn
      computerTurnInProgress.current = false
      endTurn()
    }
  }
}

/**
 * Handle playing cards from computer's face up cards
 */
const handlePlayFromFaceUp = (
  gameState: GameStateForAI,
  callbacks: AICallbacks,
  specialCardActionInProgress: { current: boolean },
  computerTurnInProgress: { current: boolean },
) => {
  const { computerFaceUp, pile } = gameState
  const { setComputerFaceUp, setPile, setMessage, endTurn } = callbacks

  // Group cards by rank
  const cardsByRank = groupCardsByRank(computerFaceUp)

  // Find playable card groups
  const playableGroups = findPlayableGroups(cardsByRank, pile)

  if (playableGroups.length > 0) {
    // Choose the best cards to play
    const { cardsToPlay, isSpecial } = chooseBestCardsToPlay(playableGroups)

    // Remove played cards from face up
    const newFaceUp = computerFaceUp.filter((c) => !cardsToPlay.some((card) => card.id === c.id))

    // Handle the play based on card type
    if (isSpecial) {
      handleSpecialCardPlay(
        cardsToPlay[0],
        newFaceUp,
        gameState,
        callbacks,
        specialCardActionInProgress,
        computerTurnInProgress,
        "faceUp",
      )
    } else {
      // Play normal cards
      playNormalCards(cardsToPlay, newFaceUp, gameState, callbacks, computerTurnInProgress, "faceUp")
    }
  } else {
    // Must pick up the pile if there are cards in the pile
    if (pile.length > 0) {
      pickUpPile(gameState, callbacks, computerTurnInProgress)
    } else {
      // If pile is empty and no playable cards, just end turn
      computerTurnInProgress.current = false
      endTurn()
    }
  }
}

/**
 * Handle playing cards from computer's face down cards
 */
const handlePlayFromFaceDown = (
  gameState: GameStateForAI,
  callbacks: AICallbacks,
  specialCardActionInProgress: { current: boolean },
  computerTurnInProgress: { current: boolean },
) => {
  const { computerFaceDown, computerHand, pile } = gameState
  const { setComputerFaceDown, setComputerHand, setPile, setMessage, endTurn } = callbacks

  // Pick a random face down card
  const randomIndex = Math.floor(Math.random() * computerFaceDown.length)
  const cardToPlay = { ...computerFaceDown[randomIndex], faceUp: true }
  const newFaceDown = [...computerFaceDown]
  newFaceDown.splice(randomIndex, 1)

  if (canPlayCard(cardToPlay, pile)) {
    // Handle special cards
    if (SPECIAL_CARDS[cardToPlay.rank]) {
      handleSpecialCardPlay(
        cardToPlay,
        newFaceDown,
        gameState,
        callbacks,
        specialCardActionInProgress,
        computerTurnInProgress,
        "faceDown",
      )
    } else {
      // Play normal card
      addCardToPile(cardToPlay, setPile)
      setComputerFaceDown(newFaceDown)

      // Check for win condition
      if (newFaceDown.length === 0 && computerHand.length === 0 && computerFaceUp.length === 0) {
        callbacks.setWinner("computer")
        callbacks.setGameState("gameOver")
        callbacks.setMessage("Computer wins!")
        computerTurnInProgress.current = false
        return
      }

      computerTurnInProgress.current = false
      endTurn()
    }
  } else {
    // Must pick up the pile
    setMessage(`Computer picks up the pile and revealed ${cardToPlay.rank}`)
    setComputerHand([...computerHand, cardToPlay, ...pile])
    setComputerFaceDown(newFaceDown)
    setPile([])
    computerTurnInProgress.current = false
    endTurn()
  }
}

/**
 * Special function to handle computer playing an ace
 */
export const handleComputerAce = (
  card: CardType,
  gameState: GameStateForAI,
  callbacks: AICallbacks,
  specialCardActionInProgress: { current: boolean },
  computerTurnInProgress: { current: boolean },
) => {
  // Destructure gameState for easier access
  const { computerHand, pile, deck } = gameState

  // Destructure callbacks for easier access
  const { setComputerHand, setPile, setDeck, setBurnedCards, setMessage, endTurn } = callbacks

  // Set flag to prevent multiple triggers
  specialCardActionInProgress.current = true

  // A clears the pile and player gets another turn
  setMessage("Ace played - pile cleared!")

  // Move pile to burned cards and add the ace with a unique ID to avoid key conflicts
  const aceWithUniqueId = {
    ...card,
    id: `${card.id}-burned-${Date.now()}`, // Ensure unique ID
    faceUp: true,
  }

  // Add all cards to burned in a single update
  setBurnedCards((prev) => [...prev, ...pile, aceWithUniqueId])

  // Clear the pile
  setPile([])

  // Use a more reliable approach to continue the computer's turn
  const continueComputerTurn = () => {
    console.log("Computer continuing turn after ace")
    setMessage("Computer's turn again!")
    specialCardActionInProgress.current = false

    // Check if computer needs to draw cards
    if (computerHand.length < 3 && deck.length > 0) {
      const cardsNeeded = 3 - computerHand.length
      const cardsToDraw = Math.min(cardsNeeded, deck.length)
      const drawnCards = deck.slice(cardsToDraw)
      const newDeck = deck.slice(cardsToDraw)

      setComputerHand((prevHand) => {
        const newHand = [...prevHand, ...drawnCards]
        console.log("Computer drew cards after ace:", newHand.length)

        // Schedule the next action after state updates
        setTimeout(() => {
          if (pile.length === 0) {
            console.log("Ending computer turn after drawing")
            computerTurnInProgress.current = false
            endTurn()
          } else {
            console.log("Computer trying to play after drawing")
            attemptComputerPlay(newHand, gameState, callbacks, specialCardActionInProgress, computerTurnInProgress)
          }
        }, 100)

        return newHand
      })

      setDeck(newDeck)
      setMessage("Computer drew cards after playing ace")
    } else {
      // Try to play a card
      attemptComputerPlay(computerHand, gameState, callbacks, specialCardActionInProgress, computerTurnInProgress)
    }
  }

  // Allow the computer to play again after a delay
  setTimeout(continueComputerTurn, 1000)
}

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

/**
 * Group cards by rank for easier processing
 */
const groupCardsByRank = (cards: CardType[]): Record<string, CardType[]> => {
  const cardsByRank: Record<string, CardType[]> = {}

  cards.forEach((card) => {
    if (!cardsByRank[card.rank]) {
      cardsByRank[card.rank] = []
    }
    cardsByRank[card.rank].push(card)
  })

  return cardsByRank
}

/**
 * Find groups of cards that can be played on the current pile
 */
const findPlayableGroups = (cardsByRank: Record<string, CardType[]>, pile: CardType[]): CardType[][] => {
  const playableGroups: CardType[][] = []

  Object.values(cardsByRank).forEach((cards) => {
    if (cards.length > 0 && canPlayCard(cards[0], pile)) {
      playableGroups.push(cards)
    }
  })

  return playableGroups
}

/**
 * Choose the best cards to play from available playable groups
 */
const chooseBestCardsToPlay = (playableGroups: CardType[][]) => {
  // First check if there are any non-special cards that can be played
  const nonSpecialGroups = playableGroups.filter((group) => !SPECIAL_CARDS[group[0].rank] || group[0].rank === "7")

  // If we have non-special cards to play, prioritize them
  if (nonSpecialGroups.length > 0) {
    // Sort by: lowest value cards first, then by groups with most cards
    nonSpecialGroups.sort((a, b) => {
      // First prioritize lowest value cards
      if (a[0].value !== b[0].value) return a[0].value - b[0].value

      // Then prioritize groups with most cards
      return b.length - a.length
    })

    return { cardsToPlay: nonSpecialGroups[0], isSpecial: false }
  }
  // If we can only play special cards, use them as a last resort
  else {
    // Get special cards (except 7s which are treated as normal cards)
    const specialGroups = playableGroups.filter((group) => SPECIAL_CARDS[group[0].rank] && group[0].rank !== "7")

    // Sort special cards by value (lowest first)
    specialGroups.sort((a, b) => a[0].value - b[0].value)

    // Only play one special card at a time to maximize their effect
    return { cardsToPlay: [specialGroups[0][0]], isSpecial: true }
  }
}

/**
 * Handle playing a special card
 */
const handleSpecialCardPlay = (
  card: CardType,
  newCardCollection: CardType[],
  gameState: GameStateForAI,
  callbacks: AICallbacks,
  specialCardActionInProgress: { current: boolean },
  computerTurnInProgress: { current: boolean },
  source: "hand" | "faceUp" | "faceDown",
) => {
  const { setComputerHand, setComputerFaceUp, setComputerFaceDown } = callbacks

  // Update the appropriate card collection
  if (source === "hand") {
    setComputerHand(newCardCollection)
  } else if (source === "faceUp") {
    setComputerFaceUp(newCardCollection)
  } else {
    setComputerFaceDown(newCardCollection)
  }

  // Handle based on card type
  if (card.rank === "a") {
    handleComputerAce(card, gameState, callbacks, specialCardActionInProgress, computerTurnInProgress)
  } else if (card.rank === "glitch") {
    handleGlitchCard(card, callbacks, specialCardActionInProgress)
  } else if (card.rank === "black-hole") {
    handleBlackHoleCard(card, gameState, callbacks, specialCardActionInProgress)
  } else if (card.rank === "2" || card.rank === "3" || card.rank === "7") {
    handleOtherSpecialCard(card, gameState.pile, callbacks, specialCardActionInProgress)
  }
}

/**
 * Handle glitch card effects
 */
const handleGlitchCard = (
  card: CardType,
  callbacks: AICallbacks,
  specialCardActionInProgress: { current: boolean },
) => {
  const { setPile, setGlitchActive, setMessage, endTurn } = callbacks

  // Add card to pile
  addCardToPile(card, setPile)

  // Activate the global glitch effect
  setGlitchActive(true)

  // Set message
  setMessage("Computer plays glitch card - reality distorted!")

  // Handle like a 3 (special card)
  specialCardActionInProgress.current = true
  setMessage("Glitch card played - takes value of card below!")
  specialCardActionInProgress.current = false
  endTurn()
}

/**
 * Handle other special cards (2, 3, 7)
 */
const handleOtherSpecialCard = (
  card: CardType,
  pile: CardType[],
  callbacks: AICallbacks,
  specialCardActionInProgress: { current: boolean },
) => {
  const { setBurnedCards, setPile, setMessage, endTurn } = callbacks

  // Set flag to prevent multiple triggers
  specialCardActionInProgress.current = true

  if (card.rank === "2") {
    // 2 removes all cards below it from the game
    setMessage("2 played - all cards below removed from the game!")
    // Move current pile (except the 2) to burned cards
    setBurnedCards((prev) => [...prev, ...pile])
    // Reset pile with just the 2
    setPile([{ ...card, faceUp: true }])
  } else if (card.rank === "3") {
    // Add the 3 card to the pile
    setPile([...pile, { ...card, faceUp: true }])
    setMessage("3 played - takes value of card below!")
  } else if (card.rank === "7") {
    setMessage("7 played - next card must be lower than 7!")
  }

  // Move to next player's turn
  specialCardActionInProgress.current = false
  endTurn()
}

/**
 * Play normal (non-special) cards
 */
const playNormalCards = (
  cards: CardType[],
  newCardCollection: CardType[],
  gameState: GameStateForAI,
  callbacks: AICallbacks,
  computerTurnInProgress: { current: boolean },
  source: "hand" | "faceUp" | "faceDown",
) => {
  const { computerHand, computerFaceUp, computerFaceDown, deck } = gameState
  const {
    setComputerHand,
    setComputerFaceUp,
    setComputerFaceDown,
    setPile,
    setMessage,
    setWinner,
    setGameState,
    endTurn,
  } = callbacks

  // Add cards to pile
  cards.forEach((card) => {
    addCardToPile({ ...card, faceUp: true }, setPile)
  })

  // Update the appropriate card collection
  if (source === "hand") {
    setComputerHand(newCardCollection)
  } else if (source === "faceUp") {
    setComputerFaceUp(newCardCollection)
  } else {
    setComputerFaceDown(newCardCollection)
  }

  setMessage(`Computer plays ${cards.length} ${cards[0].rank}${cards.length > 1 ? "s" : ""}`)

  // Check if needs to draw
  if (source === "hand" && newCardCollection.length < 3 && deck.length > 0) {
    // This will be handled by the autoDrawCards function in the Game component
    computerTurnInProgress.current = false
    endTurn()
    return
  }

  // Check for win condition - simplified logic
  if (newCardCollection.length === 0) {
    // Check if all card collections are empty based on the source
    let hasWon = false

    if (source === "hand" && computerFaceUp.length === 0 && computerFaceDown.length === 0) {
      hasWon = true
    } else if (source === "faceUp" && computerHand.length === 0 && computerFaceDown.length === 0) {
      hasWon = true
    } else if (source === "faceDown" && computerHand.length === 0 && computerFaceUp.length === 0) {
      hasWon = true
    }

    if (hasWon) {
      setWinner("computer")
      setGameState("gameOver")
      setMessage("Computer wins!")
      return
    }
  }

  computerTurnInProgress.current = false
  endTurn()
}

/**
 * Computer picks up the pile
 */
const pickUpPile = (
  gameState: GameStateForAI,
  callbacks: AICallbacks,
  computerTurnInProgress: { current: boolean },
) => {
  const { computerHand, pile } = gameState
  const { setComputerHand, setPile, setMessage, endTurn } = callbacks

  setMessage("Computer picks up the pile")
  setComputerHand(sortCardsByRank([...computerHand, ...pile]))
  setPile([])
  computerTurnInProgress.current = false
  endTurn()
}

/**
 * Helper function to attempt playing a card after an ace
 */
const attemptComputerPlay = (
  hand: CardType[],
  gameState: GameStateForAI,
  callbacks: AICallbacks,
  specialCardActionInProgress: { current: boolean },
  computerTurnInProgress: { current: boolean },
) => {
  // Destructure gameState for easier access
  const { computerFaceUp, computerFaceDown, pile } = gameState

  // Destructure callbacks for easier access
  const { setComputerHand, setPile, setBurnedCards, setMessage, setGlitchActive, endTurn, setWinner, setGameState } =
    callbacks

  // Find playable cards
  const playableCards = hand.filter((card) => canPlayCard(card, pile))

  if (playableCards.length > 0) {
    // NEW STRATEGY:
    // 1. First check if there are any non-special cards that can be played
    const nonSpecialCards = playableCards.filter((card) => !SPECIAL_CARDS[card.rank] || card.rank === "7")

    // 2. If we have non-special cards to play, prioritize them
    let cardToPlay
    if (nonSpecialCards.length > 0) {
      // Sort non-special cards by value (lowest first)
      const sortedCards = [...nonSpecialCards].sort((a, b) => a.value - b.value)

      // Group cards by rank to find multiples of the lowest value
      const lowestValue = sortedCards[0].value
      const lowestValueCards = sortedCards.filter((card) => card.value === lowestValue)

      // Group by rank to find if we have multiples of the lowest value
      const cardsByRank: Record<string, CardType[]> = {}
      lowestValueCards.forEach((card) => {
        if (!cardsByRank[card.rank]) {
          cardsByRank[card.rank] = []
        }
        cardsByRank[card.rank].push(card)
      })

      // Find the rank with the most cards among the lowest value cards
      let bestRank = lowestValueCards[0].rank
      let maxCount = 1

      Object.entries(cardsByRank).forEach(([rank, cards]) => {
        if (cards.length > maxCount) {
          maxCount = cards.length
          bestRank = rank
        }
      })

      // Play the lowest value card (or multiple if available)
      cardToPlay = cardsByRank[bestRank][0]
    }
    // 3. If we can only play special cards, use them as a last resort
    else {
      // Get special cards (except 7s which are treated as normal cards)
      const specialCards = playableCards.filter((card) => SPECIAL_CARDS[card.rank] && card.rank !== "7")

      // Sort special cards by value (lowest first)
      specialCards.sort((a, b) => a.value - b.value)

      // Only play one special card
      cardToPlay = specialCards[0]
    }

    const newHand = hand.filter((c) => c.id !== cardToPlay.id)

    // Check if the card is an ace - handle specially
    if (cardToPlay.rank === "a") {
      // For aces, don't add to pile (they go straight to burned)
      setComputerHand(newHand)

      // Instead of recursively calling handleComputerAce, just burn the ace and end turn
      // This prevents infinite loops when multiple aces are available
      const aceWithUniqueId = {
        ...cardToPlay,
        id: `${cardToPlay.id}-burned-${Date.now()}-${Math.random()}`,
        faceUp: true,
      }

      setBurnedCards((prev) => [...prev, aceWithUniqueId])
      setMessage("Computer plays another ace and ends turn")

      // End turn after playing a second ace to prevent infinite loops
      setTimeout(() => {
        computerTurnInProgress.current = false
        endTurn()
      }, 1000)
    } else if (cardToPlay.rank === "glitch") {
      // Handle glitch card - trigger screen shake and activate glitch effect
      setComputerHand(newHand)

      // Add card to pile
      addCardToPile({ ...cardToPlay, faceUp: true }, setPile)

      // Activate the global glitch effect
      setGlitchActive(true)

      // Set message
      setMessage("Computer plays glitch card - reality distorted!")

      // End turn
      computerTurnInProgress.current = false
      endTurn()
    } else {
      // Add card to pile
      addCardToPile({ ...cardToPlay, faceUp: true }, setPile)
      setComputerHand(newHand)
      setMessage(`Computer plays ${cardToPlay.rank} after ace`)

      // Check for win condition
      if (newHand.length === 0 && computerFaceUp.length === 0 && computerFaceDown.length === 0) {
        setWinner("computer")
        setGameState("gameOver")
        setMessage("Computer wins!")
      } else {
        // End turn
        computerTurnInProgress.current = false
        endTurn()
      }
    }
  } else {
    // Must pick up the pile if there are cards in the pile
    if (pile.length > 0) {
      setMessage("Computer picks up the pile")
      setComputerHand(sortCardsByRank([...hand, ...pile]))
      setPile([])
      computerTurnInProgress.current = false
      endTurn()
    } else {
      // If pile is empty and no playable cards, just end turn
      computerTurnInProgress.current = false
      endTurn()
    }
  }
}

/**
 * Add card to pile
 */
const addCardToPile = (card: CardType, setPile: (callback: (prev: CardType[]) => CardType[]) => void) => {
  setPile((prev) => [...prev, { ...card, faceUp: true }])
}

/**
 * Check if a card can be played on the current pile
 * This is a duplicate of the game-utils function to avoid circular dependencies
 */
function canPlayCard(card: CardType, pile: CardType[]): boolean {
  // First card can always be played
  if (pile.length === 0) return true

  const topCard = pile[pile.length - 1]

  // Special cards
  // Black hole, 2, 3, glitch can be played on anything
  if (card.rank === "black-hole" || card.rank === "2" || card.rank === "3" || card.rank === "glitch") return true

  // Ace can be played on anything except 7
  if (card.rank === "a" && topCard.rank !== "7") return true

  // 7 rules - next card must be lower than 7
  if (topCard.rank === "7") {
    return card.value < 7
  }

  // If top card is a 3 or glitch, check the card below
  if ((topCard.rank === "3" || topCard.rank === "glitch") && pile.length > 1) {
    const cardBelowTop = pile[pile.length - 2]

    // If the card below the 3 is a 7, apply the 7's rule
    if (cardBelowTop.rank === "7") {
      return card.value < 7
    }

    // If card below is also a 3 or glitch, we need to go deeper
    if (cardBelowTop.rank === "3" || cardBelowTop.rank === "glitch") {
      // Find the first non-3/non-glitch card in the pile
      let i = pile.length - 3
      while (i >= 0 && (pile[i].rank === "3" || pile[i].rank === "glitch")) {
        i--
      }
      // If found, use its value, otherwise use default rules
      if (i >= 0) {
        // If the card we found is a 7, apply the 7's rule
        if (pile[i].rank === "7") {
          return card.value < 7
        }
        if (card.rank === pile[i].rank) return false
        return card.value > pile[i].value
      }
    } else {
      if (card.rank === cardBelowTop.rank) return false
      return card.value > cardBelowTop.value
    }
  }

  // Normal rules - card value must be HIGHER than top card
  return card.value > topCard.value
}

// Add a new function to handle the black hole card
const handleBlackHoleCard = (
  card: CardType,
  gameState: GameStateForAI,
  callbacks: AICallbacks,
  specialCardActionInProgress: { current: boolean },
) => {
  const { pile, deck } = gameState
  const { setBurnedCards, setPile, setDeck, setMessage, endTurn } = callbacks

  // Set flag to prevent multiple triggers
  specialCardActionInProgress.current = true

  // Set message
  setMessage("Computer plays Black Hole - cosmic distortion activated!")

  // After a delay to perform the effects
  setTimeout(() => {
    // 1. Burn the play pile
    setBurnedCards((prev) => [...prev, ...pile])
    setPile([])

    // 2. Remove all remaining cards from the deck
    setBurnedCards((prev) => [...prev, ...deck])
    setDeck([])

    // 3. Remove the black hole card from the game
    // (It's already removed from the computer's hand when played)

    // Reset the flag
    specialCardActionInProgress.current = false

    // End the turn
    endTurn()
  }, 1000) // Shorter delay since we're not waiting for animation
}

