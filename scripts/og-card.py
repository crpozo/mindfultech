"""Builds public/brand/og.png, the social card, laid out like the hero itself:
copy on the left, the captured 3D brain on the right (its label pills are
erased so the card reads in one language), one
seamless background. Input: a Retina screenshot of the hero stage (brain plus
the five chips, with some air around). Fonts: Outfit[wght].ttf saved as
Outfit.ttf and IBMPlexMono-Medium.ttf next to this file (open licences, not
committed). usage: python3 scripts/og-card.py <brain-capture.png> public/brand/og.png"""
import sys
from PIL import Image, ImageDraw, ImageFont
SP = __file__.rsplit("/", 1)[0]
src_path, out_path = sys.argv[1], sys.argv[2]
W, H = 1200, 630
INK, GREY, SUB = (0x0e, 0x0d, 0x12), (0x9a, 0xa0, 0xad), (0x4c, 0x4a, 0x55)
def outfit(size, weight):
    f = ImageFont.truetype(f"{SP}/Outfit.ttf", size); f.set_variation_by_axes([weight]); return f
mono = ImageFont.truetype(f"{SP}/IBMPlexMono-Medium.ttf", 12)

# --- brain: trim the capture to its content, keep a little air ------------------
src = Image.open(src_path).convert("RGB"); px = src.load(); bg0 = px[3, 3]
def erase_chips(im):
    """Paint over the white label pills (and their soft shadows) with the
    background, row by row, so the brain stands alone."""
    w, h = im.size; p = im.load()
    white = [[min(p[x, y]) > 247 for x in range(w)] for y in range(h)]
    seen = [[False] * w for _ in range(h)]; boxes = []
    for y0 in range(h):
        for x0 in range(w):
            if white[y0][x0] and not seen[y0][x0]:
                stack = [(x0, y0)]; seen[y0][x0] = True; xs = []; ys = []
                while stack:
                    x, y = stack.pop(); xs.append(x); ys.append(y)
                    for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
                        if 0 <= nx < w and 0 <= ny < h and white[ny][nx] and not seen[ny][nx]:
                            seen[ny][nx] = True; stack.append((nx, ny))
                bw, bh = max(xs) - min(xs), max(ys) - min(ys)
                if bw > 70 and 18 < bh < 90: boxes.append((min(xs), min(ys), max(xs), max(ys)))
    def rowbg(y):
        cols = [p[x, y] for x in range(0, 8)] + [p[x, y] for x in range(w - 8, w)]
        return tuple(sum(c[i] for c in cols) // len(cols) for i in range(3))
    for (x0, y0, x1, y1) in boxes:
        for y in range(max(0, y0 - 16), min(h, y1 + 34)):
            c = rowbg(y)
            for x in range(max(0, x0 - 18), min(w, x1 + 18)): p[x, y] = c
    return len(boxes)
print("chips erased:", erase_chips(src))
def far(c): return sum(abs(c[i] - bg0[i]) for i in range(3)) > 24
xs = [x for x in range(src.width) if any(far(px[x, y]) for y in range(0, src.height, 3))]
ys = [y for y in range(src.height) if any(far(px[x, y]) for x in range(0, src.width, 3))]
pad = 26
src = src.crop((max(0, xs[0] - pad), max(0, ys[0] - pad), min(src.width, xs[-1] + pad), min(src.height, ys[-1] + pad)))
# right column: up to 600px wide, up to 540px tall
s = min(600 / src.width, 540 / src.height)
brain = src.resize((round(src.width * s), round(src.height * s)), Image.LANCZOS); bp = brain.load()
bx, by = W - 44 - brain.width, (H - brain.height) // 2

# --- background: every row takes the capture's own edge colour on that row, so
#     the paste has no seam; rows above and below continue the nearest colour ----
def edge(y):
    cols = [bp[x, y] for x in range(0, 6)] + [bp[x, y] for x in range(brain.width - 6, brain.width)]
    return tuple(sum(c[i] for c in cols) // len(cols) for i in range(3))
rows = [edge(y) for y in range(brain.height)]
card = Image.new("RGB", (W, H)); cp = card.load()
for y in range(H):
    c = rows[min(max(y - by, 0), brain.height - 1)]
    for x in range(W): cp[x, y] = c
card.paste(brain, (bx, by))

# --- copy: left column, vertically centred as a block ---------------------------
d = ImageDraw.Draw(card)
h1 = outfit(54, 500); lh = 56
sub_f = outfit(19, 400)
sub_lines = ["Full-stack software lab, powered by", "UX research and applied AI."]
def sw(t, f, sp): return sum(f.getlength(ch) for ch in t) + sp * (len(t) - 1)
def ds(x, yy, t, f, sp, fill):
    for ch in t: d.text((x, yy), ch, font=f, fill=fill); x += f.getlength(ch) + sp
SPC = 12 * 0.12; b1, b2 = "START BUILDING", "CONTACT SALES"
w1, w2 = sw(b1, mono, SPC) + 48, sw(b2, mono, SPC) + 48; bh, gap = 44, 12
block_h = lh * 2 + 22 + 27 * len(sub_lines) + 30 + bh
x0 = 84; y = (H - block_h) // 2
for line, col in (("Building the future", INK), ("with AI software", GREY)):
    d.text((x0, y), line, font=h1, fill=col, anchor="la"); y += lh
y += 22
for line in sub_lines:
    d.text((x0, y), line, font=sub_f, fill=SUB, anchor="la"); y += 27
y += 30
d.rounded_rectangle([x0, y, x0 + w1, y + bh], radius=6, fill=INK); ds(x0 + 24, y + 14, b1, mono, SPC, (255, 255, 255))
x1 = x0 + w1 + gap
d.rounded_rectangle([x1, y, x1 + w2, y + bh], radius=6, fill=(255, 255, 255), outline=(0x9e, 0x9d, 0xa2), width=2); ds(x1 + 24, y + 14, b2, mono, SPC, INK)
card.save(out_path, optimize=True)
print("saved", out_path, "brain", brain.size, "at", (bx, by), "text block", block_h)
