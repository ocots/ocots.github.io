# Olivier Cots — Personal Website

Modern, responsive, accessible personal website for Olivier Cots.

- Tech: Plain HTML/CSS/JS (no build step), dark mode, mobile menu, smooth scrolling.
- Hosting target: GitHub Pages at `ocots.github.io` (user site).

## Local preview

You can open `index.html` directly in a browser. For a quick local server (optional):

- Python 3: `python3 -m http.server 8000`
- Node: `npx serve`

Then visit `http://localhost:8000`.

## Deploy to GitHub Pages (user site)

User pages for `ocots.github.io` are served from the root of the `main` branch of the repository `github.com/ocots/ocots.github.io`.

1. Create or clone your repo:
   - If not created yet: create `ocots/ocots.github.io` on GitHub (Public).
   - Clone it locally.

2. Copy the files from this folder into that repo root:
   - `index.html`
   - `assets/` directory
   - Optional: `.nojekyll` (to disable Jekyll processing)

3. Commit and push:
   ```bash
   git add .
   git commit -m "Publish personal website"
   git push origin main
   ```

4. Visit https://ocots.github.io after a minute. If it doesn't load, check the repo settings under Pages.

## Customization

- Edit content in `index.html` sections: About, Research, Publications, Teaching, Software, Contact.
- Tweak styles in `assets/css/style.css` (colors, spacing, typography).
- Favicon at `assets/icons/favicon.svg`.

## Accessibility and performance

- Uses semantic HTML and skip-link.
- Prefers reduced JS; no frameworks.
- Dark mode with `prefers-color-scheme` and local toggle.

## License

MIT — You are free to reuse this structure and theme with attribution.
