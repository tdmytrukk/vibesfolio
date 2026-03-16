

## Plan: Switch from DM Serif Display to a Modern Serif

### What's changing
Replace **DM Serif Display** with **Instrument Serif** — a contemporary, lighter serif from Google Fonts. It's editorial but cleaner, with better readability at small sizes and a modern feel closer to what Claude and similar products use.

**Why Instrument Serif**: Free (Google Fonts), variable weight support, designed for digital screens, pairs well with Inter, and has that warm-but-modern character without feeling heavy or old-fashioned.

### Files to change

1. **`index.html`** — Update the Google Fonts `<link>` to load `Instrument Serif` instead of `DM Serif Display`

2. **`src/index.css`** — Update `--font-heading` CSS variable from `'DM Serif Display'` to `'Instrument Serif'`

3. **`tailwind.config.ts`** — Update `fontFamily.heading` from `DM Serif Display` to `Instrument Serif`

4. **`docs/design.md`** and **`docs/rules.md`** — Update font references to reflect the new heading font

That's it — since all headings reference the `font-heading` token, the change propagates everywhere automatically (page titles, card h3s, modals, etc.).

