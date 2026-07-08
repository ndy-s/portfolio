"use client"

import { useEffect, useRef, useCallback } from "react"
import { useTheme } from "next-themes"

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface CelestialBody {
  id: number
  x: number
  y: number
  z: number
  vx: number
  vy: number
  radius: number
  mass: number
  type: "planet" | "asteroid" | "blackhole" | "sun"
  color: string
  rotation: number
  rotationSpeed: number
  ringColor?: string
  hasRing: boolean
  isDragging: boolean
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

interface Comet {
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

// ─── Constants ───────────────────────────────────────────────────────────────

const STAR_COUNT = 450
const BODY_COUNT = 15
const NEBULA_COUNT = 4

const STAR_COLORS = [
  { r: 155, g: 176, b: 255 },
  { r: 170, g: 191, b: 255 },
  { r: 202, g: 215, b: 255 },
  { r: 248, g: 247, b: 255 },
  { r: 255, g: 244, b: 234 },
  { r: 255, g: 210, b: 161 },
  { r: 255, g: 204, b: 111 },
]

const PLANET_COLORS = [
  { base: "100, 149, 237", ring: "160, 190, 255" },
  { base: "210, 160, 100", ring: "230, 200, 150" },
  { base: "147, 112, 219", ring: "180, 150, 240" },
  { base: "60, 179, 113", ring: "" },
  { base: "200, 100, 80", ring: "" },
  { base: "180, 180, 200", ring: "" },
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

const MAX_DEPTH = 1000
const BASE_SPEED = 0.3
const WARP_MULTIPLIER = 1.0

// Helper to generate a new celestial body
function generateBody(width: number, height: number): CelestialBody {
  const typeRoll = Math.random()
  let type: "planet" | "asteroid" | "blackhole" | "sun"
  let radius: number
  let hasRing = false
  let color = "255, 255, 255"
  let ringColor = ""

  if (typeRoll < 0.05) {
    type = "blackhole"
    radius = Math.random() * 15 + 15
    color = "0, 0, 0"
    ringColor = ["255, 150, 50", "150, 200, 255", "255, 100, 255"][Math.floor(Math.random() * 3)]
    hasRing = true
  } else if (typeRoll < 0.15) {
    type = "sun"
    radius = Math.random() * 20 + 25
    const sunColors = ["255, 200, 100", "255, 230, 200", "150, 200, 255", "255, 100, 50"]
    color = sunColors[Math.floor(Math.random() * sunColors.length)]
  } else if (typeRoll < 0.60) {
    type = "planet"
    radius = Math.random() * 10 + 15
    const palette = PLANET_COLORS[Math.floor(Math.random() * PLANET_COLORS.length)]
    color = palette.base
    ringColor = palette.ring
    hasRing = palette.ring !== "" && Math.random() > 0.5
  } else {
    type = "asteroid"
    radius = Math.random() * 5 + 5
    color = "169, 169, 169"
  }

  return {
    id: 0,
    x: (Math.random() - 0.5) * width * 3,
    y: (Math.random() - 0.5) * height * 3,
    z: Math.random() * MAX_DEPTH,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    radius,
    mass: Math.PI * radius * radius,
    type,
    color,
    ringColor,
    hasRing,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    isDragging: false,
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const starsRef = useRef<Star[]>([])
  const bodiesRef = useRef<CelestialBody[]>([])
  const cometsRef = useRef<Comet[]>([])
  const shootingStarsRef = useRef<ShootingStar[]>([])
  const nebulaeRef = useRef<NebulaCloud[]>([])
  const particlesRef = useRef<CollisionParticle[]>([])

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
          try { osc.stop() } catch { /* already stopped */ }
        }, 200)
        dragOscRef.current = null
        dragGainRef.current = null
      }
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

  const initObjects = useCallback((width: number, height: number) => {
    // 1. Stars
    const stars: Star[] = []
    for (let i = 0; i < STAR_COUNT; i++) {
      const colorRoll = Math.random()
      let colorIndex = 0
      if (colorRoll < 0.05) colorIndex = 0
      else if (colorRoll < 0.12) colorIndex = 1
      else if (colorRoll < 0.22) colorIndex = 2
      else if (colorRoll < 0.37) colorIndex = 3
      else if (colorRoll < 0.57) colorIndex = 4
      else if (colorRoll < 0.80) colorIndex = 5
      else colorIndex = 6

      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * MAX_DEPTH,
        prevZ: MAX_DEPTH,
        size: Math.random() * 1.5 + (colorRoll > 0.8 ? 0.2 : 0.5),
        brightness: Math.random() > 0.4 ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3 + 0.1,
        twinkleSpeed: Math.random() * 2 + 1,
        twinkleOffset: Math.random() * Math.PI * 2,
        colorIndex,
      })
    }
    starsRef.current = stars

    // 2. Interactive Celestial Bodies
    const bodies: CelestialBody[] = []
    for (let i = 0; i < BODY_COUNT; i++) {
      const b = generateBody(width, height)
      b.id = i
      bodies.push(b)
    }
    bodiesRef.current = bodies

    // 3. Nebula clouds
    const nebulae: NebulaCloud[] = []
    for (let i = 0; i < NEBULA_COUNT; i++) {
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
  }, [])

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
      x: Math.random() * w,
      y: Math.random() * h * 0.6,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: Math.random() * 15 + 10,
      size: Math.random() * 1.5 + 0.8,
    }
  }, [])

  // ─── Interaction Handlers ────────────────────────────────────────────────────

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

    const onPointerDown = (e: PointerEvent) => {
      if (e.target !== canvas) return

      const { x, y } = getPointerPos(e)
      const bodies = bodiesRef.current

      for (let i = bodies.length - 1; i >= 0; i--) {
        const body = bodies[i]
        const { bx, by, projSize } = getScreenBody(body)
        const hitRadius = Math.max(projSize, 15)
        const dist = Math.hypot(bx - x, by - y)

        if (dist <= hitRadius) {
          body.isDragging = true
          body.vx = 0
          body.vy = 0

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
      if (state.activeBodyId === null) {
        const { x, y } = getPointerPos(e)
        const isHovering = bodiesRef.current.some(b => {
          const { bx, by, projSize } = getScreenBody(b)
          return Math.hypot(bx - x, by - y) <= Math.max(projSize, 15)
        })
        canvas.style.cursor = isHovering ? "grab" : "default"
        return
      }

      const { x, y } = getPointerPos(e)
      const body = bodiesRef.current.find(b => b.id === state.activeBodyId)

      if (body) {
        const { w, h, cx, cy } = getScreenBody(body)

        const targetScreenX = x + state.offsetX
        const targetScreenY = y + state.offsetY

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
        const isHovering = bodiesRef.current.some(b => {
          const { bx, by, projSize } = getScreenBody(b)
          return Math.hypot(bx - x, by - y) <= Math.max(projSize, 15)
        })
        canvas.style.cursor = isHovering ? "grab" : "default"
      }
    }

    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointermove", onPointerMove)
    canvas.addEventListener("pointerup", onPointerUp)
    canvas.addEventListener("pointercancel", onPointerUp)

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerup", onPointerUp)
      canvas.removeEventListener("pointercancel", onPointerUp)
    }
  }, [startDragSound, stopDragSound, updateDragSound])

  // ─── Rendering & Physics Loop ────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    mountedRef.current = true
    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (starsRef.current.length === 0) {
        initObjects(window.innerWidth, window.innerHeight)
      }
    }

    resize()
    window.addEventListener("resize", resize)

    let lastTime = performance.now()

    const animate = (time: number) => {
      if (!mountedRef.current) return

      const dt = Math.min((time - lastTime) / 16.67, 3)
      lastTime = time

      const w = window.innerWidth
      const h = window.innerHeight
      const isDark = themeRef.current === "dark"

      ctx.fillStyle = isDark ? "#000000" : "#ffffff"
      ctx.fillRect(0, 0, w, h)

      // ── Nebula clouds ──
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

      // ── Stars ──
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

        if (warpFactor > 0.05) {
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

        if (depthFactor > 0.7 && isDark) {
          ctx.beginPath()
          ctx.arc(sx, sy, size * 2.5, 0, Math.PI * 2)
          const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 2.5)
          grad.addColorStop(0, `rgba(${sc.r}, ${sc.g}, ${sc.b}, ${alpha * 0.25})`)
          grad.addColorStop(1, `rgba(${sc.r}, ${sc.g}, ${sc.b}, 0)`)
          ctx.fillStyle = grad
          ctx.fill()
        }
      }

      // ── Celestial Bodies (Physics) ──
      const bodies = bodiesRef.current
      const toRemove: number[] = [] // indices to remove after collision

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

          // Apply gravity
          if (dist > minDist * 0.7 && dist < w * 1.5) { // apply gravity if within influence range
            const force = GRAVITY_CONSTANT / Math.max(dist * dist, 10)
            if (!body.isDragging) {
              body.vx += (dx / dist) * force * other.mass * dt
              body.vy += (dy / dist) * force * other.mass * dt
            }
            if (!other.isDragging) {
              other.vx -= (dx / dist) * force * body.mass * dt
              other.vy -= (dy / dist) * force * body.mass * dt
            }
          }

          if (dist < minDist * 0.7) {
            // Collision! Bigger absorbs smaller
            const bigger = body.mass >= other.mass ? body : other
            const smaller = body.mass >= other.mass ? other : body
            const smallerIdx = body.mass >= other.mass ? j : i

            // Skip if dragging the smaller one (don't destroy what user is holding)
            if (smaller.isDragging) continue

            // Play collision sound based on combined mass
            playCollisionSound(Math.min((bigger.mass + smaller.mass) / 3000, 1.0))

            // Spawn debris particles at collision point
            const collisionX = (body.x + other.x) / 2
            const collisionY = (body.y + other.y) / 2
            const collisionZ = (body.z + other.z) / 2
            const debrisCount = Math.floor(Math.random() * 8 + 6)

            for (let p = 0; p < debrisCount; p++) {
              const angle = (p / debrisCount) * Math.PI * 2 + Math.random() * 0.5
              const spd = Math.random() * 3 + 1.5
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
      }

      // Remove absorbed bodies (reverse order to keep indices valid)
      if (toRemove.length > 0) {
        const sorted = [...new Set(toRemove)].sort((a, b) => b - a)
        for (const idx of sorted) {
          bodies.splice(idx, 1)
        }
        // Replenish: spawn new bodies in the distance to keep the field populated
        while (bodies.length < BODY_COUNT) {
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
          const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, r * 0.1, r * 0.1, r)
          grad.addColorStop(0, `rgba(${body.color}, ${Math.min(alpha * 1.5, 1)})`)
          grad.addColorStop(0.7, `rgba(${body.color}, ${alpha})`)
          grad.addColorStop(1, `rgba(${body.color}, ${alpha * 0.4})`)
          ctx.beginPath()
          ctx.arc(0, 0, r, 0, Math.PI * 2)
          ctx.fillStyle = grad
          ctx.fill()

          if (body.hasRing && body.ringColor && r > 3) {
            ctx.beginPath()
            ctx.ellipse(0, 0, r * 1.8, r * 0.4, 0.3, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(${body.ringColor}, ${alpha * 0.7})`
            ctx.lineWidth = Math.max(r * 0.15, 0.5)
            ctx.stroke()
          }

          if (isDark && depthFactor > 0.3) {
            const glowGrad = ctx.createRadialGradient(0, 0, r, 0, 0, r * 2.5)
            glowGrad.addColorStop(0, `rgba(${body.color}, ${alpha * 0.2})`)
            glowGrad.addColorStop(1, "rgba(0,0,0,0)")
            ctx.beginPath()
            ctx.arc(0, 0, r * 2.5, 0, Math.PI * 2)
            ctx.fillStyle = glowGrad
            ctx.fill()
          }
        } else if (body.type === "sun") {
          ctx.beginPath()
          ctx.arc(0, 0, r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(alpha * 1.5, 1)})`
          ctx.fill()

          if (isDark) {
            const glowGrad = ctx.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 3.5)
            glowGrad.addColorStop(0, `rgba(${body.color}, ${Math.min(alpha * 1.2, 1)})`)
            glowGrad.addColorStop(0.3, `rgba(${body.color}, ${alpha * 0.5})`)
            glowGrad.addColorStop(1, "rgba(0,0,0,0)")
            ctx.beginPath()
            ctx.arc(0, 0, r * 3.5, 0, Math.PI * 2)
            ctx.fillStyle = glowGrad
            ctx.fill()
          }
        } else if (body.type === "blackhole") {
          if (isDark && body.ringColor) {
            const diskGrad = ctx.createRadialGradient(0, 0, r, 0, 0, r * 2.5)
            diskGrad.addColorStop(0, `rgba(${body.ringColor}, ${alpha})`)
            diskGrad.addColorStop(0.5, `rgba(${body.ringColor}, ${alpha * 0.4})`)
            diskGrad.addColorStop(1, "rgba(0,0,0,0)")

            ctx.save()
            ctx.scale(1, 0.25)
            ctx.beginPath()
            ctx.arc(0, 0, r * 3, 0, Math.PI * 2)
            ctx.fillStyle = diskGrad
            ctx.fill()

            ctx.beginPath()
            ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`
            ctx.lineWidth = Math.max(r * 0.15, 0.5)
            ctx.stroke()
            ctx.restore()
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

      // ── Collision Debris Particles ──
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

      // ── Comets & Shooting Stars ──
      if (time - lastCometTimeRef.current > (Math.random() * 12000 + 8000)) {
        if (cometsRef.current.length < 2) {
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

      if (time - lastShootingStarTimeRef.current > (Math.random() * 4000 + 3000)) {
        if (shootingStarsRef.current.length < 3) {
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

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      mountedRef.current = false
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [initObjects, spawnComet, spawnShootingStar, playCollisionSound])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 touch-none"
      aria-hidden="true"
    />
  )
}
