import type { CardType, Rank, Suit } from "@/components/game"

/**
 * Card values for ranking
 */
export const CARD_VALUES: Record<Rank, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  j: 11,
  q: 12,
  k: 13,
  a: 14,
  glitch: 3, // Glitch card has same value as 3
  "black-hole": 20, // Black hole has the highest value
  wormhole: 15, // Wormhole has a high value
  supernova: 16, // Supernova has a high value
  "asteroid-field": 15, // Asteroid Field has a high value
}

/**
 * Special cards with unique rules
 */
export const SPECIAL_CARDS: Record<string, boolean> = {
  "2": true, // Can be played on any card, burns the pile
  "3": true, // Can be played on any card, takes value of card below
  a: true, // Can be played on anything except 7, burns the pile and player gets another turn
  glitch: true, // Can be played on any card, takes value of card below (like a 3)
  "black-hole": true, // Can be played on any card, burns the pile and removes all cards from the deck
  wormhole: true, // Can be played on any card, swaps hand cards between players
  supernova: true, // Can be played on any card, burns all cards in both players' palaces
  "asteroid-field": true, // Can be played on any card, next player must draw two cards
}

/**
 * Sort cards by their rank value (lowest to highest)
 */
export const sortCardsByRank = (cards: CardType[]): CardType[] => {
  return [...cards].sort((a, b) => a.value - b.value)
}

/**
 * Generate a unique ID for a card
 */
export const generateCardId = (suit: Suit, rank: Rank, index: number): string => {
  const timestamp = Date.now()
  return `${suit}-${rank}-${timestamp}-${index}`
}

/**
 * Check if a card can be played on the current pile
 */
export function canPlayCard(card: CardType, pile: CardType[]): boolean {
  // If pile is empty, any card can be played
  if (pile.length === 0) {
    return true
  }

  // Get the top card of the pile
  const topCard = pile[pile.length - 1]

  // Special case: 2 can be played on any card
  if (card.rank === "2") {
    return true
  }

  // Special case: 3 can be played on any card (it copies the card below it)
  if (card.rank === "3") {
    return true
  }

  // Special case: Glitch card can be played on any card (it's like a 3)
  if (card.rank === "glitch") {
    return true
  }

  // Special case: Black Hole can be played on any card
  if (card.rank === "black-hole") {
    return true
  }

  // Special case: Wormhole can be played on any card
  if (card.rank === "wormhole") {
    return true
  }

  // Special case: Supernova can be played on any card
  if (card.rank === "supernova") {
    return true
  }

  // Special case: Asteroid Field can be played on any card
  if (card.rank === "asteroid-field") {
    return true
  }

  // Special case: 7 requires the next card to be lower than 7
  if (topCard.rank === "7") {
    // If the top card is a 7, the next card must be lower than 7
    // Convert ranks to values for comparison
    const cardValue = CARD_VALUES[card.rank]
    const sevenValue = CARD_VALUES["7"]

    return cardValue < sevenValue
  }

  // Special case: If the top card is a 3, we need to look at the card below it
  if (topCard.rank === "3" && pile.length >= 2) {
    const cardBelowThree = pile[pile.length - 2]

    // If the card below the 3 is a 7, apply the 7's rule
    if (cardBelowThree.rank === "7") {
      const cardValue = CARD_VALUES[card.rank]
      const sevenValue = CARD_VALUES["7"]
      return cardValue < sevenValue
    }

    // Otherwise, compare with the card below the 3
    const cardValue = CARD_VALUES[card.rank]
    const cardBelowValue = CARD_VALUES[cardBelowThree.rank]
    return cardValue > cardBelowValue
  }

  // Special case: If the top card is a glitch card, treat it like a 3
  if (topCard.rank === "glitch" && pile.length >= 2) {
    const cardBelowGlitch = pile[pile.length - 2]

    // If the card below the glitch is a 7, apply the 7's rule
    if (cardBelowGlitch.rank === "7") {
      const cardValue = CARD_VALUES[card.rank]
      const sevenValue = CARD_VALUES["7"]
      return cardValue < sevenValue
    }

    // Otherwise, compare with the card below the glitch
    const cardValue = CARD_VALUES[card.rank]
    const cardBelowValue = CARD_VALUES[cardBelowGlitch.rank]
    return cardValue >= cardBelowValue
  }

  // Normal case: Card must be HIGHER than the top card (not equal)
  const cardValue = CARD_VALUES[card.rank]
  const topCardValue = CARD_VALUES[topCard.rank]

  return cardValue > topCardValue
}

/**
 * Get display text for a card rank
 */
export const getDisplayRank = (rank: Rank): string => {
  switch (rank) {
    case "j":
      return "Jack"
    case "q":
      return "Queen"
    case "k":
      return "King"
    case "a":
      return "Ace"
    case "glitch":
      return "Glitch Card"
    case "black-hole":
      return "Black Hole"
    case "wormhole":
      return "Wormhole"
    case "supernova":
      return "Supernova"
    case "asteroid-field":
      return "Asteroid Field"
    default:
      return rank.toUpperCase()
  }
}

/**
 * Calculate card offset for display in a hand
 * Handles responsive layout with card overlap when needed
 * Centers cards properly in the container
 */
export const getCardOffset = (index: number, total: number, maxWidth: number): number => {
  const cardWidth = 80 // Width of card in pixels
  const cardGap = 8 // Gap between cards (matches the gap-2 class used for face-up cards)

  // Calculate total width needed for all cards with gaps
  const totalWidth = cardWidth * total + cardGap * (total - 1)

  // Calculate the starting position to center the cards
  const startX = (maxWidth - totalWidth) / 2

  if (totalWidth <= maxWidth) {
    // If all cards fit with proper spacing, center them
    return startX + index * (cardWidth + cardGap)
  } else {
    // If cards don't fit, calculate overlap
    const minCardVisibleWidth = 30 // Minimum visible width of a card when overlapping
    const maxOverlapPerCard = cardWidth - minCardVisibleWidth

    // Calculate required overlap
    const requiredTotalOverlap = totalWidth - maxWidth
    const overlapPerCard = Math.min(maxOverlapPerCard, requiredTotalOverlap / (total - 1))

    // Calculate spacing between card starts with overlap
    const spacing = cardWidth + cardGap - overlapPerCard

    // Calculate total width with overlap
    const overlappedTotalWidth = spacing * (total - 1) + cardWidth

    // Center the overlapped cards
    const overlappedStartX = (maxWidth - overlappedTotalWidth) / 2

    return overlappedStartX + index * spacing
  }
}

