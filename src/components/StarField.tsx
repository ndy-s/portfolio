"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useTheme } from "next-themes"
import { useCodex } from "./CodexProvider"

// Types
interface Star {
  x: number
  y: number
  z: number
  prevZ: number
  size: number
  brightness: number
  twinkleSpeed: number
  twinkleOffset: number
  colorIndex: number
}

import {
  StarSubtype,
  PlanetSubtype,
  BodySubtype,
  SubtypeConfig,
  STAR_SUBTYPES,
  PLANET_SUBTYPES,
  OTHER_SUBTYPE_META,
} from "@/lib/celestialData"

interface CelestialBody {
  id: number
  x: number
  y: number
  z: number
  vx: number
  vy: number
  radius: number
  mass: number
  type: "planet" | "asteroid" | "blackhole" | "sun" | "asteroid-cluster"
  subtype: BodySubtype
  color: string
  rotation: number
  rotationSpeed: number
  ringColor?: string
  hasRing: boolean
  isDragging: boolean
  swallowPulse?: number
  pulseOffset?: number
}

interface CollisionParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  color: string
}

interface BodyInfo {
  id: number
  type: CelestialBody["type"]
  subtype: BodySubtype
  label: string
  icon: string
  trait: string
  mass: number
  radius: number
  hasRing: boolean
  screenX: number
  screenY: number
  projSize: number
  isDragging: boolean
}

interface TooltipInfo {
  kind: "body" | "comet" | "shooting-star"
  trackId: number
  label: string
  icon: string
  trait: string
  screenX: number
  screenY: number
  anchorSize: number
  isDragging: boolean
  canDrag: boolean
  body?: BodyInfo
  stats: { label: string; value: string }[]
}

const COMET_META = {
  label: "Comet",
  icon: "☄️",
  trait: "Icy wanderer · long glowing tail",
} as const

const SHOOTING_STAR_META = {
  label: "Shooting Star",
  icon: "💫",
  trait: "Atmospheric streak · gone in a blink",
} as const

function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1
  const dy = y2 - y1
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(px - x1, py - y1)
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

const STAR_SUBTYPE_WEIGHTS: [StarSubtype, number][] = [
  ["red-dwarf", 35],
  ["yellow-dwarf", 25],
  ["white-dwarf", 15],
  ["red-giant", 12],
  ["blue-giant", 8],
  ["neutron-star", 5],
]

const PLANET_SUBTYPE_WEIGHTS: [PlanetSubtype, number][] = [
  ["rocky", 28],
  ["gas-giant", 22],
  ["ice", 18],
  ["desert", 14],
  ["ocean", 12],
  ["lava", 6],
]

function pickWeighted<T extends string>(entries: [T, number][]): T {
  const total = entries.reduce((sum, [, w]) => sum + w, 0)
  let roll = Math.random() * total
  for (const [value, weight] of entries) {
    roll -= weight
    if (roll <= 0) return value
  }
  return entries[entries.length - 1][0]
}

function getSubtypeConfig(body: CelestialBody): SubtypeConfig {
  if (body.type === "sun") return STAR_SUBTYPES[body.subtype as StarSubtype]
  if (body.type === "planet") return PLANET_SUBTYPES[body.subtype as PlanetSubtype]
  return OTHER_SUBTYPE_META[body.subtype as "asteroid" | "blackhole" | "asteroid-cluster"]
}

function buildBodyInfo(
  body: CelestialBody,
  screenX: number,
  screenY: number,
  projSize: number,
  isDragging: boolean,
): BodyInfo {
  const meta = getSubtypeConfig(body)
  return {
    id: body.id,
    type: body.type,
    subtype: body.subtype,
    label: meta.label,
    icon: meta.icon,
    trait: meta.trait,
    mass: body.mass,
    radius: body.radius,
    hasRing: body.hasRing,
    screenX,
    screenY,
    projSize,
    isDragging,
  }
}

function buildBodyTooltip(
  body: CelestialBody,
  screenX: number,
  screenY: number,
  projSize: number,
  isDragging: boolean,
): TooltipInfo {
  const info = buildBodyInfo(body, screenX, screenY, projSize, isDragging)
  const stats = [
    { label: "mass", value: String(Math.round(info.mass)) },
    { label: "r", value: String(Math.round(info.radius)) },
  ]
  if (info.type === "planet" && info.hasRing) {
    stats.push({ label: "ringed", value: "yes" })
  }
  return {
    kind: "body",
    trackId: body.id,
    label: info.label,
    icon: info.icon,
    trait: info.trait,
    screenX,
    screenY,
    anchorSize: projSize,
    isDragging,
    canDrag: true,
    body: info,
    stats,
  }
}

function buildCometTooltip(comet: Comet): TooltipInfo {
  const speed = Math.hypot(comet.vx, comet.vy)
  const lifeLeft = Math.max(0, Math.round((1 - comet.life / comet.maxLife) * 100))
  return {
    kind: "comet",
    trackId: comet.id,
    label: COMET_META.label,
    icon: COMET_META.icon,
    trait: COMET_META.trait,
    screenX: comet.x,
    screenY: comet.y,
    anchorSize: comet.size,
    isDragging: false,
    canDrag: false,
    stats: [
      { label: "speed", value: speed.toFixed(1) },
      { label: "tail", value: String(Math.round(comet.tailLength)) },
      { label: "life", value: `${lifeLeft}%` },
    ],
  }
}

function buildShootingStarTooltip(star: ShootingStar): TooltipInfo {
  const speed = Math.hypot(star.vx, star.vy)
  const lifeLeft = Math.max(0, Math.round((1 - star.life / star.maxLife) * 100))
  return {
    kind: "shooting-star",
    trackId: star.id,
    label: SHOOTING_STAR_META.label,
    icon: SHOOTING_STAR_META.icon,
    trait: SHOOTING_STAR_META.trait,
    screenX: star.x,
    screenY: star.y,
    anchorSize: star.size,
    isDragging: false,
    canDrag: false,
    stats: [
      { label: "speed", value: speed.toFixed(1) },
      { label: "life", value: `${lifeLeft}%` },
    ],
  }
}

interface SwallowEffect {
  bhId: number
  preyType: CelestialBody["type"]
  preySubtype: BodySubtype
  preyColor: string
  preyRingColor?: string
  preyHasRing: boolean
  startWorldRadius: number
  startDist: number
  angle: number
  z: number
  mass: number
  progress: number
  trail: { x: number; y: number; alpha: number }[]
}

interface Comet {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  tailLength: number
  life: number
  maxLife: number
  brightness: number
  color: string
}

interface ShootingStar {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
}

interface NebulaCloud {
  x: number
  y: number
  radius: number
  color1: string
  color2: string
  drift: number
  driftAngle: number
  alpha: number
  pulseSpeed: number
  pulseOffset: number
}

// Performance Tiers
type PerformanceTier = "high" | "medium" | "low"

const TIER_CONFIGS = {
  high: { maxStars: 450, minStars: 100, maxBodies: 15, maxNebulae: 4, maxComets: 2, maxShootingStars: 3, maxDpr: Infinity, debrisMin: 6, debrisMax: 14, trailLength: 28 },
  medium: { maxStars: 200, minStars: 60, maxBodies: 8, maxNebulae: 2, maxComets: 1, maxShootingStars: 1, maxDpr: 1.5, debrisMin: 4, debrisMax: 8, trailLength: 12 },
  low: { maxStars: 80, minStars: 40, maxBodies: 4, maxNebulae: 0, maxComets: 0, maxShootingStars: 0, maxDpr: 1, debrisMin: 2, debrisMax: 4, trailLength: 0 },
} as const

function detectPerformanceTier(): PerformanceTier {
  if (typeof window === "undefined") return "high"

  const cores = navigator.hardwareConcurrency || 4
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 8
  const dpr = window.devicePixelRatio || 1
  const screenArea = window.innerWidth * window.innerHeight
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  let score = 0

  if (cores >= 8) score += 3
  else if (cores >= 4) score += 2

  if (memory >= 8) score += 3
  else if (memory >= 4) score += 2

  if (screenArea < 500000) score += 1
  else if (screenArea > 1500000) score -= 1

  if (isMobile) score -= 2
  if (dpr > 2) score -= 1

  if (score >= 5) return "high"
  if (score >= 2) return "medium"
  return "low"
}

// Constants
const REFERENCE_AREA = 1920 * 1080

function getStarCount(width: number, height: number, tier: PerformanceTier): number {
  const config = TIER_CONFIGS[tier]
  const ratio = (width * height) / REFERENCE_AREA
  return Math.min(Math.max(Math.floor(config.maxStars * ratio), config.minStars), config.maxStars)
}

function getBodyCount(width: number, height: number, tier: PerformanceTier): number {
  const config = TIER_CONFIGS[tier]
  const ratio = (width * height) / REFERENCE_AREA
  return Math.max(Math.floor(config.maxBodies * ratio), 1)
}

function getNebulaCount(width: number, height: number, tier: PerformanceTier): number {
  const config = TIER_CONFIGS[tier]
  const ratio = (width * height) / REFERENCE_AREA
  return Math.max(Math.floor(config.maxNebulae * ratio), tier === "low" ? 0 : 1)
}

function getMaxComets(width: number, height: number): number {
  return Math.min(width, height) < 640 ? 1 : 2
}

function getMaxShootingStars(width: number, height: number): number {
  return Math.min(width, height) < 640 ? 1 : 3
}

const STAR_COLORS = [
  { r: 155, g: 176, b: 255 },
  { r: 170, g: 191, b: 255 },
  { r: 202, g: 215, b: 255 },
  { r: 248, g: 247, b: 255 },
  { r: 255, g: 244, b: 234 },
  { r: 255, g: 210, b: 161 },
  { r: 255, g: 204, b: 111 },
]

const COMET_COLORS = [
  "180, 220, 255",
  "200, 255, 220",
  "255, 240, 200",
]

const NEBULA_PALETTES = [
  { c1: "80, 20, 120", c2: "30, 60, 150" },
  { c1: "120, 30, 60", c2: "60, 20, 100" },
  { c1: "20, 80, 100", c2: "40, 30, 120" },
  { c1: "20, 60, 40", c2: "30, 100, 80" },
]

// Physics & Interaction Constants
const FRICTION = 0.995
const MAX_VELOCITY = 15
const GRAVITY_CONSTANT = 0.0008 // Tuned for visual scale
const SUN_GRAVITY_MULTIPLIER = 4
const BLACK_HOLE_GRAVITY = 0.012
const BLACK_HOLE_ORBIT = 0.004
const BLACK_HOLE_INFLUENCE = 2.5 // multiplier of screen width
const SWALLOW_DURATION = 55 // frames at ~60fps

function getEffectiveMass(body: CelestialBody): number {
  if (body.type === "sun") {
    const config = STAR_SUBTYPES[body.subtype as StarSubtype]
    return body.mass * (config.gravityMultiplier ?? SUN_GRAVITY_MULTIPLIER)
  }
  return body.mass
}

function drawPlanetSurface(
  ctx: CanvasRenderingContext2D,
  body: Pick<CelestialBody, "subtype" | "color" | "ringColor" | "hasRing">,
  r: number,
  alpha: number,
  isDark: boolean,
  tier: PerformanceTier
) {
  const config = PLANET_SUBTYPES[body.subtype as PlanetSubtype]

  ctx.save()
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.clip()

  if (tier === "low") {
    // Ultra-simple flat fill for low tier
    ctx.fillStyle = `rgba(${body.color}, ${alpha})`
    ctx.fill()
  } else {
    if (config.banded) {
      for (let band = -3; band <= 3; band++) {
        const bandAlpha = alpha * (band % 2 === 0 ? 0.85 : 0.55)
        ctx.fillStyle = `rgba(${body.color}, ${bandAlpha})`
        ctx.fillRect(-r * 1.2, band * r * 0.22 - r * 0.08, r * 2.4, r * 0.16)
      }
      if (tier === "high") {
        const spotGrad = ctx.createRadialGradient(r * 0.35, r * 0.1, 0, r * 0.35, r * 0.1, r * 0.45)
        spotGrad.addColorStop(0, `rgba(180, 130, 90, ${alpha * 0.5})`)
        spotGrad.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = spotGrad
        ctx.fillRect(-r, -r, r * 2, r * 2)
      }
    } else {
      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, r * 0.1, r * 0.1, r)
      grad.addColorStop(0, `rgba(${body.color}, ${Math.min(alpha * 1.5, 1)})`)
      grad.addColorStop(0.7, `rgba(${body.color}, ${alpha})`)
      grad.addColorStop(1, `rgba(${body.color}, ${alpha * 0.35})`)
      ctx.fillStyle = grad
      ctx.fillRect(-r, -r, r * 2, r * 2)

      if (tier === "high") {
        if (body.subtype === "ice") {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.25})`
          ctx.beginPath()
          ctx.ellipse(-r * 0.25, -r * 0.35, r * 0.35, r * 0.15, -0.4, 0, Math.PI * 2)
          ctx.fill()
        } else if (body.subtype === "lava") {
          const lavaGrad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r)
          lavaGrad.addColorStop(0, `rgba(255, 180, 60, ${alpha * 0.7})`)
          lavaGrad.addColorStop(0.6, `rgba(${body.color}, ${alpha * 0.5})`)
          lavaGrad.addColorStop(1, "rgba(0,0,0,0)")
          ctx.fillStyle = lavaGrad
          ctx.fillRect(-r, -r, r * 2, r * 2)
        } else if (body.subtype === "ocean") {
          ctx.fillStyle = `rgba(120, 200, 255, ${alpha * 0.2})`
          ctx.beginPath()
          ctx.ellipse(r * 0.2, r * 0.15, r * 0.5, r * 0.12, 0.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }

  ctx.restore()

  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(${body.color}, ${alpha * 0.3})`
  ctx.lineWidth = Math.max(r * 0.04, 0.3)
  ctx.stroke()

  if (body.hasRing && body.ringColor && r > 3) {
    ctx.beginPath()
    ctx.ellipse(0, 0, r * 1.8, r * 0.4, 0.3, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(${body.ringColor}, ${alpha * 0.7})`
    ctx.lineWidth = Math.max(r * 0.15, 0.5)
    ctx.stroke()
  }

  if (tier === "high" && isDark && (config.glowIntensity ?? 0) > 0 && body.subtype !== "rocky" && body.subtype !== "desert") {
    const glowGrad = ctx.createRadialGradient(0, 0, r, 0, 0, r * 2.5)
    glowGrad.addColorStop(0, `rgba(${body.color}, ${alpha * (config.glowIntensity ?? 0.2) * 0.25})`)
    glowGrad.addColorStop(1, "rgba(0,0,0,0)")
    ctx.beginPath()
    ctx.arc(0, 0, r * 2.5, 0, Math.PI * 2)
    ctx.fillStyle = glowGrad
    ctx.fill()
  }
}

function drawStarSurface(
  ctx: CanvasRenderingContext2D,
  body: Pick<CelestialBody, "subtype" | "color" | "pulseOffset">,
  r: number,
  alpha: number,
  isDark: boolean,
  time: number,
  tier: PerformanceTier
) {
  const config = STAR_SUBTYPES[body.subtype as StarSubtype]
  const pulse = config.pulse
    ? 0.75 + Math.sin(time * 0.008 + (body.pulseOffset ?? 0)) * 0.25
    : 1
  const coreR = body.subtype === "neutron-star" ? r * 0.55 : r

  ctx.beginPath()
  ctx.arc(0, 0, coreR, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(alpha * 1.5 * pulse, 1)})`
  ctx.fill()

  if (body.subtype === "neutron-star") {
    const beamAlpha = alpha * pulse * 0.6
    ctx.save()
    ctx.rotate(time * 0.003 + (body.pulseOffset ?? 0))
    ctx.beginPath()
    ctx.ellipse(0, 0, r * 2.2, r * 0.25, 0, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(${body.color}, ${beamAlpha})`
    ctx.lineWidth = Math.max(r * 0.12, 0.5)
    ctx.stroke()
    ctx.rotate(Math.PI / 2)
    ctx.beginPath()
    ctx.ellipse(0, 0, r * 2.2, r * 0.25, 0, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(${body.color}, ${beamAlpha * 0.7})`
    ctx.lineWidth = Math.max(r * 0.1, 0.4)
    ctx.stroke()
    ctx.restore()
  }

  if (isDark && tier !== "low") {
    const corona = (tier === "high" ? (config.coronaScale ?? 3) : 1.8) * (body.subtype === "neutron-star" ? pulse : 1)
    const glowGrad = ctx.createRadialGradient(0, 0, coreR * 0.8, 0, 0, r * corona)
    glowGrad.addColorStop(0, `rgba(${body.color}, ${Math.min(alpha * (config.glowIntensity ?? 1) * pulse, 1)})`)
    glowGrad.addColorStop(0.35, `rgba(${body.color}, ${alpha * 0.45 * pulse})`)
    glowGrad.addColorStop(1, "rgba(0,0,0,0)")
    ctx.beginPath()
    ctx.arc(0, 0, r * corona, 0, Math.PI * 2)
    ctx.fillStyle = glowGrad
    ctx.fill()
  }
}

function drawSwallowingPrey(
  ctx: CanvasRenderingContext2D,
  type: CelestialBody["type"],
  subtype: BodySubtype,
  color: string,
  ringColor: string | undefined,
  hasRing: boolean,
  r: number,
  alpha: number,
  isDark: boolean,
  time: number,
  tier: PerformanceTier
) {
  if (type === "planet") {
    drawPlanetSurface(ctx, { subtype, color, ringColor, hasRing }, r, alpha, isDark, tier)
  } else if (type === "sun") {
    drawStarSurface(ctx, { subtype, color, pulseOffset: 0 }, r, alpha, isDark, time, tier)
  } else if (type === "asteroid-cluster") {
    const rocks = [
      { rRatio: 0, angOffset: 0, size: 0.6, phase: 0 },
      { rRatio: 1.1, angOffset: 0.3, size: 0.3, phase: 1.2 },
      { rRatio: 1.3, angOffset: 2.1, size: 0.25, phase: 2.4 },
      { rRatio: 0.9, angOffset: 4.2, size: 0.35, phase: 3.5 },
      { rRatio: 1.4, angOffset: 5.5, size: 0.2, phase: 4.1 },
    ]
    for (const rock of rocks) {
      const rockAngle = time * 0.002 + rock.angOffset
      const rx = rock.rRatio === 0 ? 0 : Math.cos(rockAngle) * rock.rRatio * r
      const ry = rock.rRatio === 0 ? 0 : Math.sin(rockAngle) * rock.rRatio * r
      const rr = r * rock.size

      const sides = 6
      ctx.beginPath()
      for (let k = 0; k < sides; k++) {
        const angle = (k / sides) * Math.PI * 2
        const jitter = 0.7 + Math.sin(k * 11.3 + rock.phase) * 0.3
        const px = rx + Math.cos(angle) * rr * jitter
        const py = ry + Math.sin(angle) * rr * jitter
        if (k === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()

      if (tier === "low") {
        ctx.fillStyle = isDark ? `rgba(${color}, ${alpha})` : `rgba(130, 125, 115, ${alpha})`
        ctx.fill()
      } else {
        const aGrad = ctx.createRadialGradient(rx - rr * 0.2, ry - rr * 0.2, 0, rx, ry, rr)
        aGrad.addColorStop(0, isDark ? `rgba(${color}, ${alpha})` : `rgba(130, 125, 115, ${alpha})`)
        aGrad.addColorStop(1, isDark ? `rgba(100, 95, 90, ${alpha * 0.5})` : `rgba(70, 65, 60, ${alpha * 0.5})`)
        ctx.fillStyle = aGrad
        ctx.fill()
      }
    }
  } else {
    const sides = 7
    ctx.beginPath()
    for (let k = 0; k < sides; k++) {
      const angle = (k / sides) * Math.PI * 2
      const jitter = 0.65 + Math.sin(k * 17.3) * 0.35
      const px = Math.cos(angle) * r * jitter
      const py = Math.sin(angle) * r * jitter
      if (k === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()

    if (tier === "low") {
      ctx.fillStyle = isDark ? `rgba(${color}, ${alpha})` : `rgba(140, 135, 125, ${alpha})`
      ctx.fill()
    } else {
      const aGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r)
      aGrad.addColorStop(0, isDark ? `rgba(${color}, ${alpha})` : `rgba(140, 135, 125, ${alpha})`)
      aGrad.addColorStop(1, isDark ? `rgba(100, 95, 90, ${alpha * 0.5})` : `rgba(80, 75, 70, ${alpha * 0.5})`)
      ctx.fillStyle = aGrad
      ctx.fill()
    }
  }
}

const MAX_DEPTH = 1000
const BASE_SPEED = 0.3
const WARP_MULTIPLIER = 1.0

// Helper to generate a new celestial body
function generateBody(width: number, height: number): CelestialBody {
  const typeRoll = Math.random()
  let type: CelestialBody["type"]
  let subtype: BodySubtype
  let config: SubtypeConfig
  let hasRing = false
  let ringColor = ""

  if (typeRoll < 0.03) {
    type = "blackhole"
    subtype = "blackhole"
    config = OTHER_SUBTYPE_META.blackhole
    ringColor = ["255, 150, 50", "150, 200, 255", "255, 100, 255"][Math.floor(Math.random() * 3)]
    hasRing = true
  } else if (typeRoll < 0.13) {
    type = "sun"
    subtype = pickWeighted(STAR_SUBTYPE_WEIGHTS)
    config = STAR_SUBTYPES[subtype]
  } else if (typeRoll < 0.45) {
    type = "planet"
    subtype = pickWeighted(PLANET_SUBTYPE_WEIGHTS)
    config = PLANET_SUBTYPES[subtype]
    ringColor = config.ringColor ?? ""
    hasRing = config.ringChance !== undefined && Math.random() < config.ringChance
  } else if (typeRoll < 0.90) {
    type = "asteroid"
    subtype = "asteroid"
    config = OTHER_SUBTYPE_META.asteroid
  } else {
    type = "asteroid-cluster"
    subtype = "asteroid-cluster"
    config = OTHER_SUBTYPE_META["asteroid-cluster"]
  }

  const radius = Math.random() * (config.radiusMax - config.radiusMin) + config.radiusMin
  const mass = (type === "blackhole"
    ? Math.PI * radius * radius * 8
    : Math.PI * radius * radius) * config.massMultiplier

  return {
    id: 0,
    x: (Math.random() - 0.5) * width * 3,
    y: (Math.random() - 0.5) * height * 3,
    z: Math.random() * MAX_DEPTH,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    radius,
    mass,
    type,
    subtype,
    color: config.color,
    ringColor,
    hasRing,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    isDragging: false,
    pulseOffset: Math.random() * Math.PI * 2,
  }
}

// Component
export function StarField() {
  const { catchBody } = useCodex()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const starsRef = useRef<Star[]>([])
  const bodiesRef = useRef<CelestialBody[]>([])
  const cometsRef = useRef<Comet[]>([])
  const shootingStarsRef = useRef<ShootingStar[]>([])
  const nebulaeRef = useRef<NebulaCloud[]>([])
  const particlesRef = useRef<CollisionParticle[]>([])
  const swallowingRef = useRef<SwallowEffect[]>([])
  const activeTooltipRef = useRef<{ kind: TooltipInfo["kind"]; trackId: number } | null>(null)
  const nextCometIdRef = useRef(1)
  const nextShootingStarIdRef = useRef(1)
  const tierRef = useRef<PerformanceTier>("high")
  const fpsFramesRef = useRef<number[]>([])
  const fpsCheckDoneRef = useRef(false)

  const [tooltipInfo, setTooltipInfo] = useState<TooltipInfo | null>(null)

  const dragStateRef = useRef<{
    activeBodyId: number | null
    offsetX: number
    offsetY: number
    velocityQueue: { dx: number, dy: number }[]
  }>({
    activeBodyId: null,
    offsetX: 0,
    offsetY: 0,
    velocityQueue: [],
  })

  const animFrameRef = useRef<number>(0)
  const lastCometTimeRef = useRef(0)
  const lastShootingStarTimeRef = useRef(0)

  const { resolvedTheme } = useTheme()
  const themeRef = useRef(resolvedTheme)
  const mountedRef = useRef(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const interactionStartedRef = useRef(false)
  const dragOscRef = useRef<OscillatorNode | null>(null)
  const dragGainRef = useRef<GainNode | null>(null)

  // Lazy-init AudioContext (must happen after user gesture)
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioCtxRef.current
  }, [])

  // Play collision impact sound
  const playCollisionSound = useCallback((intensity: number) => {
    if (!interactionStartedRef.current) return // Prevent loud explosion sounds on initial page load overlaps
    try {
      const ctx = getAudioCtx()
      if (ctx.state === 'suspended') ctx.resume()

      const now = ctx.currentTime
      const duration = 0.3 + intensity * 0.4

      // Low boom
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'

      osc.frequency.value = 80 + intensity * 40
      osc.frequency.setTargetAtTime(30, now, duration * 0.2)

      gain.gain.value = Math.min(intensity * 0.25, 0.4)
      gain.gain.setTargetAtTime(0.001, now, duration * 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + duration)

      // Crackle noise
      const bufferSize = Math.floor(ctx.sampleRate * duration * 0.5)
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3)
      }
      const noise = ctx.createBufferSource()
      const noiseGain = ctx.createGain()
      noise.buffer = noiseBuffer

      noiseGain.gain.value = Math.min(intensity * 0.15, 0.2)
      noiseGain.gain.setTargetAtTime(0.001, now, duration * 0.1)

      noise.connect(noiseGain)
      noiseGain.connect(ctx.destination)
      noise.start(now)
    } catch {
      // Audio not available, silently ignore
    }
  }, [getAudioCtx])

  // Deep gravitational whoosh when a body is fully swallowed
  const playSwallowSound = useCallback((intensity: number) => {
    if (!interactionStartedRef.current) return
    try {
      const ctx = getAudioCtx()
      if (ctx.state === "suspended") ctx.resume()

      const now = ctx.currentTime
      const duration = 0.5 + intensity * 0.4

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(120 + intensity * 30, now)
      osc.frequency.exponentialRampToValueAtTime(25, now + duration)

      gain.gain.setValueAtTime(Math.min(intensity * 0.18, 0.3), now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + duration)
    } catch {
      // Audio not available
    }
  }, [getAudioCtx])

  // Start drag hum
  const startDragSound = useCallback(() => {
    try {
      const ctx = getAudioCtx()
      if (ctx.state === 'suspended') ctx.resume()

      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(60, now)

      gain.gain.value = 0
      gain.gain.setTargetAtTime(0.06, now, 0.05)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)

      dragOscRef.current = osc
      dragGainRef.current = gain
    } catch {
      // Audio not available
    }
  }, [getAudioCtx])

  // Update drag sound pitch based on velocity
  const updateDragSound = useCallback((velocity: number) => {
    if (dragOscRef.current && dragGainRef.current) {
      const ctx = getAudioCtx()
      const now = ctx.currentTime
      dragOscRef.current.frequency.setTargetAtTime(60 + velocity * 8, now, 0.05)
      dragGainRef.current.gain.setTargetAtTime(Math.min(0.06 + velocity * 0.01, 0.15), now, 0.05)
    }
  }, [getAudioCtx])

  // Stop drag hum
  const stopDragSound = useCallback(() => {
    try {
      if (dragOscRef.current && dragGainRef.current) {
        const ctx = getAudioCtx()
        dragGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.05)
        const osc = dragOscRef.current
        setTimeout(() => {
          try {
            osc.stop()
          } catch {
            /* already stopped */
          }
        }, 200)
        dragOscRef.current = null
        dragGainRef.current = null
      }
    } catch {
      // Audio not available
    }
  }, [getAudioCtx])

  // Play discovery sound
  const playDiscoverySound = useCallback(() => {
    if (!interactionStartedRef.current) return
    try {
      const ctx = getAudioCtx()
      if (ctx.state === 'suspended') ctx.resume()

      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'

      // Frequency for a nice chime (C6 -> E6 -> G6)
      osc.frequency.setValueAtTime(1046.50, now)
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.1)
      osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.2)

      // Envelope: fast attack, medium decay
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.15, now + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.8)
    } catch {
      // Audio not available
    }
  }, [getAudioCtx])

  // Mark interaction as started on first user action (pointerdown/keydown)
  useEffect(() => {
    const handleFirstInteraction = () => {
      interactionStartedRef.current = true
      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }

    window.addEventListener('pointerdown', handleFirstInteraction)
    window.addEventListener('keydown', handleFirstInteraction)

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [])

  useEffect(() => {
    themeRef.current = resolvedTheme
  }, [resolvedTheme])

  const createStar = useCallback((width: number, height: number): Star => {
    const colorRoll = Math.random()
    let colorIndex = 0
    if (colorRoll < 0.05) colorIndex = 0
    else if (colorRoll < 0.12) colorIndex = 1
    else if (colorRoll < 0.22) colorIndex = 2
    else if (colorRoll < 0.37) colorIndex = 3
    else if (colorRoll < 0.57) colorIndex = 4
    else if (colorRoll < 0.80) colorIndex = 5
    else colorIndex = 6

    return {
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * MAX_DEPTH,
      prevZ: MAX_DEPTH,
      size: Math.random() * 1.5 + (colorRoll > 0.8 ? 0.2 : 0.5),
      brightness: Math.random() > 0.4 ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3 + 0.1,
      twinkleSpeed: Math.random() * 2 + 1,
      twinkleOffset: Math.random() * Math.PI * 2,
      colorIndex,
    }
  }, [])

  const adjustStarCount = useCallback((width: number, height: number) => {
    const target = getStarCount(width, height, tierRef.current)
    const stars = starsRef.current
    while (stars.length < target) {
      stars.push(createStar(width, height))
    }
    while (stars.length > target) {
      stars.pop()
    }
  }, [createStar])

  const initObjects = useCallback((width: number, height: number) => {
    const tier = tierRef.current

    // 1. Stars
    const stars: Star[] = []
    const starCount = getStarCount(width, height, tier)
    for (let i = 0; i < starCount; i++) {
      stars.push(createStar(width, height))
    }
    starsRef.current = stars

    // 2. Interactive Celestial Bodies
    const bodyCount = getBodyCount(width, height, tier)
    const bodies: CelestialBody[] = []
    for (let i = 0; i < bodyCount; i++) {
      const b = generateBody(width, height)
      b.id = i
      bodies.push(b)
    }
    bodiesRef.current = bodies

    // 3. Nebula clouds
    const nebulae: NebulaCloud[] = []
    const nebulaCount = getNebulaCount(width, height, tier)
    for (let i = 0; i < nebulaCount; i++) {
      const palette = NEBULA_PALETTES[i % NEBULA_PALETTES.length]
      nebulae.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 200 + 120,
        color1: palette.c1,
        color2: palette.c2,
        drift: Math.random() * 0.15 + 0.05,
        driftAngle: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.03 + 0.015,
        pulseSpeed: Math.random() * 0.3 + 0.1,
        pulseOffset: Math.random() * Math.PI * 2,
      })
    }
    nebulaeRef.current = nebulae
  }, [createStar])

  const spawnComet = useCallback((w: number, h: number): Comet => {
    const side = Math.floor(Math.random() * 4)
    let x: number, y: number, vx: number, vy: number
    const baseSpeed = Math.random() * 2 + 1.5

    switch (side) {
      case 0: // top
        x = Math.random() * w; y = -20
        vx = (Math.random() - 0.5) * baseSpeed; vy = baseSpeed
        break
      case 1: // right
        x = w + 20; y = Math.random() * h
        vx = -baseSpeed; vy = (Math.random() - 0.5) * baseSpeed
        break
      case 2: // bottom
        x = Math.random() * w; y = h + 20
        vx = (Math.random() - 0.5) * baseSpeed; vy = -baseSpeed
        break
      default: // left
        x = -20; y = Math.random() * h
        vx = baseSpeed; vy = (Math.random() - 0.5) * baseSpeed
    }

    return {
      id: nextCometIdRef.current++,
      x, y, vx, vy,
      size: Math.random() * 2.5 + 1.5,
      tailLength: Math.random() * 80 + 50,
      life: 0,
      maxLife: Math.random() * 200 + 300,
      brightness: Math.random() * 0.4 + 0.6,
      color: COMET_COLORS[Math.floor(Math.random() * COMET_COLORS.length)],
    }
  }, [])

  const spawnShootingStar = useCallback((w: number, h: number): ShootingStar => {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 12 + 8
    return {
      id: nextShootingStarIdRef.current++,
      x: Math.random() * w,
      y: Math.random() * h * 0.6,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: Math.random() * 15 + 10,
      size: Math.random() * 1.5 + 0.8,
    }
  }, [])

  // Interaction Handlers
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getPointerPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    // Helper to compute screen pos and radius
    const getScreenBody = (body: CelestialBody) => {
      const w = canvas.width / (window.devicePixelRatio || 1)
      const h = canvas.height / (window.devicePixelRatio || 1)
      const cx = w / 2
      const cy = h / 2
      const depthFactor = 1 - body.z / MAX_DEPTH
      const projSize = body.radius * depthFactor
      const bx = (body.x / body.z) * (w / 4) + cx
      const by = (body.y / body.z) * (h / 4) + cy
      return { bx, by, projSize, w, h, cx, cy }
    }

    const findBodyAtPoint = (x: number, y: number) => {
      const bodies = bodiesRef.current
      for (let i = bodies.length - 1; i >= 0; i--) {
        const body = bodies[i]
        const { bx, by, projSize } = getScreenBody(body)
        if (Math.hypot(bx - x, by - y) <= Math.max(projSize, 15)) {
          return { body, bx, by, projSize }
        }
      }
      return null
    }

    const findCometAtPoint = (x: number, y: number) => {
      const comets = cometsRef.current
      for (let i = comets.length - 1; i >= 0; i--) {
        const comet = comets[i]
        const tailX = comet.x - comet.vx * comet.tailLength * 0.3
        const tailY = comet.y - comet.vy * comet.tailLength * 0.3
        const hitRadius = Math.max(comet.size * 2.5, 14)
        const headDist = Math.hypot(comet.x - x, comet.y - y)
        const tailDist = distToSegment(x, y, comet.x, comet.y, tailX, tailY)
        if (headDist <= hitRadius || tailDist <= hitRadius * 0.65) {
          return comet
        }
      }
      return null
    }

    const findShootingStarAtPoint = (x: number, y: number) => {
      const stars = shootingStarsRef.current
      for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i]
        const speed = Math.hypot(star.vx, star.vy) || 1
        const trailLen = 25 * (1 - star.life / star.maxLife)
        const tailX = star.x - (star.vx / speed) * trailLen
        const tailY = star.y - (star.vy / speed) * trailLen
        const hitRadius = Math.max(star.size * 3.5, 12)
        const headDist = Math.hypot(star.x - x, star.y - y)
        const trailDist = distToSegment(x, y, star.x, star.y, tailX, tailY)
        if (headDist <= hitRadius || trailDist <= hitRadius * 0.55) {
          return star
        }
      }
      return null
    }

    const showTooltip = (info: TooltipInfo) => {
      activeTooltipRef.current = { kind: info.kind, trackId: info.trackId }
      setTooltipInfo(info)
    }

    const clearTooltip = () => {
      activeTooltipRef.current = null
      setTooltipInfo(null)
    }

    const findHoverTarget = (x: number, y: number): TooltipInfo | null => {
      const bodyHit = findBodyAtPoint(x, y)
      if (bodyHit) {
        return buildBodyTooltip(bodyHit.body, bodyHit.bx, bodyHit.by, bodyHit.projSize, false)
      }

      const comet = findCometAtPoint(x, y)
      if (comet) return buildCometTooltip(comet)

      const shootingStar = findShootingStarAtPoint(x, y)
      if (shootingStar) return buildShootingStarTooltip(shootingStar)

      return null
    }

    const onPointerDown = (e: PointerEvent) => {
      const { x, y } = getPointerPos(e)

      // Check comets for codex catching
      const cometHit = findCometAtPoint(x, y)
      if (cometHit) {
        if (e.cancelable) e.preventDefault()
        const isNewCatch = catchBody("comet")
        if (isNewCatch) {
          playDiscoverySound()
          const debrisCount = tierRef.current === "high" ? 25 : tierRef.current === "medium" ? 15 : 8
          for (let j = 0; j < debrisCount; j++) {
            const angle = Math.random() * Math.PI * 2
            const speed = Math.random() * 8 + 2
            particlesRef.current.push({
              x: cometHit.x,
              y: cometHit.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: Math.random() * 4 + 1,
              life: Math.random() * 30 + 30,
              maxLife: 60,
              color: cometHit.color,
            })
          }
        }
        return // Comets aren't draggable
      }

      const bodies = bodiesRef.current

      for (let i = bodies.length - 1; i >= 0; i--) {
        const body = bodies[i]
        const { bx, by, projSize } = getScreenBody(body)
        const hitRadius = Math.max(projSize, 15)
        const dist = Math.hypot(bx - x, by - y)

        if (dist <= hitRadius) {
          if (e.cancelable) e.preventDefault()

          body.isDragging = true
          body.vx = 0
          body.vy = 0

          const isNewCatch = catchBody(body.subtype)
          if (isNewCatch) {
            playDiscoverySound()
            const debrisCount = tierRef.current === "high" ? 25 : tierRef.current === "medium" ? 15 : 8
            for (let j = 0; j < debrisCount; j++) {
              const angle = Math.random() * Math.PI * 2
              const speed = Math.random() * 8 + 2
              particlesRef.current.push({
                x: body.x,
                y: body.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 1,
                life: Math.random() * 30 + 30,
                maxLife: 60,
                color: body.color,
              })
            }
          }

          showTooltip(buildBodyTooltip(body, bx, by, projSize, true))
          startDragSound()

          dragStateRef.current = {
            activeBodyId: body.id,
            offsetX: bx - x,
            offsetY: by - y,
            velocityQueue: [],
          }

          // Move body to end of array to render it on top
          bodies.splice(i, 1)
          bodies.push(body)

          canvas.setPointerCapture(e.pointerId)
          canvas.style.cursor = "grabbing"
          break
        }
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      const state = dragStateRef.current
      const { x, y } = getPointerPos(e)

      if (state.activeBodyId === null) {
        const hover = findHoverTarget(x, y)
        if (hover) {
          showTooltip(hover)
          // We can't easily change cursor if they hover over text, but we can set it on document.body
          if (e.target === canvas) canvas.style.cursor = hover.canDrag ? "grab" : "help"
        } else {
          clearTooltip()
          if (e.target === canvas) canvas.style.cursor = "default"
        }
        return
      }

      if (e.cancelable) e.preventDefault() // prevent scrolling while dragging

      const body = bodiesRef.current.find(b => b.id === state.activeBodyId)

      if (body) {
        const { bx, by, projSize, w, h, cx, cy } = getScreenBody(body)

        const targetScreenX = x + state.offsetX
        const targetScreenY = y + state.offsetY

        showTooltip(buildBodyTooltip(body, targetScreenX, targetScreenY, projSize, true))

        const oldWorldX = body.x
        const oldWorldY = body.y

        // Inverse 3D projection to find world coordinates
        body.x = (targetScreenX - cx) * body.z / (w / 4)
        body.y = (targetScreenY - cy) * body.z / (h / 4)

        // Track velocity in world space
        const dx = body.x - oldWorldX
        const dy = body.y - oldWorldY
        state.velocityQueue.push({ dx, dy })
        if (state.velocityQueue.length > 5) state.velocityQueue.shift()

        updateDragSound(Math.hypot(dx, dy))
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      const state = dragStateRef.current
      if (state.activeBodyId !== null) {
        if (e.cancelable) e.preventDefault()
        stopDragSound()
        const body = bodiesRef.current.find(b => b.id === state.activeBodyId)
        if (body) {
          body.isDragging = false

          if (state.velocityQueue.length > 0) {
            let sumX = 0, sumY = 0
            for (const v of state.velocityQueue) {
              sumX += v.dx
              sumY += v.dy
            }
            const avgX = sumX / state.velocityQueue.length
            const avgY = sumY / state.velocityQueue.length

            body.vx = Math.min(Math.max(avgX * 0.8, -MAX_VELOCITY), MAX_VELOCITY)
            body.vy = Math.min(Math.max(avgY * 0.8, -MAX_VELOCITY), MAX_VELOCITY)
          }
        }

        state.activeBodyId = null
        state.velocityQueue = []
        canvas.releasePointerCapture(e.pointerId)

        const { x, y } = getPointerPos(e)
        const hover = findHoverTarget(x, y)
        if (hover) {
          showTooltip(hover)
          canvas.style.cursor = hover.canDrag ? "grab" : "help"
        } else {
          clearTooltip()
          canvas.style.cursor = "default"
        }
      }
    }

    const onPointerLeave = () => {
      if (dragStateRef.current.activeBodyId === null) {
        clearTooltip()
        canvas.style.cursor = "default"
      }
    }

    window.addEventListener("pointerdown", onPointerDown, { passive: false })
    window.addEventListener("pointermove", onPointerMove, { passive: false })
    window.addEventListener("pointerup", onPointerUp)
    window.addEventListener("pointercancel", onPointerUp)

    // Only capture leave on canvas/document if needed
    document.addEventListener("pointerleave", onPointerLeave)

    return () => {
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      window.removeEventListener("pointercancel", onPointerUp)
      document.removeEventListener("pointerleave", onPointerLeave)
    }
  }, [startDragSound, stopDragSound, updateDragSound, playDiscoverySound, catchBody])

  // Rendering & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    mountedRef.current = true
    tierRef.current = detectPerformanceTier()

    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    const resize = () => {
      const config = TIER_CONFIGS[tierRef.current]
      const rawDpr = window.devicePixelRatio || 1
      const dpr = Math.min(rawDpr, config.maxDpr)

      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const width = window.innerWidth
      const height = window.innerHeight

      if (starsRef.current.length === 0) {
        initObjects(width, height)
      } else {
        adjustStarCount(width, height)
      }
    }

    resize()
    window.addEventListener("resize", resize)

    let lastTime = performance.now()

    const animate = (time: number) => {
      if (!mountedRef.current) return

      const dt = Math.min((time - lastTime) / 16.67, 3)
      const frameMs = time - lastTime
      lastTime = time

      // FPS Monitor logic
      if (!fpsCheckDoneRef.current && tierRef.current !== "low") {
        fpsFramesRef.current.push(frameMs)
        if (fpsFramesRef.current.length > 60) {
          const avg = fpsFramesRef.current.reduce((a, b) => a + b, 0) / fpsFramesRef.current.length
          if (avg > 25) { // < 40fps average
            const newTier = tierRef.current === "high" ? "medium" : "low"
            console.log(`[StarField] Average frame time ${avg.toFixed(1)}ms. Downgrading tier from ${tierRef.current} to ${newTier}.`)
            tierRef.current = newTier
            resize() // Apply new DPR limits and object counts
          }
          fpsCheckDoneRef.current = true
        }
      }

      const w = window.innerWidth
      const h = window.innerHeight
      const isDark = themeRef.current === "dark"
      const tier = tierRef.current

      ctx.fillStyle = isDark ? "#000000" : "#ffffff"
      ctx.fillRect(0, 0, w, h)

      // Nebula clouds
      if (isDark) {
        for (const neb of nebulaeRef.current) {
          neb.x += Math.cos(neb.driftAngle) * neb.drift * dt
          neb.y += Math.sin(neb.driftAngle) * neb.drift * dt

          if (neb.x < -neb.radius) neb.x = w + neb.radius
          if (neb.x > w + neb.radius) neb.x = -neb.radius
          if (neb.y < -neb.radius) neb.y = h + neb.radius
          if (neb.y > h + neb.radius) neb.y = -neb.radius

          const pulse = Math.sin(time * 0.001 * neb.pulseSpeed + neb.pulseOffset) * 0.3 + 0.7
          const a = neb.alpha * pulse

          const grad1 = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius)
          grad1.addColorStop(0, `rgba(${neb.color1}, ${a * 1.2})`)
          grad1.addColorStop(0.5, `rgba(${neb.color2}, ${a * 0.5})`)
          grad1.addColorStop(1, `rgba(${neb.color2}, 0)`)
          ctx.beginPath()
          ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2)
          ctx.fillStyle = grad1
          ctx.fill()

          const grad2 = ctx.createRadialGradient(
            neb.x + neb.radius * 0.3, neb.y - neb.radius * 0.2, 0,
            neb.x, neb.y, neb.radius * 1.5
          )
          grad2.addColorStop(0, `rgba(${neb.color1}, ${a * 0.4})`)
          grad2.addColorStop(1, `rgba(${neb.color2}, 0)`)
          ctx.beginPath()
          ctx.arc(neb.x, neb.y, neb.radius * 1.5, 0, Math.PI * 2)
          ctx.fillStyle = grad2
          ctx.fill()
        }
      }

      const speed = BASE_SPEED + WARP_MULTIPLIER * 3.0
      const warpFactor = 3.0 / 100
      const cx = w / 2
      const cy = h / 2

      // Stars
      for (const star of starsRef.current) {
        star.prevZ = star.z
        star.z -= speed * dt

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * w * 2
          star.y = (Math.random() - 0.5) * h * 2
          star.z = MAX_DEPTH
          star.prevZ = MAX_DEPTH
        }
        if (star.z >= MAX_DEPTH) {
          star.x = (Math.random() - 0.5) * w * 2
          star.y = (Math.random() - 0.5) * h * 2
          star.z = 1 + Math.random() * 100
          star.prevZ = star.z
        }

        const sx = (star.x / star.z) * (w / 4) + cx
        const sy = (star.y / star.z) * (h / 4) + cy
        const psx = (star.x / star.prevZ) * (w / 4) + cx
        const psy = (star.y / star.prevZ) * (h / 4) + cy
        const depthFactor = 1 - star.z / MAX_DEPTH
        const size = star.size * depthFactor * 2.5
        const twinkle = Math.sin(time * 0.001 * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7
        const alpha = depthFactor * star.brightness * twinkle

        if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) continue

        const sc = STAR_COLORS[star.colorIndex]

        if (warpFactor > 0.05 && tier !== "low") {
          const streakAlpha = alpha * Math.min(warpFactor * 2, 1)
          ctx.beginPath()
          ctx.moveTo(psx, psy)
          ctx.lineTo(sx, sy)
          ctx.strokeStyle = isDark
            ? `rgba(${sc.r}, ${sc.g}, ${sc.b}, ${streakAlpha})`
            : `rgba(${Math.floor(sc.r * 0.4)}, ${Math.floor(sc.g * 0.4)}, ${Math.floor(sc.b * 0.5)}, ${streakAlpha})`
          ctx.lineWidth = size * 0.6
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.arc(sx, sy, Math.max(size * 0.5, 0.3), 0, Math.PI * 2)
        ctx.fillStyle = isDark
          ? `rgba(${sc.r}, ${sc.g}, ${sc.b}, ${alpha})`
          : `rgba(${Math.floor(sc.r * 0.4)}, ${Math.floor(sc.g * 0.4)}, ${Math.floor(sc.b * 0.5)}, ${alpha})`
        ctx.fill()

        if (depthFactor > 0.7 && isDark && tier === "high") {
          ctx.beginPath()
          ctx.arc(sx, sy, size * 2.5, 0, Math.PI * 2)
          const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 2.5)
          grad.addColorStop(0, `rgba(${sc.r}, ${sc.g}, ${sc.b}, ${alpha * 0.25})`)
          grad.addColorStop(1, `rgba(${sc.r}, ${sc.g}, ${sc.b}, 0)`)
          ctx.fillStyle = grad
          ctx.fill()
        }
      }

      // Celestial Bodies (Physics)
      const bodies = bodiesRef.current
      const targetBodyCount = getBodyCount(w, h, tier)
      const toRemove: number[] = [] // indices to remove after collision

      // Black hole gravity — strong pull + orbital spiral for nearby bodies
      for (const bh of bodies) {
        if (bh.type !== "blackhole") continue
        const influenceRange = w * BLACK_HOLE_INFLUENCE

        for (const prey of bodies) {
          if (prey.id === bh.id || prey.type === "blackhole" || prey.isDragging) continue

          const dx = bh.x - prey.x
          const dy = bh.y - prey.y
          const dist = Math.hypot(dx, dy)
          if (dist < 1 || dist > influenceRange) continue

          const nx = dx / dist
          const ny = dy / dist
          const tx = -ny
          const ty = nx

          // Stronger pull as prey spirals closer
          const proximity = 1 - dist / influenceRange
          const pullForce = (BLACK_HOLE_GRAVITY / Math.max(dist * dist, 80)) * (1 + proximity * 2)
          const orbitForce = (BLACK_HOLE_ORBIT / Math.max(dist, 40)) * (0.5 + proximity)

          prey.vx += (nx * pullForce + tx * orbitForce) * dt
          prey.vy += (ny * pullForce + ty * orbitForce) * dt

          prey.vx = Math.min(Math.max(prey.vx, -MAX_VELOCITY), MAX_VELOCITY)
          prey.vy = Math.min(Math.max(prey.vy, -MAX_VELOCITY), MAX_VELOCITY)
        }
      }

      for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i]

        // Z-axis movement (warp speed) - skip for dragged bodies
        if (!body.isDragging) {
          body.z -= speed * dt * 0.2
          body.vx *= FRICTION
          body.vy *= FRICTION

          body.x += body.vx * dt
          body.y += body.vy * dt
        }

        // Collision detection - absorption instead of bounce
        for (let j = i + 1; j < bodies.length; j++) {
          if (toRemove.includes(i) || toRemove.includes(j)) continue

          const other = bodies[j]
          const dx = other.x - body.x
          const dy = other.y - body.y
          const dist = Math.hypot(dx, dy)
          const minDist = body.radius + other.radius
          const hasBlackHole = body.type === "blackhole" || other.type === "blackhole"

          const isAsteroidAsteroid = body.type !== "sun" && body.type !== "planet" && other.type !== "sun" && other.type !== "planet"

          // Apply standard gravity (skip pairs involving black holes — handled above, skip ast-ast on low tier)
          if (!hasBlackHole && dist > minDist * 0.7 && dist < w * 1.5 && !(tier === "low" && isAsteroidAsteroid)) {
            const force = GRAVITY_CONSTANT / Math.max(dist * dist, 10)
            if (!body.isDragging) {
              body.vx += (dx / dist) * force * getEffectiveMass(other) * dt
              body.vy += (dy / dist) * force * getEffectiveMass(other) * dt
            }
            if (!other.isDragging) {
              other.vx -= (dx / dist) * force * getEffectiveMass(body) * dt
              other.vy -= (dy / dist) * force * getEffectiveMass(body) * dt
            }
          }

          const swallowThreshold = hasBlackHole ? minDist * 0.85 : minDist * 0.7
          if (dist < swallowThreshold) {
            // Black hole always absorbs; otherwise bigger absorbs smaller
            let bigger: CelestialBody
            let smaller: CelestialBody
            let smallerIdx: number

            if (body.type === "blackhole" && other.type !== "blackhole") {
              bigger = body
              smaller = other
              smallerIdx = j
            } else if (other.type === "blackhole" && body.type !== "blackhole") {
              bigger = other
              smaller = body
              smallerIdx = i
            } else {
              bigger = body.mass >= other.mass ? body : other
              smaller = body.mass >= other.mass ? other : body
              smallerIdx = body.mass >= other.mass ? j : i
            }

            // Skip if dragging the smaller one (don't destroy what user is holding)
            if (smaller.isDragging) continue

            const isBlackHoleSwallow = bigger.type === "blackhole" && smaller.type !== "blackhole"

            if (isBlackHoleSwallow) {
              const sdx = smaller.x - bigger.x
              const sdy = smaller.y - bigger.y
              const sdist = Math.hypot(sdx, sdy) || 1

              swallowingRef.current.push({
                bhId: bigger.id,
                preyType: smaller.type,
                preySubtype: smaller.subtype,
                preyColor: smaller.color,
                preyRingColor: smaller.ringColor,
                preyHasRing: smaller.hasRing,
                startWorldRadius: smaller.radius,
                startDist: sdist,
                angle: Math.atan2(sdy, sdx),
                z: smaller.z,
                mass: smaller.mass,
                progress: 0,
                trail: [],
              })

              playSwallowSound(Math.min(smaller.mass / 2000, 1.0))

              const newMass = bigger.mass + smaller.mass * 0.5
              bigger.radius = Math.sqrt(newMass / Math.PI)
              bigger.mass = newMass
              bigger.rotationSpeed += 0.01
              bigger.swallowPulse = 1

              toRemove.push(smallerIdx)

              if (dragStateRef.current.activeBodyId === smaller.id) {
                dragStateRef.current.activeBodyId = null
                canvasRef.current?.style.setProperty("cursor", "default")
              }
              continue
            }

            // Standard planet-on-planet collision
            playCollisionSound(Math.min((bigger.mass + smaller.mass) / 3000, 1.0))

            // Spawn debris particles at collision point
            const collisionX = (body.x + other.x) / 2
            const collisionY = (body.y + other.y) / 2
            const collisionZ = (body.z + other.z) / 2
            let debrisCount = Math.floor(Math.random() * 8 + 6)
            if (smaller.type === "asteroid-cluster") {
              debrisCount += 15 // massive debris scatter for a cluster breaking apart
            }
            if (tier === "low") debrisCount = Math.floor(debrisCount * 0.3)
            else if (tier === "medium") debrisCount = Math.floor(debrisCount * 0.6)

            for (let p = 0; p < debrisCount; p++) {
              const angle = (p / debrisCount) * Math.PI * 2 + Math.random() * 0.5
              const spd = Math.random() * 3 + 1.5 + (smaller.type === "asteroid-cluster" ? Math.random() * 2 : 0)
              particlesRef.current.push({
                x: (collisionX / collisionZ) * (w / 4) + cx,
                y: (collisionY / collisionZ) * (h / 4) + cy,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                size: Math.random() * 3 + 1,
                life: 0,
                maxLife: Math.random() * 40 + 20,
                color: smaller.color === "0, 0, 0" ? "255, 200, 100" : smaller.color,
              })
            }

            // Bigger body absorbs smaller: grow in mass and radius
            const newMass = bigger.mass + smaller.mass * 0.3
            bigger.radius = Math.sqrt(newMass / Math.PI)
            bigger.mass = newMass

            // Inherit some momentum from the smaller body
            const totalMass = bigger.mass + smaller.mass
            bigger.vx = (bigger.vx * bigger.mass + smaller.vx * smaller.mass) / totalMass
            bigger.vy = (bigger.vy * bigger.mass + smaller.vy * smaller.mass) / totalMass

            // Mark smaller for removal
            toRemove.push(smallerIdx)

            // If dragging the bigger, keep drag state
            if (dragStateRef.current.activeBodyId === smaller.id) {
              dragStateRef.current.activeBodyId = null
              canvasRef.current?.style.setProperty('cursor', 'default')
            }
          }
        }

        body.rotation += body.rotationSpeed * (Math.hypot(body.vx, body.vy) * 0.1 + 1) * dt

        if (body.type === "blackhole" && body.swallowPulse && body.swallowPulse > 0.01) {
          body.swallowPulse *= 0.93
        } else if (body.type === "blackhole") {
          body.swallowPulse = 0
        }
      }

      // Remove absorbed bodies (reverse order to keep indices valid)
      if (toRemove.length > 0) {
        const sorted = [...new Set(toRemove)].sort((a, b) => b - a)
        for (const idx of sorted) {
          bodies.splice(idx, 1)
        }
        // Replenish: spawn new bodies in the distance to keep the field populated
        while (bodies.length < targetBodyCount) {
          const newBody = generateBody(w, h)
          newBody.id = Math.max(...bodies.map(b => b.id), 0) + 1
          newBody.z = MAX_DEPTH // spawn far away
          bodies.push(newBody)
        }
      }

      for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i]
        const bx = (body.x / body.z) * (w / 4) + cx
        const by = (body.y / body.z) * (h / 4) + cy
        const depthFactor = 1 - body.z / MAX_DEPTH
        const projSize = body.radius * depthFactor

        // Respawn if passed the camera or went way off screen (but never while dragging)
        if (!body.isDragging && (body.z <= 10 || bx < -w || bx > w * 2 || by < -h || by > h * 2)) {
          const newBody = generateBody(w, h)
          const oldId = body.id
          Object.assign(body, newBody)
          body.id = oldId // keep original id
          body.z = MAX_DEPTH
          if (dragStateRef.current.activeBodyId === oldId) {
            dragStateRef.current.activeBodyId = null
            canvasRef.current?.style.setProperty('cursor', 'default')
          }
          continue // skip drawing this frame
        }

        ctx.save()
        ctx.translate(bx, by)
        ctx.rotate(body.rotation)

        if (body.isDragging) {
          ctx.beginPath()
          ctx.arc(0, 0, projSize + 4, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255, 255, 255, 0.4)`
          ctx.lineWidth = 2
          ctx.stroke()
        }

        const r = projSize
        const alpha = depthFactor * 0.8

        if (body.type === "planet") {
          drawPlanetSurface(ctx, body, r, alpha, isDark, tier)
        } else if (body.type === "sun") {
          drawStarSurface(ctx, body, r, alpha, isDark, time, tier)
        } else if (body.type === "blackhole") {
          const pulseBoost = body.swallowPulse ?? 0

          if (isDark && body.ringColor) {
            const diskGrad = ctx.createRadialGradient(0, 0, r, 0, 0, r * 2.5)
            diskGrad.addColorStop(0, `rgba(${body.ringColor}, ${Math.min(alpha + pulseBoost * 0.6, 1)})`)
            diskGrad.addColorStop(0.5, `rgba(${body.ringColor}, ${alpha * 0.4 + pulseBoost * 0.3})`)
            diskGrad.addColorStop(1, "rgba(0,0,0,0)")

            ctx.save()
            ctx.scale(1, 0.25)
            ctx.beginPath()
            ctx.arc(0, 0, r * (3 + pulseBoost * 0.5), 0, Math.PI * 2)
            ctx.fillStyle = diskGrad
            ctx.fill()

            ctx.beginPath()
            ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6 + pulseBoost * 0.4})`
            ctx.lineWidth = Math.max(r * 0.15, 0.5)
            ctx.stroke()
            ctx.restore()
          }

          if (pulseBoost > 0.1 && isDark) {
            const ingestGrad = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 3)
            ingestGrad.addColorStop(0, `rgba(255, 200, 100, ${pulseBoost * 0.5})`)
            ingestGrad.addColorStop(0.5, `rgba(${body.ringColor ?? "255, 150, 50"}, ${pulseBoost * 0.25})`)
            ingestGrad.addColorStop(1, "rgba(0,0,0,0)")
            ctx.beginPath()
            ctx.arc(0, 0, r * 3, 0, Math.PI * 2)
            ctx.fillStyle = ingestGrad
            ctx.fill()
          }

          ctx.beginPath()
          ctx.arc(0, 0, r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(alpha * 2, 1)})`
          ctx.fill()

          if (isDark) {
            ctx.beginPath()
            ctx.arc(0, 0, r * 1.05, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.9})`
            ctx.lineWidth = Math.max(r * 0.1, 0.5)
            ctx.stroke()
          }
        } else if (body.type === "asteroid-cluster") {
          const rocks = [
            { rRatio: 0, angOffset: 0, size: 0.6, phase: 0 },
            { rRatio: 1.1, angOffset: 0.3, size: 0.3, phase: 1.2 },
            { rRatio: 1.3, angOffset: 2.1, size: 0.25, phase: 2.4 },
            { rRatio: 0.9, angOffset: 4.2, size: 0.35, phase: 3.5 },
            { rRatio: 1.4, angOffset: 5.5, size: 0.2, phase: 4.1 },
            { rRatio: 1.6, angOffset: 1.1, size: 0.2, phase: 0.5 }
          ]

          for (const rock of rocks) {
            const rockAngle = time * 0.001 * (1.5 / Math.max(rock.rRatio, 1)) + rock.angOffset
            const rx = rock.rRatio === 0 ? 0 : Math.cos(rockAngle) * rock.rRatio * r
            const ry = rock.rRatio === 0 ? 0 : Math.sin(rockAngle) * rock.rRatio * r
            const rr = r * rock.size

            const sides = 6
            ctx.beginPath()
            for (let k = 0; k < sides; k++) {
              const angle = (k / sides) * Math.PI * 2
              const jitter = 0.7 + Math.sin(k * 11.3 + body.id + rock.phase) * 0.3
              const px = rx + Math.cos(angle) * rr * jitter
              const py = ry + Math.sin(angle) * rr * jitter
              if (k === 0) ctx.moveTo(px, py)
              else ctx.lineTo(px, py)
            }
            ctx.closePath()

            const aGrad = ctx.createRadialGradient(rx - rr * 0.2, ry - rr * 0.2, 0, rx, ry, rr)
            aGrad.addColorStop(0, isDark ? `rgba(180, 175, 165, ${alpha})` : `rgba(130, 125, 115, ${alpha})`)
            aGrad.addColorStop(1, isDark ? `rgba(90, 85, 80, ${alpha * 0.5})` : `rgba(70, 65, 60, ${alpha * 0.5})`)
            ctx.fillStyle = aGrad
            ctx.fill()
          }
        } else {
          const sides = 7
          ctx.beginPath()
          for (let k = 0; k < sides; k++) {
            const angle = (k / sides) * Math.PI * 2
            const jitter = 0.65 + Math.sin(k * 17.3 + body.id) * 0.35
            const px = Math.cos(angle) * r * jitter
            const py = Math.sin(angle) * r * jitter
            if (k === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()

          const aGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r)
          aGrad.addColorStop(0, isDark ? `rgba(190, 185, 175, ${alpha})` : `rgba(140, 135, 125, ${alpha})`)
          aGrad.addColorStop(1, isDark ? `rgba(100, 95, 90, ${alpha * 0.5})` : `rgba(80, 75, 70, ${alpha * 0.5})`)
          ctx.fillStyle = aGrad
          ctx.fill()
        }

        ctx.restore()
      }

      // Black Hole Swallow Animations
      swallowingRef.current = swallowingRef.current.filter((effect) => {
        effect.progress += dt / SWALLOW_DURATION

        const bh = bodies.find((b) => b.id === effect.bhId)
        if (!bh) return false

        if (effect.progress >= 1) {
          bh.swallowPulse = Math.max(bh.swallowPulse ?? 0, 0.7)
          return false
        }

        const t = effect.progress
        const depthFactor = 1 - effect.z / MAX_DEPTH
        const bhSx = (bh.x / bh.z) * (w / 4) + cx
        const bhSy = (bh.y / bh.z) * (h / 4) + cy

        const spiralTurns = 2.5
        const currentAngle = effect.angle + t * spiralTurns * Math.PI * 2
        const currentDist = effect.startDist * Math.pow(1 - t, 2.5)

        const worldX = bh.x + Math.cos(currentAngle) * currentDist
        const worldY = bh.y + Math.sin(currentAngle) * currentDist

        const sx = (worldX / effect.z) * (w / 4) + cx
        const sy = (worldY / effect.z) * (h / 4) + cy

        const shrink = Math.max(0.02, 1 - t * t)
        const stretch = 1 + t * 4
        const preyR = effect.startWorldRadius * depthFactor * shrink
        const preyAlpha = depthFactor * 0.85 * (1 - t * 0.6)

        effect.trail.push({ x: sx, y: sy, alpha: (1 - t) * 0.8 })
        if (effect.trail.length > 28) effect.trail.shift()

        // Accretion stream trail spiraling into the black hole
        if (effect.trail.length > 1) {
          for (let i = 1; i < effect.trail.length; i++) {
            const prev = effect.trail[i - 1]
            const curr = effect.trail[i]
            const trailAlpha = curr.alpha * preyAlpha
            const streamGrad = ctx.createLinearGradient(prev.x, prev.y, bhSx, bhSy)
            streamGrad.addColorStop(0, `rgba(${effect.preyColor}, ${trailAlpha * 0.15})`)
            streamGrad.addColorStop(1, `rgba(${effect.preyColor}, ${trailAlpha * 0.7})`)
            ctx.beginPath()
            ctx.moveTo(prev.x, prev.y)
            ctx.lineTo(curr.x, curr.y)
            ctx.strokeStyle = streamGrad
            ctx.lineWidth = Math.max(preyR * 0.35 * (i / effect.trail.length), 0.4)
            ctx.lineCap = "round"
            ctx.stroke()
          }
        }

        // Spaghettification, stretch prey toward the event horizon
        const radialAngle = Math.atan2(bhSy - sy, bhSx - sx)
        ctx.save()
        ctx.translate(sx, sy)
        ctx.rotate(radialAngle)
        ctx.scale(shrink, stretch)
        drawSwallowingPrey(
          ctx,
          effect.preyType,
          effect.preySubtype,
          effect.preyColor,
          effect.preyRingColor,
          effect.preyHasRing,
          preyR / Math.max(shrink, 0.1),
          preyAlpha,
          isDark,
          time,
          tier
        )
        ctx.restore()

        // Bright ingestion flash as prey crosses the horizon
        if (t > 0.7) {
          const flashT = (t - 0.7) / 0.3
          const bhR = bh.radius * depthFactor
          const flashGrad = ctx.createRadialGradient(bhSx, bhSy, bhR * 0.3, bhSx, bhSy, bhR * 2.5)
          flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashT * 0.5})`)
          flashGrad.addColorStop(0.3, `rgba(${effect.preyColor}, ${flashT * 0.4})`)
          flashGrad.addColorStop(1, "rgba(0,0,0,0)")
          ctx.beginPath()
          ctx.arc(bhSx, bhSy, bhR * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = flashGrad
          ctx.fill()
        }

        return true
      })

      // Collision Debris Particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx * dt
        particle.y += particle.vy * dt
        particle.vx *= 0.97 // slow down
        particle.vy *= 0.97
        particle.life += dt

        if (particle.life >= particle.maxLife) return false

        const lifeRatio = particle.life / particle.maxLife
        const a = (1 - lifeRatio) * (isDark ? 0.9 : 0.5)
        const currentSize = particle.size * (1 - lifeRatio * 0.5)

        // Glowing debris particle
        const grad = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, currentSize * 3
        )
        grad.addColorStop(0, `rgba(255, 255, 255, ${a})`)
        grad.addColorStop(0.3, `rgba(${particle.color}, ${a * 0.8})`)
        grad.addColorStop(1, `rgba(${particle.color}, 0)`)
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, currentSize * 3, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Bright core
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, currentSize * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${a})`
        ctx.fill()

        return true
      })

      // Comets & Shooting Stars
      const maxComets = getMaxComets(w, h)
      if (time - lastCometTimeRef.current > (Math.random() * 12000 + 8000)) {
        if (cometsRef.current.length < maxComets) {
          cometsRef.current.push(spawnComet(w, h))
          lastCometTimeRef.current = time
        }
      }

      cometsRef.current = cometsRef.current.filter(comet => {
        comet.x += comet.vx * dt
        comet.y += comet.vy * dt
        comet.life += dt

        if (comet.life >= comet.maxLife) return false
        if (comet.x < -200 || comet.x > w + 200 || comet.y < -200 || comet.y > h + 200) return false

        const lifeRatio = comet.life / comet.maxLife
        const fadeIn = Math.min(lifeRatio * 5, 1)
        const fadeOut = Math.max(1 - (lifeRatio - 0.7) / 0.3, 0)
        const a = comet.brightness * fadeIn * (lifeRatio > 0.7 ? fadeOut : 1)

        if (!isDark) return true

        const tailX = comet.x - comet.vx * comet.tailLength * 0.3
        const tailY = comet.y - comet.vy * comet.tailLength * 0.3

        const tailGrad = ctx.createLinearGradient(comet.x, comet.y, tailX, tailY)
        tailGrad.addColorStop(0, `rgba(${comet.color}, ${a * 0.8})`)
        tailGrad.addColorStop(1, `rgba(${comet.color}, 0)`)
        ctx.beginPath()
        ctx.moveTo(comet.x, comet.y)
        ctx.lineTo(tailX, tailY)
        ctx.strokeStyle = tailGrad
        ctx.lineWidth = comet.size * 1.2
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(comet.x, comet.y, comet.size * 0.6, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${a})`
        ctx.fill()

        return true
      })

      const maxShootingStars = getMaxShootingStars(w, h)
      if (time - lastShootingStarTimeRef.current > (Math.random() * 4000 + 3000)) {
        if (shootingStarsRef.current.length < maxShootingStars) {
          shootingStarsRef.current.push(spawnShootingStar(w, h))
          lastShootingStarTimeRef.current = time
        }
      }

      shootingStarsRef.current = shootingStarsRef.current.filter(ss => {
        ss.x += ss.vx * dt
        ss.y += ss.vy * dt
        ss.life += dt

        if (ss.life >= ss.maxLife) return false

        const lifeRatio = ss.life / ss.maxLife
        const a = (1 - lifeRatio) * (isDark ? 0.9 : 0.3)
        const trailLen = 25

        const tx = ss.x - (ss.vx / Math.hypot(ss.vx, ss.vy)) * trailLen * (1 - lifeRatio)
        const ty = ss.y - (ss.vy / Math.hypot(ss.vx, ss.vy)) * trailLen * (1 - lifeRatio)

        const ssGrad = ctx.createLinearGradient(ss.x, ss.y, tx, ty)
        ssGrad.addColorStop(0, `rgba(255, 255, 255, ${a})`)
        ssGrad.addColorStop(1, `rgba(255, 255, 255, 0)`)
        ctx.beginPath()
        ctx.moveTo(ss.x, ss.y)
        ctx.lineTo(tx, ty)
        ctx.strokeStyle = ssGrad
        ctx.lineWidth = ss.size
        ctx.stroke()

        return true
      })

      // Keep tooltip synced with moving targets
      const activeTooltip = activeTooltipRef.current
      if (activeTooltip !== null) {
        if (activeTooltip.kind === "body") {
          const infoBody = bodies.find(b => b.id === activeTooltip.trackId)
          if (!infoBody) {
            activeTooltipRef.current = null
            setTooltipInfo(null)
          } else if (!infoBody.isDragging) {
            const bx = (infoBody.x / infoBody.z) * (w / 4) + cx
            const by = (infoBody.y / infoBody.z) * (h / 4) + cy
            const projSize = infoBody.radius * (1 - infoBody.z / MAX_DEPTH)
            setTooltipInfo(prev => {
              if (!prev || prev.kind !== "body" || prev.trackId !== infoBody.id) return prev
              if (
                Math.abs(prev.screenX - bx) < 0.5 &&
                Math.abs(prev.screenY - by) < 0.5 &&
                prev.body?.mass === infoBody.mass &&
                prev.body?.radius === infoBody.radius
              ) return prev
              return buildBodyTooltip(infoBody, bx, by, projSize, false)
            })
          }
        } else if (activeTooltip.kind === "comet") {
          const comet = cometsRef.current.find(c => c.id === activeTooltip.trackId)
          if (!comet) {
            activeTooltipRef.current = null
            setTooltipInfo(null)
          } else {
            setTooltipInfo(prev => {
              if (!prev || prev.kind !== "comet" || prev.trackId !== comet.id) return prev
              if (Math.abs(prev.screenX - comet.x) < 0.5 && Math.abs(prev.screenY - comet.y) < 0.5) return prev
              return buildCometTooltip(comet)
            })
          }
        } else if (activeTooltip.kind === "shooting-star") {
          const star = shootingStarsRef.current.find(s => s.id === activeTooltip.trackId)
          if (!star) {
            activeTooltipRef.current = null
            setTooltipInfo(null)
          } else {
            setTooltipInfo(prev => {
              if (!prev || prev.kind !== "shooting-star" || prev.trackId !== star.id) return prev
              if (Math.abs(prev.screenX - star.x) < 0.5 && Math.abs(prev.screenY - star.y) < 0.5) return prev
              return buildShootingStarTooltip(star)
            })
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      mountedRef.current = false
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [initObjects, adjustStarCount, spawnComet, spawnShootingStar, playCollisionSound, playSwallowSound])

  const tooltipStyle = tooltipInfo
    ? {
      left: Math.min(Math.max(tooltipInfo.screenX, 120), window.innerWidth - 120),
      top: Math.max(tooltipInfo.screenY - tooltipInfo.anchorSize - 16, 12),
    }
    : undefined

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 touch-none"
        aria-hidden="true"
      />

      {tooltipInfo && tooltipStyle && (
        <div
          className="fixed z-20 pointer-events-none -translate-x-1/2 -translate-y-full"
          style={tooltipStyle}
        >
          <div className="bg-black/70 backdrop-blur-md border border-white/15 rounded-xl px-3 py-2.5 shadow-lg min-w-[160px] max-w-[220px]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base leading-none">{tooltipInfo.icon}</span>
              <span className="text-sm font-semibold text-white">{tooltipInfo.label}</span>
              {tooltipInfo.isDragging && (
                <span className="text-[10px] font-medium text-white/50 ml-auto">dragging</span>
              )}
              {!tooltipInfo.canDrag && (
                <span className="text-[10px] font-medium text-white/40 ml-auto">view only</span>
              )}
            </div>
            <p className="text-[11px] text-white/60 leading-snug mb-2">{tooltipInfo.trait}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-white/45 font-mono">
              {tooltipInfo.stats.map((stat) => (
                <span key={stat.label}>
                  {stat.label} {stat.value}
                </span>
              ))}
            </div>
          </div>
          <div className="mx-auto w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-black/70" />
        </div>
      )}
    </>
  )
}
