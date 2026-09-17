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
  javascript/
  typescript/
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

C# is the first live track (18 modules, 109 topics). JavaScript (18 modules, 110 topics) and TypeScript (18 modules, 101 topics) are fully available with the same dual-audience depth model. Other languages and frameworks are listed on the home page as coming soon.

## GitHub Pages

The build job succeeded; deploy fails with **404** until Pages is available for this repository.

### Why deploy failed

This repo is **private**. GitHub Pages on a private repository requires **GitHub Pro** (or Team/Enterprise). On the free plan, Pages works only for **public** repositories.

You can either:

1. **Make the repo public** (recommended for interview docs): **Settings → General → Danger Zone → Change repository visibility → Public**
2. **Upgrade to GitHub Pro** and keep the repo private
3. **Use another host** (Netlify, Cloudflare Pages, etc.) and deploy the `dist/interview-adda/browser` folder from `npm run build:pages`

### Enable Pages (after the repo is eligible)

1. Open [Pages settings](https://github.com/amitpandey5670/interview-adda/settings/pages).
2. Under **Build and deployment → Source**, choose **GitHub Actions** (not “Deploy from a branch”).
3. Re-run the failed workflow, or push a new commit to `main`.

The [`.github/workflows/pages.yml`](.github/workflows/pages.yml) workflow runs lint, typecheck, tests, `build:pages`, and deploys `dist/interview-adda/browser`.

Published URL (default): `https://amitpandey5670.github.io/interview-adda/`

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

Built with **Angular 22**, `outputMode: "static"`, and prerender params generated from `data/` language indexes (C#, .NET, JavaScript, TypeScript).
