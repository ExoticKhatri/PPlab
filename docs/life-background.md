# Living Background — Design Doc

An interactive full-screen background that simulates "life": cells that are born, grow, compete and die, and react to the visitor's cursor. It should feel organic and atmospheric, not like a 1970s grid demo.

Status: **proposed** · Owner: Prakash · Project: PPlab

---

## 1. Goals

- **Alive at a glance.** The page should visibly breathe within the first second, without any input.
- **Interactive.** The cursor (or finger) injects life, disturbs it, or carves through it. Interaction should feel like touching a petri dish.
- **Beautiful, not technical.** Smooth glow, fading trails and color that encodes state (age, species, energy) instead of hard black/white squares.
- **A real background.** Content sits on top and stays readable. The simulation must never block clicks or tank scrolling performance.
- **Swappable rule sets.** One engine, several "worlds" (Game of Life, Lenia, …) so we can keep experimenting.

### Non-goals (for now)

- Scientific accuracy or a research tool UI.
- Saving/sharing worlds, multiplayer, or server-side anything.
- Supporting browsers without WebGL2 beyond a static fallback.

---

## 2. Concept

Three worlds, built in order. Each one is a "rule set" plugged into the same engine.

### World 1 — Glowing Life (baseline)

Conway's Game of Life (B3/S23), but rendered softly:

- Each cell stores **alive** + **age**. Dead cells keep a decaying **trail** value, so dying patterns leave ghost light behind.
- Color is driven by age: newborn cells are hot/bright, old stable cells cool down to a deep tone.
- Small random "spark" injections keep the world from going static.

Why first: dead simple rules, proves the GPU pipeline, rendering and interaction end-to-end.

### World 2 — Lenia (the "wow" one)

[Lenia](https://chakazul.github.io/lenia.html) is a continuous cellular automaton: cell values are floats in `[0, 1]`, neighborhoods are smooth rings and growth follows a bell curve. The result is soft, self-moving "creatures" that glide, split and pulse like microorganisms.

- Kernel: ring-shaped, radius ~10–15 cells, computed in the shader.
- Growth: `G(u) = 2·exp(-((u − μ)² / (2σ²))) − 1`, with presets for known stable species (e.g. *Orbium*).
- This is the default world on the home page if performance allows.

### World 3 — Ecosystem (stretch)

Two or three competing species on the same grid (multi-channel Lenia, or rock-paper-scissors CA). Each species gets its own hue; borders between them shimmer where they fight.

---

## 3. Interaction

| Input | Effect |
|---|---|
| Move cursor | Leaves a faint trail of seeded life behind it (brush) |
| Click / hold | Strong burst: drops a cluster or a known creature |
| Right-click / Shift + drag | Eraser: carves dead space |
| Idle > N seconds | Auto-seeding kicks in so the world never dies |
| Keyboard `Space` | Pause / resume (only when the background has focus mode on) |
| Keyboard `R` | Reseed |
| Keyboard `1` / `2` / `3` | Switch world |

Touch: tap = burst, drag = brush. Pointer events only, no separate mouse/touch code.

The canvas uses `pointer-events: none`; input is read from a window-level `pointermove`/`pointerdown` listener so content on top stays fully clickable.

---

## 4. Visual Direction

- **Palette:** bioluminescent. Near-black deep-sea base (`#05070a`), with life glowing in cyan → teal → violet; hot newborn cells near-white.
- **Glow:** cheap bloom = sample the trail texture at lower resolution and add it back (no post-processing library).
- **Trails:** each frame the trail buffer decays (`trail *= 0.94`) and live cells write into it. This produces motion blur and the organic feel.
- **Resolution:** the simulation runs on a coarse grid (cell size ~3–4 CSS px), then is upscaled with linear filtering so cells blend into soft blobs instead of hard pixels.
- **Readability layer:** a subtle radial vignette and optional blur behind text so content always wins.
- **Light mode:** inverted "ink in water" palette: paper base, life as dark ink with colored edges.

---

## 5. Technical Approach

### Stack

- Next.js 16 / React 19 (this repo), Tailwind v4 for page styling.
- **Raw WebGL2, no dependencies.** The whole engine is a couple of fragment shaders plus ping-pong framebuffers. Three.js etc. would add weight with no benefit.

### Why GPU

A 1920×1080 screen at 3 px cells is ~230k cells; Lenia with a radius-13 kernel means ~500 samples per cell per step. That is impossible on the CPU at 60 fps and trivial on the GPU.

### Pipeline (per frame)

```
             ┌─────────────┐
 state A ───▶│ step shader │───▶ state B      (rule set: Life / Lenia / ...)
             └─────────────┘
                    │ brush uniforms (pointer pos, radius, mode)
                    ▼
             ┌─────────────┐
 trail  ────▶│ trail shader│───▶ trail'       (decay + add live cells)
             └─────────────┘
                    ▼
             ┌─────────────┐
             │render shader│───▶ screen       (palette, glow, vignette)
             └─────────────┘
 swap A/B, swap trail buffers
```

- State textures: `RGBA16F` (needs `EXT_color_buffer_float`; fall back to `RGBA8` for Life if unavailable).
- Channel layout: `R` = value/alive, `G` = age, `B` = species, `A` = reserved.
- Simulation steps per frame are configurable (Life looks best ~15 steps/sec, Lenia ~30–60).

### Module layout

```
app/
  _components/
    life-background/
      LifeBackground.tsx      # client component: canvas, lifecycle, pointer input
      engine.ts               # WebGL2 setup, ping-pong buffers, frame loop
      gl-utils.ts             # compile/link helpers, texture + FBO creation
      worlds/
        types.ts              # World interface
        game-of-life.ts       # step shader + seed fn + params
        lenia.ts              # step shader + kernel params + presets
      shaders/
        trail.frag.ts
        render.frag.ts
        fullscreen.vert.ts
```

### World interface

```ts
interface World {
  id: "life" | "lenia" | "ecosystem";
  name: string;
  stepShader: string;                  // GLSL fragment source
  stepsPerSecond: number;
  cellSize: number;                    // CSS px per cell
  uniforms: Record<string, number>;    // rule params (μ, σ, radius, ...)
  seed: (w: number, h: number) => Float32Array;
}
```

### Component API

```tsx
<LifeBackground world="lenia" interactive intensity={0.8} />
```

Mounted once in `app/layout.tsx` (fixed, `inset-0`, `-z-10`) or per page.

---

## 6. Performance & Accessibility

- **Pause when hidden:** stop the loop on `visibilitychange` and when the canvas is off-screen.
- **Respect `prefers-reduced-motion`:** render a single, slowly evolving frame (~1 step/sec) or a static snapshot.
- **DPR cap:** simulation grid is computed from CSS pixels, never device pixels; render target capped at DPR 2.
- **Resize:** debounce, then resample the existing state into the new grid instead of resetting.
- **Adaptive quality:** measure frame time for the first ~60 frames; if > 20 ms, increase cell size or drop steps/frame.
- **Context loss:** handle `webglcontextlost` / `restored` and rebuild.
- **Fallback:** no WebGL2 → static gradient background matching the palette.
- Canvas is `aria-hidden="true"`; it is pure decoration.

---

## 7. Milestones

| # | Milestone | Done when |
|---|---|---|
| M1 | Engine skeleton | WebGL2 canvas fills screen, ping-pong loop runs, random noise evolves |
| M2 | Glowing Life | B3/S23 on GPU with age colors, trails, auto-seed |
| M3 | Interaction | Brush, burst, eraser via pointer events; content on top stays clickable |
| M4 | Lenia | Smooth creatures with at least one stable preset (Orbium) |
| M5 | Polish | Glow, vignette, light mode, reduced-motion, visibility pause, adaptive quality |
| M6 | Home page | Background mounted on `/` with PPlab title floating on top |
| M7 (stretch) | Ecosystem | Multi-species world with competing hues |

---

## 8. Open Questions

- Default world on the home page: Lenia (prettier, heavier) or Glowing Life (lighter, more recognizable)?
- Should a small, unobtrusive control (world switcher / pause) be visible, or keyboard-only?
- Background on every page, or only the home page?

---

## 9. References

- Conway's Game of Life: https://conwaylife.com/wiki/Conway%27s_Game_of_Life
- Lenia (Bert Chan): https://chakazul.github.io/lenia.html
- SmoothLife (Stephan Rafler), the continuous-CA predecessor to Lenia
- WebGL2 fundamentals: https://webgl2fundamentals.org/
