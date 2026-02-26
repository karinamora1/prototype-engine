# BOI Prototype Engine

A configurable prototype engine: **layout and core components stay fixed**, while each client instance gets its own **brand theme**, **logo**, **copy**, and **optional feature toggles**. Generate new branded instances from client briefs and store them in a searchable, optionally password-protected library.

## Features

- **Fixed layout** — Base prototype (e.g. Glade innovation engine) structure is unchanged.
- **Dynamic per instance:**
  - Brand theme (colors, typography tokens)
  - Logo and brand name
  - All UI copy/content
  - Optional modular features (toggled on/off)
- **Brief-driven generation** — Upload or paste a client brief; click **Generate** to create a new instance.
- **Instance library** — All instances stored and searchable.
- **Password protection** — Optional password per instance for access.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

3. **Optional:** Copy `.env.example` to `.env` and add any API keys (e.g. for future AI brief parsing).

## Usage

1. **Dashboard** (`/`) — Choose “Create from brief” or “Instance library”.
2. **Create from brief** (`/brief`) — Paste or type a client brief (e.g. “Bazooka Bubble Gum — fun, bold pink…”). Optionally set a password. Click **Generate** to create a new instance.
3. **Instance library** (`/library`) — Search and open any generated instance.
4. **Instance view** (`/instance/[id]`) — View the branded prototype. If the instance is password-protected, enter the password to unlock.

## Project structure

- `app/` — Next.js App Router: pages and API routes.
- `components/` — `BasePrototype` (fixed layout, theme + content + features injected).
- `lib/` — Types, instance store (file-based), brief parser (stub; plug in AI later).
- `data/` — Stored instances (JSON) and index; created at runtime.

## Customization

- **Base prototype** — Edit `components/BasePrototype.tsx` to match your real product design (e.g. Glade innovation engine). Keep the same props: `theme`, `brand`, `content`, `features`.
- **Content keys** — Extend `DEFAULT_CONTENT_KEYS` in `lib/types.ts` and add matching copy in `BasePrototype`.
- **Brief parsing** — Replace the stub in `lib/brief-parser.ts` with an AI call to derive theme, content, and features from natural-language briefs.
- **Auth** — For production, replace the simple password hash in `lib/instance-store.ts` with bcrypt and add session or JWT for library access if needed.

## Build

```bash
npm run build
npm start
```
