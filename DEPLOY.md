# Despliegue: S3 + CloudFront + ACM

Reemplace `www.360consultores.co` por su dominio (y ejecute antes `node scripts/set-domain.mjs https://su-dominio`).

## 1. Bucket S3
1. Cree un bucket privado (Block Public Access activado), región `us-east-1` o la más cercana. **Active el versionado** (respaldo y restauración, ver sección 8).
2. Compile y suba: `node scripts/build.mjs && node scripts/build-headers.mjs && node scripts/qa.mjs`, luego
   `aws s3 sync . s3://BUCKET --exclude ".git/*" --exclude ".claude/*" --exclude "src/*" --exclude "scripts/*" --exclude "content/*" --exclude "backend-ejemplo/*" --exclude "docs/*" --exclude "referencias/*" --exclude "node_modules/*" --exclude "*.md" --exclude "package.json" --exclude "security/*" --delete`
3. Cache: `assets/*` con `Cache-Control: public, max-age=31536000, immutable` (si cambia un archivo, renómbrelo o invalide); HTML, `config.js`, `sitemap.xml`, `robots.txt` y `llms.txt` con `max-age=300`.
   Ejemplo: `aws s3 cp s3://BUCKET/assets s3://BUCKET/assets --recursive --metadata-directive REPLACE --cache-control "public,max-age=31536000,immutable"`.
4. Tipos de contenido: `.webmanifest` → `application/manifest+json`, `.txt` → `text/plain; charset=utf-8`.

## 2. Certificado (ACM)
En **us-east-1** solicite un certificado público para `www.su-dominio` y `su-dominio`; valide por DNS (CNAME en su zona).

## 3. CloudFront
1. Origen: el bucket S3 con **Origin Access Control (OAC)**; aplique la política de bucket que CloudFront le propone.
2. Comportamiento por defecto: redirigir HTTP a HTTPS, métodos GET/HEAD, compresión activada (Brotli/Gzip), política de caché `CachingOptimized`.
3. Alternate domain names: `www.su-dominio` y `su-dominio`; certificado de ACM; TLS mínimo `TLSv1.2_2021`; HTTP/2 y HTTP/3 activados.
4. Objeto raíz por defecto: `index.html`.
5. Páginas de error: 403 y 404 → `/404.html` con código de respuesta 404.

## 4. Cabeceras de seguridad
Cree una *Response headers policy* con el contenido de `security/response-headers-policy.json` (CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`/`frame-ancestors`, `Permissions-Policy`) y asóciela al comportamiento. Regenérela con `node scripts/build-headers.mjs` cada vez que cambie `config.js` (orígenes de analítica) o el CSS crítico.

## 5. DNS y dominio canónico
- **Host canónico elegido: `www`** (con HTTPS). Cree en Route 53 (o su DNS) registros `ALIAS/CNAME` de `www` y del apex hacia la distribución.
- Cree una **CloudFront Function** (viewer request) con `security/cloudfront-function-redirect.js` y asóciela: redirige 301 el apex a `www` y resuelve `/` → `/index.html`. HTTP→HTTPS ya lo hace el comportamiento.
- Verifique: `curl -I http://su-dominio`, `curl -I https://su-dominio`, `curl -I http://www.su-dominio` deben terminar en `https://www.su-dominio/`.

## 6. Search Console
1. Agregue la propiedad **Dominio** y verifique con el registro TXT de DNS (preferible). Alternativa: `node scripts/set-domain.mjs https://www.su-dominio TOKEN` escribe la meta en el HTML.
2. En *Sitemaps* envíe `https://www.su-dominio/sitemap.xml`.
3. Inspeccione la URL principal y solicite indexación.

## 7. Formulario
Despliegue `backend-ejemplo/` (ver su README) o use Formspree; pegue la URL en `formEndpoint`; ejecute `node scripts/build-headers.mjs`; envíe una solicitud de prueba y confirme que **el correo llega** (revise spam y el sandbox de SES).

## 8. Respaldos y prueba de restauración
- Versionado del bucket activado + regla de ciclo de vida que expire versiones no vigentes a los 90 días.
- Opcional: replicación a otro bucket/región; conserve el repositorio Git como respaldo del código.
- **Prueba de restauración (hágala una vez antes de publicar):** (a) suba un cambio de prueba a `index.html`; (b) liste versiones `aws s3api list-object-versions --bucket BUCKET --prefix index.html`; (c) restaure la anterior con `aws s3api copy-object --bucket BUCKET --key index.html --copy-source "BUCKET/index.html?versionId=ID"`; (d) invalide CloudFront `aws cloudfront create-invalidation --distribution-id ID --paths "/*"`; (e) confirme en el navegador. Anote la fecha en el QA-CHECKLIST.

## 9. Monitoreo
- **Uptime:** UptimeRobot (o Route 53 Health Check) sobre `https://www.su-dominio/` cada 5 minutos con alerta a correo/WhatsApp.
- **Errores:** `sentryDsn` en `config.js` (opcional; se carga con consentimiento de analítica) y alarma de CloudFront 5xx en CloudWatch.

## 10. Después de publicar
Corra Lighthouse y PageSpeed Insights sobre producción, valide el JSON-LD en el Probador de resultados enriquecidos de Google y complete el `QA-CHECKLIST.md`.
