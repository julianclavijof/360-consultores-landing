// Cambia el dominio canónico en todos los archivos y escribe (opcional) la meta de Search Console.
// Uso: node scripts/set-domain.mjs https://www.midominio.co [token-google-site-verification]
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = (process.argv[2] || "").replace(/\/+$/, "");
const token = process.argv[3] || "";
if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(target)) { console.error("Uso: node scripts/set-domain.mjs https://www.midominio.co [token-gsc]"); process.exit(1); }

const OLD = "https://www.360consultores.co";
const files = ["index.html", "politica-privacidad.html", "404.html", "robots.txt", "sitemap.xml", "llms.txt", "config.js", "scripts/build.mjs", "src/index.template.html", "src/privacy.template.html", "src/404.template.html"];
const cur = readFileSync(join(root, "config.js"), "utf8").match(/siteUrl:\s*"([^"]+)"/)?.[1] || OLD;
for (const f of files) {
  let s = readFileSync(join(root, f), "utf8");
  s = s.split(cur).join(target).split(OLD).join(target);
  if (token && f.endsWith(".html") || token && f === "src/index.template.html") {
    s = s.replace(/<meta name="google-site-verification"[^>]*>\n?/, "");
    if (f === "index.html" || f === "src/index.template.html") s = s.replace("<link rel=\"canonical\"", `<meta name="google-site-verification" content="${token}">\n<link rel="canonical"`);
  }
  writeFileSync(join(root, f), s);
}
console.log(`Dominio actualizado a ${target}. Si usa www/apex distinto, revise cloudfront-function-redirect.js y DEPLOY.md.`);
