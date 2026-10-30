# Landing 360° Consultores

Sitio estático de una sola página (HTML + CSS + JS vanilla, sin frameworks) para el **Programa de Aceleración Mipyme 360°**. Listo para S3 + CloudFront. Español de Colombia.

## Estructura
```
index.html  politica-privacidad.html  404.html   (generados desde src/)
config.js   robots.txt  sitemap.xml  llms.txt  site.webmanifest
favicon.svg favicon-32.png favicon-192.png favicon-512.png apple-touch-icon.png
assets/     css/critical.css (inline) · css/styles.css · js/ · fonts/ · img/ (AVIF/WebP) · video/ (MP4/WebM)
src/        plantillas + sprite SVG (anillo, objetos de vidrio, iconos)
content/    faq.json (única fuente del acordeón y del JSON-LD FAQPage)
scripts/    build.mjs · build-headers.mjs · set-domain.mjs · qa.mjs
security/   response-headers-policy.json · cloudfront-function-redirect.js
backend-ejemplo/  Lambda + SES (ejemplo, sin credenciales)
docs/  direccion-de-arte.md · assets-higgsfield.md
QA-CHECKLIST.md  DEPLOY.md
```

## Editar y compilar
Edite `src/*.html`, `content/faq.json` o los CSS y ejecute `node scripts/build.mjs` (regenera los tres HTML con el CSS crítico inline, el sprite, el FAQ y el JSON-LD). Luego `node scripts/build-headers.mjs` (CSP con el hash del CSS inline y los orígenes de analítica configurados) y `node scripts/qa.mjs`. Para probar: `python3 -m http.server 8080` y abra `http://localhost:8080`.

## Configurar `config.js`
Todo valor vacío desactiva su función: no se carga el script ni se muestra el dato.

| Clave | Qué es |
|---|---|
| `siteUrl` | Dominio canónico. **Cámbielo con** `node scripts/set-domain.mjs https://su-dominio [token-gsc]` (actualiza canonical, hreflang, OG, sitemap, robots, llms.txt y JSON-LD) |
| `email`, `phoneDisplay`, `phoneTel`, `whatsappNumber`, `whatsappMessage` | Contacto (ya con los datos del encargo) |
| `formEndpoint` | URL del formulario (Lambda + SES o Formspree). Vacío = abre el correo (`mailto:`) |
| `ga4Id`, `gtmId` | GA4 / GTM. Con `gtmId` el seguimiento se gestiona desde el contenedor (el sitio envía eventos al `dataLayer`) |
| `metaPixelId`, `clarityId`, `posthogKey`/`posthogHost`, `sentryDsn` | Opcionales; solo cargan tras el consentimiento |
| `gscVerification` | Token de Search Console (preferible verificar por DNS) |
| `legal.razonSocial`, `nit`, `direccion`, `ciudad` | Se muestran en el pie solo si tienen valor |

Después de cambiar IDs o endpoint: `node scripts/build-headers.mjs` y vuelva a subir la política de cabeceras.

## Eventos de conversión (GA4 / dataLayer)
`form_submit`, `click_whatsapp`, `click_email`, `click_telefono`, `click_cta_principal`, `scroll_75`. Se envían solo con consentimiento de analítica (Consent Mode v2: por defecto todo denegado, nada se carga antes de aceptar).

## Decisiones técnicas
- Sin dependencias: el movimiento es CSS + `IntersectionObserver` + `requestAnimationFrame`; no se usa GSAP.
- Sin `style=` ni manejadores inline para poder usar una CSP sin `unsafe-inline`.
- Arte 3D de Higgsfield integrado (ver `docs/assets-higgsfield.md`); el anillo interactivo, el chat de WhatsApp y la línea de tiempo están hechos en código. Para reprocesar imágenes: `python3 scripts/process-assets.py`.

## Vista previa con GitHub Pages
Las rutas son relativas y hay un `.nojekyll`, así que el sitio funciona tanto en la raíz de un dominio (CloudFront) como en `https://usuario.github.io/360-consultores-landing/`.
Settings → Pages → *Deploy from a branch* → rama `claude/vigilant-bohr-v1j0ao`, carpeta `/ (root)`. En repos privados, Pages requiere GitHub Pro; si no, el repo debe ser público.
