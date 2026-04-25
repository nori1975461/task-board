# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # install dependencies
npm run dev        # start dev server at http://localhost:3000
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

## Architecture

Single-page React + TypeScript app bundled with webpack 5.

```
src/
  main.tsx          # ReactDOM.createRoot entry point
  App.tsx           # root component; owns tasks state + add/toggle/delete handlers
  types.ts          # Task interface { id, text, completed }
  style.css         # global styles (all component styles live here)
  vite-env.d.ts     # CSS module type declaration
  components/
    TaskInput.tsx   # controlled form — calls onAdd(text) on submit
    TaskList.tsx    # maps tasks → TaskItem; shows empty state
    TaskItem.tsx    # checkbox, label, delete button per task
```

State lives entirely in `App.tsx` and is passed down as props. No external state library.

## Tech Stack

| Layer | Choice |
|---|---|
| UI | React 18 |
| Language | TypeScript 5 (strict mode) |
| Bundler | webpack 5 + ts-loader + css-loader |
| Styling | Plain CSS (`src/style.css`) — no CSS-in-JS, no utility framework |
| State | `useState` in `App.tsx` only — no Redux, Zustand, or Context |
| Persistence | `localStorage` (key: `tasks`) |
| CI/CD | GitHub Actions → GitHub Pages |

## Component Naming Conventions

- **File names**: PascalCase `.tsx` (e.g. `TaskItem.tsx`)
- **Component names**: match the file name exactly
- **Props interface**: named `Props`, defined inline at the top of the same file
- **Event handler props**: prefixed with `on` + verb (e.g. `onAdd`, `onToggle`, `onDelete`)
- **CSS classes**: kebab-case matching the component role (e.g. `.task-item`, `.delete-btn`)

## Deploy

- Production URL: https://nori1975461.github.io/task-board/
- Deployed automatically by GitHub Actions on every push to `main`
- Production `publicPath` is `/task-board/`; dev server uses `/`

## Git Rules

- After every code change, stage and commit the relevant files, then push to GitHub immediately.
- Use descriptive commit messages that explain *why* the change was made, not just what.
- Never force-push to `main` or `master`.
- Do not skip pre-commit hooks (`--no-verify`).

## Notes

- Vite/rolldown/rollup native bindings are blocked by Windows Application Control on this machine — webpack is used instead.
