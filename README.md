# Imposter

A pass-and-play party game for mobile. Everyone shares one phone: each player
privately sees a secret word, except one randomly chosen Imposter, who only
gets a vague hint. After everyone's seen their role, the group discusses and
tries to vote out the Imposter.

Categories: Anime, Movies, Video Games, and General.

## Running locally

This is a static site with no build step. Serve the folder with any static
file server (ES module `import`s need `http://`, not `file://`):

```bash
python3 -m http.server 8000
# or: npx serve .
```

Then open `http://localhost:8000`.

## Adding words

All game content lives in [`data/categories.js`](data/categories.js). Add or
edit `{ word, hints: { easy, medium, hard } }` entries under any category —
each hint is a single word related to the answer but never the answer
itself, at three difficulty tiers (easy is more revealing, hard is vaguer).
No other file needs to change.

## Deploying to GitHub Pages

This repo includes a `.github/workflows/pages.yml` workflow that deploys
automatically on every push. One-time setup: go to **Settings → Pages** and
set the source to "GitHub Actions". Your game will then be live at
`https://<username>.github.io/<repo>/`.

## How it's built

Plain HTML/CSS/JS with ES modules — no framework, no bundler, no backend.

- `index.html` — the four screens (setup, reveal, discuss, results)
- `js/state.js` — game state + phase transitions
- `js/game-logic.js` — picks the word, hint tier, imposter, and discussion starter
- `js/storage.js` — persists setup (names, categories, difficulty) to localStorage
- `js/screens/*.js` — one module per screen
- `data/categories.js` — the word bank
