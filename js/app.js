/* Eversi boutique — hash-routed single page store. No build step; open index.html via any static server. */
(() => {
  const P = window.EVERSI_PRODUCTS, LINES = window.EVERSI_LINES;
  const bySlug = Object.fromEntries(P.map(p => [p.slug, p]));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const main = $("#main");
  const FREE_SHIP = 1000, SHIP_STD = 35, SHIP_EXP = 75, GIFT_WRAP = 0;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- storage (per-browser convenience only) ---------- */
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem("eversi:" + k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("eversi:" + k, JSON.stringify(v)); } catch {} }
  };
  let bag = store.get("bag", []);           // [{slug, colour, qty, gift}]
  let wish = new Set(store.get("wish", []));

  /* ---------- helpers ---------- */
  const sar = n => `<span class="price"><svg class="sar" aria-label="SAR"><use href="#sar"/></svg>${Number(n).toLocaleString("en-US")}</span>`;
  const priceOf = p => p.discount ? Math.round(p.price * (100 - p.discount) / 100) : p.price;
  const priceTag = (p, qty = 1) => p.discount ? `<span class="price-tag">${sar(priceOf(p) * qty)}<s>${sar(p.price * qty)}</s></span>` : sar(p.price * qty);
  const img = (name, sm) => `assets/img/${name}${sm ? "-sm" : ""}.jpg`;
  const heart = slug => `<svg viewBox="0 0 24 24"><use href="#i-heart"/></svg>`;
  const lineName = k => LINES[k]?.name || "";
  const PAY = { mada: "mada", visa: "Visa", mastercard: "Mastercard", applepay: "Apple Pay", tabby: "Tabby", tamara: "Tamara" };
  const payIcon = (k, cls = "pay-ic") => `<svg class="${cls}" viewBox="0 0 60 38" role="img" aria-label="${PAY[k]}"><use href="#pay-${k}"/></svg>`;
  const payRow = (keys = Object.keys(PAY), cls) => keys.map(k => payIcon(k, cls)).join("");

  function card(p) {
    const a = p.images[0], b = p.images[1];
    const badge = (p.badge || p.discount) ? `<span class="card__badges">${p.badge ? `<span class="card__badge ${p.badge === "Signature" ? "card__badge--sig" : ""}">${p.badge}</span>` : ""}${p.discount ? `<span class="card__badge card__badge--sale">−${p.discount}%</span>` : ""}</span>` : "";
    return `<article class="card rv">
      <a class="card__media" href="#/product/${p.slug}" aria-label="${esc(p.name)}">
        <img src="${img(a.src, 1)}" alt="${esc(p.name)}" loading="lazy" style="object-position:${a.pos}">
        ${b ? `<img class="alt" src="${img(b.src, 1)}" alt="" loading="lazy" style="object-position:${b.pos}">` : ""}
        ${badge}
      </a>
      <button class="card__wish" data-wish="${p.slug}" aria-pressed="${wish.has(p.slug)}" aria-label="Save ${esc(p.name)} to wishlist">${heart()}</button>
      <button class="card__quick" data-add="${p.slug}">Add to bag</button>
      <div class="card__body">
        <a class="card__name" href="#/product/${p.slug}">${esc(p.name)}</a>
        <span class="card__short">${esc(p.short)}</span>
        <div class="card__row">${priceTag(p)}<span class="dots">${p.colours.map(c => `<i style="background:${c.hex}" title="${esc(c.name)}"></i>`).join("")}</span></div>
      </div>
    </article>`;
  }

  /* ---------- views ---------- */
  const views = {};

  views.home = () => {
    const newIn = P.filter(p => p.badge && p.type === "bag").slice(0, 4);
    const sig = ["fraisier", "chantilly-cupcake", "glazed-ring", "macaron", "eclair", "clementine"].map(s => bySlug[s]);
    const charms = P.filter(p => p.type === "charm").slice(0, 4);
    const flavours = ["Fraisier", "Pistache", "Chantilly", "Toffee", "Clementine", "Mille-feuille", "Lavande", "Ganache", "Cerise", "Sorbet"];
    const tiles = [["patisserie", "fraisier-1"], ["glace", "sorbet-1"], ["whipped", "toffee-1"], ["laminated", "mille-1"]];
    return `
    <section class="hero">
      <div class="hero__copy">
        <div class="kicker">Confectionery Luxury · Riyadh</div>
        <h1>Leather, baked to <em>satisfy</em> a craving.</h1>
        <p class="hero__sub">Handbags and minaudières shaped like the pâtisserie case — rolled dough, poured ganache, piped crème — made to be wanted on sight and kept for a lifetime.</p>
        <div class="hero__cta"><a class="btn btn--solid" href="#/shop">Shop the vitrine</a><a class="btn btn--ghost" href="#/product/clementine">Meet The Clementine</a></div>
      </div>
      <div class="hero__media">
        <img src="${img("clementine-curtain")}" alt="The Clementine held between two forks against a champagne velvet curtain" fetchpriority="high">
        <div class="starburst" aria-hidden="true"><svg><use href="#star"/></svg><span>New<br>season</span></div>
        <a class="hero__tag" href="#/product/clementine"><img src="${img("clementine-1", 1)}" alt=""><div><b>The Clementine</b><span>New arrival · ${sar(priceOf(bySlug.clementine))}</span></div></a>
      </div>
    </section>
    <div class="marquee" aria-hidden="true"><div class="marquee__track">${[...flavours, ...flavours].map(f => `<span>${f}</span>`).join("")}</div></div>

    <section class="section"><div class="wrap">
      <div class="sec-head rv"><div><div class="kicker">Fresh from the atelier</div><h2>New arrivals</h2></div><a class="link" href="#/shop?sort=new">Shop all new</a></div>
      <div class="grid">${newIn.map(card).join("")}</div>
    </div></section>

    <section class="section" style="padding-top:0"><div class="wrap">
      <div class="sec-head rv"><div><div class="kicker">Four material languages</div><h2>Shop by line</h2></div></div>
      <div class="lines">${tiles.map(([k, im]) => `<a class="line-tile rv" href="#/shop?line=${k}"><img src="${img(im, 1)}" alt="" loading="lazy"><div><small>${LINES[k].season}</small><h3>${LINES[k].name}</h3></div></a>`).join("")}</div>
    </div></section>

    <section class="section band"><div class="wrap" style="text-align:center">
      <div class="kicker c">The core obsession</div>
      <p class="quote rv" style="color:var(--palette-vellum)">A handbag treated the way a pâtissier treats a gâteau: volume, sheen and touch are the argument — not a logo.</p>
      <div class="pillars rv" style="text-align:left">
        <div><h4>Visual satiation</h4><p>Every silhouette begins as a study in appetite — the pull a dessert case has before you’ve tasted anything.</p></div>
        <div><h4>Leathercraft first</h4><p>Hand-set studs, hand-painted crème, stitched layers. Craft is the status symbol; the wordmark stays quiet.</p></div>
        <div><h4>Heirloom, not trend</h4><p>Built to feel delicious season after season, and made to be repaired rather than replaced.</p></div>
        <div><h4>Made for Riyadh</h4><p>Designed in the Riyadh atelier for café terraces, vernissages and long, unhurried dinners.</p></div>
      </div>
    </div></section>

    <section class="section"><div class="wrap">
      <div class="sec-head rv"><div><div class="kicker">The vitrine</div><h2>Pâtisserie Objets</h2><p>Our most theatrical pieces — minaudières modelled on the pastry case itself.</p></div><a class="link" href="#/shop?line=patisserie">View the line</a></div>
      <div class="grid grid--3">${sig.map(card).join("")}</div>
    </div></section>

    <section class="section" style="background:var(--surface-sunken)"><div class="wrap split">
      <div class="split__media rv"><img src="${img("pack-hatbox")}" alt="Pink velvet hatbox tied with a ganache ribbon" loading="lazy" style="object-position:50% 60%"></div>
      <div class="split__copy rv">
        <div class="kicker">The Patisserie Vault</div>
        <h2>Opened like a box of rare pastries.</h2>
        <p>Every order arrives in a rigid drop-front box, wrapped in crisp glassine and tied with heavy grosgrain — with a cotton dust bag, a handwritten care card and, for the Fraisier, its own velvet hatbox.</p>
        <div class="mosaic"><img src="${img("pack-gift", 1)}" alt="Gift box tied with Eversi ribbon" loading="lazy"><img src="${img("pack-box", 1)}" alt="Drop-front Eversi box" loading="lazy"></div>
        <a class="link" href="#/vault" style="align-self:flex-start">Discover the ritual</a>
      </div>
    </div></section>

    <section class="section"><div class="wrap">
      <div class="sec-head rv"><div><div class="kicker">Finishing touches</div><h2>Bag charms</h2><p>Small sweets in stitched leather. Clip one on, or start a collection.</p></div><a class="link" href="#/shop?type=charm">All charms</a></div>
      <div class="grid">${charms.map(card).join("")}</div>
    </div></section>

    <section class="section" style="border-top:1px solid var(--hairline)"><div class="wrap join rv">
      <div class="kicker c">The Atelier List</div>
      <h2>First taste of every drop.</h2>
      <p>Private previews, early access to limited pieces and invitations to Riyadh trunk shows. No countdowns, no noise — a letter when there’s something worth opening.</p>
      <form data-join><input class="field" type="email" required placeholder="Your email address" aria-label="Email address"><button class="btn btn--solid">Join the list</button></form>
    </div></section>`;
  };

  views.shop = (q) => {
    const type = q.get("type") || "", line = q.get("line") || "", sort = q.get("sort") || "featured";
    let list = P.filter(p => (!type || p.type === type) && (!line || p.line === line));
    if (sort === "low") list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "high") list = [...list].sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === "new") list = [...list].sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
    const title = line ? LINES[line].name : type === "charm" ? "Bag charms" : type === "bag" ? "Handbags" : "The vitrine";
    const blurb = line ? LINES[line].blurb : type === "charm" ? "Small sweets in stitched leather, made to clip onto any handle." : "Every piece in the house — handbags, minaudières and charms, shaped by the pâtisserie case.";
    const chip = (label, params, on) => `<a class="chip" href="#/shop${params}" aria-pressed="${on}">${label}</a>`;
    const qs = (o) => { const u = new URLSearchParams(); Object.entries(o).forEach(([k, v]) => v && u.set(k, v)); const s = u.toString(); return s ? "?" + s : ""; };
    return `
    <section class="page-head"><div class="wrap">
      <div class="kicker">${line ? LINES[line].season : "Shop"}</div><h1>${title}</h1><p>${blurb}</p>
    </div></section>
    <div class="toolbar"><div class="wrap">
      <div class="chips" role="group" aria-label="Filter">
        ${chip("All", qs({ sort: sort !== "featured" && sort }), !type && !line)}
        ${chip("Handbags", qs({ type: "bag", sort: sort !== "featured" && sort }), type === "bag" && !line)}
        ${chip("Charms", qs({ type: "charm", sort: sort !== "featured" && sort }), type === "charm" && !line)}
        ${Object.entries(LINES).map(([k, l]) => chip(l.name, qs({ line: k, sort: sort !== "featured" && sort }), line === k)).join("")}
      </div>
      <select class="field sort" data-sort aria-label="Sort products">
        ${[["featured", "Featured"], ["new", "New in"], ["low", "Price, low to high"], ["high", "Price, high to low"]].map(([v, l]) => `<option value="${v}" ${v === sort ? "selected" : ""}>${l}</option>`).join("")}
      </select>
    </div></div>
    <section class="wrap" style="padding-bottom:100px">
      <p class="result-count">${list.length} piece${list.length === 1 ? "" : "s"}</p>
      ${list.length ? `<div class="grid">${list.map(card).join("")}</div>` : `<div class="empty"><h2>Nothing in this case yet.</h2><p>Try another line.</p></div>`}
    </section>`;
  };

  views.product = (q, slug) => {
    const p = bySlug[slug];
    if (!p) return views.notfound();
    const related = P.filter(x => x.slug !== p.slug && (p.type === "bag" ? x.type === "charm" : x.type === "bag")).slice(0, 4);
    const multi = p.images.length > 1;
    return `
    <div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/shop">Shop</a> / <a href="#/shop?line=${p.line}">${lineName(p.line)}</a> / <span>${esc(p.name)}</span></nav>
      <div class="pdp">
        <div class="gallery ${multi ? "" : "gallery--single"}">
          ${multi ? `<div class="gallery__thumbs">${p.images.map((im, i) => `<button data-thumb="${i}" aria-current="${i === 0}" aria-label="View image ${i + 1}"><img src="${img(im.src, 1)}" alt="" style="object-position:${im.pos}"></button>`).join("")}</div>` : ""}
          <div class="gallery__main" data-zoom><img data-main src="${img(p.images[0].src)}" alt="${esc(p.name)}" style="object-position:${p.images[0].pos}"></div>
        </div>
        <div class="buy" data-buy="${p.slug}">
          <div>
            <div class="kicker" style="margin-bottom:14px">${lineName(p.line)}</div>
            <h1>${esc(p.name)}</h1>
            <div style="margin-top:14px">${priceTag(p)}${p.discount ? `<span class="save">Save ${p.discount}%</span>` : ""}<div class="vat">VAT included</div>
            <div class="bnpl">${payRow(["tabby", "tamara"], "pay-ic pay-ic--sm")}<span>or 4 interest-free payments of ${sar(Math.ceil(priceOf(p) / 4))}</span></div></div>
          </div>
          <p class="lede">${esc(p.desc)}</p>
          <div>
            <div class="opt-label">Colour <b data-colour-name>${esc(p.colours[0].name)}</b></div>
            <div class="swatches">${p.colours.map((c, i) => `<button class="swatch" style="background:${c.hex}" data-colour="${esc(c.name)}" aria-pressed="${i === 0}" aria-label="${esc(c.name)}"></button>`).join("")}</div>
          </div>
          <label class="check"><input type="checkbox" data-gift><div><b>Present it as a gift</b><small>Glassine, grosgrain ribbon and a handwritten card — complimentary. Prices are hidden on the packing slip.</small></div></label>
          <div class="buy__row">
            <div class="qty"><button data-q="-1" aria-label="Decrease quantity">−</button><span data-qty>1</span><button data-q="1" aria-label="Increase quantity">+</button></div>
            <button class="btn btn--solid" data-add-pdp>Add to bag</button>
            <button class="wish-lg" data-wish="${p.slug}" aria-pressed="${wish.has(p.slug)}" aria-label="Save to wishlist">${heart()}</button>
          </div>
          <div class="perks"><span>Delivered in the Patisserie Vault</span><span>Free delivery over 1,000 SAR</span><span>14-day returns</span><span>Lifetime atelier care</span></div>
          <div class="acc">
            <details open><summary>Details</summary><div class="acc__body"><ul>${p.details.map(d => `<li>${esc(d)}</li>`).join("")}</ul></div></details>
            <details><summary>Care</summary><div class="acc__body">Store in the cotton dust bag, stuffed lightly with tissue to keep its shape. Keep away from direct sun, heat and perfume. Blot spills at once with a dry cloth. Lacquered and painted elements should never be wiped with solvents — bring them to the atelier for a complimentary refresh.</div></details>
            <details><summary>Delivery &amp; returns</summary><div class="acc__body">Riyadh: same or next day. Rest of the Kingdom: 2–4 working days. GCC: 4–7 working days. Returns accepted within 14 days, unused and in original packaging. Personalised pieces are final sale.</div></details>
          </div>
        </div>
      </div>
    </div>
    <section class="section" style="border-top:1px solid var(--hairline)"><div class="wrap">
      <div class="sec-head"><div><div class="kicker">${p.type === "bag" ? "Complete the box" : "Something to clip it to"}</div><h2>${p.type === "bag" ? "Pair it with a charm" : "Handbags"}</h2></div></div>
      <div class="grid">${related.map(card).join("")}</div>
    </div></section>`;
  };

  views.wishlist = () => {
    const list = P.filter(p => wish.has(p.slug));
    return `<section class="page-head"><div class="wrap"><div class="kicker">Saved for later</div><h1>Your wishlist</h1><p>Pieces you’ve set aside. They’ll be waiting here on this device.</p></div></section>
    <section class="wrap" style="padding:40px var(--gutter) 100px">${list.length ? `<div class="grid">${list.map(card).join("")}</div>` : `<div class="empty"><h2>Nothing saved yet.</h2><p style="margin-bottom:24px">Tap the heart on any piece to keep it here.</p><a class="btn btn--solid" href="#/shop">Browse the vitrine</a></div>`}</section>`;
  };

  views.vault = () => `
    <section class="page-head"><div class="wrap"><div class="kicker">The Parisian unboxing ritual</div><h1>The Patisserie Vault</h1><p>Unboxing an Eversi piece should feel like opening a bespoke box of rare pastries. Every layer is part of the order — and every layer is complimentary.</p></div></section>
    <section class="section"><div class="wrap split">
      <div class="split__media rv"><img src="${img("pack-box")}" alt="Coulis drop-front box with gold foil wordmark" loading="lazy"></div>
      <div class="split__copy rv"><div class="kicker">01 — The box</div><h2>A drop-front drawer, revealed horizontally.</h2><p>Rigid board wrapped in Coulis paper with a gold-foil wordmark. The front drops away so the piece slides out lying down — the way a pâtissier presents a tart.</p></div>
    </div></section>
    <section class="section" style="padding-top:0"><div class="wrap split split--rev">
      <div class="split__media rv"><img src="${img("pack-gift")}" alt="Box wrapped in cream paper with Eversi ribbon" loading="lazy"></div>
      <div class="split__copy rv"><div class="kicker">02 — The wrap</div><h2>Glassine, grosgrain and a handwritten card.</h2><p>Choose “Present it as a gift” and we wrap in crisp glassine, tie it in our Coulis grosgrain and write your message by hand. Prices never appear on a gift’s packing slip.</p></div>
    </div></section>
    <section class="section" style="padding-top:0"><div class="wrap split">
      <div class="split__media rv"><img src="${img("pack-dust")}" alt="Cream cotton dust bag with Coulis drawstrings" loading="lazy"></div>
      <div class="split__copy rv"><div class="kicker">03 — The keeping</div><h2>A dust bag for every piece. A hatbox for the Fraisier.</h2><p>Heavy cotton with Coulis drawstrings keeps leather breathing between outings. Our signature minaudière arrives in its own pink velvet hatbox, made to live on a dressing table.</p><a class="btn btn--solid" href="#/shop" style="align-self:flex-start">Shop the vitrine</a></div>
    </div></section>`;

  views.atelier = () => `
    <section class="page-head"><div class="wrap"><div class="kicker">Riyadh · Founded 2026</div><h1>Shaped to satisfy cravings through sight and touch alone.</h1></div></section>
    <section class="section"><div class="wrap split">
      <div class="split__media rv"><img src="${img("leather")}" alt="Close-up of grained leather with a debossed Eversi wordmark" loading="lazy"></div>
      <div class="split__copy rv"><div class="kicker">The house</div><h2>Away from cold minimalism.</h2>
        <p>Eversi is a house of leather goods built the way a pâtissier builds a gâteau. We move toward rich, voluptuous silhouettes inspired by rolled dough, warm ganache and poured creams — pieces with volume, sheen and something you want to touch.</p>
        <p>Stitching, quilting and lamination do the talking. The wordmark stays small and quiet; craft is the only status symbol we use.</p></div>
    </div></section>
    <section class="section band"><div class="wrap">
      <div class="kicker">Who we make for</div>
      <div class="pillars" style="grid-template-columns:repeat(3,1fr);margin-top:28px">
        <div><h4>Expressive</h4><p>Getting dressed is a daily sensory pleasure, not a uniform.</p></div>
        <div><h4>Unhurried</h4><p>Found at café terraces, gallery vernissages and intimate dinners.</p></div>
        <div><h4>Heirloom-minded</h4><p>Invests in pieces that feel delicious season after season.</p></div>
      </div>
    </div></section>
    <section class="section"><div class="wrap">
      <div class="sec-head"><div><div class="kicker">Four lines, one appetite</div><h2>The collections</h2></div></div>
      <div class="lines">${Object.entries(LINES).map(([k, l]) => `<a class="line-tile" href="#/shop?line=${k}"><img src="${img({ patisserie: "fraisier-1", glace: "drizzle-1", whipped: "macaron-1", laminated: "mille-1" }[k], 1)}" alt="" loading="lazy"><div><small>${l.season}</small><h3>${l.name}</h3></div></a>`).join("")}</div>
    </div></section>`;

  views.care = () => `
    <section class="page-head"><div class="wrap"><div class="kicker">Client care</div><h1>How can we help?</h1><p>Write to <a class="link" href="mailto:hello@eversi.co" style="text-transform:none;letter-spacing:0">hello@eversi.co</a> — the atelier answers every message personally, Sunday to Thursday.</p></div></section>
    <section class="wrap faq" style="padding-bottom:100px">
      <h3>Delivery</h3><div class="acc">
        <details><summary>How long does delivery take?</summary><div class="acc__body">Riyadh: same day for orders before 2 pm, otherwise next day. Rest of Saudi Arabia: 2–4 working days. GCC: 4–7 working days.</div></details>
        <details><summary>How much does delivery cost?</summary><div class="acc__body">Complimentary across the Kingdom on orders over 1,000 SAR. Otherwise standard delivery is 35 SAR and express is 75 SAR.</div></details>
        <details><summary>Can I send a gift directly to someone?</summary><div class="acc__body">Yes. Tick “Present it as a gift” on the product page and add a delivery address and message at checkout. We never include prices with a gift.</div></details>
      </div>
      <h3>Returns</h3><div class="acc">
        <details><summary>What is the returns policy?</summary><div class="acc__body">Unused pieces in their original Vault packaging may be returned within 14 days of delivery for a full refund to the original payment method. Personalised items are final sale.</div></details>
        <details><summary>How do I start a return?</summary><div class="acc__body">Email us your order reference. We’ll arrange a courier collection from your door at no charge.</div></details>
      </div>
      <h3>Caring for your piece</h3><div class="acc">
        <details><summary>Everyday care</summary><div class="acc__body">Keep it in its dust bag, lightly stuffed with tissue, away from sun and heat. Avoid perfume, oils and hand cream on the leather.</div></details>
        <details><summary>Lifetime atelier care</summary><div class="acc__body">Bring or send your piece to the Riyadh atelier for complimentary cleaning, conditioning and lacquer refresh. Repairs are quoted individually.</div></details>
      </div>
    </section>`;

  views.checkout = () => {
    if (!bag.length) return `<div class="wrap empty" style="padding-block:120px"><h2>Your bag is empty.</h2><p style="margin-bottom:24px">Find something sweet first.</p><a class="btn btn--solid" href="#/shop">Shop the vitrine</a></div>`;
    return `
    <div class="wrap"><nav class="crumbs"><a href="#/" >Home</a> / <span>Checkout</span></nav></div>
    <form class="wrap checkout" data-checkout novalidate>
      <div>
        <fieldset class="fieldset"><legend>Contact</legend><div class="form-grid">
          <label class="full">Email<input class="field" type="email" name="email" required autocomplete="email"></label>
          <label class="full">Mobile<input class="field" type="tel" name="phone" required placeholder="+966 5x xxx xxxx" autocomplete="tel"></label>
        </div></fieldset>
        <fieldset class="fieldset"><legend>Delivery</legend><div class="form-grid">
          <label>First name<input class="field" name="first" required autocomplete="given-name"></label>
          <label>Last name<input class="field" name="last" required autocomplete="family-name"></label>
          <label class="full">Address<input class="field" name="address" required placeholder="Street, building, district" autocomplete="street-address"></label>
          <label>City<select class="field" name="city" required>${["Riyadh", "Jeddah", "Dammam", "Khobar", "Makkah", "Madinah", "Abha", "Other — Saudi Arabia", "GCC"].map(c => `<option>${c}</option>`).join("")}</select></label>
          <label>National address code<input class="field" name="nac" placeholder="Optional · e.g. RRRD2929"></label>
        </div></fieldset>
        <fieldset class="fieldset"><legend>Delivery method</legend><div class="radio-list" data-ship>
          <label class="check"><input type="radio" name="ship" value="std" checked><div><b>Standard</b><small>Riyadh next day · Kingdom 2–4 days</small></div><span class="r" data-ship-std></span></label>
          <label class="check"><input type="radio" name="ship" value="exp"><div><b>Express</b><small>Riyadh same day before 2 pm · Kingdom 1–2 days</small></div><span class="r">${sar(SHIP_EXP)}</span></label>
          <label class="check"><input type="radio" name="ship" value="atelier"><div><b>Collect from the atelier</b><small>Riyadh · by appointment</small></div><span class="r">Free</span></label>
        </div></fieldset>
        ${bag.some(l => l.gift) ? `<fieldset class="fieldset"><legend>Gift message</legend><textarea class="field" name="message" maxlength="240" placeholder="Written by hand on our care card…" style="width:100%"></textarea></fieldset>` : ""}
        <fieldset class="fieldset"><legend>Payment</legend><div class="radio-list">
          ${[["mada", "mada debit card", "", ["mada"]], ["card", "Credit card", "Visa · Mastercard", ["visa", "mastercard"]], ["apple", "Apple Pay", "Face ID or Touch ID", ["applepay"]], ["tabby", "Tabby", "4 interest-free payments", ["tabby"]], ["tamara", "Tamara", "Split in 3 or 4, no fees", ["tamara"]]].map(([v, l, s, ic], i) => `<label class="check"><input type="radio" name="pay" value="${v}" ${i === 0 ? "checked" : ""}><div><b>${l}</b>${s ? `<small>${s}</small>` : ""}</div><span class="r pay">${payRow(ic)}</span></label>`).join("")}
        </div>
        <p class="notice" style="margin-top:14px">Preview store — no payment is taken. At launch these options hand off to the payment provider’s secure page.</p></fieldset>
        <button class="btn btn--solid btn--block" type="submit">Place order</button>
      </div>
      <aside class="summary" data-summary></aside>
    </form>`;
  };

  views.confirm = () => { const o = store.get("lastOrder", {}); return `
    <div class="wrap confirm">
      <svg class="seal" viewBox="0 0 100 100" aria-hidden="true"><use href="#star" style="fill:var(--gold)"/></svg>
      <div class="kicker c">Order received</div>
      <h1>The Vault is being prepared.</h1>
      <p>Thank you${o.name ? ", " + esc(o.name) : ""}. The atelier is wrapping your order now; a confirmation will follow by email and SMS with tracking once it leaves Riyadh.</p>
      ${o.ref ? `<span class="ref">Order ${esc(o.ref)}</span>` : ""}
      <p style="margin-top:36px"><a class="btn btn--ghost" href="#/shop">Continue browsing</a></p>
    </div>`; };

  views.notfound = () => `<div class="wrap empty" style="padding-block:120px"><h2>This shelf is empty.</h2><p style="margin-bottom:24px">The page you’re looking for has been eaten.</p><a class="btn btn--solid" href="#/">Back to the boutique</a></div>`;

  /* ---------- router ---------- */
  function route() {
    const raw = location.hash.slice(1) || "/";
    const [path, qs] = raw.split("?");
    const q = new URLSearchParams(qs || "");
    const parts = path.split("/").filter(Boolean);
    const name = parts[0] || "home";
    const view = views[name] || views.notfound;
    closeAll();
    main.innerHTML = `<div class="view-enter">${view(q, parts[1])}</div>`;
    document.title = titleFor(name, parts[1]);
    $$(".nav__links a").forEach(a => a.classList.toggle("on", a.dataset.nav === (name === "shop" && q.get("type") === "charm" ? "charm" : name)));
    window.scrollTo(0, 0);
    if (name === "checkout") renderSummary();
    observe();
  }
  function titleFor(name, slug) {
    const t = { home: "Eversi — Confectionery Leather Goods, Riyadh", shop: "Shop — Eversi", vault: "The Patisserie Vault — Eversi", atelier: "Atelier — Eversi", care: "Client Care — Eversi", wishlist: "Wishlist — Eversi", checkout: "Checkout — Eversi", confirm: "Thank you — Eversi" };
    return name === "product" && bySlug[slug] ? `${bySlug[slug].name} — Eversi` : t[name] || "Eversi";
  }

  /* ---------- reveal on scroll ---------- */
  let io;
  function observe() {
    io?.disconnect();
    io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    $$(".rv").forEach(el => io.observe(el));
  }

  /* ---------- bag ---------- */
  const subtotal = () => bag.reduce((s, l) => s + (bySlug[l.slug] ? priceOf(bySlug[l.slug]) : 0) * l.qty, 0);
  const saved = () => bag.reduce((s, l) => { const p = bySlug[l.slug]; return s + (p ? (p.price - priceOf(p)) * l.qty : 0); }, 0);
  const count = () => bag.reduce((s, l) => s + l.qty, 0);
  function addToBag(slug, colour, qty = 1, gift = false) {
    const p = bySlug[slug]; if (!p) return;
    colour = colour || p.colours[0].name;
    const ex = bag.find(l => l.slug === slug && l.colour === colour && l.gift === gift);
    ex ? (ex.qty += qty) : bag.push({ slug, colour, qty, gift });
    saveBag();
    toast(`${p.name} added to your bag`);
  }
  function saveBag() { bag = bag.filter(l => bySlug[l.slug] && l.qty > 0); store.set("bag", bag); renderBag(); if (location.hash.startsWith("#/checkout")) renderSummary(); }
  function renderBag() {
    $$("[data-bag-count]").forEach(e => e.textContent = count() || "");
    $$("[data-wish-count]").forEach(e => e.textContent = wish.size || "");
    const lines = $("[data-bag-lines]"), foot = $("[data-bag-foot]");
    if (!bag.length) {
      lines.innerHTML = `<div class="empty" style="padding:64px 0"><h2>Your bag is empty.</h2><p>The vitrine is full, though.</p></div>`;
      foot.innerHTML = `<a class="btn btn--solid btn--block" href="#/shop">Shop the vitrine</a>`;
      return;
    }
    lines.innerHTML = bag.map((l, i) => { const p = bySlug[l.slug]; return `
      <div class="line">
        <a href="#/product/${p.slug}"><img src="${img(p.images[0].src, 1)}" alt="" style="object-position:${p.images[0].pos}"></a>
        <div><h4>${esc(p.name)}</h4><small>${esc(l.colour)}${l.gift ? " · Gift wrapped" : ""}</small>
          <div class="qty"><button data-lq="${i}" data-d="-1" aria-label="Decrease">−</button><span>${l.qty}</span><button data-lq="${i}" data-d="1" aria-label="Increase">+</button></div>
          <button class="rm" data-rm="${i}">Remove</button></div>
        <div>${priceTag(p, l.qty)}</div>
      </div>`; }).join("");
    const st = subtotal(), left = Math.max(0, FREE_SHIP - st);
    foot.innerHTML = `
      <div class="progress">${left ? `You’re ${sar(left)} away from complimentary delivery.` : "Your order ships complimentary across the Kingdom."}<i><b style="width:${Math.min(100, st / FREE_SHIP * 100)}%"></b></i></div>
      <div class="totals"><div>Subtotal<small>${saved() ? `You save ${sar(saved())} with the handbag offer · ` : ""}VAT included</small></div>${sar(st)}</div>
      <a class="btn btn--solid btn--block" href="#/checkout">Checkout</a>
      <div class="pay pay--center" aria-label="Accepted payment methods">${payRow(undefined, "pay-ic pay-ic--sm")}</div>`;
  }
  function shippingCost() {
    const m = $("[data-checkout]")?.querySelector("input[name=ship]:checked")?.value || "std";
    if (m === "atelier") return 0;
    if (m === "exp") return SHIP_EXP;
    return subtotal() >= FREE_SHIP ? 0 : SHIP_STD;
  }
  function renderSummary() {
    const el = $("[data-summary]"); if (!el) return;
    if (!bag.length) { route(); return; }
    const st = subtotal(), sh = shippingCost(), total = st + sh, vat = Math.round(total - total / 1.15);
    const std = $("[data-ship-std]"); if (std) std.innerHTML = st >= FREE_SHIP ? "Free" : sar(SHIP_STD);
    el.innerHTML = `<h3>Your order</h3>
      ${bag.map(l => { const p = bySlug[l.slug]; return `<div class="line" style="grid-template-columns:64px 1fr auto"><img src="${img(p.images[0].src, 1)}" alt="" style="width:64px;height:80px;object-position:${p.images[0].pos}"><div><h4>${esc(p.name)}</h4><small>${esc(l.colour)} · Qty ${l.qty}${l.gift ? " · Gift" : ""}</small></div>${priceTag(p, l.qty)}</div>`; }).join("")}
      <div style="margin-top:16px">
        <div class="sum-row"><span>Subtotal</span>${sar(st + saved())}</div>
        ${saved() ? `<div class="sum-row save-row"><span>Handbag offer (10% off)</span><span>−${sar(saved())}</span></div>` : ""}
        <div class="sum-row"><span>Delivery</span>${sh ? sar(sh) : "<span>Free</span>"}</div>
        <div class="sum-row"><span>Patisserie Vault packaging</span><span>Included</span></div>
        <div class="sum-row total"><span>Total</span>${sar(total)}</div>
        <p class="note" style="margin-top:6px">Includes ${sar(vat)} VAT (15%).</p>
      </div>`;
  }

  /* ---------- wishlist ---------- */
  function toggleWish(slug) {
    wish.has(slug) ? wish.delete(slug) : wish.add(slug);
    store.set("wish", [...wish]);
    $$(`[data-wish="${slug}"]`).forEach(b => b.setAttribute("aria-pressed", wish.has(slug)));
    renderBag();
    if (location.hash.startsWith("#/wishlist")) route();
  }

  /* ---------- overlays ---------- */
  let lastFocus;
  function open(id) {
    closeAll(); lastFocus = document.activeElement;
    const el = $("#" + id); el.classList.add("open"); el.setAttribute("aria-hidden", "false");
    if (id !== "menu") $(".scrim").classList.add("open");
    document.body.classList.add("locked");
    if (id === "bag") { renderBag(); $(".toast").classList.remove("show"); }
    if (id === "search") { const i = $("[data-search-input]"); i.value = ""; runSearch(""); setTimeout(() => i.focus(), 50); }
    else setTimeout(() => el.querySelector("button,a")?.focus(), 50);
  }
  function closeAll() {
    $$(".drawer.open,.search.open,.mobile-menu.open").forEach(el => { el.classList.remove("open"); el.setAttribute("aria-hidden", "true"); });
    $(".scrim").classList.remove("open"); document.body.classList.remove("locked");
  }
  function runSearch(term) {
    term = term.trim().toLowerCase();
    const res = term ? P.filter(p => [p.name, p.short, p.desc, lineName(p.line), ...p.colours.map(c => c.name)].join(" ").toLowerCase().includes(term)) : P.filter(p => p.badge);
    $("[data-search-results]").innerHTML = res.length ? res.slice(0, 8).map(card).join("").replaceAll("card rv", "card") : `<p class="empty" style="grid-column:1/-1">Nothing matches “${esc(term)}”. Try “strawberry”, “charm” or “pistache”.</p>`;
  }

  let toastT;
  function toast(msg) {
    const t = $(".toast"); $("[data-toast-msg]").textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 3200);
  }

  /* ---------- theme ---------- */
  const themeBtn = $("[data-theme-toggle]");
  function applyTheme(t) {
    if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
    const dark = t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    themeBtn.querySelector("span").textContent = dark ? "Switch to light" : "Switch to dark";
  }
  applyTheme(store.get("theme", null));
  themeBtn.addEventListener("click", () => {
    const cur = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark"; store.set("theme", next); applyTheme(next);
  });

  /* ---------- events ---------- */
  document.addEventListener("click", e => {
    const t = e.target.closest("button,a"); if (!t) return;
    if (t.dataset.open) { e.preventDefault(); open(t.dataset.open); return; }
    if (t.hasAttribute("data-close")) { closeAll(); lastFocus?.focus?.(); return; }
    if (t.dataset.wish) { e.preventDefault(); toggleWish(t.dataset.wish); return; }
    if (t.dataset.add) { e.preventDefault(); addToBag(t.dataset.add); return; }
    if (t.dataset.rm !== undefined) { bag.splice(+t.dataset.rm, 1); saveBag(); return; }
    if (t.dataset.lq !== undefined) { bag[+t.dataset.lq].qty += +t.dataset.d; saveBag(); return; }
    const buy = t.closest("[data-buy]");
    if (buy) {
      if (t.dataset.colour) { $$("[data-colour]", buy).forEach(b => b.setAttribute("aria-pressed", b === t)); $("[data-colour-name]", buy).textContent = t.dataset.colour; }
      if (t.dataset.q) { const s = $("[data-qty]", buy); s.textContent = Math.max(1, Math.min(9, +s.textContent + +t.dataset.q)); }
      if (t.hasAttribute("data-add-pdp")) addToBag(buy.dataset.buy, $("[data-colour][aria-pressed=true]", buy)?.dataset.colour, +$("[data-qty]", buy).textContent, $("[data-gift]", buy).checked);
    }
    if (t.dataset.thumb !== undefined) {
      const p = bySlug[$("[data-buy]").dataset.buy], im = p.images[+t.dataset.thumb], m = $("[data-main]");
      m.src = img(im.src); m.style.objectPosition = im.pos;
      $$("[data-thumb]").forEach(b => b.setAttribute("aria-current", b === t));
    }
    if (t.tagName === "A" && t.getAttribute("href")?.startsWith("#")) closeAll();
  });
  document.addEventListener("click", e => {
    const z = e.target.closest("[data-zoom]"); if (!z) return;
    const im = $("img", z), r = z.getBoundingClientRect();
    if (!z.classList.contains("zoom")) im.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`;
    z.classList.toggle("zoom");
  });
  document.addEventListener("change", e => {
    if (e.target.matches("[data-sort]")) {
      const [path, qs] = location.hash.slice(1).split("?"); const q = new URLSearchParams(qs || "");
      e.target.value === "featured" ? q.delete("sort") : q.set("sort", e.target.value);
      location.hash = path + (q.toString() ? "?" + q : "");
    }
    if (e.target.name === "ship") renderSummary();
  });
  document.addEventListener("input", e => { if (e.target.matches("[data-search-input]")) runSearch(e.target.value); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAll();
    if (e.key === "Enter" && e.target.matches("[data-search-input]")) { const a = $("[data-search-results] a.card__name"); if (a) location.hash = a.getAttribute("href").slice(1); }
  });
  document.addEventListener("submit", e => {
    if (e.target.matches("[data-join]")) { e.preventDefault(); e.target.innerHTML = `<p class="notice" style="flex:1;text-align:center">Thank you — you’re on the Atelier List.</p>`; }
    if (e.target.matches("[data-checkout]")) {
      e.preventDefault();
      const f = e.target, bad = $$("[required]", f).filter(i => !i.checkValidity());
      $$(".field", f).forEach(i => i.style.borderColor = "");
      if (bad.length) { bad.forEach(i => i.style.borderColor = "var(--palette-coulis)"); bad[0].focus(); return; }
      const ref = "EV-" + Date.now().toString(36).toUpperCase().slice(-6);
      const name = f.first.value.trim();
      store.set("lastOrder", { ref, name });
      bag = []; saveBag();
      location.hash = "/confirm";
    }
  });
  window.addEventListener("hashchange", route);
  window.addEventListener("storage", e => { if (e.key === "eversi:bag") { bag = store.get("bag", []); renderBag(); } });

  $("[data-pay-row]").innerHTML = payRow();
  renderBag();
  route();
})();
