# Sought & Sourced — setup

Theme source: `~/Projects/sought-and-sourced-theme/`
Upload file: `~/Projects/sought-and-sourced-theme.zip`

---

## 1. Upload — nothing goes live

**Online Store → Themes → Add theme → Upload zip.**

It lands in your theme library **unpublished**. Your live theme is untouched and customers
see nothing. Hit **Preview** to walk it against your real catalogue. **Publish** is a
separate button, and your current theme stays in the library to revert to in one click.

Walk this order in preview: home → collection → a product (switch tin sizes) → add to cart →
consignment drawer → checkout button → search → a 404 → Customize.

---

## 2. Metafields — the freshness stamp needs these

**Settings → Custom data → Products → Add definition.** All optional: every field hides
itself when empty, so the theme is correct on day one and gets richer as you fill them in.

| Namespace & key | Type | Example | Used by |
|---|---|---|---|
| `custom.harvest_month` | Single line text | `Dec 2025` | Freshness stamp |
| `custom.packed_on` | **Date** | `2026-08-14` | Freshness stamp — drives "26 days ago" |
| `custom.grade` | Single line text | `8 mm+ · AGEB` | Grade badge on cards |
| `custom.subtitle` | Single line text | `8 mm+ green cardamom · AGEB` | Under the product title |
| `custom.provenance` | Multi-line text | Region, elevation, harvest window | Provenance accordion |

`packed_on` must be type **Date**, not text, or the day count won't compute. A future date
hides the whole stamp rather than printing a negative number.

**This commits you to upkeep.** The stamp hides when empty, but it cannot detect a *wrong*
date. If you stop updating `packed_on` per batch, turn the stamp off in
*Theme settings → Product* rather than letting it drift.

---

## 3. Variant weights — these drive the per-dish price

The `₹2.65 per dish` line is computed from each variant's **shipping weight in grams**, so
there's no metafield for it. Set a real weight on every variant (50 g, 100 g, 250 g) or the
line hides itself.

The assumption is in *Theme settings → Product → Grams per dish*, default **0.6 g**
(4 pods at roughly 0.15 g each). **Check this against your own pods** — every per-dish figure
on the site moves with it. The arithmetic is printed under the price so customers can see it.

---

## 4. Things to point at your own content

- **Navigation** — the header uses your `main-menu`. *Content → Menus.*
- **Products on the home page** — *Current lots* shows every product in the store until you
  pick a collection for it in Customize, up to the number set in *Products shown*.
- **Photographs** — three home-page sections take your own pictures: *From the hills to the
  tin* (a photo above each step), *From the farm* (a gallery; the first photo runs double
  size) and *The pod* (one large picture beside the copy). Empty frames hold their place with
  the leaf line work and say "Add a photograph" only inside the theme editor. More can be
  added from **Add section** — *Photo gallery*, *Photo columns* or *Story*.
- **"What are you cooking?"** — each of the four blocks has a *Where it goes* URL. Set these
  to the right collection or product, or the button falls back to all products.
- **Region line** on the product page — Customize → Product → Region line.
- **Logo** — Customize → Header. It sits *inside* the green cartouche rather than replacing
  it. Leave it empty and the cartouche sets your shop name instead, split across the
  ampersand the way the label does.

---

## 5. The design comes off the printed label

The palette, type and ornament are lifted from the box label, so the site and the packet
read as one object. Everything below is a Theme setting — none of it is hardcoded in CSS.

**Colour** — *Theme settings → Colours.*

| Token | Default | What it is |
|---|---|---|
| Page ground | `#F1EBD9` | the label stock |
| Bottle green | `#0B4531` | every reversed band, cartouche and action |
| Bottle green, deep | `#07301F` | announcement bar and footer ground |
| Brass — rules | `#B8912F` | **ornament only**, every hairline |
| Brass on green | `#E0C67E` | type and rules over a dark band |
| Brass ink | `#7A5E14` | small type on ivory — grades, section marks |
| Alert | `#8C3A24` | form errors only |

Brass is split three ways on purpose. The ornament brass is a rule colour and only reaches
2.5:1 on ivory, so it never sets type; brass ink is the darkened version that does. If you
retune the palette, keep that separation or small text stops being legible.

**Type** — Playfair Display for display (the label's high-contrast serif: caps and wide
tracking for the wordmark, 700 for the product name), Instrument Sans for text and the
tracked micro-caps, IBM Plex Mono for measurements, dates and prices.

**Ornament** — the grammar is in `assets/base.css` under *The label's ornament*:

- the **double hairline** — a brass line on the trim, a lighter one set 4px inside it, on
  every framed panel;
- the **arch** — the label's ogee silhouette, on picture panels only (`.plate`, `.card__art`),
  never on a box of text, where a dome sized off the text height would fight the plate's;
- the **cartouche** — `snippets/wordmark.liquid`, the roundel off the hang tag;
- the **two pills** — reversed green for a statement, brass outline with ✦ bullets for a claim;
- the **ringed marks** — `sections/assurances.liquid`, and a *Ringed mark* block on the
  product page; four is the printed count and what the grid is built for;
- the **nutrition panel** — `.readout` and `.table`, green header bar and zebra rows. Give a
  `.readout` a *Record header* to get the bar;
- the **seal** and the **botanical watermark** — `snippets/seal.liquid`,
  `snippets/botanical.liquid`, drawn as line work so they take the palette.

---

## 6. Where the copy takes a position

Three places argue the customer *down* the price ladder. That is the trust mechanic working,
and it is your margin, so change it if you disagree:

- Homepage → Method → *"A grade is a measurement, not a verdict."*
- Homepage → Grades → *"Bigger is not better."*
- Product → *"Grade, honestly"* accordion.

The provenance copy stays at region level — Cardamom Hills, Idukki, 900–1,400 m, Oct–Feb
harvest. **No estate or farmer name is invented anywhere.** When you fix sourcing, that
detail goes in the `custom.provenance` metafield.

---

## 7. Verification

Run since the label restyle:

- **Cross-reference check: passed** — every JSON parses, every `{% schema %}` parses, every
  section/snippet reference resolves, every block type and setting id used in a template
  exists in its schema, `settings_data.json` sets only real settings, every translation key
  exists, Liquid tags balance.
- **Contrast audit: passed** — every text pair clears 4.5:1 on the label palette; focus
  rings, the selected thumbnail and the accordion marker were moved off ornament brass onto
  bottle green or brass ink to clear 3:1.
- **Render check** — headless Chrome against the real stylesheet at 320 / 360 / 375 / 414 /
  768 / 1280 px. No horizontal overflow at any width. The masthead wraps to two rows below
  ~370px, which is why `.masthead` carries `flex-wrap:wrap`.

**Not re-run:** Shopify Theme Check — the CLI isn't installed on this machine. The earlier
pass reported 0 errors and 9 `RemoteAsset` warnings for the Google Fonts links (now
Playfair Display / Instrument Sans / IBM Plex Mono; still deliberate, still silenceable by
self-hosting the fonts and swapping the `<link>` in `layout/theme.liquid` **and**
`layout/password.liquid`). Worth running again before you publish.

**Not verified:** rendering against a live store. Cart, variant switching and checkout are
proven only in your preview. Expect a round of fixes after the first walk-through.

---

## 8. Notes for later

- **Grade scale calibration** is exact only after the viewer matches the outline to a bank
  card (ISO/IEC 7810 ID-1, 85.60 × 53.98 mm). Uncalibrated, CSS millimetres are nominal and
  close but not exact — the section says so on screen. The setting is remembered per browser
  in `localStorage`.
- **Pods size themselves in CSS** from `--pxmm`, so true scale still works with JavaScript
  disabled.
- **The pack-ladder table** (50/100/250 g side by side with cost-per-dish and a POPULAR flag)
  was scoped out. The per-dish figure it needs is already computed, so it is a section away
  if you want it.
- Checkout isn't themeable outside Shopify Plus. Subscriptions and tiered wholesale pricing
  need apps, not theme code.
