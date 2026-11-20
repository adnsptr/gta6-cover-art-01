# Vice Cover Studio

[![Make GTA 6 Cover Art](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/adnsptr/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/adnsptr/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline web app that turns your photos and a caption into GTA 6-style
cover art: a multi-panel poster with bold lettering and a Vice City sunset or
neon colour grade, exported as a PNG to share. Built for the
[Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) bounty on
[make.fun](https://make.fun).

## What it does

- **Any photo:** add your own photos from your machine (up to 6), or start
  from the two included samples. Click a panel to pick it, drag to move the
  photo inside it, scroll to zoom, or use the sliders.
- **Layouts:** six poster layouts — Hero + Three, Four Grid, Full Bleed,
  Trio Strips, Nine Panel, and Tilted Snaps — each filling its panels with
  one photo or several.
- **Colour grades:** six grades — Sunset, Neon Night, Vice Dusk, Golden Hour,
  Mono Noir, Palm Teal — plus film grain and a vignette.
- **Caption:** an Anton display title (white, sunset gradient or neon) with
  a Pacifico script subtitle and an optional title badge.
- **Fast export:** one click exports a PNG in 1080 × 1080, 1080 × 1350 or
  1920 × 1080. Undo and redo are one click away.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Everything runs from the
static files under `app/` — no network request, no upload: your photos never
leave your machine.

## Layout

- `app/` — the web app (index.html, style.css, src/, fonts/, samples/)
- `screenshots/` — 3–4 screenshots: the cover first, then the editor at work
- `main.ts` — the entry program: copies `app/` and `screenshots/` to
  `/output` and writes `dossier.json`
- `vendor/makefun-app.ts` — the kit's dossier library, unchanged

## Fonts

Anton and Pacifico ship under `app/fonts/` under the SIL Open Font License
(their `OFL-*.txt` files sit beside them). No Rockstar Games logo, artwork or
font is used anywhere; every title in the screenshots is invented.
