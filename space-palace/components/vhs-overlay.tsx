"use client"

import { useEffect, useState, useRef } from "react"

export default function VHSOverlay() {
  const [noiseOffset, setNoiseOffset] = useState(0)
  const [scanlineOffset, setScanlineOffset] = useState(0)
  const [colorShift, setColorShift] = useState({ r: 0, g: 0, b: 0 })
  const [pulsePhase, setPulsePhase] = useState(0)
  const [glitchBlocks, setGlitchBlocks] = useState<
    Array<{
      x: number
      y: number
      width: number
      height: number
      color: string
      opacity: number
    }>
  >([])
  const [holographicShapes, setHolographicShapes] = useState<
    Array<{
      x: number
      y: number
      size: number
      rotation: number
      color: string
      type: "circle" | "square" | "triangle"
    }>
  >([])

  // Animation frame reference
  const animationFrameRef = useRef<number>()

  // Generate random holographic shapes
  const generateHolographicShapes = () => {
    const shapes = []
    const shapeCount = Math.floor(Math.random() * 3) + 2

    const shapeTypes: Array<"circle" | "square" | "triangle"> = ["circle", "square", "triangle"]
    const colors = [
      "rgba(255, 0, 255, 0.3)", // Magenta
      "rgba(0, 255, 255, 0.3)", // Cyan
      "rgba(255, 255, 0, 0.3)", // Yellow
      "rgba(0, 255, 0, 0.3)", // Green
      "rgba(255, 0, 0, 0.3)", // Red
      "rgba(0, 0, 255, 0.3)", // Blue
    ]

    for (let i = 0; i < shapeCount; i++) {
      shapes.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 150 + 50,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
      })
    }

    setHolographicShapes(shapes)
  }

  // Generate random glitch blocks
  const generateGlitchBlocks = () => {
    const blocks = []
    const blockCount = Math.floor(Math.random() * 5) + 3

    const colors = [
      "rgba(193, 107, 60, 1)", // brown-sugar
      "rgba(21, 46, 86, 1)", // delft-blue
      "rgba(244, 231, 160, 1)", // vanilla
      "rgba(76, 35, 82, 1)", // violet-jtc
      "rgba(135, 105, 125, 1)", // chinese-violet
      "rgba(72, 100, 133, 1)", // lapis-lazuli
      "rgba(255, 255, 255, 0.8)", // White
    ]

    for (let i = 0; i < blockCount; i++) {
      blocks.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        width: Math.random() * 20 + 5,
        height: Math.random() * 10 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.2,
      })
    }

    setGlitchBlocks(blocks)
  }

  // Update VHS effects periodically
  useEffect(() => {
    const animate = () => {
      // Random noise offset
      setNoiseOffset(Math.random() * 100)

      // Scanline movement
      setScanlineOffset((prev) => (prev + 1) % 20)

      // Random RGB shift - more pronounced
      setColorShift({
        r: Math.random() * 8 - 4,
        g: Math.random() * 8 - 4,
        b: Math.random() * 8 - 4,
      })

      // Update pulse phase
      setPulsePhase((prev) => (prev + 0.05) % (Math.PI * 2))

      // Occasionally generate new glitch blocks
      if (Math.random() > 0.85) {
        generateGlitchBlocks()
      }

      // Occasionally generate new holographic shapes
      if (Math.random() > 0.95) {
        generateHolographicShapes()
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Initial generation of shapes and blocks
    generateHolographicShapes()
    generateGlitchBlocks()

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Calculate pulsating values
  const pulseValue = Math.sin(pulsePhase) * 0.3 + 0.7 // Oscillates between 0.4 and 1.0
  const pulseScale = Math.sin(pulsePhase * 0.5) * 0.1 + 1.0 // Oscillates between 0.9 and 1.1

  return (
    <div className="fixed inset-0 pointer-events-none z-0 w-screen h-screen overflow-hidden">
      {/* Pulsating background gradient */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle, 
            rgba(193, 107, 60,${pulseValue * 0.5}) 0%, 
            rgba(21, 46, 86,${pulseValue * 0.3}) 30%, 
            rgba(0,0,0,0) 70%)`,
          transform: `scale(${pulseScale})`,
        }}
      />

      {/* Static noise overlay */}
      <div
        className="absolute inset-0 opacity-15 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          backgroundPosition: `${noiseOffset}% ${noiseOffset}%`,
        }}
      />

      {/* Horizontal scanlines */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px)",
          backgroundSize: "100% 4px",
          backgroundPosition: `0 ${scanlineOffset}px`,
        }}
      />

      {/* RGB color shift layers - more pronounced */}
      <div
        className="absolute inset-0 bg-red-500 mix-blend-screen opacity-20"
        style={{
          transform: `translate(${colorShift.r * 2}px, 0)`,
        }}
      />
      <div
        className="absolute inset-0 bg-green-500 mix-blend-screen opacity-20"
        style={{
          transform: `translate(${colorShift.g * 2}px, 0)`,
        }}
      />
      <div
        className="absolute inset-0 bg-blue-500 mix-blend-screen opacity-20"
        style={{
          transform: `translate(${colorShift.b * 2}px, 0)`,
        }}
      />

      {/* Holographic shapes */}
      {holographicShapes.map((shape, index) => {
        // Render different shape types
        let shapeElement

        if (shape.type === "circle") {
          shapeElement = (
            <div
              key={`holo-shape-${index}`}
              className="absolute rounded-full mix-blend-screen"
              style={{
                left: `${shape.x}%`,
                top: `${shape.y}%`,
                width: `${shape.size}px`,
                height: `${shape.size}px`,
                background: `linear-gradient(${shape.rotation}deg, ${shape.color}, transparent)`,
                transform: `rotate(${shape.rotation + pulsePhase * 30}deg) scale(${pulseScale})`,
                opacity: pulseValue,
              }}
            />
          )
        } else if (shape.type === "square") {
          shapeElement = (
            <div
              key={`holo-shape-${index}`}
              className="absolute mix-blend-screen"
              style={{
                left: `${shape.x}%`,
                top: `${shape.y}%`,
                width: `${shape.size}px`,
                height: `${shape.size}px`,
                background: `linear-gradient(${shape.rotation}deg, ${shape.color}, transparent)`,
                transform: `rotate(${shape.rotation + pulsePhase * 20}deg) scale(${pulseScale})`,
                opacity: pulseValue,
              }}
            />
          )
        } else {
          // Triangle using clip-path
          shapeElement = (
            <div
              key={`holo-shape-${index}`}
              className="absolute mix-blend-screen"
              style={{
                left: `${shape.x}%`,
                top: `${shape.y}%`,
                width: `${shape.size}px`,
                height: `${shape.size}px`,
                background: `linear-gradient(${shape.rotation}deg, ${shape.color}, transparent)`,
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                transform: `rotate(${shape.rotation + pulsePhase * 40}deg) scale(${pulseScale})`,
                opacity: pulseValue,
              }}
            />
          )
        }

        return shapeElement
      })}

      {/* Pixel glitch blocks */}
      {glitchBlocks.map((block, index) => (
        <div
          key={`glitch-block-${index}`}
          className="absolute mix-blend-screen"
          style={{
            left: `${block.x}%`,
            top: `${block.y}%`,
            width: `${block.width}%`,
            height: `${block.height}px`,
            backgroundColor: block.color,
            opacity: block.opacity * pulseValue,
          }}
        />
      ))}

      {/* Occasional glitch effect */}
      {Math.random() > 0.8 && (
        <div
          className="absolute bg-white mix-blend-overlay"
          style={{
            height: `${Math.random() * 5 + 1}px`,
            width: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.8,
          }}
        />
      )}

      {/* Horizontal data corruption glitches */}
      {Math.random() > 0.9 && (
        <div
          className="absolute mix-blend-screen"
          style={{
            height: `${Math.random() * 20 + 5}px`,
            width: "100%",
            left: `${Math.random() * 10 - 5}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            transform: `skewX(${Math.random() * 20 - 10}deg)`,
          }}
        />
      )}

      {/* Vignette effect - more colorful */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(circle, transparent 50%, rgba(0,0,0,0.9) 150%),
            radial-gradient(circle at 30% 30%, rgba(193, 107, 60,0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(21, 46, 86,0.1) 0%, transparent 50%)

          `,
        }}
      />

      {/* Pulsating color overlay */}
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{
          background: `linear-gradient(
            ${pulsePhase * 30}deg, 
            rgba(76, 35, 82,${0.05 * pulseValue}) 0%, 
            rgba(72, 100, 133,${0.05 * pulseValue}) 50%, 
            rgba(135, 105, 125,${0.05 * pulseValue}) 100%
          )`,
        }}
      />
    </div>
  )
}

