export type Suit = "hearts" | "diamonds" | "clubs" | "spades"

// Card ranks
export type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "j"
  | "q"
  | "k"
  | "a"
  | "glitch"
  | "black-hole"
  | "wormhole"
  | "supernova"
  | "asteroid-field"

// Card representation
export interface CardType {
  id: string
  suit: Suit
  rank: Rank
  value: number
  faceUp: boolean
  selected?: boolean
}

// Game states
export type GameState = "setup" | "playing" | "swapping" | "gameOver"

// Player types
export type PlayerType = "player" | "computer"

// Card source types
export type CardSource = "hand" | "faceUp" | "faceDown"

