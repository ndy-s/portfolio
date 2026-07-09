export type StarSubtype = "red-dwarf" | "yellow-dwarf" | "blue-giant" | "red-giant" | "neutron-star" | "white-dwarf"
export type PlanetSubtype = "gas-giant" | "rocky" | "ice" | "desert" | "ocean" | "lava"
export type BodySubtype = StarSubtype | PlanetSubtype | "asteroid" | "blackhole" | "comet"

export const TOTAL_CELESTIAL_BODIES = 15

export interface SubtypeConfig {
  label: string
  icon: string
  trait: string
  radiusMin: number
  radiusMax: number
  massMultiplier: number
  gravityMultiplier?: number
  color: string
  ringColor?: string
  ringChance?: number
  pulse?: boolean
  banded?: boolean
  glowIntensity?: number
  coronaScale?: number
}

export const STAR_SUBTYPES: Record<StarSubtype, SubtypeConfig> = {
  "red-dwarf": {
    label: "Red Dwarf",
    icon: "🔴",
    trait: "Smallest stars · longest-lived",
    radiusMin: 12,
    radiusMax: 18,
    massMultiplier: 0.55,
    gravityMultiplier: 2.5,
    color: "255, 90, 70",
    coronaScale: 2.2,
    glowIntensity: 0.55,
  },
  "yellow-dwarf": {
    label: "Yellow Dwarf",
    icon: "☀️",
    trait: "Sun-like · stable fusion",
    radiusMin: 22,
    radiusMax: 32,
    massMultiplier: 1,
    gravityMultiplier: 4,
    color: "255, 210, 100",
    coronaScale: 3.5,
    glowIntensity: 1,
  },
  "blue-giant": {
    label: "Blue Giant",
    icon: "💙",
    trait: "Hot and massive · short-lived",
    radiusMin: 34,
    radiusMax: 48,
    massMultiplier: 2.4,
    gravityMultiplier: 6,
    color: "110, 175, 255",
    coronaScale: 4.2,
    glowIntensity: 1.25,
  },
  "red-giant": {
    label: "Red Giant",
    icon: "🟠",
    trait: "Expanded shell · low density",
    radiusMin: 38,
    radiusMax: 52,
    massMultiplier: 1.7,
    gravityMultiplier: 3.5,
    color: "255, 115, 45",
    coronaScale: 3.2,
    glowIntensity: 0.85,
  },
  "neutron-star": {
    label: "Neutron Star",
    icon: "✨",
    trait: "Ultra-dense · intense gravity",
    radiusMin: 5,
    radiusMax: 9,
    massMultiplier: 2.8,
    gravityMultiplier: 9,
    color: "195, 220, 255",
    pulse: true,
    coronaScale: 2.8,
    glowIntensity: 1.6,
  },
  "white-dwarf": {
    label: "White Dwarf",
    icon: "⚪",
    trait: "Stellar remnant · dense core",
    radiusMin: 9,
    radiusMax: 15,
    massMultiplier: 1.4,
    gravityMultiplier: 5,
    color: "235, 242, 255",
    coronaScale: 2,
    glowIntensity: 0.75,
  },
}

export const PLANET_SUBTYPES: Record<PlanetSubtype, SubtypeConfig> = {
  "gas-giant": {
    label: "Gas Giant",
    icon: "🪐",
    trait: "Massive atmosphere · often ringed",
    radiusMin: 22,
    radiusMax: 36,
    massMultiplier: 2,
    color: "210, 160, 100",
    ringColor: "230, 200, 150",
    ringChance: 0.7,
    banded: true,
  },
  rocky: {
    label: "Rocky Planet",
    icon: "🌍",
    trait: "Solid surface · moderate gravity",
    radiusMin: 12,
    radiusMax: 22,
    massMultiplier: 1,
    color: "100, 149, 237",
  },
  ice: {
    label: "Ice Planet",
    icon: "❄️",
    trait: "Frozen surface · reflective sheen",
    radiusMin: 14,
    radiusMax: 24,
    massMultiplier: 0.9,
    color: "185, 215, 245",
    glowIntensity: 0.45,
  },
  desert: {
    label: "Desert Planet",
    icon: "🏜️",
    trait: "Arid windswept dunes",
    radiusMin: 13,
    radiusMax: 22,
    massMultiplier: 0.95,
    color: "215, 155, 85",
  },
  ocean: {
    label: "Ocean Planet",
    icon: "🌊",
    trait: "Deep water world",
    radiusMin: 14,
    radiusMax: 23,
    massMultiplier: 1.1,
    color: "35, 95, 175",
    glowIntensity: 0.35,
  },
  lava: {
    label: "Lava Planet",
    icon: "🌋",
    trait: "Molten surface · volcanic heat",
    radiusMin: 12,
    radiusMax: 20,
    massMultiplier: 1,
    color: "225, 75, 35",
    glowIntensity: 0.85,
  },
}

export const OTHER_SUBTYPE_META: Record<"asteroid" | "blackhole" | "comet", SubtypeConfig> = {
  asteroid: {
    label: "Asteroid",
    icon: "☄️",
    trait: "Lightweight rocky fragment",
    radiusMin: 5,
    radiusMax: 10,
    massMultiplier: 0.4,
    color: "169, 169, 169",
  },
  blackhole: {
    label: "Black Hole",
    icon: "🕳️",
    trait: "Extreme gravity · swallows bodies",
    radiusMin: 15,
    radiusMax: 30,
    massMultiplier: 8,
    color: "0, 0, 0",
    ringColor: "255, 150, 50",
    ringChance: 1,
  },
  comet: {
    label: "Comet",
    icon: "☄️",
    trait: "Icy body with a glowing tail",
    radiusMin: 4,
    radiusMax: 8,
    massMultiplier: 0.2,
    color: "200, 255, 255",
  }
}
