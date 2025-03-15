"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import type { CardType } from "@/types/game-types"
import GlitchEffect from "./glitch-effect"

interface SpecialCardProps {
  card: CardType
  onClick?: () => void
  selectable?: boolean
  className?: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function SpecialCard({
  card,
  onClick,
  selectable = false,
  className = "",
  onMouseEnter,
  onMouseLeave,
}: SpecialCardProps) {
  const [animationState, setAnimationState] = useState(0)

  // Simple animation effect for some cards
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationState((prev) => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Render different special cards based on rank
  const renderCardContent = () => {
    let backgroundImage = ""

    switch (card.rank) {
      case "black-hole":
        backgroundImage =
          "https://storage.googleapis.com/palace-game/card-designs/black-hole.png"
        break
      case "wormhole":
        backgroundImage = "https://storage.googleapis.com/palace-game/card-designs/wormhole.png"
        break
      case "supernova":
        backgroundImage = "https://storage.googleapis.com/palace-game/card-designs/supernova.png"
        break
      case "asteroid-field":
        backgroundImage = "https://storage.googleapis.com/palace-game/card-designs/asteroid.png"
        break
      default:
        return (
          <div className="h-full w-full p-1 flex flex-col justify-between bg-white">
            <div className="text-center">Unknown</div>
          </div>
        )
    }

    return (
      <motion.div
        className="h-full w-full relative rounded-md overflow-hidden border border-white"
        animate={{
          boxShadow: [
            "0 0 10px 2px rgba(128, 0, 255, 0.7), 0 0 20px 5px rgba(0, 255, 255, 0.4)",
            "0 0 15px 4px rgba(128, 0, 255, 0.9), 0 0 30px 8px rgba(0, 255, 255, 0.6)",
            "0 0 10px 2px rgba(128, 0, 255, 0.7), 0 0 20px 5px rgba(0, 255, 255, 0.4)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        {/* Card background image */}
        <img
          src={backgroundImage || "/placeholder.svg"}
          alt={card.rank}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Holographic overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Pulsating inner glow */}
        <motion.div
          className="absolute inset-0 rounded-md"
          style={{
            background:
              "radial-gradient(circle, rgba(128, 0, 255, 0.3) 0%, rgba(0, 255, 255, 0.2) 50%, transparent 70%)",
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`relative w-[3.325rem] h-[5.25rem] md:w-[4.75rem] md:h-28 rounded-md cursor-pointer select-none overflow-hidden
               ${card.selected ? "ring-2 ring-blue-500" : ""} ${className}`}
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
      style={
        card.selected
          ? {
              boxShadow: "0 0 0 2px #f2a63a, 0 0 10px 2px rgba(242, 166, 58, 0.7)",
            }
          : {
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }
      }
    >
      {renderCardContent()}
      {card.rank === "glitch" && <GlitchEffect intensity="medium" className="rounded-md" />}
    </motion.div>
  )
}

