# Assets con Higgsfield

Todos los assets del encargo están generados, revisados, optimizados e integrados. Modelo de imagen `gpt_image_2` (calidad media; 2k en escenas 16:9, 1k en objetos) y de video `minimax_h3_max` (768p).

## Prefijo de estilo (inglés; sin ajustes porque no hubo `/referencias`)
`Translucent frosted glass 3D render with iridescent refraction, soft pearl and lavender gradient background, glossy rounded forms, subtle holographic edge reflections in blue, violet and pink, soft diffused light rays, cinematic soft studio lighting, minimal composition with lots of empty space, premium futuristic and clean, no text, no letters, no logos, no watermark.`

La API no expone la semilla: la coherencia se logró reutilizando el prefijo y el mismo encuadre «objeto único centrado sobre perla». Los videos usan la imagen elegida como fotograma inicial **y final**, lo que da un bucle perfecto.

## Set final
| Asset | Tipo | Job elegido | Descartado / notas |
|---|---|---|---|
| hero-ring (póster) | imagen 16:9 2k | `fd864d89-597e-492d-b580-18efb2b16bbb` | variante `3a227f21-…` (más inclinada) |
| hero-ring (video) | video 6,6 s, loop | `862134fd-6aae-46fa-88f2-8fae926015d5` | inicio = fin = póster. MP4 537 KB + WebM 394 KB (1280×720, sin audio) |
| eje-direccion | imagen 1:1 + `remove_background` | `6c6ca3d4-…` → recorte `55460d15-cb05-4432-8efd-e5ffb46fdcef` | variante `9487a586-…` |
| eje-legalidad | imagen 1:1 + recorte | `8538b824-…` → `3ebed4b7-1ca3-44d4-acf6-9d32c0b7c21e` | una sola variante |
| eje-talento | imagen 1:1 + recorte | `3182842b-…` → `2e08bfdb-657c-4159-a2b9-35755dad9526` | una sola variante |
| eje-automatizacion | imagen 1:1 + recorte | `9a0e72f8-…` → `f26b7202-9bb9-49b0-91ce-41faf104eb89` | una sola variante |
| eje-logistica | imagen 1:1 + recorte | `647d5868-…` → `6c2f49f6-d83a-4c04-9ee2-7f2fdf742dbb` | una sola variante |
| kit-digital | imagen (la API usó 3:4 en vez de 4:5) + recorte | `6dd657f0-…` → `bdac99ec-29ed-4007-8f51-efdcd2f1c0de` | una sola variante |
| escena-problema | imagen 16:9 | `51545681-2310-4435-b53c-9a70464d5b9e` (maqueta de arcilla gris azulada) | la primera (`df02c792-…`) salió casi fotográfica y se regeneró una vez, como se pidió |
| escena-seminario | imagen 16:9 | `f900b7f3-91c8-4a48-b0ef-add0fbae5c95` | una sola variante |
| ruta-profunda | imagen 21:9 | `66413055-8055-4281-b432-5ba7d123ae83` | una sola variante |
| cierre-ring | video 5,2 s, loop | `612ed747-e3a5-44bc-9471-4401ba060eb5` | inicio = fin = póster del hero. MP4 189 KB + WebM 132 KB (960×540). Póster: su primer fotograma |
| fondos-degradado ×3 | imágenes 16:9 | `008a88e7-…`, `43a86e92-…`, `f30e4538-…` | claro, perla y noche. Se usan el 1 (secciones claras) y el 3 (bloques azul noche) |
| og-image | composición | recorte del póster del hero + titular superpuesto por código | `assets/img/og-image.jpg` (1200×630) |

**Desvío frente al encargo:** se generó una sola variante por asset (no dos) en los objetos, escenas y fondos, porque la primera salió dentro de estilo; solo hubo doble variante en el hero y en Dirección. Se regeneró una vez la escena del problema.

## Costo
Gastados: **54 créditos** (saldo 152,75 → 98,75). Cada imagen cuesta 1 crédito (también cada recorte) y cada video de 5 a 6 s unos 12,5.

## Post-proceso (reproducible)
- Imágenes: `python3 scripts/process-assets.py CARPETA_ORIGINALES` genera WebP + AVIF en 1x y 2x, en kebab-case en `assets/img`, con `width`/`height` en el HTML (macro `{{pic:…}}` de `scripts/build.mjs`).
- Videos: `ffmpeg -i original.mp4 -an -vf "scale=1280:720,fps=24" -c:v libx264 -crf 24 -pix_fmt yuv420p -movflags +faststart hero-ring.mp4` y `-c:v libvpx-vp9 -b:v 0 -crf 32` para WebM. Ambos ≤ 1,5 MB.
- Uso: `<video muted loop playsinline preload="none">` sobre el póster; solo se reproduce si no hay `prefers-reduced-motion` ni ahorro de datos, y se pausa fuera de pantalla. El LCP medido es el texto del hero, nunca el video.
