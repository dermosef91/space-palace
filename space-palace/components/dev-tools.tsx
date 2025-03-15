"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Code, Info, Eye, EyeOff, Trophy, Frown } from "lucide-react"
import Card from "@/components/card"
import type { CardType, Suit, Rank } from "@/types/game-types"
import { CARD_VALUES } from "@/lib/game-utils"
// Add import for the SpecialCard component
import SpecialCard from "@/components/special-card"

// Add skipToWin to the props
interface DevToolsProps {
  onClose: () => void
  toggleVHSOverlay?: () => void
  toggleComputerCardsVisible?: () => void
  isComputerCardsVisible?: boolean
  previewWinScreen?: () => void
  previewLoseScreen?: () => void
  onAddCardToPlayer?: (card: CardType) => void
  onAddCardToComputer?: (card: CardType) => void
  skipToWin?: () => void
}

// Update the function parameters to include skipToWin
export default function DevTools({
  onClose,
  toggleVHSOverlay,
  toggleComputerCardsVisible,
  isComputerCardsVisible = false,
  previewWinScreen,
  previewLoseScreen,
  onAddCardToPlayer,
  onAddCardToComputer,
  skipToWin,
}: DevToolsProps) {
  // State to track selected card for explanation
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)

  // All possible suits and ranks
  const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"]
  const ranks: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "j", "q", "k", "a"]

  // Generate all card combinations
  const generateAllCards = (): CardType[] => {
    const cards: CardType[] = []
    let cardIndex = 0

    for (const suit of suits) {
      for (const rank of ranks) {
        cards.push({
          id: `dev-${suit}-${rank}-${cardIndex++}`,
          suit,
          rank,
          value: CARD_VALUES[rank],
          faceUp: true,
        })
      }
    }

    // Add glitch card
    cards.push({
      id: `dev-glitch-${cardIndex++}`,
      suit: "spades", // The suit doesn't matter for the glitch card
      rank: "glitch",
      value: CARD_VALUES["glitch"],
      faceUp: true,
    })

    // Add the black hole card
    cards.push({
      id: `dev-black-hole-${cardIndex++}`,
      suit: "special",
      rank: "black-hole",
      value: CARD_VALUES["black-hole"],
      faceUp: true,
    })

    // Add the new special cards
    cards.push({
      id: `dev-wormhole-${cardIndex++}`,
      suit: "special",
      rank: "wormhole",
      value: CARD_VALUES["wormhole"],
      faceUp: true,
    })

    cards.push({
      id: `dev-supernova-${cardIndex++}`,
      suit: "special",
      rank: "supernova",
      value: CARD_VALUES["supernova"],
      faceUp: true,
    })

    cards.push({
      id: `dev-asteroid-field-${cardIndex++}`,
      suit: "special",
      rank: "asteroid-field",
      value: CARD_VALUES["asteroid-field"],
      faceUp: true,
    })

    return cards
  }

  const allCards = generateAllCards()

  // Group cards by suit for easier display
  const cardsBySuit: Record<string, CardType[]> = {}
  suits.forEach((suit) => {
    // Filter out the glitch card from regular suits
    cardsBySuit[suit] = allCards.filter((card) => card.suit === suit && card.rank !== "glitch")
  })
  // Add a group for special cards (including glitch and other special cards)
  cardsBySuit["special"] = allCards.filter((card) => card.rank === "glitch" || card.suit === "special")

  // Handle card click to show explanation
  const handleCardClick = (card: CardType) => {
    setSelectedCard(card)
  }

  // Get explanation text for a card
  const getCardExplanation = (card: CardType): string => {
    switch (card.rank) {
      case "2":
        return "2 can be played on any card. It burns the pile (removes all cards below it from the game)."
      case "3":
        return "3 can be played on any card. It takes the value of the card below it."
      case "7":
        return "7 forces the next player to play a card lower than 7."
      case "10":
        return `10 (value: ${card.value}) - Regular card. Must be played on a card with lower value.`
      case "a":
        return "Ace can be played on anything except 7. It burns the pile and gives you another turn."
      case "glitch":
        return "Glitch card behaves like a 3 - can be played on any card and takes the value of the card below it. Also causes visual distortion effects."
      case "black-hole":
        return "Black Hole card can be played on any card. When played, it burns the pile, removes all cards from the deck, and creates a cosmic distortion. This rare and powerful card can dramatically change the course of the game."
      case "wormhole":
        return "Wormhole card swaps the hand cards of both players. Playable on any card. Burns itself after playing."
      case "supernova":
        return "Supernova card burns all cards in both players' palaces. Playable on any card. Burns itself after playing."
      case "asteroid-field":
        return "Asteroid Field card forces the next player to draw two cards. Playable on any card. Burns itself after playing."
      default:
        if (["j", "q", "k"].includes(card.rank)) {
          return `${card.rank.toUpperCase()} (value: ${card.value}) - Face card with high value. Must be played on a card with lower value.`
        }
        return `${card.rank} (value: ${card.value}) - Regular card. Must be played on a card with lower value.`
    }
  }

  // Get a title for the card
  const getCardTitle = (card: CardType): string => {
    switch (card.rank) {
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
      case "black-hole":
        return "Black Hole Card"
      case "wormhole":
        return "Wormhole Card"
      case "supernova":
        return "Supernova Card"
      case "asteroid-field":
        return "Asteroid Field Card"
      default:
        return card.rank.toUpperCase()
    }
  }

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 dark:bg-neutral-800/95 text-white p-4 z-50 rounded-t-lg border-t border-neutral-700 backdrop-blur-sm overflow-y-auto"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      style={{ maxHeight: "80vh" }}
    >
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-neutral-900/95 dark:bg-neutral-800/95 py-2 z-10">
        <h2 className="text-xl font-semibold flex items-center">
          <Code className="mr-2" size={20} />
          Developer Tools
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-neutral-700 transition-colors"
          aria-label="Close developer tools"
        >
          <X size={20} />
        </button>
      </div>
      {/* Card explanation panel */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="mb-4 bg-neutral-800/80 p-4 rounded-lg border border-neutral-700"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {selectedCard.suit === "special" && selectedCard.rank !== "glitch" ? (
                  <SpecialCard card={selectedCard} />
                ) : selectedCard.rank === "glitch" ? (
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 1, -1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <Card card={selectedCard} />
                  </motion.div>
                ) : (
                  <Card card={selectedCard} />
                )}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-blue-400" />
                  <h3 className="text-lg font-medium">
                    {getCardTitle(selectedCard)}
                    <span className="text-sm font-normal ml-2 text-neutral-400">
                      {selectedCard.suit !== "special" && `(${selectedCard.suit})`}
                    </span>
                  </h3>
                </div>
                <p className="text-neutral-300">{getCardExplanation(selectedCard)}</p>
                <div className="mt-3 text-sm text-neutral-400">
                  <span className="font-medium">Card Value:</span> {selectedCard.value}
                </div>
                {(selectedCard.rank === "2" ||
                  selectedCard.rank === "3" ||
                  selectedCard.rank === "a" ||
                  selectedCard.rank === "glitch" ||
                  selectedCard.rank === "black-hole" ||
                  selectedCard.rank === "wormhole" ||
                  selectedCard.rank === "supernova" ||
                  selectedCard.rank === "asteroid-field") && (
                  <div className="mt-2 bg-blue-900/30 text-blue-300 px-3 py-2 rounded-md text-sm">
                    <span className="font-medium">Special Card</span> - Has unique gameplay effects
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="p-1 rounded-full hover:bg-neutral-700 transition-colors flex-shrink-0"
                aria-label="Close explanation"
              >
                <X size={16} />
              </button>
            </div>
            {/* Add to hand button */}
            <button
              onClick={() => {
                // Create a copy of the selected card with a unique ID
                const cardToAdd: CardType = {
                  ...selectedCard,
                  id: `${selectedCard.id}-added-${Date.now()}`,
                  faceUp: true,
                }

                // Add it to the player's hand
                onAddCardToPlayer && onAddCardToPlayer(cardToAdd)

                // Show feedback
                setSelectedCard(null)
              }}
              className="mt-3 px-3 py-2 bg-green-800 hover:bg-green-700 text-white rounded-md text-sm flex items-center gap-2 transition-colors w-full justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-plus-circle"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>
              Add to Your Hand
            </button>
            {/* Add to computer hand button */}
            <button
              onClick={() => {
                // Create a copy of the selected card with a unique ID
                const cardToAdd: CardType = {
                  ...selectedCard,
                  id: `${selectedCard.id}-added-computer-${Date.now()}`,
                  faceUp: true,
                }

                // Add it to the computer's hand
                onAddCardToComputer && onAddCardToComputer(cardToAdd)

                // Show feedback
                setSelectedCard(null)
              }}
              className="mt-2 px-3 py-2 bg-red-800 hover:bg-red-700 text-white rounded-md text-sm flex items-center gap-2 transition-colors w-full justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-cpu"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                <rect x="9" y="9" width="6" height="6"></rect>
                <line x1="9" y1="1" x2="9" y2="4"></line>
                <line x1="15" y1="1" x2="15" y2="4"></line>
                <line x1="9" y1="20" x2="9" y2="23"></line>
                <line x1="15" y1="20" x2="15" y2="23"></line>
                <line x1="20" y1="9" x2="23" y2="9"></line>
                <line x1="20" y1="14" x2="23" y2="14"></line>
                <line x1="1" y1="9" x2="4" y2="9"></line>
                <line x1="1" y1="14" x2="4" y2="14"></line>
              </svg>
              Add to Computer's Hand
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <h3 className="text-lg font-medium mb-2">All Cards</h3>
      <div className="space-y-6">
        {Object.entries(cardsBySuit).map(([suit, cards]) => (
          <div key={suit} className="space-y-2">
            <h4 className="text-md font-medium capitalize">{suit === "special" ? "Special Cards" : `${suit}`}</h4>
            <div className="flex flex-wrap gap-2">
              {cards.map((card) => (
                <div key={card.id} className="flex flex-col items-center" onClick={() => handleCardClick(card)}>
                  <div className="cursor-pointer transition-transform hover:scale-105 active:scale-95">
                    {card.suit === "special" && card.rank !== "glitch" ? (
                      <SpecialCard card={card} />
                    ) : card.rank === "glitch" ? (
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 2, -2, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                        className="relative z-10"
                      >
                        <Card card={card} />
                        <div className="absolute inset-0 z-[-1] bg-black/50 rounded-md blur-xl"></div>
                      </motion.div>
                    ) : (
                      <Card card={card} />
                    )}
                  </div>
                  <span className="text-xs mt-1">{card.rank}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 border-t border-neutral-700 pt-4">
        <h3 className="text-lg font-medium mb-2">Visual Effects</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={toggleVHSOverlay}
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-sm flex items-center gap-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide lucide-tv"
            >
              <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
              <polyline points="17 2 12 7 7 2" />
            </svg>
            Toggle glitch effect
          </button>
        </div>
      </div>
      {/* New section for debugging tools */}
      <div className="mt-6 border-t border-neutral-700 pt-4">
        <h3 className="text-lg font-medium mb-2">Debugging Tools</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={toggleComputerCardsVisible}
            className={`px-3 py-2 ${isComputerCardsVisible ? "bg-green-700" : "bg-neutral-800"} hover:bg-neutral-700 text-white rounded-md text-sm flex items-center gap-2 transition-colors`}
          >
            {isComputerCardsVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            {isComputerCardsVisible ? "Hide Computer Cards" : "Show Computer Cards"}
          </button>
        </div>

        <h4 className="text-md font-medium mb-2">Preview Game States</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={previewWinScreen}
            className="px-3 py-2 bg-green-800 hover:bg-green-700 text-white rounded-md text-sm flex items-center gap-2 transition-colors"
          >
            <Trophy size={16} />
            Preview Win Screen
          </button>
          <button
            onClick={previewLoseScreen}
            className="px-3 py-2 bg-red-800 hover:bg-red-700 text-white rounded-md text-sm flex items-center gap-2 transition-colors"
          >
            <Frown size={16} />
            Preview Lose Screen
          </button>
        </div>
        {/* Add a new section for game progression after the "Preview Game States" section */}
        <h4 className="text-md font-medium mb-2 mt-4">Game Progression</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={skipToWin}
            className="px-3 py-2 bg-indigo-800 hover:bg-indigo-700 text-white rounded-md text-sm flex items-center gap-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-skip-forward"
            >
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
            Skip to Win
          </button>
        </div>
      </div>
      {/* Add a new section for special actions */}
      <div className="mt-6 border-t border-neutral-700 pt-4">
        <h3 className="text-lg font-medium mb-2">Special Actions</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => {
              // Generate a unique black hole card
              const blackHoleCard: CardType = {
                id: `black-hole-${Date.now()}`,
                suit: "special",
                rank: "black-hole",
                value: CARD_VALUES["black-hole"],
                faceUp: true,
              }

              // Add it to the player's hand
              onAddCardToPlayer && onAddCardToPlayer(blackHoleCard)
            }}
            className="px-3 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-md text-sm flex items-center gap-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-circle-dot"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="1" />
            </svg>
            Add Black Hole Card
          </button>

          <button
            onClick={() => {
              // Generate a unique wormhole card
              const wormholeCard: CardType = {
                id: `wormhole-${Date.now()}`,
                suit: "special",
                rank: "wormhole",
                value: CARD_VALUES["wormhole"],
                faceUp: true,
              }

              // Add it to the player's hand
              onAddCardToPlayer && onAddCardToPlayer(wormholeCard)
            }}
            className="px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-md text-sm flex items-center gap-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-refresh-cw"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            Add Wormhole Card
          </button>

          <button
            onClick={() => {
              // Generate a unique supernova card
              const supernovaCard: CardType = {
                id: `supernova-${Date.now()}`,
                suit: "special",
                rank: "supernova",
                value: CARD_VALUES["supernova"],
                faceUp: true,
              }

              // Add it to the player's hand
              onAddCardToPlayer && onAddCardToPlayer(supernovaCard)
            }}
            className="px-3 py-2 bg-orange-900 hover:bg-orange-800 text-white rounded-md text-sm flex items-center gap-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-sun"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
            Add Supernova Card
          </button>

          <button
            onClick={() => {
              // Generate a unique asteroid field card
              const asteroidFieldCard: CardType = {
                id: `asteroid-field-${Date.now()}`,
                suit: "special",
                rank: "asteroid-field",
                value: CARD_VALUES["asteroid-field"],
                faceUp: true,
              }

              // Add it to the player's hand
              onAddCardToPlayer && onAddCardToPlayer(asteroidFieldCard)
            }}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm flex items-center gap-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-circle-dashed"
            >
              <path d="M10.1 2.18a9.93 9.93 0 0 1 3.8 0" />
              <path d="M17.6 3.71a9.95 9.95 0 0 1 2.69 2.7" />
              <path d="M21.82 10.1a9.93 9.93 0 0 1 0 3.8" />
              <path d="M20.29 17.6a9.95 9.95 0 0 1-2.7 2.69" />
              <path d="M13.9 21.82a9.94 9.94 0 0 1-3.8 0" />
              <path d="M6.4 20.29a9.95 9.95 0 0 1-2.69-2.7" />
              <path d="M2.18 13.9a9.93 9.93 0 0 1 0-3.8" />
              <path d="M3.71 6.4a9.95 9.95 0 0 1 2.7-2.69" />
            </svg>
            Add Asteroid Field Card
          </button>
        </div>
      </div>
      <div className="h-16"></div> {/* Spacer at bottom for better scrolling */}
    </motion.div>
  )
}

