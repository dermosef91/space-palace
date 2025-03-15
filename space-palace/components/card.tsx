"use client"

import { motion } from "framer-motion"
import type { CardType } from "@/types/game-types"
import GlitchEffect from "./glitch-effect"
<<<<<<< HEAD
import styles from "./card.module.css"
=======
import styles from "./card.module.css" // CORRECT: Default import
>>>>>>> a91c3cf (add initial project setup with Next.js, Tailwind CSS, and essential configurations)
import SpecialCard from "./special-card"

interface CardProps {
  card: CardType
  onClick?: () => void
  selectable?: boolean
  glitchActive?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function Card({
  card,
  onClick,
  selectable = false,
  glitchActive = false,
  onMouseEnter,
  onMouseLeave,
}: CardProps) {
  // Card colors
  const suitColors = {
    hearts: "text-[#b7232e]",
    diamonds: "text-[#b7232e]",
    clubs: "text-[#343344] dark:text-[#343344]",
    spades: "text-[#343344] dark:text-[#343344]",
  }

  // Card suit symbols
  const suitSymbols = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  }

  // Face card representations
  const displayValue = () => {
    if (card.rank === "j") return "J"
    if (card.rank === "q") return "Q"
    if (card.rank === "k") return "K"
    if (card.rank === "a") return "A"
    if (card.rank === "glitch") return "?"
    return card.rank
  }

  // Determine if this is a "3" card that needs special styling
  const isThreeCard = card.faceUp && card.rank === "3"
  const isSevenCard = card.faceUp && card.rank === "7"
  const isTwoCard = card.faceUp && card.rank === "2"

  const getSuitColor = (suit: string) => {
    if (isTwoCard) {
      return "text-white" // All suits are white for "2" cards
    }
    return suitColors[suit]
  }

  return (
    <motion.div
      className={`relative w-[3.325rem] h-[5.25rem] md:w-[4.75rem] md:h-28 rounded-md cursor-pointer select-none overflow-visible
               ${card.faceUp ? "bg-white dark:bg-neutral-800" : "bg-neutral-300 dark:bg-neutral-700"}
               ${isThreeCard ? styles.threeCard : ""}
               ${isSevenCard ? styles.sevenCard : ""}
               ${isTwoCard ? styles.twoCard : ""}`}
      style={
        card.selected
          ? {
              boxShadow: "0 0 0 2px #f2a63a, 0 0 10px 2px rgba(242, 166, 58, 0.7)",
            }
          : {
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }
      }
      whileHover={selectable ? { y: -10 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      layout
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
    >
      {card.faceUp ? (
        card.rank === "glitch" ? (
          // Enhanced holographic glitch card front
          <div className="h-full w-full overflow-hidden relative rounded-md">
            <GlitchEffect intensity="high" className="rounded-md" />
          </div>
        ) : card.suit === "special" || card.rank === "black-hole" ? (
          // Special cards (including black-hole) - use the SpecialCard component
          <SpecialCard card={card} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />
        ) : (
          // Regular card front
          <div
            className={`h-full w-full p-1 flex flex-col justify-between rounded-md 
${isTwoCard ? styles.twoCardContent : ""}
${isThreeCard ? styles.threeCardContent : ""} 
${isSevenCard ? styles.sevenCardContent : ""} 
${card.faceUp && card.rank !== "glitch" && !isTwoCard ? "bg-[#fff7e3]" : ""}`}
          >
            {/* Top left */}
            <div
              className={`text-left text-base md:text-lg font-sans font-bold tracking-tight ${getSuitColor(card.suit)}`}
            >
              {displayValue()}
            </div>

            {/* Center */}
            <div
              className={`absolute inset-0 flex items-center justify-center text-4xl md:text-5xl font-bold ${getSuitColor(card.suit)}`}
            >
              {suitSymbols[card.suit]}
            </div>

            {/* Bottom right */}
            <div
              className={`text-right text-base md:text-lg font-sans font-bold tracking-tight self-end ${getSuitColor(card.suit)}`}
            >
              {displayValue()}
            </div>

            {/* Shine effect for "3" cards */}
            {isThreeCard && <div className={styles.shine}></div>}
          </div>
        )
      ) : (
        <div className="h-full w-full">
          <div
            className="w-full h-full rounded-md relative"
            style={{
              backgroundImage: glitchActive
                ? 'url("https://storage.googleapis.com/palace-game/glitchbg.png")'
                : 'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mosef8868_Generate_an_abstract_background_image_with_a_dark_cos_a86b0087-2144-48a2-9a6b-c426e0dfb127.png-uQheUcOaFsMHtxYwmeKjb7RxzrWrF7.jpeg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "1px solid rgba(254, 123, 42, 0.6)",
            }}
          >
            {/* Inner border */}
            <div
              className="absolute inset-[1px] rounded-[3px]"
              style={{
                border: "1px solid rgba(254, 123, 42, 0.6)",
              }}
            />

            {/* Subtle black to transparent gradient overlay */}
            <div
              className="absolute inset-0 rounded-md"
              style={{
                background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0) 100%)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}

