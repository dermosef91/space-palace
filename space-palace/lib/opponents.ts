export interface OpponentCharacter {
  id: string
  name: string
  image: string
  description: string
  specialAbility?: string
}

export const opponents: OpponentCharacter[] = [
  {
    id: "rookie",
    name: "The Rookie",
    image: "https://storage.googleapis.com/palace-game/character-profiles/rookie.png?height=300&width=300",
    description: "Ready? I think I got this...",
    specialAbility: "None",
  },
  {
    id: "trickster",
    name: "The Trickster",
    image: "https://storage.googleapis.com/palace-game/character-profiles/trickster.png?height=300&width=300",
    description: "Don't blink, or you'll miss the best part!",
    specialAbility: "Special cards might appear",
  },
  {
    id: "analyst",
    name: "The Analyst",
    image: "https://storage.googleapis.com/palace-game/character-profiles/analyst.png?height=300&width=300",
    description: "My strategy is sound. Your resistance, futile.",
    specialAbility: "Special cards appear more frequently",
  },
  {
    id: "psychic",
    name: "The Psychic",
    image: "https://storage.googleapis.com/palace-game/character-profiles/psychic.png?height=300&width=300",
    description: "Your thoughts betray you. And your cards will too.",
    specialAbility: "Special cards appear more frequently",
  },
  {
    id: "master",
    name: "The Cosmic Master",
    image: "https://storage.googleapis.com/palace-game/character-profiles/master.png?height=300&width=300",
    description: "The game is mine, always has been, always will be.",
    specialAbility: "Special cards appear more frequently",
  },
]

