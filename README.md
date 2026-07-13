# Portfolio

A personal portfolio website featuring an interactive, physics-based cosmic background simulation. Built with Next.js 16, TypeScript, and Framer Motion. The site includes a real-time gravitational N-body simulation, a multi-directional 3D star field, procedural nebulae, comets, and draggable celestial bodies, all running smoothly on an HTML5 Canvas.

## Featured Projects

### Portfolio Website (Interactive N-Body Simulation)
This portfolio is more than a static page; the background is a live physics sandbox running an N-body gravitational simulation on HTML5 Canvas. Every celestial body has mass and velocity, interacting through Newtonian gravity in real-time. You can grab planets, fling them into black holes, and watch collisions scatter debris with synthesized audio feedback. The rendering pipeline adapts to your device hardware, automatically scaling visual fidelity and physics complexity across three performance tiers to ensure smooth framerates on any device.

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

## StarField: Simplified Overview

The core feature of this portfolio is `src/components/StarField.tsx`, an interactive physics simulation rendered entirely on an HTML5 Canvas. Here is a simplified breakdown of how it works.

### The Six Layers

The simulation renders six different visual elements every frame:
1. **Nebula clouds**: Slow-drifting, colorful background blobs (visible in dark mode).
2. **Star field**: Hundreds of stars with perspective depth, lateral drift, and directional respawn from all sides of the view.
3. **Celestial bodies**: Interactive planets, suns, asteroids, and black holes that spawn from multiple directions and pull on each other with gravity.
4. **Collision debris**: Small particles that scatter when two bodies collide.
5. **Comets**: Large glowing objects that occasionally streak across the screen with a tail.
6. **Shooting stars**: Fast, short-lived streaks of light.

### Adaptive Performance

To make sure the animation runs smoothly on everything from smartphones to high-end desktops, the simulation automatically checks your device's capabilities. 
- **High Tier**: Full detail with maximum stars, complex lighting, and many celestial bodies.
- **Medium Tier**: Reduced star count and simplified lighting for balanced performance.
- **Low Tier**: Basic colors and fewer bodies to keep older devices or mobile phones running smoothly.

If the simulation detects that your device is struggling to maintain a good frame rate, it will automatically downgrade the visual quality to keep the experience smooth.

### How Space Moves (Coordinate System)

The simulation uses a 3D coordinate system (x, y, z) but displays it on a 2D screen. The camera sits at `z = 0` looking into positive z. World positions are projected to the canvas with a perspective formula centered on the screen, so distant objects appear smaller and cluster toward the middle.

Depth motion is the main driver of the warp effect: as an object's z value decreases, it moves toward the camera and appears larger. Stars and bodies also drift laterally in x and y, so motion is not limited to a single vanishing point.

When stars pass the camera or recede too far, they respawn using the directional spawn system described below.

### Directional Spawning

Real space is three-dimensional. Even when you travel forward, objects can appear from the sides, sweep across your field of view, or fall behind you as you overtake them. The simulation models this with a directional spawn system.

At any depth, the code computes the visible frustum (the world-space bounds that map to the screen edges). New and respawned objects are placed using one of ten spawn directions:

| Direction | Share | Behavior |
|-----------|-------|----------|
| Ahead | 30% | Spawned inside the view cone, approaching the camera |
| Left / Right / Top / Bottom | 36% | Spawned just outside the frustum with velocity crossing the screen |
| Corners | 14% | Diagonal entry from off-screen corners |
| Behind | 6% | Spawned near the camera with negative z speed, simulating objects you overtake and watch recede |

Each spawn assigns world position (x, y, z), lateral velocity (vx, vy), and a z speed factor. A factor of `1` means the object approaches normally. A negative factor makes it recede into the distance.

Background stars use the same system with gentler lateral motion. Star streak trails track previous x, y, and z positions so warp lines follow the actual path of each star, not just radial lines from the center.

Celestial bodies use stronger lateral speeds so planets and asteroids can visibly drift in from the edges. Respawn logic differs by direction: approaching bodies reset at max depth when they pass the camera; receding bodies reset when they drift back to max depth or leave the screen.

### Celestial Bodies and Gravity

The simulation calculates the gravitational pull between every single celestial body on the screen. 
- Larger objects (like suns or black holes) have more mass and pull smaller objects toward them.
- If two bodies get too close, they collide! The larger body absorbs the smaller one, growing in size and changing its path based on the momentum of the crash.
- When a collision happens, debris particles scatter in all directions.

### Interaction

You can click (or tap) and drag any planet, sun, or asteroid. When you release it, the simulation calculates the speed and direction of your drag and "throws" the body across the screen, letting you play with the gravitational sandbox.

### Sound Effects (Web Audio)

There are no sound files in this project. All audio, like the hum of dragging a planet or the deep boom of a collision, is generated purely with math in real-time using the browser's Web Audio API.

## Theming

The site supports both light and dark modes using CSS variables, but it defaults to dark mode to showcase the space simulation in its best environment.

## License

MIT (c) Hendy Saputra
