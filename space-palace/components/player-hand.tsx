"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import type { CardType } from "@/types/game-types"
import Card from "@/components/card"
import { useState, useEffect, useRef } from "react"
import { getDisplayRank } from "@/lib/game-utils"
<<<<<<< HEAD
import buttonStyles from "../components/button.module.css"
=======
import styles from "../components/button.module.css"
>>>>>>> a91c3cf (add initial project setup with Next.js, Tailwind CSS, and essential configurations)
import { getHandCardStyle } from "@/lib/card-layout-utils"

// Helper function to check if a card can be played
const canPlayCard = (card: CardType, currentPile: CardType[]): boolean => {
  // First card can always be played
  if (currentPile.length === 0) return true

  const topCard = currentPile[currentPile.length - 1]

  // Special cards
  // 2 can be played on anything
  if (card.rank === "2") return true

  // 3 or glitch can be played on anything (takes value of card below)
  if (card.rank === "3" || card.rank === "glitch") return true

  // Ace can be played on anything except 7
  if (card.rank === "a" && topCard.rank !== "7") return true

  // 7 rules - next card must be lower than 7
  if (topCard.rank === "7") {
    return card.value < 7
  }

  // If top card is a 3 or glitch, check the card below
  if ((topCard.rank === "3" || topCard.rank === "glitch") && currentPile.length > 1) {
    const cardBelowTop = currentPile[currentPile.length - 2]

    // If the card below the 3 is a 7, apply the 7's rule
    if (cardBelowTop.rank === "7") {
      return card.value < 7
    }

    // If card below is also a 3 or glitch, we need to go deeper
    if (cardBelowTop.rank === "3" || cardBelowTop.rank === "glitch") {
      // Find the first non-3/non-glitch card in the pile
      let i = currentPile.length - 3
      while (i >= 0 && (currentPile[i].rank === "3" || currentPile[i].rank === "glitch")) {
        i--
      }
      // If found, use its value, otherwise use default rules
      if (i >= 0) {
        // If the card we found is a 7, apply the 7's rule
        if (currentPile[i].rank === "7") {
          return card.value < 7
        }
        if (card.rank === currentPile[i].rank) return false
        return card.value > currentPile[i].value
      }
    } else {
      if (card.rank === cardBelowTop.rank) return false
      return card.value > cardBelowTop.value
    }
  }

  // Normal rules - card value must be HIGHER than top card
  return card.value > topCard.value
}

interface PlayerHandProps {
  hand: CardType[]
  faceUp: CardType[]
  faceDown: CardType[]
  playCards: (cards: CardType[]) => void
  playFaceUpCards: (cards: CardType[]) => void
  playFaceDownCard: (card: CardType, cardElement: HTMLElement) => void
  pickUpPile: () => void
  gameState: string
  currentPlayer: "player" | "computer"
  pile: CardType[]
  handleCardSwap?: (card: CardType, type: "hand" | "faceUp") => void
  selectedHandCard?: CardType | null
  selectedFaceUpCard?: CardType | null
  deck?: CardType[]
  finishSwapping?: () => void
  onHoverCard?: (card: CardType | null) => void
}

export default function PlayerHand({
  hand,
  faceUp,
  faceDown,
  playCards,
  playFaceUpCards,
  playFaceDownCard,
  pickUpPile,
  gameState,
  currentPlayer,
  pile,
  handleCardSwap,
  selectedHandCard,
  selectedFaceUpCard,
  deck = [],
  finishSwapping,
  onHoverCard,
}: PlayerHandProps) {
  const isPlayerTurn = currentPlayer === "player" && gameState === "playing"
  const isSwapping = gameState === "swapping"

  // Debug ref to track face-up cards
  const prevFaceUpRef = useRef<CardType[]>([])

  // Track previous hand to help with animation issues
  const prevHandRef = useRef<CardType[]>([])

  // State to track selected cards for playing
  const [selectedForPlay, setSelectedForPlay] = useState<CardType[]>([])

  // Log when face-up cards change
  useEffect(() => {
    if (prevFaceUpRef.current.length !== faceUp.length) {
      console.log("Face-up cards changed:", {
        previous: prevFaceUpRef.current.map((c) => `${c.rank}-${c.suit}`),
        current: faceUp.map((c) => `${c.rank}-${c.suit}`),
      })
      prevFaceUpRef.current = [...faceUp]
    }

    // Update previous hand reference
    prevHandRef.current = [...hand]
  }, [faceUp, hand])

  // Reset selected cards when turn changes or hand changes
  useEffect(() => {
    if (!isPlayerTurn || hand.length !== prevHandRef.current.length) {
      setSelectedForPlay([])
    }
  }, [isPlayerTurn, hand.length])

  // Handle card selection for playing
  const handleCardSelect = (card: CardType) => {
    if (!isPlayerTurn) return

    setSelectedForPlay((prev) => {
      const isSelected = prev.some((c) => c.id === card.id)

      if (isSelected) {
        // If already selected, remove it
        return prev.filter((c) => c.id !== card.id)
      } else if (prev.length > 0 && prev[0].rank !== card.rank) {
        // If different rank, replace all selections with just this card
        return [card]
      } else {
        // If same rank or no other cards selected, add it
        return [...prev, card]
      }
    })
  }

  // Play selected cards
  const playSelectedCards = () => {
    if (selectedForPlay.length > 0) {
      playCards(selectedForPlay)
      setSelectedForPlay([])
    }
  }

  // Get display text for the selected cards
  const getSelectedCardText = () => {
    if (selectedForPlay.length === 0) return "Pick Up Pile"

    const rank = selectedForPlay[0].rank
    const count = selectedForPlay.length

    // Get display text for the rank
    const rankDisplay = getDisplayRank(rank)

    return `Play ${count > 1 ? count + " " : ""}${rankDisplay}${count > 1 ? "s" : ""}`
  }

  // Check if a card is selected for play
  const isCardSelected = (card: CardType) => {
    return selectedForPlay.some((c) => c.id === card.id)
  }

  // Modified function to only check hand cards
  const hasPlayableHandCards = () => {
    // Only check hand cards, not face-up or face-down
    return hand.some((card) => canPlayCard(card, pile))
  }

  // Should the Pick Up Pile button be red?
  const shouldHighlightPickUpButton = () => {
    // Only highlight when:
    // 1. There are cards in the pile
    // 2. Player has cards in their hand (they're not playing from palace)
    // 3. None of the hand cards are playable
    return pile.length > 0 && hand.length > 0 && !hasPlayableHandCards()
  }

  // Handle selecting face up cards
  const handleFaceUpCardSelect = (card: CardType) => {
    if (!isPlayerTurn || (hand.length > 0 && deck.length === 0)) return

    setSelectedForPlay((prev) => {
      const isSelected = prev.some((c) => c.id === card.id)

      if (isSelected) {
        // If already selected, remove it
        return prev.filter((c) => c.id !== card.id)
      } else if (prev.length > 0 && prev[0].rank !== card.rank) {
        // If different rank, replace all selections with just this card
        return [card]
      } else {
        // If same rank or no other cards selected, add it
        return [...prev, card]
      }
    })
  }

  // Play selected face up cards
  const playSelectedFaceUpCards = () => {
    if (selectedForPlay.length > 0) {
      console.log(
        "Playing face-up cards:",
        selectedForPlay.map((c) => `${c.rank}-${c.suit}`),
      )
      playFaceUpCards(selectedForPlay)
      setSelectedForPlay([])
    }
  }

  // Check if selected cards are playable
  const areSelectedCardsPlayable = () => {
    if (selectedForPlay.length === 0) return false
    // All cards must be of the same rank, so we just need to check the first one
    return canPlayCard(selectedForPlay[0], pile)
  }

  // Handle card hover events
  const handleCardMouseEnter = (card: CardType) => {
    if (onHoverCard) onHoverCard(card)
  }

  const handleCardMouseLeave = () => {
    if (onHoverCard) onHoverCard(null)
  }

  const handleExitComplete = () => {
    // This ensures React cleans up any lingering animation elements
    console.log("Animation exit complete")
  }

  // Handle face down card click with reference to the DOM element
  const handleFaceDownCardClick = (card: CardType, event: React.MouseEvent<HTMLDivElement>) => {
    if (isPlayerTurn && hand.length === 0 && faceUp.length === 0) {
      // Get the card element
      const cardElement = event.currentTarget as HTMLElement
      playFaceDownCard(card, cardElement)
    }
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Player's hand with turn indicator - only show if there are cards */}
      {hand.length > 0 && (
        <>
          <div className="flex items-center justify-center mb-1 opacity-70">
            <motion.div
              className="text-xs text-white/80 bg-black/40 px-2 py-0.5 rounded-full border border-[#FE7B2A]20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Your Hand
            </motion.div>
          </div>
          <div className="relative h-32 w-full mb-2">
            {/* Add turn indicator for player's hand */}
            {(isSwapping || (isPlayerTurn && hand.length > 0)) && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-[#FE7B2A]/10 z-0"
                animate={{
                  boxShadow: [
                    "0 0 20px 8px rgba(254, 123, 42, 0.3)",
                    "0 0 35px 15px rgba(254, 123, 42, 0.5)",
                    "0 0 20px 8px rgba(254, 123, 42, 0.3)",
                  ],
<<<<<<< HEAD
                  opacity: [03, 0.7],
=======
                  opacity: [0.3, 0.7],
>>>>>>> a91c3cf (add initial project setup with Next.js, Tailwind CSS, and essential configurations)
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                aria-label={isSwapping ? "Swapping phase - select cards to swap" : "Your turn - play from hand"}
              />
            )}
            <AnimatePresence onExitComplete={handleExitComplete}>
              {hand.map((card, index) => (
                <motion.div
                  key={`hand-${card.id}`}
                  className="absolute"
                  initial={{ scale: 0, y: 100 }}
                  animate={{
                    scale: 1,
                    y: isCardSelected(card) || (selectedHandCard && selectedHandCard.id === card.id) ? -10 : 0,
                    ...getHandCardStyle(index, hand.length),
                  }}
                  exit={{ scale: 0, y: -100, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    delay: index * 0.05,
                  }}
                  whileHover={hand.length > 5 ? { y: -15, zIndex: 100 } : {}}
                >
                  <Card
                    card={{
                      ...card,
                      faceUp: true,
                      selected: isCardSelected(card) || (selectedHandCard && selectedHandCard.id === card.id),
                    }}
                    onClick={
                      isSwapping
                        ? () => handleCardSwap && handleCardSwap(card, "hand")
                        : isPlayerTurn
                          ? () => handleCardSelect(card)
                          : undefined
                    }
                    selectable={isSwapping || isPlayerTurn}
                    onMouseEnter={() => handleCardMouseEnter(card)}
                    onMouseLeave={handleCardMouseLeave}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Action button when hand has cards */}
      {isPlayerTurn && hand.length > 0 && (
        <div className="flex gap-2">
          {selectedForPlay.length > 0 ? (
            <motion.button
<<<<<<< HEAD
              className={`px-4 py-2 rounded-md font-light shadow-md border border-[#FE7B2A] transition-all ${buttonStyles.buttonShine}
=======
              className={`px-4 py-2 rounded-md font-light shadow-md border border-[#FE7B2A] transition-all ${styles.buttonShine}
>>>>>>> a91c3cf (add initial project setup with Next.js, Tailwind CSS, and essential configurations)
 ${
   areSelectedCardsPlayable()
     ? "bg-black/70 text-white hover:bg-[#FE7B2A]/80 hover:shadow-[0_0_10px_rgba(254,123,42,0.5)]"
     : "bg-black/40 text-white/50 border-[#FE7B2A]/30 cursor-not-allowed"
 }`}
              onClick={
                areSelectedCardsPlayable()
                  ? selectedForPlay.some((card) => faceUp.some((c) => c.id === card.id))
                    ? playSelectedFaceUpCards
                    : playSelectedCards
                  : undefined
              }
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              whileHover={areSelectedCardsPlayable() ? { scale: 1.05 } : {}}
              whileTap={areSelectedCardsPlayable() ? { scale: 0.95 } : {}}
            >
              {getSelectedCardText()}
            </motion.button>
          ) : (
            <motion.button
<<<<<<< HEAD
              className={`px-4 py-2 rounded-md font-light shadow-md border border-[#FE7B2A] transition-all ${buttonStyles.buttonShine}
 ${
   shouldHighlightPickUpButton()
     ? `bg-[#FE7B2A]/80 text-white hover:shadow-[0_0_10px_rgba(254,123,42,0.7)] ${buttonStyles.buttonPulse}`
=======
              className={`px-4 py-2 rounded-md font-light shadow-md border border-[#FE7B2A] transition-all ${styles.buttonShine}
 ${
   shouldHighlightPickUpButton()
     ? `bg-[#FE7B2A]/80 text-white hover:shadow-[0_0_10px_rgba(254,123,42,0.7)] ${styles.buttonPulse}`
>>>>>>> a91c3cf (add initial project setup with Next.js, Tailwind CSS, and essential configurations)
     : "bg-black/70 text-white hover:bg-black/80 hover:shadow-[0_0_10px_rgba(254,123,42,0.5)]"
 }`}
              onClick={pickUpPile}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: pile.length > 0 ? 1 : 0,
                y: pile.length > 0 ? 0 : 10,
              }}
              exit={{ opacity: 0, y: 10 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={pile.length === 0}
            >
              Pick Up Pile
            </motion.button>
          )}
        </div>
      )}

      <div className="flex items-center justify-center mb-1 opacity-70">
        <motion.div
          className="text-xs text-white/80 bg-black/40 px-2 py-0.5 rounded-full border border-[#FE7B2A]/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Your Palace
        </motion.div>
      </div>
      {/* Player's face-up and face-down cards (stacked) - Palace area */}
      <div className={`relative w-fit mx-auto mb-2 ${hand.length === 0 ? "mt-8" : ""}`}>
        {/* Palace area pulse indicator during swapping or when playing from palace */}
        {(isSwapping || (isPlayerTurn && hand.length === 0)) && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-[#FE7B2A]/20"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              boxShadow: [
                "0 0 20px 8px rgba(254, 123, 42, 0.3)",
                "0 0 35px 15px rgba(254, 123, 42, 0.5)",
                "0 0 20px 8px rgba(254, 123, 42, 0.3)",
              ],
              border: [
                "2px solid rgba(254, 123, 42, 0.4)",
                "2px solid rgba(254, 123, 42, 0.8)",
                "2px solid rgba(254, 123, 42, 0.4)",
              ],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
              ease: "easeInOut",
            }}
            aria-label={isPlayerTurn && hand.length === 0 ? "Your turn - play from palace" : "Swapping area"}
          />
        )}
        <div className="flex gap-2 justify-center p-4 bg-black/30 rounded-xl relative z-10 border border-[#FE7B2A] border-opacity-60">
          {faceDown.map((faceDownCard, index) => {
            const correspondingFaceUpCard = index < faceUp.length ? faceUp[index] : null

            return (
              <div key={`facedown-${faceDownCard.id}`} className="relative">
                {/* Face down card */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0, y: -100, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                  onClick={(e) => handleFaceDownCardClick(faceDownCard, e)}
                >
                  <Card card={faceDownCard} selectable={isPlayerTurn && hand.length === 0 && faceUp.length === 0} />
                </motion.div>

                {/* Face up card stacked on top with slight offset */}
                {correspondingFaceUpCard && (
                  <motion.div
                    className="absolute top-[-5px] left-[5px]"
                    initial={{ scale: 0 }}
                    animate={{
                      scale: 1,
                      y:
                        isCardSelected(correspondingFaceUpCard) ||
                        (selectedFaceUpCard && selectedFaceUpCard.id === correspondingFaceUpCard.id)
                          ? -10
                          : 0,
                    }}
                    exit={{ scale: 0, y: -100, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  >
                    <Card
                      card={{
                        ...correspondingFaceUpCard,
                        selected:
                          isCardSelected(correspondingFaceUpCard) ||
                          (selectedFaceUpCard && selectedFaceUpCard.id === correspondingFaceUpCard.id),
                      }}
                      onClick={
                        isSwapping
                          ? () => handleCardSwap && handleCardSwap(correspondingFaceUpCard, "faceUp")
                          : isPlayerTurn && (hand.length === 0 || (deck && deck.length === 0))
                            ? () => handleFaceUpCardSelect(correspondingFaceUpCard)
                            : undefined
                      }
                      selectable={isSwapping || (isPlayerTurn && (hand.length === 0 || (deck && deck.length === 0)))}
                      onMouseEnter={() => handleCardMouseEnter(correspondingFaceUpCard)}
                      onMouseLeave={handleCardMouseLeave}
                    />
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Swapping phase button */}
      {isSwapping && finishSwapping && (
        <div className="flex gap-2 mt-4">
          <motion.button
<<<<<<< HEAD
            className={`px-4 py-2 bg-black/70 text-white rounded-md font-light shadow-md border border-[#FE7B2A] hover:bg-black/80 hover:shadow-[0_0_10px_rgba(254,123,42,0.5)] transition-all ${buttonStyles.buttonShine}`}
=======
            className={`px-4 py-2 bg-black/70 text-white rounded-md font-light shadow-md border border-[#FE7B2A] hover:bg-black/80 hover:shadow-[0_0_10px_rgba(254,123,42,0.5)] transition-all ${styles.buttonShine}`}
>>>>>>> a91c3cf (add initial project setup with Next.js, Tailwind CSS, and essential configurations)
            onClick={finishSwapping}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Done Swapping
          </motion.button>
        </div>
      )}

      {/* Action button below palace when hand is empty */}
      {isPlayerTurn && hand.length === 0 && (
        <div className="flex gap-2 mt-4">
          {selectedForPlay.length > 0 ? (
            <motion.button
<<<<<<< HEAD
              className={`px-4 py-2 rounded-md font-light shadow-md border border-[#FE7B2A] transition-all ${buttonStyles.buttonShine}
=======
              className={`px-4 py-2 rounded-md font-light shadow-md border border-[#FE7B2A] transition-all ${styles.buttonShine}
>>>>>>> a91c3cf (add initial project setup with Next.js, Tailwind CSS, and essential configurations)
 ${
   areSelectedCardsPlayable()
     ? "bg-black/70 text-white hover:bg-[#FE7B2A]/80 hover:shadow-[0_0_10px_rgba(254,123,42,0.5)]"
     : "bg-black/40 text-white/50 border-[#FE7B2A]/30 cursor-not-allowed"
 }`}
              onClick={
                areSelectedCardsPlayable()
                  ? selectedForPlay.some((card) => faceUp.some((c) => c.id === card.id))
                    ? playSelectedFaceUpCards
                    : playSelectedCards
                  : undefined
              }
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              whileHover={areSelectedCardsPlayable() ? { scale: 1.05 } : {}}
              whileTap={areSelectedCardsPlayable() ? { scale: 0.95 } : {}}
            >
              {getSelectedCardText()}
            </motion.button>
          ) : (
            // Only show the Pick Up Pile button when there are cards in the pile AND we're not playing from palace
            // (i.e., we're in a situation where the player has no hand cards but still needs to pick up)
            pile.length > 0 && (
              <motion.button
<<<<<<< HEAD
                className={`px-4 py-2 bg-black/70 text-white rounded-md font-light shadow-md border border-[#FE7B2A] hover:bg-black/80 hover:shadow-[0_0_10px_rgba(254,123,42,0.5)] transition-all ${buttonStyles.buttonShine}`}
=======
                className={`px-4 py-2 bg-black/70 text-white rounded-md font-light shadow-md border border-[#FE7B2A] hover:bg-black/80 hover:shadow-[0_0_10px_rgba(254,123,42,0.5)] transition-all ${styles.buttonShine}`}
>>>>>>> a91c3cf (add initial project setup with Next.js, Tailwind CSS, and essential configurations)
                onClick={pickUpPile}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Pick Up Pile
              </motion.button>
            )
          )}
        </div>
      )}
    </div>
  )
}

