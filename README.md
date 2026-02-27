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

## Deployment (Vercel)

The app uses **environment variables** for AI features. These are **not** read from `.env` or `.env.local` in production — you must set them in Vercel.

1. In the [Vercel dashboard](https://vercel.com/dashboard), open your project (**Prototype-Engine**).
2. Go to **Settings** → **Environment Variables**.
3. Add the same variables you use locally:

   | Name             | Description |
   |------------------|-------------|
   | `OPENAI_API_KEY` | Required for AI-generated brief content, project detail, concepts, insights, opportunity spaces, theme-from-image, and persona/concept images. Get a key at [OpenAI API keys](https://platform.openai.com/api-keys). |
   | `FAL_KEY`        | Required for AI-generated images (concept headers, opportunity images, personas). Format: `your-fal-key-id:your-fal-key-secret`. Get it at [Fal AI dashboard](https://fal.ai/dashboard/keys). |

4. **Redeploy** the project (Deployments → … on latest → Redeploy) so the new variables are applied. Environment variables are only loaded at build/run time; changing them does not affect already-running deployments.

If these keys are missing in production, the app will still run, but AI generation will be skipped (e.g. instance creation may use fallback content and no AI images).
