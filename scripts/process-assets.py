#!/usr/bin/env python3
"""Optimiza los assets generados con Higgsfield: WebP + AVIF en 1x y 2x, nombres en kebab-case.
Uso: python3 scripts/process-assets.py CARPETA_ORIGINALES
Espera en la carpeta: hero-a.png cut-dir.png cut-leg.png cut-tal.png cut-aut.png cut-log.png cut-kit.png
prob2.png sem.png ruta.png bg1.png bg2.png bg3.png (ver docs/assets-higgsfield.md para el origen de cada uno).
Requiere Pillow con soporte AVIF/WebP."""
import sys
from pathlib import Path
from PIL import Image

src = Path(sys.argv[1]); out = Path(__file__).resolve().parent.parent / "assets" / "img"
out.mkdir(parents=True, exist_ok=True)

def save(im, name, width, avif_q=55, webp_q=82):
    h = round(im.height * width / im.width)
    r = im.resize((width, h), Image.LANCZOS)
    r.save(out / f"{name}.webp", quality=webp_q, method=6)
    r.save(out / f"{name}.avif", quality=avif_q, speed=4)
    print(f"{name}: {width}x{h}  webp {(out/f'{name}.webp').stat().st_size//1024} KB  avif {(out/f'{name}.avif').stat().st_size//1024} KB")

def set_(file, name, w1, rgba=False, **kw):
    im = Image.open(src / file).convert("RGBA" if rgba else "RGB")
    save(im, f"{name}-1x", w1, **kw); save(im, f"{name}-2x", w1 * 2, **kw)

for f, n in [("cut-dir.png", "eje-direccion"), ("cut-leg.png", "eje-legalidad"), ("cut-tal.png", "eje-talento"), ("cut-aut.png", "eje-automatizacion"), ("cut-log.png", "eje-logistica")]:
    set_(f, n, 320, rgba=True, avif_q=60)
set_("cut-kit.png", "kit-digital", 360, rgba=True, avif_q=60)
set_("prob2.png", "escena-problema", 640)
set_("sem.png", "escena-seminario", 640)
set_("ruta.png", "ruta-profunda", 1136, avif_q=50)
set_("hero-a.png", "hero-ring-poster", 960, avif_q=50)
for f, n in [("bg1.png", "fondo-degradado-1"), ("bg2.png", "fondo-degradado-2"), ("bg3.png", "fondo-degradado-3")]:
    im = Image.open(src / f).convert("RGB"); save(im, n, 1280, avif_q=40, webp_q=70)
