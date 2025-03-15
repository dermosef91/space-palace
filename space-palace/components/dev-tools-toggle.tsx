"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Code } from "lucide-react"
import DevTools from "@/components/dev-tools"

interface CardType {
  id: string
  name: string
  // Add other properties as needed
}

interface DevToolsToggleProps {
  toggleVHSOverlay?: () => void
  toggleComputerCardsVisible?: () => void
  isComputerCardsVisible?: boolean
  previewWinScreen?: () => void
  previewLoseScreen?: () => void
  onAddCardToPlayer?: (card: CardType) => void
  onAddCardToComputer?: (card: CardType) => void
  skipToWin?: () => void
}

export default function DevToolsToggle({
  toggleVHSOverlay,
  toggleComputerCardsVisible,
  isComputerCardsVisible = false,
  previewWinScreen,
  previewLoseScreen,
  onAddCardToPlayer,
  onAddCardToComputer,
  skipToWin,
}: DevToolsToggleProps) {
  const [showDevTools, setShowDevTools] = useState(false)

  return (
    <>
      <motion.button
        className="fixed bottom-16 right-4 bg-black/70 text-white p-2 rounded-full shadow-lg z-40 border border-[#FE7B2A] hover:bg-black/80 hover:shadow-[0_0_15px_rgba(254,123,42,0.6)]"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowDevTools(true)}
        aria-label="Open developer tools"
      >
        <Code size={24} />
      </motion.button>

      <AnimatePresence>
        {showDevTools && (
          <DevTools
            onClose={() => setShowDevTools(false)}
            toggleVHSOverlay={toggleVHSOverlay}
            toggleComputerCardsVisible={toggleComputerCardsVisible}
            isComputerCardsVisible={isComputerCardsVisible}
            previewWinScreen={previewWinScreen}
            previewLoseScreen={previewLoseScreen}
            onAddCardToPlayer={onAddCardToPlayer}
            onAddCardToComputer={onAddCardToComputer}
            skipToWin={skipToWin}
          />
        )}
      </AnimatePresence>
    </>
  )
}

