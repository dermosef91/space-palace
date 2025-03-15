"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import type { CardType } from "@/types/game-types"
import Card from "@/components/card"

interface PileViewerProps {
  pile: CardType[]
  onClose: () => void
}

export default function PileViewer({ pile, onClose }: PileViewerProps) {
  if (pile.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-neutral-900/90 rounded-xl p-4 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Pile Contents ({pile.length} cards)</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cards in pile */}
          <div>
            <h3 className="text-sm text-neutral-400 mb-2">All Cards</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {[...pile].reverse().map((card, index) => (
                <div key={`pile-card-${card.id}-${index}`} className="relative">
                  <Card card={card} />
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      Top
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

