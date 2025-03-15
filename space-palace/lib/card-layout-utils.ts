export const getHandCardStyle = (index: number, totalCards: number) => {
  // Get the current viewport width for responsive calculations
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 400

  // Adjust card width and max container width based on screen size
  const cardWidth = viewportWidth < 400 ? 66.5 : 76 // 5% smaller width (70*0.95=66.5, 80*0.95=76)
  const maxWidth = Math.min(viewportWidth - 40, 400) // Ensure container fits within screen with padding

  // For 5 or fewer cards, use normal spacing
  if (totalCards <= 5) {
    const cardGap = viewportWidth < 400 ? 10 : 20 // Smaller gaps on small screens
    const totalWidth = cardWidth * totalCards + cardGap * (totalCards - 1)

    // If total width exceeds max width, reduce gaps
    if (totalWidth > maxWidth) {
      const availableGapSpace = maxWidth - cardWidth * totalCards
      const adjustedGap = Math.max(2, availableGapSpace / (totalCards - 1))
      return {
        left: `calc(50% - ${maxWidth / 2}px + ${index * (cardWidth + adjustedGap)}px)`,
        zIndex: index,
      }
    }

    return {
      left: `calc(50% - ${totalWidth / 2}px + ${index * (cardWidth + cardGap)}px)`,
      zIndex: index,
    }
  }
  // For more than 5 cards, use dynamic overlap
  else {
    // Calculate overlap based on number of cards and screen size
    // More aggressive overlap for smaller screens or more cards
    const overlapFactor = Math.min(0.7, 0.4 + (totalCards - 5) * 0.05 + (viewportWidth < 400 ? 0.1 : 0))
    const visibleCardWidth = cardWidth * (1 - overlapFactor)

    // Calculate the total width needed for all overlapped cards
    const totalWidth = visibleCardWidth * (totalCards - 1) + cardWidth

    // If still too wide, increase overlap further
    if (totalWidth > maxWidth) {
      const requiredVisibleWidth = (maxWidth - cardWidth) / (totalCards - 1)
      const adjustedOverlap = cardWidth - requiredVisibleWidth
      const adjustedVisibleWidth = cardWidth - adjustedOverlap

      return {
        left: `calc(50% - ${maxWidth / 2}px + ${index * adjustedVisibleWidth}px)`,
        zIndex: index,
        // Add hover effect to make the hovered card stand out
        hover: {
          zIndex: 100,
          y: -15,
          transition: { duration: 0.2 },
        },
      }
    }

    return {
      left: `calc(50% - ${totalWidth / 2}px + ${index * visibleCardWidth}px)`,
      zIndex: index,
      // Add hover effect to make the hovered card stand out
      hover: {
        zIndex: 100,
        y: -15,
        transition: { duration: 0.2 },
      },
    }
  }
}

