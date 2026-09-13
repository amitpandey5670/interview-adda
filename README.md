# Interview Adda

Senior-level interview preparation docs as a static Angular site. Content lives in JSON under `data/`; the app prerenders every route for GitHub Pages.

## Requirements

- **Node.js 22.22.3+** (see [`.nvmrc`](.nvmrc))
- npm 10+

```bash
nvm use
npm ci --legacy-peer-deps
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Dev server at `http://localhost:4200/` (`base href` `/`) |
| `npm run build` | Local static prerender to `dist/interview-adda/browser` |
| `npm run build:pages` | GitHub Project Pages build (`/interview-adda/`) + `404.html` + `.nojekyll` |
| `npm run lint` | ESLint |
| `npm run typecheck` | Content contracts + Angular build typecheck |
| `npm test` | JSON schema tests + Angular unit tests |

## Site configuration

Base href is controlled by [`config/site.config.json`](config/site.config.json):

- `local.baseHref`: `/` for `npm start` and `npm run build`
- `githubPages.baseHref`: `/interview-adda/` for Project Pages

Change `githubPages.baseHref` if the repository name differs.

## Content layout

```
data/
  catalog.json          # Home dashboard tiles
  csharp/
    index.json          # Module index and learning stages
    overview.json       # Language landing page
    modules/
      01-.../
        module.json
        topics/*.json
        mindmap.json
        quick-overview.json
        interview.json
  contracts/            # Shared TypeScript types
  schemas/              # JSON Schema validation
```

C# is the first live track (18 modules, 109 topics). Other languages and frameworks are listed on the home page as coming soon.

## GitHub Pages

1. Push to `main`.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The [`.github/workflows/pages.yml`](.github/workflows/pages.yml) workflow runs lint, typecheck, tests, `build:pages`, and deploys `dist/interview-adda/browser`.

Published URL (default): `https://<username>.github.io/interview-adda/`

## Project structure

```
src/app/
  pages/          # Home, overview, topic, mind map, interview pages
  layout/         # Doc shell, collapsible index nav
  shared/         # CodeBlock, prose, related links, mind map canvas
  core/content/   # JsonContentRepository, prerender route params
config/           # site.config.json
scripts/          # Base-href helpers for ng build/serve
```

Built with **Angular 22**, `outputMode: "static"`, and prerender params generated from `data/csharp`.
