# Assets con Higgsfield

## Estado: bloqueado por red · 6 de 152,75 créditos gastados

La generación funciona, pero **el entorno de la sesión no puede descargar los resultados**: el proxy deniega el host `d8j0ntlcm91z4.cloudfront.net` (CDN de Higgsfield). Sin poder ver ni descargar las imágenes, se frenó el gasto después de la validación inicial y el sitio se construyó con arte hecho en código (anillo SVG de vidrio, objetos de vidrio SVG por eje, teléfono del Kit, escena del seminario, tienda apagada). El sitio es completo y funcional sin los archivos de Higgsfield.

**Para continuar**: agregue `d8j0ntlcm91z4.cloudfront.net` a *Allowed domains* de la red del entorno (menú del entorno → Edit → Network access) y pida «continúa los assets»; se descargan, se procesan y se sustituyen.

## Prefijo de estilo (inglés, sin ajustes porque no hubo referentes)
`Translucent frosted glass 3D render with iridescent refraction, soft pearl and lavender gradient background, glossy rounded forms, subtle holographic edge reflections in blue, violet and pink, soft diffused light rays, cinematic soft studio lighting, minimal composition with lots of empty space, premium futuristic and clean, no text, no letters, no logos, no watermark.`

## Generado hasta ahora (modelo `gpt_image_2`, calidad media)
| Asset | Resolución | Variantes (job id) | Estado |
|---|---|---|---|
| hero-ring (póster 16:9) | 2k | `fd864d89-597e-492d-b580-18efb2b16bbb`, `3a227f21-8294-40a8-b7bc-b7614180b35b` | generado, sin revisar ni descargar |
| eje-direccion (1:1) | 1k | `6c6ca3d4-1e32-4d82-87a9-7264e6e803be`, `9487a586-7d2f-4602-a8ba-f26feb9b07ac` | generado, sin revisar ni descargar |

Semilla: no expuesta por la API; para mantener coherencia se reutiliza el prefijo y se usa la mejor variante como imagen de referencia en el resto del set.

## Pendiente (plan y costo estimado)
| Asset | Tipo | Costo estimado |
|---|---|---|
| eje-legalidad, eje-talento, eje-automatizacion, eje-logistica | 4 × 2 variantes, 1:1, luego `remove_background` | ~8 a 16 créditos |
| kit-digital 4:5, escena-problema, escena-seminario, ruta-profunda 21:9, fondos-degradado ×3, og-image | 2 variantes cada uno | ~16 a 20 créditos |
| hero-ring video 6 a 8 s (loop: imagen inicial = final) y cierre-ring video 5 s | `minimax_h3_max` 768p, ~12,5 créditos por 5 s | ~40 a 50 créditos |
| **Total restante** | | **~65 a 85 créditos** (saldo 146,75) |

## Post-proceso previsto
Imágenes a WebP + AVIF 1x y 2x con `width`/`height`, nombres en kebab-case en `assets/img`. Videos MP4 (H.264) + WebM sin audio, ≤ 1,5 MB, con `poster`, `muted loop playsinline preload="metadata"`; con ahorro de datos o `prefers-reduced-motion` solo el póster; el LCP seguirá siendo el titular.
