"use client"

import { useState, useEffect, useRef } from "react"

interface GlitchEffectProps {
  intensity?: "low" | "medium" | "high"
  isActive?: boolean
  className?: string
}

export default function GlitchEffect({ intensity = "medium", isActive = true, className = "" }: GlitchEffectProps) {
  // Glitch effect states
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 })
  const [colorPhase, setColorPhase] = useState(0)
  const [holographicAngle, setHolographicAngle] = useState(0)
  const [distortionLevel, setDistortionLevel] = useState(0)
  const [glowIntensity, setGlowIntensity] = useState(1.0)

  // Pixel glitch effect states
  const [pixelGlitches, setPixelGlitches] = useState<
    Array<{
      x: number
      y: number
      width: number
      height: number
      color: string
      opacity: number
    }>
  >([])
  const [horizontalGlitches, setHorizontalGlitches] = useState<
    Array<{
      y: number
      height: number
      offset: number
      opacity: number
    }>
  >([])

  // Reference for animation frame
  const animationRef = useRef<number>()

  // Set intensity multipliers
  const intensityValues = {
    low: {
      colorOpacity: 0.3,
      glowOpacity: 0.3,
      pixelFrequency: 0.9, // Higher = less frequent
      lineFrequency: 0.95,
      maxPixelGlitches: 2,
      maxLineGlitches: 1,
      glitchSize: 0.7,
    },
    medium: {
      colorOpacity: 0.5,
      glowOpacity: 0.5,
      pixelFrequency: 0.8,
      lineFrequency: 0.9,
      maxPixelGlitches: 3,
      maxLineGlitches: 2,
      glitchSize: 1,
    },
    high: {
      colorOpacity: 0.8,
      glowOpacity: 0.7,
      pixelFrequency: 0.7,
      lineFrequency: 0.8,
      maxPixelGlitches: 5,
      maxLineGlitches: 3,
      glitchSize: 1.3,
    },
  }

  // Get current intensity settings
  const currentIntensity = intensityValues[intensity]

  // Glitch animation effect
  useEffect(() => {
    if (!isActive) {
      // Clear any existing glitches if not active
      setPixelGlitches([])
      setHorizontalGlitches([])
      return
    }

    const animate = () => {
      // Random offset for RGB splitting - aligned with VHS effect
      setGlitchOffset({
        x: Math.random() * 4 - 2,
        y: Math.random() * 4 - 2,
      })

      // Cycle through color phases - slower to match VHS scan
      setColorPhase((prev) => (prev + 0.3) % 100)

      // Holographic angle shift - slower to match VHS effect
      setHolographicAngle((prev) => (prev + 0.2) % 360)

      // Fluctuating distortion - timing aligned with VHS
      setDistortionLevel(Math.sin(Date.now() / 600) * 0.5 + 0.5)

      // Pulsing glow - timing aligned with VHS
      setGlowIntensity(0.7 + Math.sin(Date.now() / 500) * 0.3)

      // Generate pixel glitches
      if (Math.random() > currentIntensity.pixelFrequency) {
        generatePixelGlitches()
      }

      // Generate horizontal line glitches
      if (Math.random() > currentIntensity.lineFrequency) {
        generateHorizontalGlitches()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, intensity, currentIntensity])

  // Generate random pixel glitch blocks
  const generatePixelGlitches = () => {
    const newGlitches = []
    const glitchCount = Math.floor(Math.random() * currentIntensity.maxPixelGlitches) + 1

    for (let i = 0; i < glitchCount; i++) {
      // Generate vibrant colors for the glitches
      const colors = [
        `rgb(255, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 255)})`, // Red-ish
        `rgb(${Math.floor(Math.random() * 100)}, 255, ${Math.floor(Math.random() * 255)})`, // Green-ish
        `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 255)}, 255)`, // Blue-ish
        `rgb(255, 255, ${Math.floor(Math.random() * 100)})`, // Yellow-ish
        `rgb(255, ${Math.floor(Math.random() * 100)}, 255)`, // Magenta-ish
        `rgb(${Math.floor(Math.random() * 100)}, 255, 255)`, // Cyan-ish
        "white",
      ]

      newGlitches.push({
        x: Math.random() * 100, // % position
        y: Math.random() * 100, // % position
        width: (Math.random() * 20 + 5) * currentIntensity.glitchSize, // % width
        height: (Math.random() * 8 + 2) * currentIntensity.glitchSize, // % height
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.4 + 0.2, // 0.2-0.6 opacity
      })
    }

    setPixelGlitches(newGlitches)
  }

  // Generate horizontal line glitches (data corruption effect)
  const generateHorizontalGlitches = () => {
    const newGlitches = []
    const glitchCount = Math.floor(Math.random() * currentIntensity.maxLineGlitches) + 1

    for (let i = 0; i < glitchCount; i++) {
      newGlitches.push({
        y: Math.random() * 100, // % position
        height: (Math.random() * 3 + 1) * currentIntensity.glitchSize, // % height
        offset: (Math.random() * 10 - 5) * currentIntensity.glitchSize, // % horizontal offset
        opacity: Math.random() * 0.3 + 0.4, // 0.4-0.7 opacity
      })
    }

    setHorizontalGlitches(newGlitches)
  }

  // Generate holographic gradient based on angle
  const generateHolographicGradient = () => {
    return `
      linear-gradient(
        ${holographicAngle}deg, 
        rgba(255, 0, 255, ${0.8 * currentIntensity.colorOpacity}) 0%, 
        rgba(255, 0, 0, ${0.8 * currentIntensity.colorOpacity}) 10%, 
        rgba(255, 255, 0, ${0.8 * currentIntensity.colorOpacity}) 20%, 
        rgba(0, 255, 0, ${0.8 * currentIntensity.colorOpacity}) 30%, 
        rgba(0, 255, 255, ${0.8 * currentIntensity.colorOpacity}) 40%,
        rgba(0, 0, 255, ${0.8 * currentIntensity.colorOpacity}) 50%,
        rgba(255, 0, 255, ${0.8 * currentIntensity.colorOpacity}) 60%,
        rgba(255, 0, 0, ${0.8 * currentIntensity.colorOpacity}) 70%,
        rgba(255, 255, 0, ${0.8 * currentIntensity.colorOpacity}) 80%,
        rgba(0, 255, 0, ${0.8 * currentIntensity.colorOpacity}) 90%,
        rgba(0, 255, 255, ${0.8 * currentIntensity.colorOpacity}) 100%
      )
    `
  }

  if (!isActive) return null

  return (
    <>
      {/* Base metallic background */}
      <div
        className={`absolute inset-0 ${className}`}
        style={{
          background: "linear-gradient(135deg, #f0f0f0 0%, #c0c0c0 50%, #f0f0f0 100%)",
          opacity: intensity === "high" ? 0.3 : 0.1,
        }}
      ></div>

      {/* Holographic rainbow gradient */}
      <div
        className={`absolute inset-0 ${className}`}
        style={{
          background: generateHolographicGradient(),
          opacity: 0.8 * currentIntensity.colorOpacity,
          mixBlendMode: "color-dodge",
        }}
      ></div>

      {/* RGB split effect */}
      <div
        className={`absolute inset-0 mix-blend-screen ${className}`}
        style={{
          background: `linear-gradient(${holographicAngle + 30}deg, rgba(255,0,0,${0.8 * currentIntensity.colorOpacity}), rgba(255,0,255,${0.8 * currentIntensity.colorOpacity}))`,
          transform: `translate(${glitchOffset.x}px, ${glitchOffset.y}px)`,
          filter: `blur(${distortionLevel}px)`,
        }}
      ></div>
      <div
        className={`absolute inset-0 mix-blend-screen ${className}`}
        style={{
          background: `linear-gradient(${holographicAngle + 240}deg, rgba(0,0,255,${0.8 * currentIntensity.colorOpacity}), rgba(255,0,255,${0.8 * currentIntensity.colorOpacity}))`,
          transform: `translate(${-glitchOffset.x}px, ${-glitchOffset.y}px)`,
          filter: `blur(${distortionLevel}px)`,
        }}
      ></div>

      {/* Scan lines */}
      <div
        className={`absolute inset-0 ${className}`}
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 1px, transparent 1px, transparent 2px)",
          backgroundSize: "100% 4px",
          backgroundPosition: `0 ${colorPhase % 4}px`,
          opacity: currentIntensity.colorOpacity,
        }}
      ></div>

      {/* Pixel glitch blocks */}
      {pixelGlitches.map((glitch, index) => (
        <div
          key={`pixel-glitch-${index}`}
          className={`absolute ${className}`}
          style={{
            left: `${glitch.x}%`,
            top: `${glitch.y}%`,
            width: `${glitch.width}%`,
            height: `${glitch.height}%`,
            backgroundColor: glitch.color,
            opacity: glitch.opacity * currentIntensity.colorOpacity,
            mixBlendMode: "screen",
            zIndex: 5,
          }}
        />
      ))}

      {/* Horizontal line glitches (data corruption effect) */}
      {horizontalGlitches.map((glitch, index) => (
        <div
          key={`h-glitch-${index}`}
          className={`absolute ${className}`}
          style={{
            top: `${glitch.y}%`,
            height: `${glitch.height}%`,
            width: "100%",
            left: `${glitch.offset}%`,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            opacity: glitch.opacity * currentIntensity.colorOpacity,
            mixBlendMode: "screen",
            zIndex: 5,
          }}
        />
      ))}

      {/* Occasional glitch artifact */}
      {Math.random() > 0.9 && (
        <div
          className={`absolute bg-white mix-blend-overlay ${className}`}
          style={{
            height: `${Math.random() * 3 + 1}px`,
            width: `${Math.random() * 80}%`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.6 * currentIntensity.colorOpacity,
            zIndex: 2,
          }}
        />
      )}

      {/* Glow effect */}
      <div
        className={`absolute -inset-2 ${className}`}
        style={{
          boxShadow: `
            0 0 ${12 * glowIntensity * currentIntensity.glitchSize}px rgba(255, 0, 255, ${glowIntensity * currentIntensity.glowOpacity}),
            0 0 ${18 * glowIntensity * currentIntensity.glitchSize}px rgba(0, 255, 255, ${glowIntensity * currentIntensity.glowOpacity})
          `,
          opacity: 0.9 * currentIntensity.glowOpacity,
          pointerEvents: "none",
          zIndex: -1,
          borderRadius: "0.75rem",
        }}
      />
    </>
  )
}

