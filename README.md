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

The game ships with a built-in word bank in
[`data/categories.js`](data/categories.js): `{ word, hints: { easy, medium,
hard } }` entries per category, each hint a single word related to the
answer but never the answer itself, at three difficulty tiers.

Players can also add, edit, or delete words right from the app — tap **Edit
Word Lists** on the setup screen. Those changes are saved to the browser's
localStorage (per device, not shared between players) and a "Reset" button
restores a category back to the shipped defaults. To change the defaults
themselves for everyone, edit `data/categories.js` directly.

## Deploying to GitHub Pages

This repo includes a `.github/workflows/pages.yml` workflow that deploys
automatically on every push. One-time setup: go to **Settings → Pages** and
set the source to "GitHub Actions". Your game will then be live at
`https://<username>.github.io/<repo>/`.

## How it's built

Plain HTML/CSS/JS with ES modules — no framework, no bundler, no backend.

- `index.html` — the five screens (setup, word list editor, reveal, discuss, results)
- `js/state.js` — game state + phase transitions
- `js/game-logic.js` — picks the word, hint tier, imposter, and discussion starter
- `js/wordbank.js` — the live, editable word bank (starts from `data/categories.js`, persisted to localStorage)
- `js/storage.js` — persists setup (names, categories, difficulty) to localStorage
- `js/screens/*.js` — one module per screen, including `editor.js` for the in-app word list editor
- `data/categories.js` — the shipped default word bank
