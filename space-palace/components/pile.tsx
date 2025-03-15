"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import type { CardType } from "@/types/game-types"
import Card from "@/components/card"
import PileViewer from "@/components/pile-viewer"
import SpecialCard from "@/components/special-card"

interface PileProps {
  pile: CardType[]
}

export default function Pile({ pile }: PileProps) {
  const [showPileViewer, setShowPileViewer] = useState(false)

  const handlePileClick = () => {
    if (pile.length > 0) {
      setShowPileViewer(true)
    }
  }

  return (
    <>
      <div
        className="relative h-28 w-20 cursor-pointer"
        onClick={handlePileClick}
        aria-label={pile.length > 0 ? "View pile contents" : "Empty pile"}
      >
        {/* Placeholder for empty pile */}
        {pile.length === 0 ? (
          <motion.div
            className="absolute inset-0 rounded-md bg-[#FE7B2A]/20"
            animate={{
              boxShadow: [
                "0 0 8px 2px rgba(254, 123, 42, 0.2)",
                "0 0 15px 4px rgba(254, 123, 42, 0.3)",
                "0 0 8px 2px rgba(254, 123, 42, 0.2)",
              ],
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ) : (
          // Subtle indicator that pile is clickable
          <motion.div
            className="absolute inset-0 rounded-md bg-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        )}

        <AnimatePresence>
          {pile.slice(-5).map((card, index, array) => (
            <motion.div
              key={card.id}
              className="absolute"
              initial={{
                scale: 1.5,
                y: -100,
                rotate: Math.random() * 20 - 10,
              }}
              animate={{
                scale: 1,
                y: index * 2,
                x: index * 2,
                rotate: Math.random() * 10 - 5,
                zIndex: index,
              }}
              exit={{ scale: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
            >
              {card.special ? <SpecialCard card={card} /> : <Card card={card} />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pile viewer modal */}
      {showPileViewer && <PileViewer pile={pile} onClose={() => setShowPileViewer(false)} />}
    </>
  )
}

