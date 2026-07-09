# Portfolio

A personal portfolio website with an interactive physics-based cosmic background simulation. Built with Next.js 16, TypeScript, and Framer Motion. Features real-time gravitational N-body simulation, 3D star field rendering, procedural nebulae, comets, and draggable celestial bodies, all running on an HTML5 Canvas.

---

## Tech Stack

| Layer       | Technology                                      |
| -------------| -------------------------------------------------|
| Framework   | [Next.js 16](https://nextjs.org/) (App Router)  |
| Language    | TypeScript                                      |
| Styling     | Tailwind CSS (utility classes) + CSS Variables  |
| Animations  | [Framer Motion](https://www.framer.com/motion/) |
| Physics Sim | Custom, HTML5 Canvas + `requestAnimationFrame`  |
| Icons       | `react-icons` (Simple Icons, Font Awesome)      |
| Theming     | `next-themes`                                   |
| Font        | Inter (Google Fonts via `next/font`)            |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout: theme provider, starfield, ambient audio
│   ├── page.tsx            # Page composition (renders all sections in order)
│   └── globals.css         # CSS variables, dark/light tokens, nebula overlays
│
├── components/
│   ├── StarField.tsx       # The entire physics + rendering simulation
│   ├── Header.tsx          # Name, typing subtitle, "Hire Me" CTA
│   ├── About.tsx           # Bio text
│   ├── Services.tsx        # Freelance service cards
│   ├── WorkExperience.tsx  # Timeline with Grogu character + speech bubble
│   ├── Projects.tsx        # Project cards with modal detail view
│   ├── ProjectModal.tsx    # Fullscreen project detail overlay
│   ├── Technologies.tsx    # Tech icon grid
│   ├── Connect.tsx         # Contact CTA section
│   ├── Footer.tsx          # Footer with theme switcher
│   ├── AnimatedSection.tsx # Reusable scroll-triggered fade-in wrapper
│   ├── BackgroundAudio.tsx # Ambient music player with Web Audio API
│   ├── CosmicHelp.tsx      # Floating help button explaining the simulation
│   ├── ThemeProvider.tsx   # next-themes provider wrapper
│   └── ThemeSwitcher.tsx   # Sun/moon toggle button
│
└── data/
    └── data.ts             # Single source of truth for all content + typed data
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- [pnpm](https://pnpm.io/) (preferred) or npm

### Install and Run

```bash
# Clone the repository
git clone https://github.com/ndy-s/portfolio.git
cd portfolio

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The site will be available at `http://localhost:3000`.

### Build for Production

```bash
pnpm build
pnpm start
```

### Linting

```bash
pnpm lint
```

---

## StarField — Deep Dive

The heart of this portfolio is `src/components/StarField.tsx`, a 1,100+ line TypeScript component rendering a real-time, interactive physics simulation entirely on an HTML5 Canvas.

### Overview

The simulation renders six distinct layers every animation frame:

1. **Nebula clouds** — slow-drifting radial gradient blobs
2. **Star field** — 450 stars using perspective (Z-depth) projection
3. **Celestial bodies** — 15 interactive bodies with mutual gravity
4. **Collision debris particles** — spawned on body absorption events
5. **Comets** — occasional large objects crossing the screen with tails
6. **Shooting stars** — fast, short-lived streaks

---

### Adaptive Performance

To ensure a smooth framerate across a wide range of devices, the simulation uses a dynamic tiering system (`high`, `medium`, `low`) that dictates rendering quality and physics calculations.

**1. Device Detection on Mount:**
The simulation infers device capabilities using:
- `navigator.hardwareConcurrency` (CPU cores)
- `navigator.deviceMemory` (RAM)
- `window.devicePixelRatio` (DPR)
- Screen Area (`innerWidth * innerHeight`)
- `navigator.userAgent` (Mobile vs Desktop)

**2. Tier Configurations:**
- **High:** Renders up to 450 stars, 15 bodies, full DPR, rich multi-stop gradients, and complex glows.
- **Medium:** Capped at 200 stars, 8 bodies, max DPR of 1.5. Disables non-essential planet gradients and inner shadows.
- **Low:** Capped at 80 stars, 4 bodies, max DPR of 1.0. Uses flat colours instead of canvas gradients. Disables star warp streaks and drops $O(N^2)$ asteroid-asteroid gravity checks to alleviate CPU pressure.

**3. Runtime FPS Guardian:**
The application tracks the average frame render time during the first 60 frames. If the average FPS drops below 40 (`>25ms` per frame), it automatically downgrades the tier (e.g., `high` → `medium`) on the fly to rescue performance.

---

### Coordinate System

The simulation uses a **3D world-space** coordinate system projected into 2D screen space.

- **World space:** `(x, y, z)` where `z` is depth. `z = MAX_DEPTH (1000)` is the far plane; `z ≈ 0` is the camera.
- **Screen space:** `(sx, sy)` are the 2D pixel coordinates on the canvas.

**Perspective Projection Formula:**

```
sx = (worldX / worldZ) * (screenWidth  / 4) + screenCenterX
sy = (worldY / worldZ) * (screenHeight / 4) + screenCenterY
```

The divisor `4` acts as a field-of-view scalar. A smaller value narrows the FOV (more zoom); a larger value widens it. This is equivalent to a pinhole camera model.

**Depth Factor** (used for size and alpha scaling):
```
depthFactor = 1 - (z / MAX_DEPTH)
```
When `z = MAX_DEPTH`, `depthFactor = 0` (invisible, far away). When `z ≈ 0`, `depthFactor = 1` (fully visible, close). Objects naturally fade in as they approach.

---

### Delta Time Normalization

All physics values are multiplied by `dt` to be frame-rate independent:
```
dt = min((currentTime - lastFrameTime) / 16.67, 3)
```
`16.67ms` is the duration of one frame at 60fps. At 60fps `dt ≈ 1.0`, at 30fps `dt ≈ 2.0`. The cap of `3` prevents runaway physics if the tab is backgrounded.

---

### Layer 1: Star Field

Each star has a 3D position `(x, y, z)` and a `prevZ` from the previous frame.

**Motion per frame:**
```
star.z -= speed * dt
// speed = BASE_SPEED + WARP_MULTIPLIER * 3.0 = 3.3
```

**Warp Streak Effect:**

As `z` decreases each frame, the projected screen position moves outward from the center, producing the classic hyperspace effect. A line is drawn from the previous projected position to the current one:

```
previousScreenX = (star.x / star.prevZ) * (w / 4) + cx
currentScreenX  = (star.x / star.z)     * (w / 4) + cx

ctx.moveTo(previousScreenX, previousScreenY)
ctx.lineTo(currentScreenX,  currentScreenY)
```

Stars that reach `z <= 0` (past the camera) reset to `z = MAX_DEPTH` with a new random world position.

**Twinkle Effect:**
```
twinkle = sin(time * 0.001 * twinkleSpeed + twinkleOffset) * 0.3 + 0.7
alpha   = depthFactor * star.brightness * twinkle
```
Each star has an individual `twinkleSpeed` (1–3 Hz) and a random `twinkleOffset` phase, creating organic desynchronised twinkling.

**Star Color Distribution (Hertzsprung–Russell inspired):**

Stars are assigned colors matching real stellar spectral classes via a weighted random roll:

| Probability | Color (RGB) | Spectral Class |
|---|---|---|
| 0–5% | `(155, 176, 255)` | Blue (O/B class) |
| 5–12% | `(170, 191, 255)` | Blue-white (A class) |
| 12–22% | `(202, 215, 255)` | White (F class) |
| 22–37% | `(248, 247, 255)` | Yellow-white (G class, Sun-like) |
| 37–57% | `(255, 244, 234)` | Warm white |
| 57–80% | `(255, 210, 161)` | Orange (K class) |
| 80–100% | `(255, 204, 111)` | Red-orange (M class, most common) |

The bias toward orange/red matches reality: M-class red dwarfs are the most common star type in the universe.

**Bright Star Glow:**  
Stars with `depthFactor > 0.7` (close to the camera) receive an additional radial gradient halo at `2.5x their rendered size`, fading to transparent. This simulates lens diffraction for nearby bright stars.

---

### Layer 2: Celestial Bodies (N-Body Gravity)

15 celestial bodies coexist and exert mutual gravitational attraction using a **pairwise N-body simulation** (O(n²), acceptable for n=15).

**Body Types and Spawn Probabilities:**

| Type | Probability | Radius Range | Special |
|---|---|---|---|
| Black Hole | 5% | 15–30 px | Accretion disk ring |
| Sun / Star | 10% | 25–45 px | Coloured corona glow |
| Planet | 45% | 15–25 px | Optional ring system |
| Asteroid | 40% | 5–10 px | Irregular polygon shape |

**Mass:**
```
mass = π × radius²
```
Mass is proportional to circular area, so a planet twice the radius has 4x the mass.

---

#### Gravitational Force Calculation

For every unique pair `(i, j)`:

```typescript
const dx   = other.x - body.x       // world-space X displacement
const dy   = other.y - body.y       // world-space Y displacement
const dist = Math.hypot(dx, dy)     // Euclidean distance

// Only apply gravity between collision threshold and max influence radius
if (dist > minDist * 0.7 && dist < screenWidth * 1.5) {

  // Inverse-square law: F proportional to G / r²
  const force = GRAVITY_CONSTANT / Math.max(dist * dist, 10)
  //                                         ^ clamped to prevent division-by-zero

  // Acceleration = force × other_mass
  // (dx/dist, dy/dist) is the unit vector pointing toward the other body
  body.vx  += (dx / dist) * force * other.mass * dt
  body.vy  += (dy / dist) * force * other.mass * dt

  // Equal and opposite reaction (Newton's 3rd law)
  other.vx -= (dx / dist) * force * body.mass * dt
  other.vy -= (dy / dist) * force * body.mass * dt
}
```

Key constants:
- `GRAVITY_CONSTANT = 0.0008` — tuned so bodies exhibit visible orbital drift without flying apart instantly
- `dist²` is clamped to `max(dist², 10)` to prevent velocity explosions at near-zero distances
- Gravity is only applied within `1.5 × screenWidth` to bound computational influence

**Velocity Damping:**
```
body.vx *= FRICTION   // FRICTION = 0.995 per frame
body.vy *= FRICTION
```
At 60fps: `0.995^60 ≈ 0.74`, roughly 26% velocity loss per second. Velocity is clamped to `MAX_VELOCITY = 15`.

---

#### Collision Detection and Absorption

When `dist < (radius_a + radius_b) * 0.7`, a collision occurs. The larger body absorbs the smaller.

**Step 1 — Determine winner:**
```typescript
const bigger  = body.mass >= other.mass ? body  : other
const smaller = body.mass >= other.mass ? other : body
```

**Step 2 — Mass update (partial absorption):**
```
newMass = bigger.mass + smaller.mass × 0.3
```
Only 30% of the smaller body's mass is added, simulating energy lost to the event (heat, radiation, debris).

**Step 3 — Radius from new mass:**
```
bigger.radius = sqrt(newMass / π)
```
Derived from the inverse of `mass = π × r²`.

**Step 4 — Momentum conservation:**
```
bigger.vx = (bigger.vx × bigger.mass + smaller.vx × smaller.mass) / totalMass
bigger.vy = (bigger.vy × bigger.mass + smaller.vy × smaller.mass) / totalMass
```
This is the perfectly inelastic collision formula: the combined body moves at the mass-weighted average velocity of both.

**Step 5 — Debris particles:**
6–14 particles spawn at the screen-projected collision point. Each launches at an evenly distributed angle:
```
angle = (p / debrisCount) × 2π + random_jitter
speed = random(1.5, 4.5)
vx    = cos(angle) × speed
vy    = sin(angle) × speed
```
Particles slow via `vx *= 0.97` each frame and fade over 20–60 frames.

**Step 6 — Replenishment:**
A new body spawns immediately at `z = MAX_DEPTH` to keep the field at exactly 15 bodies.

---

#### Respawning

If a body drifts beyond `2x the screen width/height` or passes `z <= 10`, it is recycled in-place with a new random type, keeping its `id` to avoid corrupting drag state:
```typescript
Object.assign(body, generateBody(w, h))
body.id = oldId
body.z  = MAX_DEPTH
```

---

### Layer 3: Drag Interaction

Click and drag any celestial body. Hit detection uses the projected screen radius with a minimum touch target of 15px:
```
hitRadius = max(projSize, 15)
if (Math.hypot(bx - pointerX, by - pointerY) <= hitRadius) → drag starts
```

**Inverse Projection (screen to world):**

Forward projection:
```
sx = (worldX / worldZ) × (w/4) + cx
```
Solving for `worldX`:
```
worldX = (sx - cx) × worldZ / (w/4)
```
The body's `z` is preserved during drag, so it stays at the same depth while following the cursor.

**Throw Velocity:**
On pointer-up, velocity is averaged from the last 5 world-space displacement samples:
```
avgVelocityX = (sum of last 5 dx values) / 5 × 0.8
```
The `0.8` factor softens the throw.

---

### Layer 4: Nebula Clouds

4 large radial gradient blobs drift slowly across the screen (dark mode only).

**Drift:**
```
neb.x += cos(driftAngle) × drift × dt
neb.y += sin(driftAngle) × drift × dt
```
Speed (`drift`) is 0.05–0.2 px/frame. They wrap around screen edges seamlessly.

**Double-gradient layering:**
Each nebula draws two overlapping radial gradients at slightly offset centres, creating an organic, asymmetric cloud shape.

**Pulsing:**
```
pulse = sin(time × 0.001 × pulseSpeed + pulseOffset) × 0.3 + 0.7
alpha = neb.baseAlpha × pulse
```
Each nebula pulses at an independent frequency (0.1–0.4 Hz) with a random phase offset.

---

### Layer 5: Comets

Comets spawn from a random screen edge every 8–20 seconds (max 2 concurrent).

- **Speed:** 1.5–3.5 px/frame, directed inward from the spawn edge
- **Tail:** A `createLinearGradient` line drawn backward along the velocity vector: `tailEnd = head - velocity × tailLength × 0.3`
- **Fade:** Fade-in over the first 20% of lifetime, fade-out over the last 30%

---

### Layer 6: Shooting Stars

Spawn every 3–7 seconds (max 3 concurrent). Speed: 8–20 px/frame. Lifetime: 10–25 frames.

Trail length scales with remaining life:
```
trailLength = 25 × (1 - lifeRatio)
tx = ss.x - (vx / speed) × trailLength
ty = ss.y - (vy / speed) × trailLength
```
Drawn as a `createLinearGradient` from head (white, opaque) to tail (transparent).

---

### Web Audio — Synthesized Sound Effects

All interaction sounds are synthesized in real-time using the Web Audio API. No audio files are needed for these effects.

**Collision Sound (two-layer synthesis):**
1. **Sine oscillator** — sweeps `80 + intensity×40 Hz` down to `30 Hz` over 0.3–0.7s (low boom)
2. **White noise** — shaped with an exponential decay envelope `(1 - i/bufferSize)³` (crackling debris)

```
intensity = min((mass_a + mass_b) / 3000, 1.0)
```

**Drag Hum:**
A continuous 60 Hz sine tone that pitch-shifts with drag velocity:
```
frequency = 60 + velocity × 8 Hz
gain      = min(0.04 + velocity × 0.005, 0.1)
```
Fades in over `0.1s` on grab; fades out over `0.15s` on release.

All effects are gated by `interactionStartedRef`. Nothing plays until the user's first pointer or key event, preventing unexpected sounds on page load.

---

### Rendering Pipeline Per Frame

```
1.  fillRect()               clear canvas (alpha: false for performance)
2.  Nebulae (dark only)      drifting radial gradient blobs
3.  Stars                    perspective-projected, twinkle, warp streaks
4.  Celestial bodies
    a. Apply gravity (all pairs)
    b. Apply friction and clamp velocity
    c. Update position
    d. Collision detection and absorption
    e. Draw body (planet / sun / blackhole / asteroid)
5.  Debris particles         fade out over ~40 frames
6.  Comets                   edge-spawned with gradient tails
7.  Shooting stars           fast, short-lived streaks
8.  requestAnimationFrame    schedule next frame
```

**High-DPI support:**
```typescript
const dpr = window.devicePixelRatio || 1
canvas.width  = window.innerWidth  * dpr
canvas.height = window.innerHeight * dpr
ctx.setTransform(dpr, 0, 0, dpr, 0, 0)  // scale all draws up by DPR
```
This renders at native resolution on retina/4K displays while keeping the CSS size unchanged.

---

## Theming

CSS variables are defined in `globals.css` for both modes:

```css
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --muted: #6b7280;
  --card: #f9f9f9;
  --border: #e5e7eb;
}

.dark {
  --background: #000000;
  --foreground: #ededed;
  --muted: #9ca3af;
  --card: #111111;
  --border: #1f1f1f;
}
```

`next-themes` is configured with `defaultTheme="dark"` and `enableSystem={false}` so the site always opens in dark mode regardless of OS preference.

---

## License

MIT © Hendy Saputra
