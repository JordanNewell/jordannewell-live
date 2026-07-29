# jordannewell-live

Splash + license page for [jordannewell.com](https://jordannewell.com). Separated from the main blog repo so iterations on the splash don't entangle blog deploys.

Served via GitHub Pages from the `main` branch. Custom domain: `jordannewell.com`.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Deploy

Automatic on push to `main`. GitHub Actions builds and ships to GH Pages. No manual deploy script.

## Pages

- `/` — splash (terminal, keyboard, emoji dock, character)
- `/legal` — license + attribution

## Related

- Main blog repo: [JordanNewell/jordannewell-com](https://github.com/JordanNewell/jordannewell-com) (currently orphaned — splash took over the domain)
- Source splash components originally lived in jordannewell-com; extracted 2026-07-29.
