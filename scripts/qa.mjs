// Chequeos estáticos: enlaces, anclas, JSON-LD, SEO básico y CSP. Uso: node scripts/qa.mjs
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "politica-privacidad.html", "404.html"];
let fails = 0;
const ok = (c, msg) => { console.log(`${c ? "OK  " : "FAIL"} ${msg}`); if (!c) fails++; };
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');

for (const p of pages) {
  const h = readFileSync(join(root, p), "utf8");
  const ids = new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const hrefs = [...h.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  let broken = 0, count = 0;
  for (const u of hrefs) {
    if (/^(https?:|mailto:|tel:|data:)/.test(u)) {
      if (u.startsWith("tel:")) ok(/^tel:\+\d{10,13}$/.test(u), `${p}: ${u} válido`);
      continue;
    }
    count++;
    if (u === "#") { broken++; console.log(`  enlace vacío "#" en ${p}`); continue; }
    if (u.startsWith("#")) { if (!ids.has(u.slice(1))) { broken++; console.log(`  ancla rota ${u} en ${p}`); } continue; }
    const [file, hash] = u.split("#");
    const path = file === "/" ? "index.html" : file.replace(/^\//, "");
    if (!existsSync(join(root, path))) { broken++; console.log(`  archivo faltante ${u} en ${p}`); continue; }
    if (hash && path.endsWith(".html")) { const t = readFileSync(join(root, path), "utf8"); if (!new RegExp(`id="${hash}"`).test(t)) { broken++; console.log(`  ancla rota ${u} en ${p}`); } }
  }
  ok(broken === 0, `${p}: ${count} enlaces/recursos internos sin roturas`);
  ok(!/\sstyle="/.test(h) && !/\son[a-z]+="/.test(h), `${p}: sin style= ni manejadores inline (compatible con CSP)`);
  ok((h.match(/<h1[\s>]/g) || []).length === (p === "index.html" || p === "404.html" || p === "politica-privacidad.html" ? 1 : 1), `${p}: un solo h1`);
  const imgs = [...h.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  ok(imgs.every((i) => /\balt="/.test(i) && /\bwidth="/.test(i) && /\bheight="/.test(i)), `${p}: ${imgs.length} imágenes con alt, width y height`);
  const robots = h.match(/<meta name="robots" content="([^"]+)"/)?.[1] || "";
  ok(p === "404.html" ? robots.includes("noindex") : !robots.includes("noindex"), `${p}: robots="${robots}"`);
}

const idx = readFileSync(join(root, "index.html"), "utf8");
const title = idx.match(/<title>([^<]+)/)[1], desc = idx.match(/name="description" content="([^"]+)"/)[1];
ok(title.length <= 60, `title ${title.length}/60 caracteres`);
ok(desc.length <= 155, `meta description ${desc.length}/155 caracteres`);
ok(/<html lang="es-CO"/.test(idx) && /hreflang="es-CO"/.test(idx) && /hreflang="x-default"/.test(idx), "lang es-CO, hreflang es-CO y x-default");
for (const id of ["reto", "como-funciona", "servicios", "contratacion", "hoja-de-ruta", "equipo", "preguntas", "contacto"]) ok(new RegExp(`id="${id}"`).test(idx), `ancla #${id}`);

const ld = JSON.parse(idx.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const types = ld["@graph"].flatMap((n) => [].concat(n["@type"]));
ok(["Organization", "ProfessionalService", "WebSite", "Service", "FAQPage"].every((t) => types.includes(t)), `JSON-LD parsea y contiene ${types.join(", ")}`);
const faqLd = ld["@graph"].find((n) => n["@type"] === "FAQPage").mainEntity;
const htmlQ = [...idx.matchAll(/class="faq-q"[^>]*><span>([^<]+)<\/span>/g)].map((m) => decode(m[1]));
const htmlA = [...idx.matchAll(/class="faq-a"[^>]*><div><p>([^<]+)<\/p>/g)].map((m) => decode(m[1]));
ok(faqLd.length === htmlQ.length && faqLd.every((q, i) => q.name === htmlQ[i] && q.acceptedAnswer.text === htmlA[i]), `FAQPage idéntico al acordeón visible (${faqLd.length} preguntas)`);
ok(ld["@graph"].every((n) => !("aggregateRating" in n) && !("review" in n)), "JSON-LD sin reseñas ni calificaciones inventadas");

const robotsTxt = readFileSync(join(root, "robots.txt"), "utf8");
ok(!/Disallow:\s*\//.test(robotsTxt.replace(/Disallow:\s*\n/g, "")) && /Sitemap: https:/.test(robotsTxt), "robots.txt no bloquea y apunta al sitemap");
const csp = JSON.parse(readFileSync(join(root, "security/response-headers-policy.json"), "utf8")).SecurityHeadersConfig.ContentSecurityPolicy.ContentSecurityPolicy;
ok(!/unsafe-inline|unsafe-eval/.test(csp), "CSP sin unsafe-inline ni unsafe-eval");
const cfg = readFileSync(join(root, "config.js"), "utf8");
ok(!/(AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY|sk_live_|password\s*[:=]\s*"[^"]+"|(api[_-]?key|secret|token)\s*[:=]\s*"[A-Za-z0-9_\-]{16,}")/i.test(cfg + idx), "sin credenciales ni tokens en config.js ni index.html");
console.log(fails ? `\n${fails} chequeo(s) fallaron` : "\nTodos los chequeos pasaron");
process.exit(fails ? 1 : 0);
