#!/usr/bin/env python3
"""Regenera las tarjetas sociales (1200x630) desde el og:title de cada página.

Uso, desde la raíz del repo:
    python3 tools/make-og.py

Necesita fonttools, brotli y Pillow. Convierte las fuentes woff2 del sitio a
TTF en un directorio temporal para poder dibujar con la misma tipografía.
No toca ningún otro archivo.
"""
import glob
import os
import re
import tempfile

from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont

BG, INK, MUTED, ACCENT = "#01082D", "#ADE1FB", "#5AA7D6", "#266CA9"
W, H, MARGIN, FONT_MAX, FONT_MIN = 1200, 630, 84, 72, 46


def to_ttf(src, dst, weight=None):
    font = TTFont(src)
    font.flavor = None
    if weight is not None and "fvar" in font:
        for axis in font["fvar"].axes:
            if axis.axisTag == "wght":
                axis.defaultValue = weight
    font.save(dst)


def wrap(draw, text, font, max_width):
    lines, current = [], ""
    for word in text.split():
        candidate = (current + " " + word).strip()
        if draw.textlength(candidate, font=font) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def main():
    tmp = tempfile.mkdtemp()
    display = os.path.join(tmp, "archivo.ttf")
    mono = os.path.join(tmp, "mono.ttf")
    to_ttf("assets/fonts/archivo-latin-wght.woff2", display, 600)
    to_ttf("assets/fonts/jetbrains-mono-latin-400.woff2", mono)

    count = 0
    for page in glob.glob("**/*.html", recursive=True):
        with open(page, encoding="utf-8") as handle:
            html = handle.read()
        image = re.search(r'<meta property="og:image" content="([^"]+)"', html)
        if not image:
            continue
        path = os.path.join("assets", image.group(1).split("/assets/")[-1])
        if not os.path.exists(path):
            print("sin archivo:", path)
            continue
        title = re.search(r'<meta property="og:title" content="([^"]+)"', html)
        title = title.group(1) if title else re.search(r"<title>(.*?)</title>", html, re.S).group(1)
        title = re.sub(r"\s*[·|]\s*José Tovar.*$", "", title).strip()

        card = Image.new("RGB", (W, H), BG)
        draw = ImageDraw.Draw(card)
        size, lines = FONT_MAX, []
        while size >= FONT_MIN:
            font = ImageFont.truetype(display, size)
            try:
                font.set_variation_by_axes([600])
            except Exception:
                pass
            lines = wrap(draw, title, font, W - 2 * MARGIN)
            if len(lines) <= 3:
                break
            size -= 6
        line_height = int(size * 1.18)
        y = (H - line_height * len(lines)) // 2 - 20
        for line in lines:
            draw.text((MARGIN, y), line, font=font, fill=INK)
            y += line_height
        draw.rectangle([MARGIN, H - 84, MARGIN + 10, H - 74], fill=ACCENT)
        draw.text((MARGIN + 26, H - 90), "guajilodev", font=ImageFont.truetype(mono, 26), fill=MUTED)
        card.save(path, optimize=True)
        count += 1
    print(f"{count} tarjetas regeneradas")


if __name__ == "__main__":
    main()
