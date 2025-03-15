"use client"

import { motion } from "framer-motion"

interface RoundTrackerProps {
  currentRound: number
  totalRounds: number
}

export default function RoundTracker({ currentRound, totalRounds }: RoundTrackerProps) {
  return (
    <div className="fixed top-2 left-2 z-40 flex items-center bg-black/70 border border-[#FE7B2A]/50 rounded-lg px-3 py-1.5 text-white text-sm font-medium shadow-lg">
      <div className="mr-2">Round:</div>
      <div className="flex space-x-1">
        {Array.from({ length: totalRounds }).map((_, index) => (
          <motion.div
            key={`round-${index + 1}`}
            className={`w-3 h-3 rounded-full ${index + 1 <= currentRound ? "bg-[#FE7B2A]" : "bg-white/20"}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.2 }}
          />
        ))}
      </div>
    </div>
  )
}

