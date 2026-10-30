# QA-CHECKLIST · 360° Consultores

Leyenda: ✅ **hecho en código** · ⚙️ **pendiente de configurar por usted** (con instrucciones) · 🔍 **pendiente de validación manual**.

## Resultados de las pruebas automáticas (30 de octubre de 2026). Sin compresión el rendimiento móvil baja a 95 (LCP 2,9 s); en producción CloudFront comprime
| Prueba | Móvil | Escritorio |
|---|---|---|
| Lighthouse Rendimiento (servidor con Brotli, como CloudFront) | **100** | **100** |
| Accesibilidad / Mejores prácticas / SEO | 100 / 100 / 100 | 100 / 100 / 100 |
| LCP / CLS / TBT (sustituto de INP) | 1,7 s / 0 / 50 ms | 0,4 s / 0,009 / 0 ms |

- `node scripts/qa.mjs`: **todos los chequeos pasan**: 0 enlaces o anclas rotos en las 3 páginas, un solo `h1`, imágenes con `alt`/`width`/`height`, título 57/60 y descripción 141/155 caracteres, `robots` sin `noindex` (solo la 404), JSON-LD válido (Organization + ProfessionalService, WebSite, Service, FAQPage idéntico al acordeón, sin reseñas inventadas), CSP sin `unsafe-inline`, sin credenciales.
- Pruebas de navegador (Playwright): sin scroll horizontal ni errores de consola en **360, 768, 1280 y 1920 px**; menú móvil, acordeón, validación del formulario, envío con éxito y con error, y consentimiento (sin consentimiento no se carga ningún script de terceros; al rechazar tampoco; al aceptar sí).
- Pendiente de ustedes: el **Probador de resultados enriquecidos de Google** (requiere la URL pública) y las pruebas en producción.

## Los 30 puntos
| # | Punto | Estado | Detalle / instrucciones |
|---|---|---|---|
| 01 | Alta de la propiedad en Search Console | ⚙️ | Propiedad «Dominio», verificación TXT por DNS (o `node scripts/set-domain.mjs https://www.su-dominio TOKEN`). Ver `DEPLOY.md` §6 |
| 02 | sitemap.xml generado y enviado | ⚙️ | Generado ✅ (con `lastmod`). Envíelo en Search Console → Sitemaps tras publicar |
| 03 | robots.txt sin bloquear el rastreo | ✅ | `Allow: /` y `Sitemap:` apuntando al dominio (se actualiza con `set-domain.mjs`) |
| 04 | Sin etiquetas noindex accidentales | ✅ | Solo `404.html` lleva `noindex`; verificado por `qa.mjs` |
| 05 | Google Analytics 4 | ⚙️ | Escriba `ga4Id: "G-XXXXXXXXXX"` en `config.js`; cargue con consentimiento |
| 06 | Google Tag Manager si aplica | ⚙️ | Opcional: `gtmId: "GTM-XXXXXXX"`; el sitio envía eventos al `dataLayer` |
| 07 | Eventos y conversiones en GA4 | ⚙️ | Eventos en código ✅ (`form_submit`, `click_whatsapp`, `click_email`, `click_telefono`, `click_cta_principal`, `scroll_75`). En GA4 → Administrar → Eventos, marque `form_submit` como evento clave; verifique en DebugView |
| 08 | Meta Pixel | ⚙️ | `metaPixelId` en `config.js` (solo con consentimiento de marketing; envía `Lead` y `Contact`) |
| 09 | PostHog / Hotjar / Clarity | ⚙️ | `clarityId` o `posthogKey` en `config.js`. Hotjar no está integrado (puede cargarse desde GTM) |
| 10 | Banner de cookies | ✅ | Aceptar, rechazar y configurar; reabrible desde «Preferencias de cookies» |
| 11 | Bloqueo de scripts no esenciales hasta el consentimiento | ✅ | Consent Mode v2 en `denied` por defecto; probado en navegador |
| 12 | Política de privacidad actualizada | 🔍 | Completa (Ley 1581 de 2012, Decreto 1377 de 2013). Valide los marcados `[CONFIRMAR]`: razón social, NIT, dirección, proveedores |
| 13 | SSL/TLS y HTTPS forzado | ⚙️ | ACM + CloudFront «Redirect HTTP to HTTPS» + HSTS (`DEPLOY.md` §2 a §4) |
| 14 | DNS, dominio principal y redirecciones canónicas | ⚙️ | Host canónico `www`; CloudFront Function incluida (`DEPLOY.md` §5) |
| 15 | Sin credenciales, tokens ni datos de staging | ✅ | Verificado por `qa.mjs`; `config.js` es público y solo lleva IDs |
| 16 | Backups automáticos | ⚙️ | Versionado de S3 + ciclo de vida (`DEPLOY.md` §8) |
| 17 | Prueba de restauración | 🔍 | Procedimiento en `DEPLOY.md` §8; anote la fecha aquí: ________ |
| 18 | PageSpeed Insights móvil y desktop | 🔍 | Local: 99 / 100 (arriba). Repita sobre la URL pública con CDN y compresión |
| 19 | Core Web Vitals (LCP, INP, CLS) | 🔍 | Laboratorio en verde (LCP 2,1 s en móvil con red lenta simulada). Los datos de campo aparecen en Search Console tras ~28 días |
| 20 | Imágenes, fuentes y scripts optimizados | ✅ | Fuentes WOFF2 autohospedadas con preload y `swap`, CSS crítico inline, JS con `defer`, logo en WebP, arte en SVG. Imágenes AVIF + WebP 1x/2x con `width`/`height`, videos MP4 + WebM ≤ 540 KB con póster, solo póster con movimiento reducido o ahorro de datos (`docs/assets-higgsfield.md`) |
| 21 | Prueba en móviles reales y distintos tamaños | 🔍 | Probado en emulación (360, 768, 1280, 1920). Falta iPhone y Android reales |
| 22 | Contraste, foco visible y teclado | ✅ | Lighthouse accesibilidad 100, foco visible, enlace «Saltar al contenido», menú y acordeón con teclado. 🔍 Haga un recorrido con lector de pantalla |
| 23 | Formularios de punta a punta | ⚙️ | Validación, honeypot y estados probados ✅. Falta conectar `formEndpoint` (`backend-ejemplo/`) |
| 24 | Los correos realmente llegan | 🔍 | Con el endpoint activo, envíe una solicitud y confirme recepción (y SPF/DKIM de SES) |
| 25 | Botones, enlaces, WhatsApp y llamadas | ✅ | `wa.me/573153386887` con mensaje, `tel:` y `mailto:` verificados. 🔍 Pruebe el toque en un celular |
| 26 | Vulnerabilidades críticas y permisos | ⚙️ | Sin dependencias en producción; CSP sin `unsafe-inline`; bucket privado con OAC. Ejecute `npm audit` si agrega paquetes y revise los permisos IAM |
| 27 | Monitoreo de errores | ⚙️ | `sentryDsn` en `config.js` (opcional) + alarma CloudWatch 5xx |
| 28 | Monitoreo de uptime y alertas | ⚙️ | UptimeRobot / Route 53 Health Check (`DEPLOY.md` §9) |
| 29 | Regresión final en producción | 🔍 | Repita `qa.mjs`, Lighthouse y las pruebas de formulario sobre el dominio real |
| 30 | Conformidad final del cliente | 🔍 | Revisión y firma del cliente: ________ |
