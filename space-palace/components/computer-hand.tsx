"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { CardType } from "@/types/game-types"
import Card from "@/components/card"
import { getHandCardStyle } from "@/lib/card-layout-utils"

interface ComputerHandProps {
  hand: CardType[]
  faceUp: CardType[]
  faceDown: CardType[]
  currentPlayer: "player" | "computer"
  glitchActive?: boolean
  showComputerCards?: boolean
}

export default function ComputerHand({
  hand,
  faceUp,
  faceDown,
  currentPlayer,
  glitchActive = false,
  showComputerCards = false,
}: ComputerHandProps) {
  const isComputerTurn = currentPlayer === "computer"

  // Handle animation complete to ensure cards are properly removed
  const handleExitComplete = () => {
    // This ensures React cleans up any lingering animation elements
    console.log("Computer hand animation exit complete")
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Computer's palace label */}
      <div className="flex items-center justify-center mb-1 opacity-70">
        <motion.div
          className="text-xs text-white/80 bg-black/40 px-2 py-0.5 rounded-full border border-[#FE7B2A]/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Opponent's Palace
        </motion.div>
      </div>

      {/* Computer's face-up and face-down cards (stacked) - Palace area */}
      <div className="relative flex gap-2 justify-center p-4 bg-black/30 rounded-xl w-fit mx-auto border border-[#FE7B2A] border-opacity-60">
        {/* Add turn indicator for computer's palace */}
        {isComputerTurn && hand.length === 0 && faceUp.length === 0 && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-[#FE7B2A]/10 z-0"
            animate={{
              boxShadow: [
                "0 0 10px 2px rgba(254, 123, 42, 0.2)",
                "0 0 20px 6px rgba(254, 123, 42, 0.4)",
                "0 0 10px 2px rgba(254, 123, 42, 0.2)",
              ],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            aria-label="Computer's turn - playing from palace"
          />
        )}
        {faceDown.map((faceDownCard, index) => {
          const correspondingFaceUpCard = index < faceUp.length ? faceUp[index] : null

          return (
            <div key={`computer-facedown-${faceDownCard.id}`} className="relative computer-facedown-card">
              {/* Face down card - show face up if showComputerCards is true */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, y: 100, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              >
                <Card card={{ ...faceDownCard, faceUp: showComputerCards }} glitchActive={glitchActive} />
                {isComputerTurn && hand.length === 0 && faceUp.length === 0 && (
                  <motion.div
                    className="absolute inset-0 rounded-md bg-[#FE7B2A]/20"
                    animate={{ opacity: [0, 0.2, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                  />
                )}
              </motion.div>

              {/* Face up card stacked on top with slight offset */}
              {correspondingFaceUpCard && (
                <motion.div
                  className="absolute top-[-5px] left-[5px]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0, y: 100, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                >
                  <Card card={{ ...correspondingFaceUpCard, faceUp: true }} glitchActive={glitchActive} />
                  {isComputerTurn && hand.length === 0 && (
                    <motion.div
                      className="absolute inset-0 rounded-md bg-[#FE7B2A]/20"
                      animate={{ opacity: [0, 0.2, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    />
                  )}
                </motion.div>
              )}
            </div>
          )
        })}
      </div>

      {/* Computer's hand label */}
      <div className="flex items-center justify-center mb-1 opacity-70">
        <motion.div
          className="text-xs text-white/80 bg-black/40 px-2 py-0.5 rounded-full border border-[#FE7B2A]/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Opponent's Hand
        </motion.div>
      </div>

      {/* Computer's hand */}
      <div className="relative h-32 w-full">
        {/* Add turn indicator for computer's hand */}
        {isComputerTurn && hand.length > 0 && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-[#FE7B2A]/10 z-0"
            animate={{
              boxShadow: [
                "0 0 10px 2px rgba(254, 123, 42, 0.2)",
                "0 0 20px 6px rgba(254, 123, 42, 0.4)",
                "0 0 10px 2px rgba(254, 123, 42, 0.2)",
              ],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            aria-label="Computer's turn - playing from hand"
          />
        )}
        <AnimatePresence onExitComplete={handleExitComplete}>
          {hand.map((card, index) => (
            <motion.div
              key={`computer-hand-${card.id}`}
              className="absolute"
              initial={{ scale: 0, y: -100 }}
              animate={{
                scale: 1,
                y: 0,
                ...getHandCardStyle(index, hand.length),
              }}
              exit={{ scale: 0, y: 100, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                delay: index * 0.05,
              }}
            >
              {/* Show computer cards face up if showComputerCards is true */}
              <Card card={{ ...card, faceUp: showComputerCards }} glitchActive={glitchActive} />
              {isComputerTurn && (
                <motion.div
                  className="absolute inset-0 rounded-md bg-[#FE7B2A]/20"
                  animate={{ opacity: [0, 0.2, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

