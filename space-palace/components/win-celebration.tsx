"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
<<<<<<< HEAD
import buttonStyles from "../components/button.module.css"
=======
import styles from "../components/button.module.css"
>>>>>>> a91c3cf (add initial project setup with Next.js, Tailwind CSS, and essential configurations)

interface WinCelebrationProps {
  winner: "player" | "computer"
  restartGame: () => void
  round?: number
  totalRounds?: number
  nextRound?: () => void
  isLastRound?: boolean
}

export default function WinCelebration({
  winner,
  restartGame,
  round = 1,
  totalRounds = 5,
  nextRound,
  isLastRound = false,
}: WinCelebrationProps) {
  const mounted = useRef(true)

  useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [])

  // Update the renderContent function to include the images

  const renderContent = () => {
    if (winner === "player") {
      return (
        <>
          {/* Win image */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="w-32 h-32 rounded-full border border-[#FE7B2A] p-1">
              <div className="w-full h-full rounded-full overflow-hidden bg-black relative">
                <img
                  src="https://storage.googleapis.com/palace-game/other-images/win-screen.png"
                  alt="Victory"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Win text with staggered letters */}
          <div className="overflow-hidden mb-5">
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-center text-[#FE7B2A]"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              {isLastRound ? "You've Won The Game!" : "Round Complete!"}
            </motion.h1>
          </div>

          {/* Round information */}
          {!isLastRound && (
            <motion.div
              className="text-lg mb-2 text-[#FE7B2A] font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Round {round} of {totalRounds} completed
            </motion.div>
          )}

          {/* Motivational message */}
          <motion.p
            className="text-lg mb-6 text-neutral-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.7,
              duration: 0.5,
            }}
          >
            {isLastRound
              ? "Congratulations! You've defeated all five opponents and proven yourself the ultimate Palace master!"
              : "Great work! You've mastered this round. Are you ready for your next opponent?"}
          </motion.p>
        </>
      )
    } else {
      return (
        <>
          {/* Lose image */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="w-32 h-32 rounded-full border border-[#FE7B2A] p-1">
              <div className="w-full h-full rounded-full overflow-hidden bg-black relative">
                <img
                  src="https://storage.googleapis.com/palace-game/other-images/game-over.png"
                  alt="Game Over"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Lose text */}
          <div className="overflow-hidden mb-5">
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-center text-[#FE7B2A]"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              Game Over!
            </motion.h1>
          </div>

          {/* Round information */}
          <motion.div
            className="text-lg mb-2 text-[#FE7B2A] font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Defeated on Round {round} of {totalRounds}
          </motion.div>

          {/* Encouraging message */}
          <motion.p
            className="text-lg mb-6 text-neutral-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.7,
              duration: 0.5,
            }}
          >
            Don't worry, even the best card players lose sometimes. Ready to start over?
          </motion.p>
        </>
      )
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-md">
      <motion.div
        className="bg-black/90 border border-[#FE7B2A] rounded-lg p-8 max-w-2xl w-full mx-4 text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          duration: 0.5,
        }}
      >
        {renderContent()}

        {/* Buttons section */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {winner === "player" && !isLastRound && nextRound ? (
            <motion.button
<<<<<<< HEAD
              className={`mt-6 px-6 py-3 bg-black/70 text-white rounded-lg shadow-lg font-medium transition-all border border-[#FE7B2A] hover:bg-black/80 hover:shadow-[0_0_15px_rgba(254,123,42,0.6)] w-full sm:w-auto ${buttonStyles.buttonShine}`}
=======
              className={`mt-6 px-6 py-3 bg-black/70 text-white rounded-lg shadow-lg font-medium transition-all border border-[#FE7B2A] hover:bg-black/80 hover:shadow-[0_0_15px_rgba(254,123,42,0.6)] w-full sm:w-auto ${styles.buttonShine}`}
>>>>>>> a91c3cf (add initial project setup with Next.js, Tailwind CSS, and essential configurations)
              onClick={nextRound}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.2,
                duration: 0.5,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next Round
            </motion.button>
          ) : (
            <motion.button
<<<<<<< HEAD
              className={`mt-6 px-6 py-3 bg-black/70 text-white rounded-lg shadow-lg font-medium transition-all border border-[#FE7B2A] hover:bg-black/80 hover:shadow-[0_0_15px_rgba(254,123,42,0.6)] w-full sm:w-auto ${buttonStyles.buttonShine}`}
=======
              className={`mt-6 px-6 py-3 bg-black/70 text-white rounded-lg shadow-lg font-medium transition-all border border-[#FE7B2A] hover:bg-black/80 hover:shadow-[0_0_15px_rgba(254,123,42,0.6)] w-full sm:w-auto ${styles.buttonShine}`}
>>>>>>> a91c3cf (add initial project setup with Next.js, Tailwind CSS, and essential configurations)
              onClick={restartGame}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.2,
                duration: 0.5,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {winner === "player" && isLastRound ? "Play Again" : "Try Again"}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

