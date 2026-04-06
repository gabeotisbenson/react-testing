# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - Type-check with `tsc -b` then bundle with Vite
- `npm run lint` - ESLint across the project
- `npm run type-check` - TypeScript type checking only (`tsc --noEmit`)
- `npm run preview` - Preview the production build locally

## Stack

- React 19, TypeScript ~5.9, Vite 7
- Node LTS (see `.nvmrc`)
- ESLint with typescript-eslint, react-hooks, and react-refresh plugins
- No test framework configured yet

## Architecture

Minimal Vite React template. Entry point is `src/main.tsx` which renders `<App />` inside `<StrictMode>`. Static assets in `public/`.

## TypeScript

Strict mode enabled with `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`. Two tsconfig project references: `tsconfig.app.json` (src) and `tsconfig.node.json` (Vite/node config).
