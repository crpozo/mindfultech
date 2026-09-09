"""Builds public/brand/og.png, the social card: a capture of the hero brain with
its chips on top and the hero headline, subtitle and buttons underneath, on one
seamless background. Input: a Retina screenshot of the hero stage (brain plus
the five chips, with some air around). Fonts: Outfit[wght].ttf saved as
Outfit.ttf and IBMPlexMono-Medium.ttf next to this file (open licences, not
committed). usage: python3 scripts/og-card.py <brain-capture.png> public/brand/og.png"""
import sys
from PIL import Image, ImageDraw, ImageFont
SP = __file__.rsplit("/", 1)[0]
src_path, out_path = sys.argv[1], sys.argv[2]
W, H, BAND = 1200, 630, 416
INK, GREY, SUB = (0x0e, 0x0d, 0x12), (0x9a, 0xa0, 0xad), (0x4c, 0x4a, 0x55)
def outfit(size, weight):
    f = ImageFont.truetype(f"{SP}/Outfit.ttf", size); f.set_variation_by_axes([weight]); return f
mono = ImageFont.truetype(f"{SP}/IBMPlexMono-Medium.ttf", 12)

src = Image.open(src_path).convert("RGB")
# trim uniform borders (anything close to the corner colour), keep a little air
px = src.load(); bg0 = px[3, 3]
def far(c): return sum(abs(c[i] - bg0[i]) for i in range(3)) > 24
xs = [x for x in range(src.width) if any(far(px[x, y]) for y in range(0, src.height, 3))]
ys = [y for y in range(src.height) if any(far(px[x, y]) for x in range(0, src.width, 3))]
pad = 30
src = src.crop((max(0, xs[0] - pad), max(0, ys[0] - pad), min(src.width, xs[-1] + pad), min(src.height, ys[-1] + pad)))
# scale to the band height exactly
s = BAND / src.height
brain = src.resize((round(src.width * s), BAND), Image.LANCZOS)
bp = brain.load()

# background: each band row takes the capture's own edge colour on that row, so
# the paste has no seam; below the band the last colour eases to white
card = Image.new("RGB", (W, H), "#ffffff"); cp = card.load()
def edge(y):
    cols = [bp[x, y] for x in range(0, 6)] + [bp[x, y] for x in range(brain.width - 6, brain.width)]
    return tuple(sum(c[i] for c in cols) // len(cols) for i in range(3))
rows = [edge(y) for y in range(BAND)]
for y in range(H):
    if y < BAND: c = rows[y]
    else:
        t = (y - BAND) / (H - BAND); last = rows[-1]
        c = tuple(round(last[i] + (255 - last[i]) * t) for i in range(3))
    for x in range(W): cp[x, y] = c
x0 = (W - brain.width) // 2
card.paste(brain, (x0, 0))

# copy, centred under the brain
d = ImageDraw.Draw(card)
h1 = outfit(46, 500); lh = 48; y = BAND + 10
for line, col in (("Construyendo el futuro", INK), ("con software de IA", GREY)):
    d.text((W / 2, y), line, font=h1, fill=col, anchor="ma"); y += lh
y += 10
d.text((W / 2, y), "Laboratorio de software full-stack, impulsado por investigación UX e IA aplicada.", font=outfit(18, 400), fill=SUB, anchor="ma")
y += 26 + 16
def sw(t, f, sp): return sum(f.getlength(ch) for ch in t) + sp * (len(t) - 1)
def ds(x, yy, t, f, sp, fill):
    for ch in t: d.text((x, yy), ch, font=f, fill=fill); x += f.getlength(ch) + sp
SPC = 12 * 0.12; b1, b2 = "EMPIEZA A CONSTRUIR", "HABLEMOS"
w1, w2 = sw(b1, mono, SPC) + 48, sw(b2, mono, SPC) + 48; bh, gap = 42, 12
bx = round((W - (w1 + gap + w2)) / 2)
d.rounded_rectangle([bx, y, bx + w1, y + bh], radius=6, fill=INK); ds(bx + 24, y + 13, b1, mono, SPC, (255, 255, 255))
bx2 = bx + w1 + gap
d.rounded_rectangle([bx2, y, bx2 + w2, y + bh], radius=6, fill=(255, 255, 255), outline=(0x9e, 0x9d, 0xa2), width=2); ds(bx2 + 24, y + 13, b2, mono, SPC, INK)
card.save(out_path, optimize=True)
print("saved", out_path, "brain", brain.size, "buttons end at", y + bh)
