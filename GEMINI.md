# 🎨 Nine-Security Frontend: AI Context (L2)

> **AI Directive**: You are in the Frontend context. This is a multi-page Vite application published via GitHub Pages.

## 📂 Directory Map
- `src/js/`: Modular JS for i18n, translations, and shared logic.
- `src/css/`: Modular CSS (prefer `styles.css` and `variables.css`).
- `assets/`: Images, logos, and fonts.
- `dist/`: Build output (synced to Pages repo).

## ⚙️ Core Logic
- **API Routing**: The base URL switches between `api.nine-security.com` (Helix) and `gov.nine-security.com` (Governance) depending on the page and environment.
- **i18n**: Multi-language support via `translations.js`. Always update this when adding UI text.
- **Vite Config**: Uses `vite.config.js` for multi-page entry points.

## 🛠️ Deployment SOP
- **Publishing**: Use `./deploy-frontend-pages.sh` from the root.
- **Manual Sync**: If needed, sync `core/frontend/dist/` to the root of the `9Sec-Website` repository.

## 🧭 Deep Dive
Most tool pages (e.g., `veris.html`, `governance-app.html`) have their own JS logic in the same directory or under `src/js/`. Check `window.location.hostname` checks in the code for environment-specific logic.
