"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { Rank } from "@/types/game-types"
import { getDisplayRank } from "@/lib/game-utils"

interface CardDescriptionProps {
  rank: Rank | null
}

export default function CardDescription({ rank }: CardDescriptionProps) {
  // Define descriptions for each special card
  const descriptions: Record<string, { title: string; description: string }> = {
    "2": {
      title: "Clear the Pile",
      description: "Can be played on any card. Removes all cards below it from the game.",
    },
    "3": {
      title: "Transparent Card",
      description: "Can be played on any card. Takes the value and effect of the card below it.",
    },
    "7": {
      title: "Reverse Card",
      description: "Next player must play a card lower than 7.",
    },
    a: {
      title: "Ace",
      description: "Clears the pile and gives you another turn.",
    },
    glitch: {
      title: "Glitch Card",
      description: "Err0r. Sy5t3m...d3gr@d1ng...",
    },
    "black-hole": {
      title: "Black Hole",
      description:
        "Can be played on any card. Burns the pil and removes all cards from the deck.",
    },
    wormhole: {
      title: "Wormhole",
      description: "Can be played on any card. Swaps the hand cards of both players.",
    },
    supernova: {
      title: "Supernova",
      description: "Can be played on any card. Burns all cards in both players' palaces.",
    },
    "asteroid-field": {
      title: "Asteroid Field",
      description: "Can be played on any card. The next player must draw two cards.",
    },
  }

  // Get the description for the current rank
  const cardInfo = descriptions[rank] || { title: "Regular Card", description: "No special abilities." }

  // Only render if we have a rank
  if (!rank) return null

  // Check if this is a special car

  // Only render if we have a rank
  if (!rank) return null

  // Check if this is a special card
  const isSpecialCard = [
    "2",
    "3",
    "7",
    "a",
    "glitch",
    "black-hole",
    "wormhole",
    "supernova",
    "asteroid-field",
  ].includes(rank as string)

  // Don't show for non-special cards
  if (!isSpecialCard) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white rounded-lg shadow-lg p-4 max-w-xs z-50"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-lg font-medium mb-1">
          {cardInfo.title === "Regular Card" ? getDisplayRank(rank) : cardInfo.title}
        </h3>
        <p className="text-sm text-neutral-200">{cardInfo.description}</p>
      </motion.div>
    </AnimatePresence>
  )
}

