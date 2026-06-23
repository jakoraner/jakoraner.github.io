# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio website for Jacob Hoffmann (https://www.jacobhoffmann.de/), a
Create React App (CRA, `react-scripts@5.0.1`) single-page app styled with Tailwind
CSS and deployed to GitHub Pages. The repo is the `jakoraner.github.io` user-pages
repo, served under the custom domain in `public/CNAME`.

## Node version (read this first)

`react-scripts@5.0.1` is old and **hangs silently on Node 22+** (no output, 0% CPU,
the dev server never binds its port). Use **Node 18 or 20**:

```bash
nvm use 20   # or: nvm install 20
```

The machine's default Node (nvm v24 / Homebrew v25) will *not* work for `npm start`,
`npm run build`, or `npm test`. Always switch to Node 20 before running any script.

## Commands

```bash
npm install            # install deps (CRA tree is large; "44K" du readings are misleading)
npm start              # dev server on http://localhost:3000 (Node 20!)
npm run build          # production build into build/
npm test               # Jest in watch mode (no tests exist yet)
CI=true npm test       # run tests once, non-interactively
npm test -- --testPathPattern=SomeName   # run a single test file
npm run deploy         # build, then publish build/ to the gh-pages branch via gh-pages
```

`build/` is committed to the repo (tracked in git), separate from what `npm run deploy`
pushes to the `gh-pages` branch.

## Deployment

- `npm run deploy` runs `predeploy` (`npm run build`) then `gh-pages -d build`, pushing
  the build output to the **`gh-pages` branch**, which GitHub Pages serves.
- `public/CNAME` (`jacobhoffmann.de`) and `package.json#homepage` pin the custom domain.
  Asset URLs in the build derive from `homepage`.
- `public/_redirects` provides SPA fallback (`/* /index.html 200`).

## Architecture

- **Entry / routing**: `src/index.js` mounts `<App>` with the legacy
  `ReactDOM.render` API (React 18 is installed but `createRoot` is not used).
  `src/app.js` defines a **`HashRouter`** (URLs look like `/#/work`) with three routes:
  `/` → `Landingpage`, `/work` → `Work`, `/playlists` → `Playlists`.
  `components/ScrollToHash.js` handles in-page anchor scrolling on navigation.
- **Shared UI**: `components/Navbar.js` is the nav used across pages.
  `components/Blog.js` exists but is **not routed** (unused).
- **Styling**: Tailwind (`src/tailwind.css`, `src/index.css`, `src/app.css`;
  `tailwind.config.js` + `postcss`/`autoprefixer`). Utility classes throughout.
- **Embeds & lazy loading**: `components/LazyLoadIframe.js` wraps iframes in an
  `IntersectionObserver` so they load only when near the viewport. `Playlists.js`
  renders a list of Spotify embed iframes this way; `Work.js` embeds a Figma prototype
  and PDFs.

## The `src/components/cg_project/` subtree (Computer Graphics coursework)

This is the bulk of the repo: worksheets 01–10 from a WebGL computer-graphics course,
surfaced through the `/work` page. Two distinct integration patterns coexist:

1. **React-component worksheets** (e.g. `cg_project/01/w01p1.js`): export a React
   component that renders a `<canvas>` and drives WebGL via helpers imported from
   `src/utils` (`import { setupWebGL } from '../../../utils'`). These are bundled and
   imported directly into `Work.js`.
2. **Standalone HTML worksheets** (e.g. `cg_project/02/w02p1.html` + `w02p1.js`):
   classic Angel "Interactive Computer Graphics" textbook style using browser globals
   (`WebGLUtils`, `initShaders`) and `window.onload`. Self-contained pages, not part of
   the React bundle.

`src/utils/` is the Angel WebGL support library (`MV.js` for matrix/vector math,
`initShaders.js`, `webgl-utils.js`, `utils.js`); `src/utils/index.js` re-exports it for
the React components. 3D models (`.obj`/`.mtl`), textures/cubemaps (`.png`/`.jpg`), and
worksheet PDFs live alongside their worksheets.

## Git LFS

`src/components/cg_project/05/monkey.obj` (~231 MB) is tracked via **Git LFS**
(see `.gitattributes`) — it exceeds GitHub's 100 MB file limit. **git-lfs must be
installed** to check out a working copy. It is an oversized, *unused* Blender export
(nothing imports it; the worksheets use the small `monkey2.obj`/`monkey4.obj`). Its
size can stall the webpack dev-server file watcher, so be aware when touching that dir.
