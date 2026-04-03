# Querai — Financial AI Platform

## Project Overview
A React + TypeScript fintech application (Vite-powered) for enterprise financial intelligence. Brand name: **Querai** 

## Tech Stack
- **Framework:** React 19 + TypeScript
- **Build:** Vite
- **Routing:** React Router v7 (`react-router-dom`)
- **Styling:** Tailwind CSS v4 — utility-first with custom design tokens in `src/index.css`
- **UI Libraries:** MUI (selective use), Recharts (data viz), dnd-kit (drag & drop)
- **Fonts:** Manrope (headings via `font-heading`), Inter (body via `font-sans`)
- **Icons:** Material Symbols Outlined (via `.icon` class)

## Architecture
```
src/
├── components/
│   ├── charts/    # LineChart, BarChart, DonutChart, DataTable, KPICard, CategoryBarList
│   ├── form/      # Input, Checkbox, Radio, Select, DatePicker, Toggle
│   └── ui/        # Button, Card, Skeleton, Modal, Alert, Chip, Tabs, Accordion, etc.
├── layouts/       # AppLayout, Navbar, Sidebar, PageContainer
├── pages/         # Home (design showcase), Chat, Login, Settings, Selection, Usecase
├── mocks/         # Mock data (sidebarMock)
├── hooks/
├── services/
└── utils/
```

## Design System: "Sovereign Curator"
Full documentation in `.claude/skills/DESIGN.md`. Key rules:

- **No-Line Rule:** Never use 1px solid borders. Define boundaries via background color shifts only.
- **Ghost Border:** If a border is unavoidable, use `outline-variant` at 15% opacity.
- **Surface Hierarchy:** `surface` → `surface-container-low` → `surface-container-lowest` (cards).
- **Glassmorphism:** Floating elements use `bg-white/10 backdrop-blur-xl border-white/30`.
- **Shadows:** Use `shadow-ambient` (0 10px 30px -5px rgba(25,28,29,0.05)).
- **Border Radius:** `rounded-lg` (16px) for containers, `rounded-xl` (24px) for special elements.

## Key Conventions
- Components use TypeScript interfaces extending native HTML attributes where applicable.
- build and use resuable components  when needed . 
- Pages wrapped in `<AppLayout>` get Navbar + Sidebar automatically. Login is standalone (no layout).
- Mock auth credentials: `wassim@querai.com` / `querai123` (in `src/pages/Login/useLogin.ts`).
- Reusable loading states via `<Skeleton>` and `<SkeletonCard>` components.

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Type-check + production build
- `npm run lint` — ESLint

## Style Guidelines
- Prefer editing existing components over creating new files.
- Follow the design token system in `src/index.css` (`@theme` block) for all colors, radii, shadows.
- Use `font-heading` for headlines (Manrope), `font-sans` for body (Inter).
- Icons: `<span className="icon">icon_name</span>` using Material Symbols names.
- Animations: define keyframes in `src/index.css`, apply via utility classes.
