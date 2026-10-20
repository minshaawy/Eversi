/* Eversi catalogue — edit products here.
   Prices are in SAR (VAT incl.) and are PLACEHOLDERS until the founder confirms the price list.
   discount: optional percentage off `price`; the store shows the original struck through and charges the reduced price.
   img: base name in assets/img (a "-sm" variant is used for cards). pos: CSS object-position for card crops. */
window.EVERSI_LINES = {
  laminated: { name: "Laminated Precision", season: "Gourmand Noir · AW", blurb: "Mille-feuille layering, sharp chevron folds, envelope construction — structure you can see in cross-section." },
  whipped:   { name: "Whipped & Pillowy",   season: "Gourmand Noir · AW", blurb: "Plush quilting, gathered panels and molten-gold hardware — volume you want to press a thumb into." },
  glace:     { name: "Glacé & Sculptural",  season: "Sorbet Pastel · SS", blurb: "Sorbet tones, piping-bag wave cutouts and a playful, brunch-table sophistication." },
  patisserie:{ name: "Pâtisserie Objets",   season: "The Vitrine",        blurb: "Sculptural minaudières modelled on the pastry case itself — the house's most theatrical pieces." }
};

window.EVERSI_PRODUCTS = [
  {
    slug: "strawberry-drizzle", name: "The Strawberry Drizzle", type: "bag", line: "glace", price: 1850, discount: 10, badge: "New",
    short: "Top-handle · Pêche calfskin · Ganache wave",
    desc: "A structured top-handle in pêche calfskin, dipped along the base in a ganache wave and finished with hand-set sprinkles of gold stud. Periwinkle rolled handles sit on gold collars — the whole silhouette reads like the first slice of a strawberry gâteau.",
    details: ["Smooth calfskin with contrast ganache leather wave", "Hand-set gold-tone studs", "Rolled leather handles, 14 cm drop", "Suede-lined interior with one slip pocket", "W 28 × H 17 × D 10 cm"],
    images: [{ src: "drizzle-1", pos: "50% 55%" }],
    colours: [{ name: "Pêche & Ganache", hex: "#F2B4A4" }]
  },
  {
    slug: "sorbet-mini", name: "The Sorbet Mini", type: "bag", line: "glace", price: 990, discount: 10, badge: "New",
    short: "Mini bowling bag · Three flavours",
    desc: "A palm-sized dome bag in two-tone calfskin — a sorbet shell around a vanilla-cream front panel, zipped with a gold pull. Choose your flavour, or collect all three.",
    details: ["Smooth calfskin, contrast cream panel", "Two rolled top handles + detachable strap", "Two-way gold zip", "Fits phone, cardholder and lipstick", "W 19 × H 12 × D 8 cm"],
    images: [{ src: "sorbet-1", pos: "50% 60%" }],
    colours: [{ name: "Lavande", hex: "#C9C2E8" }, { name: "Coral", hex: "#F6BDBB" }, { name: "Pistache", hex: "#BFE3D0" }]
  },
  {
    slug: "toffee-clutch", name: "The Toffee Clutch", type: "bag", line: "whipped", price: 1450, discount: 10, badge: "Winter Edit",
    short: "Quilted caramel calfskin · Cream velvet",
    desc: "Warm hands, warmer evenings. Diamond-quilted caramel calfskin folds over a plush cream-velvet body, closed with a gold turn-lock and carried on a fine gold chain.",
    details: ["Quilted calfskin flap, cream velvet body", "Gold-tone turn-lock", "Detachable chain, 55 cm drop", "Suede interior", "W 26 × H 15 × D 6 cm"],
    images: [{ src: "toffee-1", pos: "60% 55%" }],
    colours: [{ name: "Toffee", hex: "#B4712F" }]
  },
  {
    slug: "millefeuille-pouch", name: "The Millefeuille Pouch", type: "bag", line: "laminated", price: 890, discount: 10,
    short: "Four leather leaves · Hand-stitched",
    desc: "Layer upon layer. Four leaves of cream calfskin and chocolate suede, stacked into a chevron envelope and hand-stitched in tonal thread — a pouch you read in cross-section.",
    details: ["Cream calfskin and chocolate suede", "Hand-stitched chevron layers", "Magnetic closure", "Carry as a pouch or insert into a larger bag", "W 30 × H 18 cm"],
    images: [{ src: "mille-1", pos: "70% 40%" }],
    colours: [{ name: "Crème & Chocolat", hex: "#EADBC0" }]
  },
  {
    slug: "clementine", name: "The Clementine", type: "bag", line: "glace", price: 1350, discount: 10,
    short: "Half-moon shoulder bag · Embossed segments",
    desc: "A half-moon of tangerine calfskin, embossed with the segments of a sliced clementine and finished with a leaf-and-stem strap fitting. Bright enough to carry a whole brunch.",
    details: ["Embossed smooth calfskin", "Adjustable shoulder strap", "Gold-tone leaf hardware", "Zip closure", "W 30 × H 15 × D 6 cm"],
    images: [{ src: "clementine-curtain", pos: "50% 55%" }, { src: "clementine-2", pos: "50% 62%" }, { src: "clementine-1", pos: "50% 50%" }],
    colours: [{ name: "Clementine", hex: "#E58A2E" }]
  },
  {
    slug: "fraisier", name: "The Fraisier", type: "bag", line: "patisserie", price: 2400, discount: 10, badge: "Signature",
    short: "Minaudière · Hand-painted layers",
    desc: "The house signature: a layered strawberry gâteau rendered as a rigid minaudière — sponge, crème and fruit hand-painted on lacquered leather, topped with a cream handle. Presented in its own velvet hatbox.",
    details: ["Lacquered leather over a rigid frame", "Hand-painted fruit and crème", "Top handle + detachable gold chain", "Delivered in the pink velvet hatbox", "W 20 × H 14 × D 10 cm"],
    images: [{ src: "fraisier-1", pos: "50% 55%" }, { src: "fraisier-2", pos: "45% 50%" }, { src: "fraisier-3", pos: "50% 60%" }, { src: "fraisier-4", pos: "50% 50%" }],
    colours: [{ name: "Fraise", hex: "#F3B7B9" }]
  },
  {
    slug: "chantilly-cupcake", name: "The Chantilly Cupcake", type: "bag", line: "patisserie", price: 2150, discount: 10,
    short: "Swirl-top minaudière · Cherry clasp",
    desc: "A fluted pink cup crowned with a piped chantilly swirl and a single lacquered cherry. The swirl lifts on a hinge; a gold push-lock keeps it closed.",
    details: ["Fluted calfskin base, sculpted swirl lid", "Lacquered cherry finial", "Gold arch handle + chain strap", "W 18 × H 20 cm"],
    images: [{ src: "cupcake-1", pos: "50% 50%" }, { src: "cupcake-2", pos: "50% 50%" }, { src: "cupcake-3", pos: "40% 50%" }],
    colours: [{ name: "Rose & Chantilly", hex: "#F4C6CC" }]
  },
  {
    slug: "glazed-ring", name: "The Glazed Ring", type: "bag", line: "patisserie", price: 1690, discount: 10,
    short: "Round bag · Glazed calfskin · Sprinkles",
    desc: "A perfect ring of golden calfskin under a strawberry glaze, studded with enamel sprinkles. The hole is real — the bag zips around it.",
    details: ["Glazed calfskin with enamel sprinkles", "Gold arch handle + chain", "Wraparound zip", "W 20 × H 20 × D 7 cm"],
    images: [{ src: "glazed-1", pos: "50% 50%" }, { src: "glazed-2", pos: "50% 50%" }, { src: "glazed-3", pos: "45% 50%" }],
    colours: [{ name: "Strawberry Glaze", hex: "#F29AB0" }]
  },
  {
    slug: "macaron", name: "The Macaron", type: "bag", line: "whipped", price: 1590, discount: 10,
    short: "Round shoulder bag · Ganache-quilted filling",
    desc: "Two smooth shells around a quilted, pillowy filling — pâtisserie-pastel and a little bit edible. Carry by the gold handle or long on the chain.",
    details: ["Smooth calfskin shells, quilted nappa filling", "Gold handle + chain strap", "Zip closure around the filling", "W 20 × H 18 × D 10 cm"],
    images: [{ src: "macaron-1", pos: "50% 50%" }, { src: "macaron-2", pos: "60% 55%" }, { src: "macaron-3", pos: "50% 50%" }],
    colours: [{ name: "Pistache", hex: "#CFE4D3" }, { name: "Lavande", hex: "#D9CFE0" }]
  },
  {
    slug: "eclair", name: "The Éclair au Chocolat", type: "bag", line: "patisserie", price: 1990, discount: 10,
    short: "Frame baguette · Ganache glaze",
    desc: "A long frame baguette in golden choux-textured leather, glazed in ganache and piped with crème pearls. Opens on a gold kiss-lock frame.",
    details: ["Textured calfskin, lacquered ganache top", "Gold kiss-lock frame and arch handle", "Detachable chain", "W 30 × H 12 × D 10 cm"],
    images: [{ src: "eclair-1", pos: "50% 55%" }, { src: "eclair-2", pos: "60% 50%" }],
    colours: [{ name: "Ganache", hex: "#4A2A1A" }]
  },

  /* ---- Bag charms ---- */
  { slug: "charm-fraisier-slice", name: "Fraisier Slice Charm", type: "charm", line: "patisserie", price: 520, badge: "New",
    short: "Leather bag charm · Hand-stitched", desc: "A slice of the house gâteau, in stitched leather layers with a lacquered strawberry. Clips to any handle.",
    details: ["Stitched leather", "Gold-tone ring and clasp", "H 7 cm"], images: [{ src: "c-fraisier", pos: "50% 50%" }], colours: [{ name: "Fraise", hex: "#F3B7B9" }] },
  { slug: "charm-cherry", name: "Cerise Charm", type: "charm", line: "patisserie", price: 450,
    short: "Lacquered cherries · Engraved leaf", desc: "Two lacquered cherries on a gold stem, with an Eversi-engraved leaf. The finishing touch for any top handle.",
    details: ["Lacquered resin cherries", "Engraved gold-tone leaf", "H 8 cm"], images: [{ src: "c-cherry", pos: "50% 50%" }], colours: [{ name: "Cerise", hex: "#C8394A" }] },
  { slug: "charm-pistache-slice", name: "Pistache Slice Charm", type: "charm", line: "laminated", price: 490,
    short: "Laminated leather · Pistachio crown", desc: "Laminated golden leather layered with crème, crowned with a pistachio-green rosette.",
    details: ["Layered leather", "Gold-tone ring", "H 7 cm"], images: [{ src: "c-pistache", pos: "50% 50%" }, { src: "c-pistache-2", pos: "50% 50%" }], colours: [{ name: "Pistache", hex: "#9DBF7A" }] },
  { slug: "charm-strawberry-cube", name: "Fraise Cube Charm", type: "charm", line: "patisserie", price: 470,
    short: "Square gâteau · Strawberry crown", desc: "A square of strawberry shortcake with a single berry on top.",
    details: ["Stitched leather", "Gold-tone ring", "H 6 cm"], images: [{ src: "c-cube", pos: "50% 50%" }], colours: [{ name: "Fraise", hex: "#F3B7B9" }] },
  { slug: "charm-cupcake", name: "Cupcake Charm", type: "charm", line: "whipped", price: 420,
    short: "Felted swirl · Gold-stitched cup", desc: "A felted rose swirl on a gold-stitched leather cup, scattered with sprinkles.",
    details: ["Felted wool and leather", "Gold-tone ring", "H 6 cm"], images: [{ src: "c-cupcake", pos: "50% 50%" }], colours: [{ name: "Rose", hex: "#E8A6BE" }] },
  { slug: "charm-glazed", name: "Glazed Ring Charm", type: "charm", line: "patisserie", price: 420,
    short: "Leather doughnut · Enamel sprinkles", desc: "The Glazed Ring, small enough to hang from it.",
    details: ["Leather with enamel sprinkles", "Gold-tone ring", "Ø 6 cm"], images: [{ src: "c-donut", pos: "50% 50%" }], colours: [{ name: "Strawberry Glaze", hex: "#F29AB0" }] },
  { slug: "charm-croissant", name: "Croissant Charm", type: "charm", line: "laminated", price: 450,
    short: "Laminated tan leather", desc: "Rolled, laminated tan leather with stitched ridges — the breakfast of charms.",
    details: ["Laminated leather", "Gold-tone ring", "W 9 cm"], images: [{ src: "c-croissant", pos: "50% 50%" }], colours: [{ name: "Beurre", hex: "#C98A45" }] },
  { slug: "charm-cheesecake", name: "Cheesecake Charm", type: "charm", line: "whipped", price: 420,
    short: "Cream leather · Coulis drip", desc: "Cream leather wedge on a biscuit base, with a coulis drip and a lacquered berry.",
    details: ["Leather and lacquer", "Gold-tone ring", "H 6 cm"], images: [{ src: "c-cheesecake", pos: "50% 50%" }], colours: [{ name: "Crème", hex: "#F2E6CF" }] }
];
