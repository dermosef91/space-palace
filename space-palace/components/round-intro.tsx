"use client"

import { motion } from "framer-motion"
import type { OpponentCharacter } from "@/lib/opponents"
<<<<<<< HEAD
import buttonStyles from "./button.module.css"
=======
import styles from "./button.module.css"
>>>>>>> a91c3cf (add initial project setup with Next.js, Tailwind CSS, and essential configurations)

interface RoundIntroProps {
  round: number
  opponent: OpponentCharacter
  onBeginRound: () => void
}

export default function RoundIntro({ round, opponent, onBeginRound }: RoundIntroProps) {
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
        <motion.div
          className="text-[#FE7B2A] font-bold mb-1"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          ROUND {round} OF 5
        </motion.div>

        <motion.h2
          className="text-3xl font-bold mb-4 text-[#FE7B2A]"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {opponent.name}
        </motion.h2>

        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="w-32 h-32 rounded-full border border-[#FE7B2A] p-1">
            <div className="w-full h-full rounded-full overflow-hidden bg-black relative">
              <img
                src={opponent.image || "/placeholder.svg"}
                alt={opponent.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>

        <motion.div className="mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <p className="text-neutral-300 mb-3">{opponent.description}</p>
          {opponent.specialAbility && (
            <div className="mt-3 bg-[#FE7B2A]/30 text-[#FE7B2A] px-3 py-2 rounded-md text-sm inline-block">
              <span className="font-medium">Special Rules:</span> {opponent.specialAbility}
            </div>
          )}
        </motion.div>

        <motion.button
<<<<<<< HEAD
          className={`mt-6 px-6 py-3 bg-black/70 text-white rounded-lg shadow-lg font-medium transition-all border border-[#FE7B2A] hover:bg-black/80 hover:shadow-[0_0_15px_rgba(254,123,42,0.6)] w-full sm:w-auto ${buttonStyles.buttonShine}`}
=======
          className={`mt-6 px-6 py-3 bg-black/70 text-white rounded-lg shadow-lg font-medium transition-all border border-[#FE7B2A] hover:bg-black/80 hover:shadow-[0_0_15px_rgba(254,123,42,0.6)] w-full sm:w-auto ${styles.buttonShine}`}
>>>>>>> a91c3cf (add initial project setup with Next.js, Tailwind CSS, and essential configurations)
          onClick={onBeginRound}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Begin Round
        </motion.button>
      </motion.div>
    </div>
  )
}

