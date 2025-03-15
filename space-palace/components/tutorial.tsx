"use client"

import { motion } from "framer-motion"
import { HelpCircle, Crown, Zap, ArrowRightCircle, PlayCircle } from "lucide-react"
import buttonStyles from "../components/button.module.css"

interface TutorialProps {
  startGame: () => void
}

export default function Tutorial({ startGame }: TutorialProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-md">
      <motion.div
        className="bg-black/90 border border-[#FE7B2A] rounded-lg p-8 max-w-2xl w-full mx-4 text-center overflow-y-auto max-h-[90vh]"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          duration: 0.5,
        }}
      >
        {/* Tutorial header */}
        <motion.div
          className="mb-6 flex items-center justify-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <HelpCircle size={30} className="mr-2 text-[#FE7B2A]" />
          <h2 className="text-2xl sm:text-3xl font-bold text-[#FE7B2A]">How to Play</h2>
        </motion.div>

        {/* Tutorial content */}
        <motion.div
          className="space-y-6 text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Game objective */}
          <div className="flex items-start">
            <div className="bg-[#FE7B2A]/30 p-2 rounded-full mr-3 mt-0.5">
              <Crown size={18} className="text-[#FE7B2A]" />
            </div>
            <div>
              <h3 className="font-bold text-[#FE7B2A] mb-1">Objective</h3>
              <p className="text-sm text-neutral-300">Be the first to play all your Palace cards.</p>
            </div>
          </div>

          {/* Playing the game */}
          <div className="flex items-start">
            <div className="bg-[#FE7B2A]/30 p-2 rounded-full mr-3 mt-0.5">
              <ArrowRightCircle size={18} className="text-[#FE7B2A]" />
            </div>
            <div>
              <h3 className="font-bold text-[#FE7B2A] mb-1">How to Play</h3>
              <p className="text-sm text-neutral-300">
                Take turns playing from your Hand. If you can't play, pick up the pile!
              </p>
              <p className="text-sm text-neutral-300 mt-2">Keep drawing until the draw pile is empty.</p>
              <p className="text-sm text-neutral-300 mt-2">Then, play your Palace cards:</p>
              <ol className="text-sm text-neutral-300 list-decimal pl-5 space-y-1 mt-2">
                <li>First, the three face-up cards.</li>
                <li>Then, the three face-down cards—played blindly.</li>
              </ol>
            </div>
          </div>

          {/* Special cards */}
          <div className="flex items-start">
            <div className="bg-[#FE7B2A]/30 p-2 rounded-full mr-3 mt-0.5">
              <Zap size={18} className="text-[#FE7B2A]" />
            </div>
            <div>
              <h3 className="font-bold text-[#FE7B2A] mb-1">Special Cards</h3>
              <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1">
                <li>
                  <b>2</b> – Play anytime; clears the pile.
                </li>
                <li>
                  <b>3</b> – Play anytime; copies the last card's value.
                </li>
                <li>
                  <b>7</b> – The next card must be lower than 7.
                </li>
                <li>
                  <b>Ace</b> – Clears the pile and lets you play again.
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Start game button */}
        <motion.button
          className={`mt-6 px-6 py-3 bg-black/70 text-white rounded-lg shadow-lg font-medium transition-all border border-[#FE7B2A] hover:bg-black/80 hover:shadow-[0_0_15px_rgba(254,123,42,0.6)] w-full sm:w-auto ${buttonStyles.buttonShine}`}
          onClick={startGame}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.6,
            duration: 0.5,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center justify-center">
            <PlayCircle size={20} className="mr-2" />
            Start Game
          </div>
        </motion.button>
      </motion.div>
    </div>
  )
}

