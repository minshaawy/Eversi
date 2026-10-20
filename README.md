# Eversi — Online Boutique

Storefront for **Eversi**, a Riyadh house of confectionery-inspired leather goods.
A static site — plain HTML, CSS and JavaScript, with no build step and no dependencies.

> **Preview store.** No payment is taken and orders are not sent anywhere. The bag and wishlist are saved in the visitor's browser only. To sell for real, the design needs to be connected to a commerce platform (Salla or Shopify).

## Run it locally

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>. Opening `index.html` directly from disk will not load the styles and scripts; use a local server.

## Publish on GitHub Pages

1. Push this folder to a GitHub repository (the files must sit at the repository root).
2. Open **Settings → Pages**, set **Source** to *Deploy from a branch*, and choose `main` with the `/ (root)` folder.
3. The site will be live at `https://<username>.github.io/<repository>/` within a minute or two.

## Structure

| Path | What it is |
|---|---|
| `index.html` | Page shell: header, footer, bag drawer, search, and the inline SVG symbols (wordmark, Saudi Riyal sign, payment badges) |
| `css/eversi.css` | All styles, built on the Edition One brand tokens; supports light and dark mode |
| `js/catalog.js` | **The product list.** Names, prices, discounts, colours, details, images |
| `js/app.js` | The store: page routing, product pages, bag, wishlist, search, checkout |
| `assets/img/` | Product photography; each image has a full-size version and a `-sm` version for cards |
| `assets/fonts/` | Font definitions (Gilroy, with Urbanist as the fallback) |
| `assets/build_images.py` | Regenerates `assets/img/` from the original renders (needs the full Eversi brand folder alongside) |

## Common edits

- **Change a price or discount:** edit `price` and `discount` for that product in `js/catalog.js`. `discount: 10` means 10% off; delete it to remove the offer.
- **Add a product:** copy an existing entry in `js/catalog.js`, then add its images to `assets/img/` as `name.jpg` and `name-sm.jpg`.
- **Delivery fees and the free-delivery threshold:** see `FREE_SHIP`, `SHIP_STD` and `SHIP_EXP` at the top of `js/app.js`.

## Before launch

- **Gilroy font:** Gilroy is a commercial typeface. Add licensed web font files to `assets/fonts/gilroy/` (see the note at the top of `assets/fonts/fonts.css`), or use an Adobe Fonts web project. Until then, visitors who don't have Gilroy installed will see Urbanist.
- **Payment badges:** the mada, Visa, Mastercard, Apple Pay, Tabby and Tamara badges are drawn approximations. Replace them with each provider's official merchant artwork (the `pay-*` symbols in `index.html`).
- **Prices** in `js/catalog.js` are placeholders until the final price list is confirmed.
