/* Eversi boutique — hash-routed single page store. No build step; open index.html via any static server.
   Bilingual: every string is written as L(english, arabic); product copy in Arabic lives in catalog-ar.js. */
(() => {
  const P = window.EVERSI_PRODUCTS, LINES = window.EVERSI_LINES, AR = window.EVERSI_AR || { products: {}, lines: {}, colours: {}, badges: {} };
  const bySlug = Object.fromEntries(P.map(p => [p.slug, p]));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const main = $("#main");
  const FREE_SHIP = 1000, SHIP_STD = 35, SHIP_EXP = 75;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- storage (per-browser convenience only) ---------- */
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem("eversi:" + k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("eversi:" + k, JSON.stringify(v)); } catch {} }
  };
  let bag = store.get("bag", []);           // [{slug, colour, qty, gift}] — colour is stored by its English name
  let wish = new Set(store.get("wish", []));
  let lang = store.get("lang", "en");

  /* ---------- language ---------- */
  const isAr = () => lang === "ar";
  const L = (en, ar) => isAr() ? ar : en;
  const tx = (p, f) => (isAr() && AR.products[p.slug]?.[f]) || p[f];          // product field in the current language
  const cn = name => (isAr() && AR.colours[name]) || name;                       // colour name
  const lineName = k => (isAr() && AR.lines[k]?.name) || LINES[k]?.name || "";
  const lineSeason = k => (isAr() && AR.lines[k]?.season) || LINES[k]?.season || "";
  const lineBlurb = k => (isAr() && AR.lines[k]?.blurb) || LINES[k]?.blurb || "";
  const badgeName = b => (isAr() && AR.badges[b]) || b;
  const locale = () => isAr() ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB";

  /* ---------- helpers ---------- */
  const sar = n => `<span class="price"><svg class="sar" aria-label="SAR"><use href="#sar"/></svg>${Number(n).toLocaleString("en-US")}</span>`;
  const priceOf = p => p.discount ? Math.round(p.price * (100 - p.discount) / 100) : p.price;
  const priceTag = (p, qty = 1) => p.discount ? `<span class="price-tag">${sar(priceOf(p) * qty)}<s>${sar(p.price * qty)}</s></span>` : sar(p.price * qty);
  const img = (name, sm) => `assets/img/${name}${sm ? "-sm" : ""}.jpg`;
  const heart = () => `<svg viewBox="0 0 24 24"><use href="#i-heart"/></svg>`;
  const deliveryBy = () => { const d = new Date(); d.setDate(d.getDate() + 1); while ([5, 6].includes(d.getDay())) d.setDate(d.getDate() + 1); return d.toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long" }); };
  const PAY = { mada: "mada", visa: "Visa", mastercard: "Mastercard", applepay: "Apple Pay", tabby: "Tabby", tamara: "Tamara" };
  const payIcon = (k, cls = "pay-ic") => `<svg class="${cls}" viewBox="0 0 60 38" role="img" aria-label="${PAY[k]}"><use href="#pay-${k}"/></svg>`;
  const payRow = (keys = Object.keys(PAY), cls) => keys.map(k => payIcon(k, cls)).join("");

  function card(p) {
    const a = p.images[0], b = p.images[1], name = esc(tx(p, "name"));
    const tags = (p.badge || p.discount) ? `<div class="card__tags">${p.badge ? `<span class="card__tag ${p.badge === "Signature" ? "card__tag--sig" : ""}">${badgeName(p.badge)}</span>` : ""}${p.discount ? `<span class="card__tag card__tag--sale">−${p.discount}%</span>` : ""}</div>` : "";
    return `<article class="card rv">
      <a class="card__media" href="#/product/${p.slug}" aria-label="${name}">
        <img src="${img(a.src, 1)}" alt="${name}" loading="lazy" style="object-position:${a.pos}">
        ${b ? `<img class="alt" src="${img(b.src, 1)}" alt="" loading="lazy" style="object-position:${b.pos}">` : ""}
      </a>
      <button class="card__wish" data-wish="${p.slug}" aria-pressed="${wish.has(p.slug)}" aria-label="${L("Save to wishlist", "أضف إلى المفضّلة")}">${heart()}</button>
      <button class="card__quick" data-add="${p.slug}">${L("Add to bag", "أضف إلى السلة")}</button>
      <div class="card__body">
        ${tags}
        <a class="card__name" href="#/product/${p.slug}">${name}</a>
        <span class="card__short">${esc(tx(p, "short"))}</span>
        <div class="card__row">${priceTag(p)}<span class="dots">${p.colours.map(c => `<i style="background:${c.hex}" title="${esc(cn(c.name))}"></i>`).join("")}</span></div>
      </div>
    </article>`;
  }

  /* campaign pair: two portrait photographs, each captioned underneath with the piece it shows */
  const duo = items => `<section class="duo"><div class="wrap duo__grid">${items.map(([slug, im, pos]) => {
    const p = bySlug[slug], name = esc(tx(p, "name"));
    return `<a class="duo__item rv" href="#/product/${slug}"><span class="duo__img"><img src="${img(im)}" alt="${name}" loading="lazy" style="object-position:${pos || "50% 50%"}"></span><span class="duo__cap"><span><small>${lineName(p.line)}</small><b>${name}</b></span>${priceTag(p)}</span></a>`;
  }).join("")}</div></section>`;

  /* ---------- views ---------- */
  const views = {};

  views.home = () => {
    const newIn = P.filter(p => p.badge && p.type === "bag").slice(0, 4);
    const sig = ["fraisier", "chantilly-cupcake", "glazed-ring", "macaron", "eclair", "clementine"].map(s => bySlug[s]);
    const charms = P.filter(p => p.type === "charm").slice(0, 4);
    const flavours = L("Fraisier,Pistache,Chantilly,Toffee,Clementine,Mille-feuille,Lavande,Ganache,Cerise,Sorbet", "فريزييه,فستق,شانتيي,توفي,كليمنتين,ميلفاي,لافندر,غاناش,كرز,سوربيه").split(",");
    const tiles = [["patisserie", "fraisier-1"], ["glace", "sorbet-1"], ["whipped", "toffee-1"], ["laminated", "mille-1"]];
    return `
    <section class="hero">
      <div class="hero__copy">
        <div class="kicker">${L("Confectionery Luxury · Riyadh", "فخامة الحلويات · الرياض")}</div>
        <h1>${L("Leather, baked to <em>satisfy</em> a craving.", "جلدٌ يُخبز <em>ليُشبع</em> الشهيّة.")}</h1>
        <p class="hero__sub">${L("Handbags and minaudières shaped like the pâtisserie case — rolled dough, poured ganache, piped crème — made to be wanted on sight and kept for a lifetime.", "حقائب يد وميناديير مستوحاة من واجهة الحلويات — عجين مفرود، وغاناش منسكب، وكريمة مزيّنة — تُشتهى من النظرة الأولى وتبقى مدى العمر.")}</p>
        <div class="hero__cta"><a class="btn btn--solid" href="#/shop">${L("Shop the vitrine", "تسوّق الآن")}</a><a class="btn btn--ghost" href="#/product/clementine">${L("Meet The Clementine", "اكتشف كليمنتين")}</a></div>
      </div>
      <div class="hero__media">
        <img src="${img("clementine-floating")}" alt="${L("The Clementine bag floating among fresh clementines and leaves", "حقيبة كليمنتين معلّقة في الهواء بين حبّات اليوسفي وأوراقها")}" fetchpriority="high">
      </div>
    </section>
    <div class="marquee" aria-hidden="true"><div class="marquee__track">${[...flavours, ...flavours].map(f => `<span>${f}</span>`).join("")}</div></div>
    ${duo([["clementine", "cam-clem-teal", "50% 55%"], ["sorbet-mini", "cam-sorbet-chair", "35% 50%"]])}

    <section class="section"><div class="wrap">
      <div class="sec-head rv"><div><div class="kicker">${L("Fresh from the atelier", "طازجة من المشغل")}</div><h2>${L("New arrivals", "وصل حديثًا")}</h2></div><a class="link" href="#/shop?sort=new">${L("Shop all new", "كل الجديد")}</a></div>
      <div class="grid">${newIn.map(card).join("")}</div>
    </div></section>

    <section class="section" style="padding-top:0"><div class="wrap">
      <div class="sec-head rv"><div><div class="kicker">${L("Four material languages", "أربع لغات من الجلد")}</div><h2>${L("Shop by line", "تسوّق حسب الخط")}</h2></div></div>
      <div class="lines">${tiles.map(([k, im]) => `<a class="line-tile rv" href="#/shop?line=${k}"><span class="line-tile__img"><img src="${img(im, 1)}" alt="" loading="lazy"></span><div><small>${lineSeason(k)}</small><h3>${lineName(k)}</h3></div></a>`).join("")}</div>
    </div></section>

    ${duo([["fraisier", "cam-fraisier-navy", "50% 45%"], ["eclair", "cam-eclair-car", "50% 45%"]])}

    <section class="section band"><div class="wrap" style="text-align:center">
      <div class="kicker c">${L("The core obsession", "الشغف الأساسي")}</div>
      <p class="quote rv" style="color:var(--palette-vellum)">${L("A handbag treated the way a pâtissier treats a gâteau: volume, sheen and touch are the argument — not a logo.", "حقيبة تُعامَل كما يعامل الحلواني كعكته: الامتلاء واللمعة والملمس هي الحجّة — لا الشعار.")}</p>
      <div class="pillars rv" style="text-align:start">
        <div><h4>${L("Visual satiation", "شبعٌ بالنظر")}</h4><p>${L("Every silhouette begins as a study in appetite — the pull a dessert case has before you’ve tasted anything.", "كل تصميم يبدأ كدراسة في الشهيّة — تلك الجاذبية التي تملكها واجهة الحلويات قبل أن تتذوّق شيئًا.")}</p></div>
        <div><h4>${L("Leathercraft first", "الحِرفة أولًا")}</h4><p>${L("Hand-set studs, hand-painted crème, stitched layers. Craft is the status symbol; the wordmark stays quiet.", "مسامير مثبّتة يدويًا، وكريمة مرسومة باليد، وطبقات مخيطة. الحِرفة هي رمز المكانة، والشعار يبقى هادئًا.")}</p></div>
        <div><h4>${L("Heirloom, not trend", "إرثٌ لا موضة")}</h4><p>${L("Built to feel delicious season after season, and made to be repaired rather than replaced.", "صُنعت لتبقى شهيّة موسمًا بعد موسم، ولتُصلَح لا لتُستبدَل.")}</p></div>
        <div><h4>${L("Made for Riyadh", "صُنعت للرياض")}</h4><p>${L("Designed in the Riyadh atelier for café terraces, vernissages and long, unhurried dinners.", "صُمّمت في مشغل الرياض لشرفات المقاهي، وافتتاحيات المعارض، والعشاءات الطويلة الهادئة.")}</p></div>
      </div>
    </div></section>

    <section class="section"><div class="wrap">
      <div class="sec-head rv"><div><div class="kicker">${L("The vitrine", "الواجهة")}</div><h2>${lineName("patisserie")}</h2><p>${L("Our most theatrical pieces — minaudières modelled on the pastry case itself.", "أكثر قطعنا مسرحيةً — ميناديير منحوتة على هيئة واجهة الحلويات نفسها.")}</p></div><a class="link" href="#/shop?line=patisserie">${L("View the line", "عرض الخط")}</a></div>
      <div class="grid grid--3">${sig.map(card).join("")}</div>
    </div></section>

    ${duo([["clementine", "cam-clem-orchard", "50% 60%"], ["strawberry-drizzle", "cam-drizzle-car", "50% 55%"]])}

    <section class="section" style="border-top:1px solid var(--hairline)"><div class="wrap split">
      <div class="split__media rv"><img src="${img("pack-hatbox")}" alt="${L("Pink velvet hatbox tied with a ganache ribbon", "علبة قبّعة مخملية وردية مربوطة بشريط بلون الغاناش")}" loading="lazy" style="object-position:50% 60%"></div>
      <div class="split__copy rv">
        <div class="kicker">${L("The Patisserie Vault", "صندوق الباتيسري")}</div>
        <h2>${L("Opened like a box of rare pastries.", "يُفتح كعلبة حلويات نادرة.")}</h2>
        <p>${L("Every order arrives in a rigid drop-front box, wrapped in crisp glassine and tied with heavy grosgrain — with a cotton dust bag, a handwritten care card and, for the Fraisier, its own velvet hatbox.", "يصل كل طلب في صندوق صلب بواجهة تنفتح للأمام، ملفوفًا بورق الغلاسين ومربوطًا بشريط غروغران — مع كيس قطني للحفظ، وبطاقة عناية مكتوبة باليد، ولحقيبة فريزييه علبة قبّعة مخملية خاصة بها.")}</p>
        <div class="mosaic"><img src="${img("pack-gift", 1)}" alt="${L("Gift box tied with Eversi ribbon", "علبة هدية مربوطة بشريط Eversi")}" loading="lazy"><img src="${img("pack-box", 1)}" alt="${L("Drop-front Eversi box", "صندوق Eversi")}" loading="lazy"></div>
        <a class="link" href="#/vault" style="align-self:flex-start">${L("Discover the ritual", "اكتشف الطقس")}</a>
      </div>
    </div></section>

    <section class="section"><div class="wrap">
      <div class="sec-head rv"><div><div class="kicker">${L("Finishing touches", "اللمسات الأخيرة")}</div><h2>${L("Bag charms", "تعليقات الحقائب")}</h2><p>${L("Small sweets in stitched leather. Clip one on, or start a collection.", "حلويات صغيرة من الجلد المخيط. علّق واحدة، أو ابدأ مجموعتك.")}</p></div><a class="link" href="#/shop?type=charm">${L("All charms", "كل التعليقات")}</a></div>
      <div class="grid">${charms.map(card).join("")}</div>
    </div></section>

    <section class="section" style="border-top:1px solid var(--hairline)"><div class="wrap join rv">
      <div class="kicker c">${L("The Atelier List", "قائمة المشغل")}</div>
      <h2>${L("First taste of every drop.", "أول من يتذوّق كل إصدار.")}</h2>
      <p>${L("Private previews, early access to limited pieces and invitations to Riyadh trunk shows. No countdowns, no noise — a letter when there’s something worth opening.", "عروض خاصة، ووصول مبكر للقطع المحدودة، ودعوات لمعارض الرياض. بلا عدّ تنازلي ولا ضجيج — رسالة فقط حين يكون هناك ما يستحق.")}</p>
      <form data-join><input class="field" type="email" required placeholder="${L("Your email address", "بريدك الإلكتروني")}" aria-label="${L("Email address", "البريد الإلكتروني")}"><button class="btn btn--solid">${L("Join the list", "انضم إلى القائمة")}</button></form>
    </div></section>`;
  };

  views.shop = (q) => {
    const type = q.get("type") || "", line = q.get("line") || "", sort = q.get("sort") || "featured";
    let list = P.filter(p => (!type || p.type === type) && (!line || p.line === line));
    if (sort === "low") list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "high") list = [...list].sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === "new") list = [...list].sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
    const title = line ? lineName(line) : type === "charm" ? L("Bag charms", "تعليقات الحقائب") : type === "bag" ? L("Handbags", "حقائب اليد") : L("The vitrine", "الواجهة");
    const blurb = line ? lineBlurb(line) : type === "charm" ? L("Small sweets in stitched leather, made to clip onto any handle.", "حلويات صغيرة من الجلد المخيط، تُعلَّق على أي مقبض.") : L("Every piece in the house — handbags, minaudières and charms, shaped by the pâtisserie case.", "كل قطع الدار — حقائب يد وميناديير وتعليقات، مستوحاة من واجهة الحلويات.");
    const keep = sort !== "featured" ? sort : "";
    const qs = (o) => { const u = new URLSearchParams(); Object.entries(o).forEach(([k, v]) => v && u.set(k, v)); const s = u.toString(); return s ? "?" + s : ""; };
    const tabs = [
      [L("All", "الكل"), "clementine-1", qs({ sort: keep }), !type && !line],
      [L("Handbags", "حقائب اليد"), "drizzle-1", qs({ type: "bag", sort: keep }), type === "bag" && !line],
      [L("Charms", "التعليقات"), "c-fraisier", qs({ type: "charm", sort: keep }), type === "charm" && !line],
      ...Object.keys(LINES).map(k => [lineName(k), { patisserie: "fraisier-1", glace: "sorbet-1", whipped: "toffee-1", laminated: "mille-1" }[k], qs({ line: k, sort: keep }), line === k])
    ];
    const cols = store.get("cols", 3);
    const colBtn = n => `<button class="view-btn" data-cols="${n}" aria-pressed="${cols === n}" aria-label="${L(`${n} per row`, `${n} في الصف`)}"><svg viewBox="0 0 ${n * 6 - 2} 10" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<rect x="${i * 6}" width="4" height="10" rx="1"/>`).join("")}</svg></button>`;
    const n = list.length;
    return `
    <section class="page-head"><div class="wrap">
      <div class="kicker">${line ? lineSeason(line) : L("Shop", "المتجر")}</div><h1>${title}</h1><p>${blurb}</p>
    </div></section>
    <nav class="petits" aria-label="${L("Browse by line", "تصفّح حسب الخط")}"><div class="petits__row">
      ${tabs.map(([label, im, href, on]) => `<a class="petit" href="#/shop${href}" aria-current="${on ? "page" : "false"}"><span class="petit__img"><img src="${img(im, 1)}" alt="" loading="lazy"></span><span class="petit__label">${label}</span></a>`).join("")}
    </div></nav>
    <div class="toolbar"><div class="wrap">
      <p class="result-count">${L(`${n} piece${n === 1 ? "" : "s"}`, `${n} ${n === 1 ? "قطعة" : n === 2 ? "قطعتان" : n <= 10 ? "قطع" : "قطعة"}`)}</p>
      <div class="toolbar__right">
        <div class="view-toggle" role="group" aria-label="${L("Products per row", "عدد المنتجات في الصف")}">${[2, 3, 4].map(colBtn).join("")}</div>
        <select class="field sort" data-sort aria-label="${L("Sort products", "ترتيب المنتجات")}">
          ${[["featured", L("Featured", "المميّزة")], ["new", L("New in", "الأحدث")], ["low", L("Price, low to high", "السعر: من الأقل")], ["high", L("Price, high to low", "السعر: من الأعلى")]].map(([v, l]) => `<option value="${v}" ${v === sort ? "selected" : ""}>${l}</option>`).join("")}
        </select>
      </div>
    </div></div>
    <section class="wrap" style="padding-block:36px 120px">
      ${n ? `<div class="grid c${cols}" data-shop-grid>${list.map(card).join("")}</div>` : `<div class="empty"><h2>${L("Nothing in this case yet.", "لا شيء في هذه الواجهة بعد.")}</h2><p>${L("Try another line.", "جرّب خطًا آخر.")}</p></div>`}
    </section>`;
  };

  views.product = (q, slug) => {
    const p = bySlug[slug];
    if (!p) return views.notfound();
    const related = P.filter(x => x.slug !== p.slug && (p.type === "bag" ? x.type === "charm" : x.type === "bag")).slice(0, 4);
    const multi = p.images.length > 1, name = esc(tx(p, "name"));
    return `
    <div class="wrap">
      <nav class="crumbs" aria-label="${L("Breadcrumb", "مسار التنقّل")}"><a href="#/shop">${L("Shop", "المتجر")}</a> / <a href="#/shop?line=${p.line}">${lineName(p.line)}</a> / <span>${name}</span></nav>
      <div class="pdp">
        <div class="gallery ${multi ? "" : "gallery--single"}">
          ${multi ? `<div class="gallery__thumbs">${p.images.map((im, i) => `<button data-thumb="${i}" aria-current="${i === 0}" aria-label="${L("View image", "عرض الصورة")} ${i + 1}"><img src="${img(im.src, 1)}" alt="" style="object-position:${im.pos}"></button>`).join("")}</div>` : ""}
          <div class="gallery__main">
            <div class="gallery__track" data-track>${p.images.map((im, i) => `<figure class="gallery__slide" data-zoom><img src="${img(im.src)}" alt="${i ? "" : name}" ${i ? 'loading="lazy"' : ""} style="object-position:${im.pos}"></figure>`).join("")}</div>
            ${multi ? `<button class="gallery__nav gallery__nav--prev" data-slide="-1" aria-label="${L("Previous image", "الصورة السابقة")}">‹</button><button class="gallery__nav gallery__nav--next" data-slide="1" aria-label="${L("Next image", "الصورة التالية")}">›</button><span class="gallery__count" data-count>1 / ${p.images.length}</span>` : ""}
          </div>
        </div>
        <div class="buy" data-buy="${p.slug}">
          <div>
            <div class="kicker" style="margin-bottom:14px">${lineName(p.line)}</div>
            <h1>${name}</h1>
            <div style="margin-top:14px">${priceTag(p)}${p.discount ? `<span class="save">${L(`Save ${p.discount}%`, `وفّر ${p.discount}%`)}</span>` : ""}<div class="vat">${L("VAT included", "شامل ضريبة القيمة المضافة")}</div>
            <div class="bnpl">${payRow(["tabby", "tamara"], "pay-ic pay-ic--sm")}<span>${L("or 4 interest-free payments of", "أو 4 دفعات بدون فوائد، كل دفعة")} ${sar(Math.ceil(priceOf(p) / 4))}</span></div></div>
            <p class="eta"><svg aria-hidden="true"><use href="#i-truck"/></svg><span>${L("Order today — delivered in Riyadh by", "اطلب اليوم — يصلك في الرياض")} <b>${deliveryBy()}</b></span></p>
          </div>
          <p class="lede">${esc(tx(p, "desc"))}</p>
          <div>
            <div class="opt-label">${L("Colour", "اللون")} <b data-colour-name>${esc(cn(p.colours[0].name))}</b></div>
            <div class="swatches">${p.colours.map((c, i) => `<button class="swatch" style="background:${c.hex}" data-colour="${esc(c.name)}" aria-pressed="${i === 0}" aria-label="${esc(cn(c.name))}"></button>`).join("")}</div>
            ${dims(p) ? `<div class="scale-links"><button class="scale-link" data-open="scale" data-view="body"><svg aria-hidden="true"><use href="#i-ruler"/></svg>${L("See it to scale", "شاهد المقاس على الجسم")}</button>${p.type === "bag" ? `<button class="scale-link" data-open="scale" data-view="fits"><svg aria-hidden="true"><use href="#i-bag"/></svg>${L("What fits inside", "ماذا تتّسع الحقيبة")}</button>` : ""}</div>` : ""}
            ${p.type === "bag" && dims(p) ? `<p class="holds"><span>${L("Holds", "تتّسع لـ")}</span> ${holds(p).map(itemName).join(" · ") || L("small essentials", "الأساسيات الصغيرة")}</p>` : ""}
          </div>
          <label class="check"><input type="checkbox" data-gift><div><b>${L("Present it as a gift", "قدّمها كهدية")}</b><small>${L("Glassine, grosgrain ribbon and a handwritten card — complimentary. Prices are hidden on the packing slip.", "ورق غلاسين، وشريط غروغران، وبطاقة مكتوبة باليد — مجانًا. ولا تظهر الأسعار في إيصال الطلب.")}</small></div></label>
          <div class="buy__row">
            <div class="qty"><button data-q="-1" aria-label="${L("Decrease quantity", "إنقاص الكمية")}">−</button><span data-qty>1</span><button data-q="1" aria-label="${L("Increase quantity", "زيادة الكمية")}">+</button></div>
            <button class="btn btn--solid" data-add-pdp>${L("Add to bag", "أضف إلى السلة")}</button>
            <button class="wish-lg" data-wish="${p.slug}" aria-pressed="${wish.has(p.slug)}" aria-label="${L("Save to wishlist", "أضف إلى المفضّلة")}">${heart()}</button>
          </div>
          <ul class="assure">
            <li><svg aria-hidden="true"><use href="#i-gift"/></svg>${L("Gift-wrapped in the Patisserie Vault", "مغلّفة كهدية في صندوق الباتيسري")}</li>
            <li><svg aria-hidden="true"><use href="#i-truck"/></svg>${L("Complimentary delivery over 1,000 SAR", "توصيل مجاني للطلبات فوق 1,000 ريال")}</li>
            <li><svg aria-hidden="true"><use href="#i-return"/></svg>${L("14-day returns, collected from your door", "استرجاع خلال 14 يومًا، نستلمه من بابك")}</li>
            <li><svg aria-hidden="true"><use href="#i-lock"/></svg>${L("Secure checkout · mada, Apple Pay, Tabby, Tamara", "دفع آمن · مدى، Apple Pay، تابي، تمارا")}</li>
          </ul>
          <div class="acc">
            <details open><summary>${L("Details", "التفاصيل")}</summary><div class="acc__body"><ul>${tx(p, "details").map(d => `<li>${esc(d)}</li>`).join("")}</ul></div></details>
            <details><summary>${L("Care", "العناية")}</summary><div class="acc__body">${L("Store in the cotton dust bag, stuffed lightly with tissue to keep its shape. Keep away from direct sun, heat and perfume. Blot spills at once with a dry cloth. Lacquered and painted elements should never be wiped with solvents — bring them to the atelier for a complimentary refresh.", "احفظها في كيسها القطني، محشوّة بخفّة بورق ناعم لتحافظ على شكلها. أبعدها عن الشمس المباشرة والحرارة والعطور. امسح أي انسكاب فورًا بقطعة قماش جافة. لا تُمسح الأجزاء الملمّعة والمرسومة بأي مذيبات — أحضرها إلى المشغل لتجديدها مجانًا.")}</div></details>
            <details><summary>${L("Delivery &amp; returns", "التوصيل والاسترجاع")}</summary><div class="acc__body">${L("Riyadh: same or next day. Rest of the Kingdom: 2–4 working days. GCC: 4–7 working days. Returns accepted within 14 days, unused and in original packaging. Personalised pieces are final sale.", "الرياض: في اليوم نفسه أو التالي. باقي مناطق المملكة: 2–4 أيام عمل. دول الخليج: 4–7 أيام عمل. نقبل الاسترجاع خلال 14 يومًا للقطع غير المستخدمة وفي تغليفها الأصلي. القطع المخصّصة غير قابلة للاسترجاع.")}</div></details>
          </div>
        </div>
      </div>
    </div>
    <section class="section" style="border-top:1px solid var(--hairline)"><div class="wrap">
      <div class="sec-head"><div><div class="kicker">${p.type === "bag" ? L("Complete the box", "أكمل الصندوق") : L("Something to clip it to", "حقيبة تُعلَّق عليها")}</div><h2>${p.type === "bag" ? L("Pair it with a charm", "أضف إليها تعليقة") : L("Handbags", "حقائب اليد")}</h2></div></div>
      <div class="grid">${related.map(card).join("")}</div>
    </div></section>`;
  };

  views.wishlist = () => {
    const list = P.filter(p => wish.has(p.slug));
    return `<section class="page-head"><div class="wrap"><div class="kicker">${L("Saved for later", "محفوظة لوقت لاحق")}</div><h1>${L("Your wishlist", "المفضّلة")}</h1><p>${L("Pieces you’ve set aside. They’ll be waiting here on this device.", "القطع التي اخترتها. ستبقى هنا بانتظارك على هذا الجهاز.")}</p></div></section>
    <section class="wrap" style="padding:40px var(--gutter) 100px">${list.length ? `<div class="grid">${list.map(card).join("")}</div>` : `<div class="empty"><h2>${L("Nothing saved yet.", "لا توجد قطع محفوظة بعد.")}</h2><p style="margin-bottom:24px">${L("Tap the heart on any piece to keep it here.", "اضغط على القلب في أي قطعة لحفظها هنا.")}</p><a class="btn btn--solid" href="#/shop">${L("Browse the vitrine", "تصفّح الواجهة")}</a></div>`}</section>`;
  };

  views.vault = () => `
    <section class="page-head"><div class="wrap"><div class="kicker">${L("The Parisian unboxing ritual", "طقس الفتح الباريسي")}</div><h1>${L("The Patisserie Vault", "صندوق الباتيسري")}</h1><p>${L("Unboxing an Eversi piece should feel like opening a bespoke box of rare pastries. Every layer is part of the order — and every layer is complimentary.", "فتح قطعة من Eversi يجب أن يشبه فتح علبة حلويات نادرة صُنعت لك خصيصًا. كل طبقة جزء من الطلب — وكل طبقة مجانية.")}</p></div></section>
    <section class="section"><div class="wrap split">
      <div class="split__media rv"><img src="${img("pack-box")}" alt="${L("Coulis drop-front box with gold foil wordmark", "صندوق بلون الكولي مع شعار مذهّب")}" loading="lazy"></div>
      <div class="split__copy rv"><div class="kicker">${L("01 — The box", "01 — الصندوق")}</div><h2>${L("A drop-front drawer, revealed horizontally.", "درج تنفتح واجهته للأمام، فتظهر القطعة ممدّدة.")}</h2><p>${L("Rigid board wrapped in Coulis paper with a gold-foil wordmark. The front drops away so the piece slides out lying down — the way a pâtissier presents a tart.", "كرتون صلب مغلّف بورق بلون الكولي وشعار مذهّب. تنفتح الواجهة فتنزلق القطعة ممدّدة — كما يقدّم الحلواني فطيرته.")}</p></div>
    </div></section>
    <section class="section" style="padding-top:0"><div class="wrap split split--rev">
      <div class="split__media rv"><img src="${img("pack-gift")}" alt="${L("Box wrapped in cream paper with Eversi ribbon", "صندوق ملفوف بورق كريمي وشريط Eversi")}" loading="lazy"></div>
      <div class="split__copy rv"><div class="kicker">${L("02 — The wrap", "02 — التغليف")}</div><h2>${L("Glassine, grosgrain and a handwritten card.", "غلاسين، وغروغران، وبطاقة مكتوبة باليد.")}</h2><p>${L("Choose “Present it as a gift” and we wrap in crisp glassine, tie it in our Coulis grosgrain and write your message by hand. Prices never appear on a gift’s packing slip.", "اختر «قدّمها كهدية» وسنغلّفها بورق الغلاسين، ونربطها بشريط الغروغران بلون الكولي، ونكتب رسالتك باليد. ولا تظهر الأسعار أبدًا في إيصال الهدية.")}</p></div>
    </div></section>
    <section class="section" style="padding-top:0"><div class="wrap split">
      <div class="split__media rv"><img src="${img("pack-dust")}" alt="${L("Cream cotton dust bag with Coulis drawstrings", "كيس قطني كريمي بأربطة بلون الكولي")}" loading="lazy"></div>
      <div class="split__copy rv"><div class="kicker">${L("03 — The keeping", "03 — الحفظ")}</div><h2>${L("A dust bag for every piece. A hatbox for the Fraisier.", "كيس حفظ لكل قطعة، وعلبة قبّعة لفريزييه.")}</h2><p>${L("Heavy cotton with Coulis drawstrings keeps leather breathing between outings. Our signature minaudière arrives in its own pink velvet hatbox, made to live on a dressing table.", "قطن سميك بأربطة بلون الكولي يترك الجلد يتنفّس بين المشاوير. وتصل الميناديير الأشهر لدينا في علبة قبّعة مخملية وردية خاصة بها، صُنعت لتبقى على طاولة الزينة.")}</p><a class="btn btn--solid" href="#/shop" style="align-self:flex-start">${L("Shop the vitrine", "تسوّق الآن")}</a></div>
    </div></section>`;

  views.atelier = () => `
    <section class="page-head"><div class="wrap"><div class="kicker">${L("Riyadh · Founded 2026", "الرياض · تأسست 2026")}</div><h1>${L("Shaped to satisfy cravings through sight and touch alone.", "صُمّمت لتُشبع الشهيّة بالنظر واللمس وحدهما.")}</h1></div></section>
    <section class="section"><div class="wrap split">
      <div class="split__media rv"><img src="${img("leather")}" alt="${L("Close-up of grained leather with a debossed Eversi wordmark", "لقطة قريبة لجلد محبّب عليه شعار Eversi محفور")}" loading="lazy"></div>
      <div class="split__copy rv"><div class="kicker">${L("The house", "الدار")}</div><h2>${L("Away from cold minimalism.", "بعيدًا عن البساطة الباردة.")}</h2>
        <p>${L("Eversi is a house of leather goods built the way a pâtissier builds a gâteau. We move toward rich, voluptuous silhouettes inspired by rolled dough, warm ganache and poured creams — pieces with volume, sheen and something you want to touch.", "Eversi دار للمنتجات الجلدية تُبنى كما يبني الحلواني كعكته. نتّجه نحو تصاميم غنية ممتلئة مستوحاة من العجين المفرود والغاناش الدافئ والكريمة المنسكبة — قطع لها امتلاء ولمعة وشيء يدعوك للمسها.")}</p>
        <p>${L("Stitching, quilting and lamination do the talking. The wordmark stays small and quiet; craft is the only status symbol we use.", "الخياطة والتبطين والطبقات هي التي تتكلّم. الشعار يبقى صغيرًا وهادئًا، والحِرفة هي رمز المكانة الوحيد لدينا.")}</p></div>
    </div></section>
    <section class="section band"><div class="wrap">
      <div class="kicker">${L("Who we make for", "لمن نصنع")}</div>
      <div class="pillars" style="grid-template-columns:repeat(3,1fr);margin-top:28px">
        <div><h4>${L("Expressive", "معبّرة")}</h4><p>${L("Getting dressed is a daily sensory pleasure, not a uniform.", "ترى في اختيار ملابسها متعة حسّية يومية، لا زيًّا موحّدًا.")}</p></div>
        <div><h4>${L("Unhurried", "على مهل")}</h4><p>${L("Found at café terraces, gallery vernissages and intimate dinners.", "تجدها على شرفات المقاهي، وفي افتتاحيات المعارض، والعشاءات الهادئة.")}</p></div>
        <div><h4>${L("Heirloom-minded", "تقتني لتبقى")}</h4><p>${L("Invests in pieces that feel delicious season after season.", "تستثمر في قطع تبقى شهيّة موسمًا بعد موسم.")}</p></div>
      </div>
    </div></section>
    <section class="section"><div class="wrap">
      <div class="sec-head"><div><div class="kicker">${L("Four lines, one appetite", "أربعة خطوط، شهيّة واحدة")}</div><h2>${L("The collections", "المجموعات")}</h2></div></div>
      <div class="lines">${Object.keys(LINES).map(k => `<a class="line-tile" href="#/shop?line=${k}"><span class="line-tile__img"><img src="${img({ patisserie: "fraisier-1", glace: "drizzle-1", whipped: "macaron-1", laminated: "mille-1" }[k], 1)}" alt="" loading="lazy"></span><div><small>${lineSeason(k)}</small><h3>${lineName(k)}</h3></div></a>`).join("")}</div>
    </div></section>`;

  views.care = () => `
    <section class="page-head"><div class="wrap"><div class="kicker">${L("Client care", "خدمة العملاء")}</div><h1>${L("How can we help?", "كيف نساعدك؟")}</h1><p>${L("Write to", "راسلنا على")} <a class="link" href="mailto:hello@eversi.co" style="text-transform:none;letter-spacing:0">hello@eversi.co</a> ${L("— the atelier answers every message personally, Sunday to Thursday.", "— يردّ المشغل على كل رسالة شخصيًا، من الأحد إلى الخميس.")}</p></div></section>
    <section class="wrap faq" style="padding-bottom:100px">
      <h3>${L("Delivery", "التوصيل")}</h3><div class="acc">
        <details><summary>${L("How long does delivery take?", "كم يستغرق التوصيل؟")}</summary><div class="acc__body">${L("Riyadh: same day for orders before 2 pm, otherwise next day. Rest of Saudi Arabia: 2–4 working days. GCC: 4–7 working days.", "الرياض: في اليوم نفسه للطلبات قبل الساعة 2 ظهرًا، وإلا ففي اليوم التالي. باقي مناطق المملكة: 2–4 أيام عمل. دول الخليج: 4–7 أيام عمل.")}</div></details>
        <details><summary>${L("How much does delivery cost?", "كم تكلفة التوصيل؟")}</summary><div class="acc__body">${L("Complimentary across the Kingdom on orders over 1,000 SAR. Otherwise standard delivery is 35 SAR and express is 75 SAR.", "مجاني في جميع أنحاء المملكة للطلبات فوق 1,000 ريال. وفيما عدا ذلك، التوصيل العادي 35 ريالًا والسريع 75 ريالًا.")}</div></details>
        <details><summary>${L("Can I send a gift directly to someone?", "هل يمكنني إرسال هدية مباشرة لشخص آخر؟")}</summary><div class="acc__body">${L("Yes. Tick “Present it as a gift” on the product page and add a delivery address and message at checkout. We never include prices with a gift.", "نعم. اختر «قدّمها كهدية» في صفحة المنتج، وأضف عنوان التوصيل والرسالة عند الدفع. لا نرفق الأسعار مع الهدايا أبدًا.")}</div></details>
      </div>
      <h3>${L("Returns", "الاسترجاع")}</h3><div class="acc">
        <details><summary>${L("What is the returns policy?", "ما سياسة الاسترجاع؟")}</summary><div class="acc__body">${L("Unused pieces in their original Vault packaging may be returned within 14 days of delivery for a full refund to the original payment method. Personalised items are final sale.", "يمكن استرجاع القطع غير المستخدمة في تغليفها الأصلي خلال 14 يومًا من التوصيل، مع استرداد كامل المبلغ إلى وسيلة الدفع الأصلية. القطع المخصّصة غير قابلة للاسترجاع.")}</div></details>
        <details><summary>${L("How do I start a return?", "كيف أبدأ الاسترجاع؟")}</summary><div class="acc__body">${L("Email us your order reference. We’ll arrange a courier collection from your door at no charge.", "أرسل لنا رقم طلبك بالبريد الإلكتروني، وسنرتّب مندوبًا يستلمه من بابك مجانًا.")}</div></details>
      </div>
      <h3>${L("Caring for your piece", "العناية بقطعتك")}</h3><div class="acc">
        <details><summary>${L("Everyday care", "العناية اليومية")}</summary><div class="acc__body">${L("Keep it in its dust bag, lightly stuffed with tissue, away from sun and heat. Avoid perfume, oils and hand cream on the leather.", "احفظها في كيسها القطني، محشوّة بخفّة بورق ناعم، بعيدًا عن الشمس والحرارة. وتجنّب وصول العطور والزيوت وكريمات اليد إلى الجلد.")}</div></details>
        <details><summary>${L("Lifetime atelier care", "عناية المشغل مدى الحياة")}</summary><div class="acc__body">${L("Bring or send your piece to the Riyadh atelier for complimentary cleaning, conditioning and lacquer refresh. Repairs are quoted individually.", "أحضر قطعتك أو أرسلها إلى مشغل الرياض لتنظيفها وترطيبها وتجديد لمعتها مجانًا. وتُسعَّر الإصلاحات لكل قطعة على حدة.")}</div></details>
      </div>
    </section>`;

  views.checkout = () => {
    if (!bag.length) return `<div class="wrap empty" style="padding-block:120px"><h2>${L("Your bag is empty.", "سلّتك فارغة.")}</h2><p style="margin-bottom:24px">${L("Find something sweet first.", "اختر شيئًا شهيًّا أولًا.")}</p><a class="btn btn--solid" href="#/shop">${L("Shop the vitrine", "تسوّق الآن")}</a></div>`;
    const cities = L("Riyadh,Jeddah,Dammam,Khobar,Makkah,Madinah,Abha,Other — Saudi Arabia,GCC", "الرياض,جدة,الدمام,الخبر,مكة المكرمة,المدينة المنورة,أبها,مدينة أخرى في المملكة,دول الخليج").split(",");
    return `
    <div class="wrap"><nav class="crumbs"><a href="#/">${L("Home", "الرئيسية")}</a> / <span>${L("Checkout", "إتمام الطلب")}</span></nav></div>
    <form class="wrap checkout" data-checkout novalidate>
      <div>
        <fieldset class="fieldset"><legend>${L("Contact", "التواصل")}</legend><div class="form-grid">
          <label class="full">${L("Email", "البريد الإلكتروني")}<input class="field" type="email" name="email" required autocomplete="email"></label>
          <label class="full">${L("Mobile", "رقم الجوال")}<input class="field" type="tel" name="phone" required placeholder="+966 5x xxx xxxx" autocomplete="tel"></label>
        </div></fieldset>
        <fieldset class="fieldset"><legend>${L("Delivery", "التوصيل")}</legend><div class="form-grid">
          <label>${L("First name", "الاسم الأول")}<input class="field" name="first" required autocomplete="given-name"></label>
          <label>${L("Last name", "اسم العائلة")}<input class="field" name="last" required autocomplete="family-name"></label>
          <label class="full">${L("Address", "العنوان")}<input class="field" name="address" required placeholder="${L("Street, building, district", "الشارع، المبنى، الحي")}" autocomplete="street-address"></label>
          <label>${L("City", "المدينة")}<select class="field" name="city" required>${cities.map(c => `<option>${c}</option>`).join("")}</select></label>
          <label>${L("National address code", "رمز العنوان الوطني")}<input class="field" name="nac" placeholder="${L("Optional · e.g. RRRD2929", "اختياري · مثل RRRD2929")}"></label>
        </div></fieldset>
        <fieldset class="fieldset"><legend>${L("Delivery method", "طريقة التوصيل")}</legend><div class="radio-list" data-ship>
          <label class="check"><input type="radio" name="ship" value="std" checked><div><b>${L("Standard", "عادي")}</b><small>${L("Riyadh next day · Kingdom 2–4 days", "الرياض في اليوم التالي · المملكة 2–4 أيام")}</small></div><span class="r" data-ship-std></span></label>
          <label class="check"><input type="radio" name="ship" value="exp"><div><b>${L("Express", "سريع")}</b><small>${L("Riyadh same day before 2 pm · Kingdom 1–2 days", "الرياض في اليوم نفسه قبل 2 ظهرًا · المملكة 1–2 يوم")}</small></div><span class="r">${sar(SHIP_EXP)}</span></label>
          <label class="check"><input type="radio" name="ship" value="atelier"><div><b>${L("Collect from the atelier", "الاستلام من المشغل")}</b><small>${L("Riyadh · by appointment", "الرياض · بموعد مسبق")}</small></div><span class="r">${L("Free", "مجانًا")}</span></label>
        </div></fieldset>
        ${bag.some(l => l.gift) ? `<fieldset class="fieldset"><legend>${L("Gift message", "رسالة الهدية")}</legend><textarea class="field" name="message" maxlength="240" placeholder="${L("Written by hand on our care card…", "تُكتب باليد على بطاقتنا…")}" style="width:100%"></textarea></fieldset>` : ""}
        <fieldset class="fieldset"><legend>${L("Payment", "الدفع")}</legend><div class="radio-list">
          ${[["mada", L("mada debit card", "بطاقة مدى"), "", ["mada"]], ["card", L("Credit card", "بطاقة ائتمانية"), "Visa · Mastercard", ["visa", "mastercard"]], ["apple", "Apple Pay", L("Face ID or Touch ID", "Face ID أو Touch ID"), ["applepay"]], ["tabby", L("Tabby", "تابي"), L("4 interest-free payments", "4 دفعات بدون فوائد"), ["tabby"]], ["tamara", L("Tamara", "تمارا"), L("Split in 3 or 4, no fees", "قسّمها على 3 أو 4 بدون رسوم"), ["tamara"]]].map(([v, l, s, ic], i) => `<label class="check"><input type="radio" name="pay" value="${v}" ${i === 0 ? "checked" : ""}><div><b>${l}</b>${s ? `<small>${s}</small>` : ""}</div><span class="r pay">${payRow(ic)}</span></label>`).join("")}
        </div>
        <p class="notice" style="margin-top:14px">${L("Preview store — no payment is taken. At launch these options hand off to the payment provider’s secure page.", "متجر تجريبي — لا يتم خصم أي مبلغ. عند الإطلاق ستنقلك هذه الخيارات إلى صفحة الدفع الآمنة لمزوّد الخدمة.")}</p></fieldset>
        <button class="btn btn--solid btn--block" type="submit">${L("Place order", "تأكيد الطلب")}</button>
      </div>
      <aside class="summary" data-summary></aside>
    </form>`;
  };

  views.confirm = () => { const o = store.get("lastOrder", {}); return `
    <div class="wrap confirm">
      <svg class="seal" viewBox="0 0 100 100" aria-hidden="true"><use href="#star" style="fill:var(--gold)"/></svg>
      <div class="kicker c">${L("Order received", "تم استلام الطلب")}</div>
      <h1>${L("The Vault is being prepared.", "نجهّز صندوقك الآن.")}</h1>
      <p>${L(`Thank you${o.name ? ", " + esc(o.name) : ""}. The atelier is wrapping your order now; a confirmation will follow by email and SMS with tracking once it leaves Riyadh.`, `شكرًا لك${o.name ? " يا " + esc(o.name) : ""}. يغلّف المشغل طلبك الآن، وسيصلك تأكيد بالبريد الإلكتروني ورسالة نصية مع رقم التتبّع فور خروجه من الرياض.`)}</p>
      ${o.ref ? `<span class="ref">${L("Order", "رقم الطلب")} ${esc(o.ref)}</span>` : ""}
      <p style="margin-top:36px"><a class="btn btn--ghost" href="#/shop">${L("Continue browsing", "متابعة التسوّق")}</a></p>
    </div>`; };

  views.notfound = () => `<div class="wrap empty" style="padding-block:120px"><h2>${L("This shelf is empty.", "هذا الرف فارغ.")}</h2><p style="margin-bottom:24px">${L("The page you’re looking for has been eaten.", "يبدو أن الصفحة التي تبحث عنها قد أُكلت.")}</p><a class="btn btn--solid" href="#/">${L("Back to the boutique", "العودة إلى المتجر")}</a></div>`;

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
    const t = {
      home: L("Eversi — Confectionery Leather Goods, Riyadh", "Eversi — منتجات جلدية مستوحاة من الحلويات، الرياض"), shop: L("Shop", "المتجر"), vault: L("The Patisserie Vault", "صندوق الباتيسري"),
      atelier: L("Atelier", "المشغل"), care: L("Client Care", "خدمة العملاء"), wishlist: L("Wishlist", "المفضّلة"), checkout: L("Checkout", "إتمام الطلب"), confirm: L("Thank you", "شكرًا لك")
    };
    if (name === "product" && bySlug[slug]) return `${tx(bySlug[slug], "name")} — Eversi`;
    return name === "home" ? t.home : t[name] ? `${t[name]} — Eversi` : "Eversi";
  }

  /* ---------- size on body ----------
     Everything is drawn in centimetres: 1 SVG unit = 1 cm, so the bag is always true to the figure's height.
     Bag size is read from the "W × H" line in each product's details. */
  const dims = p => {
    const d = p.details.join(" "); let m;
    if ((m = d.match(/W (\d+) × H (\d+)/))) return { w: +m[1], h: +m[2] };
    if ((m = d.match(/Ø (\d+)/))) return { w: +m[1], h: +m[1] };
    if ((m = d.match(/H (\d+) cm/))) return { w: Math.round(m[1] * .8), h: +m[1] };
    if ((m = d.match(/W (\d+) cm/))) return { w: +m[1], h: Math.round(m[1] * .6) };
    return null;
  };
  const HELD = ["toffee-clutch", "millefeuille-pouch"];                        // carried in the hand, no handle drop
  const SHAPE = { "glazed-ring": "ring", "macaron": "round", "clementine": "moon", "sorbet-mini": "dome", "chantilly-cupcake": "dome" };
  const SIZES = ["XS", "S", "M", "L", "XL"], SIZE_W = [.9, .95, 1, 1.07, 1.14];
  const scale = Object.assign({ h: 165, size: 2, unit: "cm", view: "body", item: 0 }, store.get("scale", {}));
  const GROUND = 200;
  const fmtLen = cm => scale.unit === "in" ? `${(cm / 2.54).toFixed(1)} ${L("in", "إنش")}` : `${Math.round(cm)} ${L("cm", "سم")}`;

  function bagShape(shape, attrs, bx, top, W, H, charm) {
    const cx = bx + W / 2;
    return {
      rect: `<rect x="${bx}" y="${top}" width="${W}" height="${H}" rx="${charm ? 1 : 1.4}" ${attrs}/>`,
      dome: `<path d="M${bx} ${top + H}V${top + H * .5}A${W / 2} ${H * .5} 0 0 1 ${bx + W} ${top + H * .5}V${top + H}Z" ${attrs}/>`,
      moon: `<path d="M${bx} ${top}A${W / 2} ${H} 0 0 0 ${bx + W} ${top}Z" ${attrs}/>`,
      round: `<ellipse cx="${cx}" cy="${top + H / 2}" rx="${W / 2}" ry="${H / 2}" ${attrs}/>`,
      ring: `<circle cx="${cx}" cy="${top + H / 2}" r="${W / 2}" ${attrs}/><circle cx="${cx}" cy="${top + H / 2}" r="${W * .17}" class="scale-stage-fill"/>`
    }[shape];
  }

  /* ---------- what fits ----------
     Everyday objects at their real size (W × H × D, cm). An object fits when its three dimensions,
     largest to smallest, sit inside the bag's usable interior — width and height reduced for the
     bag's shape, depth from the "D" in its details. */
  const ITEMS = [
    { k: "phone", en: "Smartphone", ar: "هاتف ذكي", d: [7.7, 16.3, .9] },
    { k: "cards", en: "Cardholder", ar: "حافظة بطاقات", d: [10, 7, .6] },
    { k: "lipstick", en: "Lipstick", ar: "أحمر شفاه", d: [2, 8.5, 2] },
    { k: "keys", en: "Keys", ar: "مفاتيح", d: [5, 9, 1.5] },
    { k: "earbuds", en: "Earbuds case", ar: "علبة سماعات", d: [6, 4.6, 2.2] },
    { k: "perfume", en: "Travel perfume", ar: "عطر صغير", d: [4, 10, 3] },
    { k: "passport", en: "Passport", ar: "جواز سفر", d: [9, 12.5, .5] },
    { k: "sunglasses", en: "Sunglasses", ar: "نظارة شمسية", d: [15, 5, 4] },
    { k: "wallet", en: "Long wallet", ar: "محفظة طويلة", d: [19, 10, 2] },
    { k: "bottle", en: "Water bottle", ar: "زجاجة ماء", d: [7, 22, 7] }
  ];
  const FILL = { rect: [.9, .9], dome: [.9, .8], moon: [.82, .7], round: [.78, .78], ring: [.55, .55] };   // usable share of [width, height]
  const depthOf = p => { const m = p.details.join(" ").match(/D (\d+)/); if (m) return +m[1]; return SHAPE[p.slug] ? Math.round(dims(p).w * .55) : 3; };   // flat pouches ≈ 3 cm
  const itemName = it => L(it.en, it.ar);
  function fits(p, it) {
    const d = dims(p), [fw, fh] = FILL[SHAPE[p.slug] || "rect"];
    const room = [d.w * fw, d.h * fh, depthOf(p) * .85].sort((a, b) => b - a);
    return [...it.d].sort((a, b) => b - a).every((v, i) => v <= room[i]);
  }
  const holds = p => ITEMS.filter(it => fits(p, it));
  const ITEM_ART = {
    phone: (x, y) => `<rect x="${x}" y="${y}" width="7.7" height="16.3" rx="1.1" fill="#2B2B2E"/><rect x="${x + .9}" y="${y + .9}" width="3.3" height="3.3" rx=".9" fill="#45454B"/><circle cx="${x + 1.85}" cy="${y + 1.85}" r=".55" fill="#18181A"/><circle cx="${x + 3.25}" cy="${y + 3.25}" r=".55" fill="#18181A"/><circle cx="${x + 3.25}" cy="${y + 1.85}" r=".3" fill="#6B6B72"/>`,
    cards: (x, y) => `<rect x="${x}" y="${y}" width="10" height="7" rx=".7" fill="#B4712F"/><rect x="${x + .5}" y="${y + .5}" width="9" height="6" rx=".4" fill="none" stroke="#F6EFE2" stroke-width=".12" stroke-dasharray=".35 .3"/><path d="M${x + .5} ${y + 2.4}H${x + 9.5}" stroke="#8B5A3C" stroke-width=".2"/>`,
    lipstick: (x, y) => `<path d="M${x + .45} ${y + 2.7}V${y + 1}L${x + 1.55} ${y}V${y + 2.7}Z" fill="#7A2331"/><rect x="${x + .25}" y="${y + 2.6}" width="1.5" height=".9" fill="#A87E2A"/><rect x="${x}" y="${y + 3.5}" width="2" height="5" rx=".3" fill="#C99A3B"/>`,
    keys: (x, y) => `<circle cx="${x + 2.5}" cy="${y + 1.7}" r="1.4" fill="none" stroke="#B9A06A" stroke-width=".35"/><circle cx="${x + 2.5}" cy="${y + 4.3}" r="1.2" fill="#C99A3B"/><circle cx="${x + 2.5}" cy="${y + 4.3}" r=".4" fill="var(--surface-sunken)"/><rect x="${x + 2.1}" y="${y + 5.3}" width=".8" height="3.7" fill="#C99A3B"/><rect x="${x + 2.9}" y="${y + 7}" width=".7" height=".5" fill="#C99A3B"/><rect x="${x + 2.9}" y="${y + 8.1}" width=".5" height=".5" fill="#C99A3B"/>`,
    earbuds: (x, y) => `<rect x="${x}" y="${y}" width="6" height="4.6" rx="2" fill="#F4F2EE" stroke="#CBC5BC" stroke-width=".15"/><path d="M${x + .3} ${y + 1.6}H${x + 5.7}" stroke="#CBC5BC" stroke-width=".12"/><circle cx="${x + 3}" cy="${y + 2.8}" r=".18" fill="#9C968D"/>`,
    perfume: (x, y) => `<rect x="${x + 1}" y="${y}" width="2" height="2.6" rx=".3" fill="#C99A3B"/><rect x="${x + 1.5}" y="${y + 2.6}" width="1" height=".6" fill="#A87E2A"/><rect x="${x}" y="${y + 3.2}" width="4" height="6.8" rx=".6" fill="#EADBC8" stroke="#CDBBA6" stroke-width=".15"/><rect x="${x + .4}" y="${y + 5}" width="3.2" height="4.6" rx=".4" fill="#E8B98E"/>`,
    passport: (x, y) => `<rect x="${x}" y="${y}" width="9" height="12.5" rx=".5" fill="#3B1E24"/><circle cx="${x + 4.5}" cy="${y + 5.4}" r="1.6" fill="none" stroke="#C99A3B" stroke-width=".22"/><rect x="${x + 2.5}" y="${y + 1.6}" width="4" height=".4" fill="#C99A3B"/><rect x="${x + 2.8}" y="${y + 9.6}" width="3.4" height=".35" fill="#C99A3B"/>`,
    sunglasses: (x, y) => `<ellipse cx="${x + 3.4}" cy="${y + 2.7}" rx="3.2" ry="2.25" fill="#2B2B2E"/><ellipse cx="${x + 11.6}" cy="${y + 2.7}" rx="3.2" ry="2.25" fill="#2B2B2E"/><path d="M${x + 6.3} ${y + 2}Q${x + 7.5} ${y + 1.1} ${x + 8.7} ${y + 2}" fill="none" stroke="#2B2B2E" stroke-width=".55"/><ellipse cx="${x + 2.6}" cy="${y + 2}" rx="1" ry=".5" fill="#4A4A50"/><ellipse cx="${x + 10.8}" cy="${y + 2}" rx="1" ry=".5" fill="#4A4A50"/>`,
    wallet: (x, y) => `<rect x="${x}" y="${y}" width="19" height="10" rx=".8" fill="#7A2331"/><path d="M${x} ${y + 3.6}H${x + 19}" stroke="#5E1A26" stroke-width=".25"/><rect x="${x + 8.5}" y="${y + 3}" width="2" height="1.4" rx=".3" fill="#C99A3B"/>`,
    bottle: (x, y) => `<rect x="${x + 1.5}" y="${y}" width="4" height="2.4" rx=".5" fill="#6E6E72"/><path d="M${x + 5.4} ${y + .6}h1v1.4h-1" fill="none" stroke="#6E6E72" stroke-width=".35"/><rect x="${x}" y="${y + 2.4}" width="7" height="19.6" rx="1.6" fill="#22303A"/><rect x="${x + 1}" y="${y + 4}" width=".7" height="15" rx=".35" fill="#3A4B57"/>`
  };
  function fitsScene(p, hex) {
    const d = dims(p), it = ITEMS[scale.item], [iw, ih] = it.d, shape = SHAPE[p.slug] || "rect";
    const gap = Math.max(3, (d.w + iw) * .12), W = d.w + gap + iw, H = Math.max(d.h, ih), pad = Math.max(3, W * .1);
    const fs = Math.max(1.3, (W + pad * 2) / 30);
    const bag = `fill="${hex}" stroke="rgba(27,15,9,.28)" stroke-width="${fs * .09}"`;
    return { vb: `${-pad} ${-pad} ${W + pad * 2} ${H + pad + fs * 4.2}`, svg: `
      ${bagShape(shape, bag, 0, H - d.h, d.w, d.h, false)}
      ${ITEM_ART[it.k](d.w + gap, H - ih)}
      <line x1="${-pad}" x2="${W + pad}" y1="${H + fs * .3}" y2="${H + fs * .3}" class="scale-ground" style="stroke-width:${fs * .06}"/>
      <text x="${d.w / 2}" y="${H + fs * 2}" text-anchor="middle" class="fit-label" style="font-size:${fs}px">${fmtLen(d.w)} × ${fmtLen(d.h)}</text>
      <text x="${d.w + gap + iw / 2}" y="${H + fs * 2}" text-anchor="middle" class="fit-label" style="font-size:${fs}px">${itemName(it)}</text>
      <text x="${d.w + gap + iw / 2}" y="${H + fs * 3.4}" text-anchor="middle" class="fit-label fit-label--muted" style="font-size:${fs * .85}px">${fmtLen(iw)} × ${fmtLen(ih)}</text>` };
  }

  function scaleScene(p, hex) {
    const s = scale.h / 165, sx = SIZE_W[scale.size], top0 = GROUND - 165 * s;
    const hx = 22 * sx * s, hy = top0 + 85 * s;                                // the figure's right hand
    const { w: W, h: H } = dims(p), charm = p.type === "charm";
    const dropM = p.details.join(" ").match(/(\d+) cm drop/);
    const drop = charm || HELD.includes(p.slug) ? 0 : dropM ? +dropM[1] : 12;
    const top = drop ? hy + drop : hy - H / 2, bx = hx - W / 2, cx = hx;
    const shape = SHAPE[p.slug] || "rect", bag = `fill="${hex}" stroke="rgba(27,15,9,.28)" stroke-width=".3"`;
    const body = bagShape(shape, bag, bx, top, W, H, charm);
    const straps = drop ? `<path d="M${bx + W * .3} ${top}L${hx} ${hy}L${bx + W * .7} ${top}" fill="none" stroke="var(--gold)" stroke-width=".6" stroke-linejoin="round"/>` : "";
    const yW = top + H + 5, xH = bx - 5, tick = 1.4, lbl = `class="scale-dim"`;
    const dimsSvg = `
      <g class="scale-line"><path d="M${bx} ${yW}H${bx + W}M${bx} ${yW - tick}V${yW + tick}M${bx + W} ${yW - tick}V${yW + tick}"/>
      <path d="M${xH} ${top}V${top + H}M${xH - tick} ${top}H${xH + tick}M${xH - tick} ${top + H}H${xH + tick}"/></g>
      <text x="${bx + W / 2}" y="${yW + 5.2}" text-anchor="middle" ${lbl}>${fmtLen(W)}</text>
      <text transform="translate(${xH - 2.4} ${top + H / 2}) rotate(-90)" text-anchor="middle" ${lbl}>${fmtLen(H)}</text>`;
    return `
      <g transform="translate(0 ${top0}) scale(${sx * s} ${s})">
        <!-- fashion croquis, drawn in centimetres for a 165 cm figure; right hand at (22, 85) -->
        <path class="scale-hair" d="M0-.6C8.4-.6 9.8 6 9.4 13.4C9.2 21.5 10.2 29 10.8 37C11.2 42.4 9.4 46 6.6 46L4.2 30.5H-4.2L-6.6 46C-9.4 46-11.2 42.4-10.8 37C-10.2 29-9.2 21.5-9.4 13.4C-9.8 6-8.4-.6 0-.6Z"/>
        <g class="scale-skin">
          <ellipse cx="0" cy="11.6" rx="6.4" ry="8.8"/>
          <path d="M-2.9 18.6C-2.9 22.6-3.3 25.8-4.6 28.2H4.6C3.3 25.8 2.9 22.6 2.9 18.6Z"/>
          <path d="M12.6 30.2C16.4 30.4 18 33.2 18.4 38C18.8 46 19.5 54 20 60.2C20.6 68 21.9 76 23.2 82.2L20.8 82.8C19.6 76.4 18.4 68.6 17.6 61.4C17 55 16.1 48 15.2 42.2Z"/>
          <path d="M-12.6 30.2C-16.4 30.4-18 33.2-18.4 38C-18.8 46-19.5 54-20 60.2C-20.6 68-21.9 76-23.2 82.2L-20.8 82.8C-19.6 76.4-18.4 68.6-17.6 61.4C-17 55-16.1 48-15.2 42.2Z"/>
          <ellipse cx="22.1" cy="85.4" rx="2" ry="3.3" transform="rotate(-6 22.1 85.4)"/>
          <ellipse cx="-22.1" cy="85.4" rx="2" ry="3.3" transform="rotate(6 -22.1 85.4)"/>
          <path d="M1.2 116C1.4 128 1.7 140 2.2 151.5L2.7 157.2H5.2L5.5 151.5C6 140 5.8 128 5 116Z"/>
          <path d="M-1.2 116C-1.4 128-1.7 140-2.2 151.5L-2.7 157.2H-5.2L-5.5 151.5C-6 140-5.8 128-5 116Z"/>
        </g>
        <path class="scale-hair" d="M-7.2 9.2C-6.4 1.6 5.4.2 7.8 7.6C5.2 4.6-.8 4-7.2 9.2Z"/>
        <path class="scale-dress" d="M-4.4 28C-8.4 28.3-12 29.1-14.4 30.4C-15.4 32.6-14.8 35.6-13.4 38.2C-14.4 44.2-13 52.4-10.5 62C-12.6 68-16 74-16.6 82C-18 95-21 108-23.2 120.2Q0 124.4 23.2 120.2C21 108 18 95 16.6 82C16 74 12.6 68 10.5 62C13 52.4 14.4 44.2 13.4 38.2C14.8 35.6 15.4 32.6 14.4 30.4C12 29.1 8.4 28.3 4.4 28Z"/>
        <path class="scale-waist" d="M-10.6 61.2Q0 63.4 10.6 61.2L10.4 63.6Q0 65.8-10.4 63.6Z"/>
        <path class="scale-shoe" d="M2.5 156.4C2.3 160 2.4 162.9 3 164.2H3.9L4.2 161.6C6.4 162.2 9 163.6 10.6 164.6C10.9 163.1 8.2 159.8 5.9 156.6Z"/>
        <path class="scale-shoe" d="M-2.5 156.4C-2.3 160-2.4 162.9-3 164.2H-3.9L-4.2 161.6C-6.4 162.2-9 163.6-10.6 164.6C-10.9 163.1-8.2 159.8-5.9 156.6Z"/>
      </g>
      <line x1="-60" x2="60" y1="${GROUND + 2.2}" y2="${GROUND + 2.2}" class="scale-ground"/>
      ${straps}${body}${dimsSvg}`;
  }
  function renderScale() {
    const panel = $("[data-scale]"), buy = $("[data-buy]"); if (!panel || !buy) return;
    const p = bySlug[buy.dataset.buy], d = dims(p); if (!d) return;
    const colourName = $("[data-colour][aria-pressed=true]", buy)?.dataset.colour || p.colours[0].name;
    const hex = (p.colours.find(c => c.name === colourName) || p.colours[0]).hex;
    const canFit = p.type === "bag";
    if (!canFit) scale.view = "body";
    panel.dataset.slug = p.slug; panel.dataset.hex = hex;
    const tabs = canFit ? `<div class="scale__tabs" role="tablist">${[["body", L("On body", "على الجسم")], ["fits", L("What fits", "ماذا تتّسع")]].map(([v, l]) => `<button role="tab" data-view="${v}" aria-selected="${scale.view === v}">${l}</button>`).join("")}</div>` : "";
    const units = `<div class="scale__units" role="group" aria-label="${L("Units", "وحدة القياس")}">${["cm", "in"].map(u => `<button data-unit="${u}" aria-pressed="${scale.unit === u}">${u === "cm" ? L("cm", "سم") : L("in", "إنش")}</button>`).join("")}</div>`;
    const head = `<div class="modal__head"><div><div class="kicker">${esc(tx(p, "name"))}</div><h2 id="scale-title">${scale.view === "fits" ? L("What fits inside", "ماذا تتّسع الحقيبة") : L("Size on body", "المقاس على الجسم")}</h2>${tabs}</div><button class="icon-btn" data-close aria-label="${L("Close", "إغلاق")}"><svg><use href="#i-close"/></svg></button></div>`;
    if (scale.view === "fits") {
      const yes = holds(p), no = ITEMS.filter(it => !yes.includes(it));
      panel.innerHTML = `${head}
      <div class="scale">
        <div class="scale__stage scale__stage--fits">
          <svg role="img" aria-label="${L("The bag beside an everyday object at real size", "الحقيبة بجانب غرض يومي بمقاسه الحقيقي")}" data-fit-svg></svg>
          <div class="fit-picker">
            <button class="fit-step" data-item-step="-1" aria-label="${L("Previous object", "الغرض السابق")}">‹</button>
            <div class="fit-items" role="group" aria-label="${L("Everyday objects", "أغراض يومية")}">${ITEMS.map((it, i) => `<button class="fit-item" data-item="${i}" aria-pressed="${scale.item === i}" aria-label="${itemName(it)}" title="${itemName(it)}"><svg viewBox="-1.5 -1.5 ${it.d[0] + 3} ${it.d[1] + 3}" aria-hidden="true">${ITEM_ART[it.k](0, 0)}</svg></button>`).join("")}</div>
            <button class="fit-step" data-item-step="1" aria-label="${L("Next object", "الغرض التالي")}">›</button>
          </div>
        </div>
        <div class="scale__controls">
          ${units}
          <p class="fit-verdict" data-fit-verdict></p>
          <div class="fit-group"><h3>${L("Holds", "تتّسع لـ")}</h3><ul class="fit-list">${yes.map(it => `<li class="ok">${itemName(it)}</li>`).join("") || `<li>${L("Small essentials only", "الأساسيات الصغيرة فقط")}</li>`}</ul></div>
          ${no.length ? `<div class="fit-group"><h3>${L("Too large", "أكبر من الحقيبة")}</h3><ul class="fit-list">${no.map(it => `<li class="no">${itemName(it)}</li>`).join("")}</ul></div>` : ""}
          <p class="note">${L("Based on the bag’s outer size and shape; leave a little room for the lining. Objects are shown at their typical real size.", "مبنيّ على المقاس الخارجي للحقيبة وشكلها، مع ترك مساحة بسيطة للبطانة. الأغراض معروضة بمقاسها الحقيقي المعتاد.")}</p>
        </div>
      </div>`;
      updateFits();
      return;
    }
    panel.innerHTML = `${head}
      <div class="scale">
        <div class="scale__stage"><svg viewBox="-60 -8 120 218" role="img" aria-label="${L("Illustration of the bag to scale beside a figure", "رسم توضيحي للحقيبة بمقاسها الحقيقي بجانب مجسّم")}" data-scale-svg></svg></div>
        <div class="scale__controls">
          ${units}
          <label class="scale__ctl"><span>${L("Height", "الطول")} <b data-scale-h></b></span><input type="range" min="150" max="190" step="1" value="${scale.h}" data-scale-height></label>
          <label class="scale__ctl"><span>${L("Size", "المقاس")} <b data-scale-s></b></span><input type="range" min="0" max="4" step="1" value="${scale.size}" data-scale-size></label>
          <dl class="scale__facts"><div><dt>${L("Width", "العرض")}</dt><dd data-scale-w></dd></div><div><dt>${L("Height", "الارتفاع")}</dt><dd data-scale-bh></dd></div></dl>
          <p class="note">${L("A to-scale illustration of the piece, shown held in the hand. Measurements are approximate.", "رسم توضيحي بالمقاس الحقيقي للقطعة محمولةً باليد. القياسات تقريبية.")}</p>
        </div>
      </div>`;
    updateScale();
  }
  function updateFits() {
    const panel = $("[data-scale]"), svg = $("[data-fit-svg]"); if (!panel?.dataset.slug || !svg) return;
    const p = bySlug[panel.dataset.slug], it = ITEMS[scale.item], sc = fitsScene(p, panel.dataset.hex), ok = fits(p, it);
    svg.setAttribute("viewBox", sc.vb); svg.innerHTML = sc.svg;
    $("[data-fit-verdict]").className = `fit-verdict ${ok ? "is-ok" : "is-no"}`;
    $("[data-fit-verdict]").innerHTML = ok ? L(`<b>${itemName(it)}</b> fits inside.`, `<b>${itemName(it)}</b> تتّسع لها الحقيبة.`) : L(`<b>${itemName(it)}</b> is too large for this bag.`, `<b>${itemName(it)}</b> أكبر من الحقيبة.`);
    $$("[data-item]").forEach(b => b.setAttribute("aria-pressed", +b.dataset.item === scale.item));
    $(`[data-item="${scale.item}"]`)?.scrollIntoView({ block: "nearest", inline: "center" });
    $$("[data-unit]").forEach(b => b.setAttribute("aria-pressed", b.dataset.unit === scale.unit));
    store.set("scale", scale);
  }
  function updateScale() {
    if (scale.view === "fits") return updateFits();
    const panel = $("[data-scale]"); if (!panel?.dataset.slug || !$("[data-scale-svg]")) return;
    const p = bySlug[panel.dataset.slug], d = dims(p);
    $("[data-scale-svg]").innerHTML = scaleScene(p, panel.dataset.hex);
    $("[data-scale-h]").textContent = fmtLen(scale.h);
    $("[data-scale-s]").textContent = SIZES[scale.size];
    $("[data-scale-w]").textContent = fmtLen(d.w);
    $("[data-scale-bh]").textContent = fmtLen(d.h);
    $$("[data-unit]").forEach(b => b.setAttribute("aria-pressed", b.dataset.unit === scale.unit));
    store.set("scale", scale);
  }

  /* ---------- product gallery ---------- */
  const currentSlide = () => { const tr = $("[data-track]"); return tr ? Math.round(tr.scrollLeft / tr.clientWidth) : 0; };
  function goSlide(i) {
    const tr = $("[data-track]"); if (!tr) return;
    const n = tr.children.length; i = (i + n) % n;
    tr.scrollTo({ left: i * tr.clientWidth, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  function syncSlide() {
    const i = currentSlide(), c = $("[data-count]");
    if (c) c.textContent = `${i + 1} / ${$("[data-track]").children.length}`;
    $$("[data-thumb]").forEach(b => b.setAttribute("aria-current", +b.dataset.thumb === i));
    $$(".gallery__slide.zoom").forEach(s => s.classList.remove("zoom"));
  }
  document.addEventListener("scroll", e => { if (e.target.matches?.("[data-track]")) { clearTimeout(syncSlide.t); syncSlide.t = setTimeout(syncSlide, 60); } }, true);

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
    toast(L(`${p.name} added to your bag`, `أُضيفت ${tx(p, "name")} إلى سلّتك`));
  }
  function saveBag() { bag = bag.filter(l => bySlug[l.slug] && l.qty > 0); store.set("bag", bag); renderBag(); if (location.hash.startsWith("#/checkout")) renderSummary(); }
  function renderBag() {
    $$("[data-bag-count]").forEach(e => e.textContent = count() || "");
    $$("[data-wish-count]").forEach(e => e.textContent = wish.size || "");
    const lines = $("[data-bag-lines]"), foot = $("[data-bag-foot]");
    if (!bag.length) {
      lines.innerHTML = `<div class="empty" style="padding-block:64px"><h2>${L("Your bag is empty.", "سلّتك فارغة.")}</h2><p>${L("The vitrine is full, though.", "لكن الواجهة ممتلئة.")}</p></div>`;
      foot.innerHTML = `<a class="btn btn--solid btn--block" href="#/shop">${L("Shop the vitrine", "تسوّق الآن")}</a>`;
      return;
    }
    lines.innerHTML = bag.map((l, i) => { const p = bySlug[l.slug]; return `
      <div class="line">
        <a href="#/product/${p.slug}"><img src="${img(p.images[0].src, 1)}" alt="" style="object-position:${p.images[0].pos}"></a>
        <div><h4>${esc(tx(p, "name"))}</h4><small>${esc(cn(l.colour))}${l.gift ? L(" · Gift wrapped", " · مغلّفة كهدية") : ""}</small>
          <div class="qty"><button data-lq="${i}" data-d="-1" aria-label="${L("Decrease", "إنقاص")}">−</button><span>${l.qty}</span><button data-lq="${i}" data-d="1" aria-label="${L("Increase", "زيادة")}">+</button></div>
          <button class="rm" data-rm="${i}">${L("Remove", "إزالة")}</button></div>
        <div>${priceTag(p, l.qty)}</div>
      </div>`; }).join("");
    const st = subtotal(), left = Math.max(0, FREE_SHIP - st);
    foot.innerHTML = `
      <div class="progress">${left ? L(`You’re ${sar(left)} away from complimentary delivery.`, `باقٍ ${sar(left)} على التوصيل المجاني.`) : L("Your order ships complimentary across the Kingdom.", "طلبك يُوصَّل مجانًا في جميع أنحاء المملكة.")}<i><b style="width:${Math.min(100, st / FREE_SHIP * 100)}%"></b></i></div>
      <div class="totals"><div>${L("Subtotal", "المجموع الفرعي")}<small>${saved() ? L(`You save ${sar(saved())} with the handbag offer · `, `وفّرت ${sar(saved())} مع عرض الحقائب · `) : ""}${L("VAT included", "شامل الضريبة")}</small></div>${sar(st)}</div>
      <a class="btn btn--solid btn--block" href="#/checkout">${L("Checkout", "إتمام الطلب")}</a>
      <div class="pay pay--center" aria-label="${L("Accepted payment methods", "طرق الدفع المقبولة")}">${payRow(undefined, "pay-ic pay-ic--sm")}</div>`;
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
    const std = $("[data-ship-std]"); if (std) std.innerHTML = st >= FREE_SHIP ? L("Free", "مجانًا") : sar(SHIP_STD);
    el.innerHTML = `<h3>${L("Your order", "طلبك")}</h3>
      ${bag.map(l => { const p = bySlug[l.slug]; return `<div class="line" style="grid-template-columns:64px 1fr auto"><img src="${img(p.images[0].src, 1)}" alt="" style="width:64px;height:80px;object-position:${p.images[0].pos}"><div><h4>${esc(tx(p, "name"))}</h4><small>${esc(cn(l.colour))} · ${L("Qty", "الكمية")} ${l.qty}${l.gift ? L(" · Gift", " · هدية") : ""}</small></div>${priceTag(p, l.qty)}</div>`; }).join("")}
      <div style="margin-top:16px">
        <div class="sum-row"><span>${L("Subtotal", "المجموع الفرعي")}</span>${sar(st + saved())}</div>
        ${saved() ? `<div class="sum-row save-row"><span>${L("Handbag offer (10% off)", "عرض الحقائب (خصم 10%)")}</span><span>−${sar(saved())}</span></div>` : ""}
        <div class="sum-row"><span>${L("Delivery", "التوصيل")}</span>${sh ? sar(sh) : `<span>${L("Free", "مجانًا")}</span>`}</div>
        <div class="sum-row"><span>${L("Patisserie Vault packaging", "تغليف صندوق الباتيسري")}</span><span>${L("Included", "مشمول")}</span></div>
        <div class="sum-row total"><span>${L("Total", "الإجمالي")}</span>${sar(total)}</div>
        <p class="note" style="margin-top:6px">${L(`Includes ${sar(vat)} VAT (15%).`, `يشمل ${sar(vat)} ضريبة القيمة المضافة (15%).`)}</p>
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
    if (id === "scale") renderScale();
    if (id === "search") { const i = $("[data-search-input]"); i.value = ""; runSearch(""); setTimeout(() => i.focus(), 50); }
    else setTimeout(() => el.querySelector("button,a")?.focus(), 50);
  }
  function closeAll() {
    $$(".drawer.open,.search.open,.mobile-menu.open,.modal.open").forEach(el => { el.classList.remove("open"); el.setAttribute("aria-hidden", "true"); });
    $(".scrim").classList.remove("open"); document.body.classList.remove("locked");
  }
  function runSearch(term) {
    term = term.trim().toLowerCase();
    const hay = p => { const a = AR.products[p.slug] || {}; return [p.name, p.short, p.desc, a.name, a.short, a.desc, LINES[p.line]?.name, AR.lines[p.line]?.name, ...p.colours.flatMap(c => [c.name, AR.colours[c.name]])].join(" ").toLowerCase(); };
    const res = term ? P.filter(p => hay(p).includes(term)) : P.filter(p => p.badge);
    $("[data-search-results]").innerHTML = res.length ? res.slice(0, 8).map(card).join("").replaceAll("card rv", "card") : `<p class="empty" style="grid-column:1/-1">${L(`Nothing matches “${esc(term)}”. Try “strawberry”, “charm” or “pistache”.`, `لا نتائج لـ «${esc(term)}». جرّب «فراولة» أو «تعليقة» أو «فستق».`)}</p>`;
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
    const dark = t === "dark";
    themeBtn.querySelector("span").textContent = dark ? L("Switch to light", "الوضع الفاتح") : L("Switch to dark", "الوضع الداكن");
  }
  themeBtn.addEventListener("click", () => {
    const cur = document.documentElement.dataset.theme || "light";
    const next = cur === "dark" ? "light" : "dark"; store.set("theme", next); applyTheme(next);
  });

  /* ---------- static page text (header, footer, drawers) ---------- */
  function applyLang() {
    const root = document.documentElement;
    root.lang = lang; root.dir = isAr() ? "rtl" : "ltr";
    $$("[data-ar]").forEach(el => {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      el.innerHTML = isAr() ? el.dataset.ar : el.dataset.en;
    });
    $$("[data-ar-placeholder]").forEach(el => {
      if (el.dataset.enPlaceholder === undefined) el.dataset.enPlaceholder = el.placeholder;
      el.placeholder = isAr() ? el.dataset.arPlaceholder : el.dataset.enPlaceholder;
    });
    $$("[data-lang-toggle]").forEach(b => { b.textContent = isAr() ? "EN" : "ع"; b.setAttribute("aria-label", isAr() ? "Switch to English" : "التبديل إلى العربية"); b.lang = isAr() ? "en" : "ar"; });
    applyTheme(store.get("theme", null));
  }
  function setLang(next) {
    lang = next; store.set("lang", lang);
    applyLang(); renderBag(); route();
  }

  /* ---------- events ---------- */
  document.addEventListener("click", e => {
    const t = e.target.closest("button,a"); if (!t) return;
    if (t.hasAttribute("data-lang-toggle")) { setLang(isAr() ? "en" : "ar"); return; }
    if (t.dataset.open) { e.preventDefault(); if (t.dataset.view) scale.view = t.dataset.view; open(t.dataset.open); return; }
    if (t.dataset.view && t.closest("[data-scale]")) { scale.view = t.dataset.view; renderScale(); return; }
    if (t.dataset.item !== undefined) { scale.item = +t.dataset.item; updateFits(); return; }
    if (t.dataset.itemStep) { scale.item = (scale.item + +t.dataset.itemStep + ITEMS.length) % ITEMS.length; updateFits(); return; }
    if (t.hasAttribute("data-close")) { closeAll(); lastFocus?.focus?.(); return; }
    if (t.dataset.wish) { e.preventDefault(); toggleWish(t.dataset.wish); return; }
    if (t.dataset.add) { e.preventDefault(); addToBag(t.dataset.add); return; }
    if (t.dataset.rm !== undefined) { bag.splice(+t.dataset.rm, 1); saveBag(); return; }
    if (t.dataset.lq !== undefined) { bag[+t.dataset.lq].qty += +t.dataset.d; saveBag(); return; }
    const buy = t.closest("[data-buy]");
    if (buy) {
      if (t.dataset.colour) { $$("[data-colour]", buy).forEach(b => b.setAttribute("aria-pressed", b === t)); $("[data-colour-name]", buy).textContent = cn(t.dataset.colour); }
      if (t.dataset.q) { const s = $("[data-qty]", buy); s.textContent = Math.max(1, Math.min(9, +s.textContent + +t.dataset.q)); }
      if (t.hasAttribute("data-add-pdp")) addToBag(buy.dataset.buy, $("[data-colour][aria-pressed=true]", buy)?.dataset.colour, +$("[data-qty]", buy).textContent, $("[data-gift]", buy).checked);
    }
    if (t.dataset.unit) { scale.unit = t.dataset.unit; updateScale(); return; }
    if (t.dataset.thumb !== undefined) goSlide(+t.dataset.thumb);
    if (t.dataset.slide) goSlide(currentSlide() + +t.dataset.slide);
    if (t.dataset.cols) {
      const n = +t.dataset.cols; store.set("cols", n);
      $$("[data-cols]").forEach(b => b.setAttribute("aria-pressed", b === t));
      const g = $("[data-shop-grid]"); if (g) g.className = `grid c${n}`;
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
  document.addEventListener("input", e => {
    if (e.target.matches("[data-search-input]")) runSearch(e.target.value);
    if (e.target.matches("[data-scale-height]")) { scale.h = +e.target.value; updateScale(); }
    if (e.target.matches("[data-scale-size]")) { scale.size = +e.target.value; updateScale(); }
  });
  document.addEventListener("click", e => { if (e.target.classList?.contains("modal")) closeAll(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAll();
    if (e.key === "Enter" && e.target.matches("[data-search-input]")) { const a = $("[data-search-results] a.card__name"); if (a) location.hash = a.getAttribute("href").slice(1); }
  });
  document.addEventListener("submit", e => {
    if (e.target.matches("[data-join]")) { e.preventDefault(); e.target.innerHTML = `<p class="notice" style="flex:1;text-align:center">${L("Thank you — you’re on the Atelier List.", "شكرًا لك — أنت الآن في قائمة المشغل.")}</p>`; }
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
  applyLang();
  renderBag();
  route();
})();
