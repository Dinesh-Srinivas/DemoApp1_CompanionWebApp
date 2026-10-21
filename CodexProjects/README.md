# Pocket Pal

A small client-side companion pet built with React, TypeScript, Vite, Tailwind CSS, Framer Motion and Lucide. Game progress is saved in browser local storage; there is no backend or API key.

## Start locally

```sh
pnpm install
pnpm dev
```

Vite prints the local URL (usually `http://localhost:5173`).

## Production build

```sh
pnpm build
pnpm preview
```

The deployable static site is written to `dist/`. For a free static host such as Netlify, Vercel or Cloudflare Pages, connect this repository, set the build command to `pnpm build`, and the publish/output directory to `dist`.

## Progress and privacy

Pet stats, tasks, coins, inventory, room, settings and activity history stay in the current browser profile under the `pocket-pal-v1` local storage key. Clearing that browser storage resets the game. Use **Settings → Reset my progress** to start over from inside the app.
