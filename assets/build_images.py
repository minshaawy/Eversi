"""Rebuild web-sized product imagery from the Eversi source renders.
Run from the Eversi folder:  python3 "Eversi Shop/assets/build_images.py"
"""
import os
from PIL import Image

SRC = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")

MAP = {
    # bags
    "drizzle-1":   "social-assets/new-arrivals/wave-bag.jpg",
    "sorbet-1":    "social-assets/new-arrivals/mochi-minis.jpg",
    "toffee-1":    "social-assets/new-arrivals/toffee-clutch.jpg",
    "mille-1":     "social-assets/new-arrivals/millefeuille.jpg",
    "clementine-1":"social campaign/new bag.jpeg",
    "clementine-curtain":"social campaign/clementine-curtain-champagne.jpg",
    "clementine-2":"social campaign/new bag composite/orange-bag-v1.png",
    "fraisier-1":  "imgs/magnific_use-the-uploaded-referenc_lJZ1j79gv9.png",
    "fraisier-2":  "imgs/magnific_use-the-uploaded-referenc_KLPQqx8kqp.png",
    "fraisier-3":  "social campaign/Gemini_Generated_Image_tv6cy2tv6cy2tv6c.jpeg",
    "fraisier-4":  "imgs/Gemini_Generated_Image_8onnn68onnn68onn.jpeg",
    "cupcake-1":   "imgs/magnific_use-the-uploaded-referenc_lJZ1tjogv9.png",
    "cupcake-2":   "imgs/magnific_use-the-uploaded-referenc_aFL8GmqfSh.png",
    "cupcake-3":   "imgs/magnific_use-the-uploaded-referenc_SyAxQWQUb8.png",
    "glazed-1":    "imgs/magnific_use-the-uploaded-referenc_rgNqhbBxtc.png",
    "glazed-2":    "imgs/magnific_use-the-uploaded-referenc_lJZ1ExVgv9.png",
    "glazed-3":    "imgs/magnific_use-the-uploaded-referenc_XmqV2X4Bfo.png",
    "macaron-1":   "imgs/magnific_use-the-uploaded-referenc_P30UksQ42C.png",
    "macaron-2":   "imgs/magnific_use-the-uploaded-referenc_mErXW33hJQ.png",
    "macaron-3":   "imgs/magnific_use-the-uploaded-referenc_N2MJxFw6D9.png",
    "eclair-1":    "imgs/magnific_use-the-uploaded-referenc_5jyQiqkKxe.png",
    "eclair-2":    "imgs/magnific_use-the-uploaded-referenc_yicSSi6PW9.png",
    # charms
    "c-cupcake":   "imgs/magnific_a-cute-miniature-3d-cupca_0efrSfQTfW.png",
    "c-donut":     "imgs/magnific_a-cute-miniature-3d-donut_dtqSPlcXSL.png",
    "c-croissant": "imgs/magnific_a-cute-miniature-3d-frenc_jU3VB1BLD0.png",
    "c-cheesecake":"imgs/magnific_a-cute-miniature-3d-new-y_1lNceadr4r.png",
    "c-fraisier":  "imgs/magnific_a-cute-miniature-3d-straw_CqgiAn9EEy.png",
    "c-pistache":  "imgs/Gemini_Generated_Image_v7a5fzv7a5fzv7a5.jpeg",
    "c-pistache-2":"imgs/Gemini_Generated_Image_dpyneldpyneldpyn.jpeg",
    "c-cube":      "imgs/Gemini_Generated_Image_wqgucxwqgucxwqgu.jpeg",
    "c-cherry":    "imgs/ChatGPT Image Sep 19, 2026, 01_39_58 PM.png",
    # house / packaging
    "pack-bag":    "social-assets/figma/bag-sq.jpg",
    "pack-box":    "social-assets/figma/box-sq.jpg",
    "pack-dust":   "social-assets/figma/dust-sq.jpg",
    "pack-gift":   "social-assets/figma/gift-sq.jpg",
    "pack-plate":  "social-assets/figma/plate-tall.jpg",
    "pack-hatbox": "imgs/Gemini_Generated_Image_3z1bn13z1bn13z1b.jpeg",
    "pack-plaid":  "Gemini_Generated_Image_766ozh766ozh766o.jpeg",
    "pack-carry":  "Gemini_Generated_Image_99s4ey99s4ey99s4.jpeg",
    "leather":     "imgs/ChatGPT Image Sep 19, 2026, 01_37_05 PM.png",
}

os.makedirs(OUT, exist_ok=True)
for key, rel in MAP.items():
    im = Image.open(os.path.join(SRC, rel)).convert("RGB")
    for suffix, edge in (("", 1600), ("-sm", 720)):
        c = im.copy()
        c.thumbnail((edge, edge), Image.LANCZOS)
        c.save(os.path.join(OUT, f"{key}{suffix}.jpg"), "JPEG", quality=80, optimize=True, progressive=True)
    print(f"{key:14s} {im.size}")
