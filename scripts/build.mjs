// Genera index.html a partir de src/index.template.html (CSS crítico inline, sprite SVG, anillo, FAQ y JSON-LD).
// Uso: node scripts/build.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const SITE = "https://www.360consultores.co"; // se reemplaza con scripts/set-domain.mjs

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const faq = JSON.parse(read("content/faq.json"));

// FAQ accesible (acordeón) + JSON-LD alimentados por la misma fuente
const faqHtml = faq.map((f, i) => `      <div class="faq-item reveal">
        <h3><button class="faq-q" type="button" id="faq-q${i + 1}" aria-expanded="false" aria-controls="faq-a${i + 1}"><span>${esc(f.q)}</span><span class="pm" aria-hidden="true"></span></button></h3>
        <div class="faq-a" id="faq-a${i + 1}" role="region" aria-labelledby="faq-q${i + 1}"><div><p>${esc(f.a)}</p></div></div>
      </div>`).join("\n");

const jsonld = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": `${SITE}/#organization`,
      name: "360° Consultores",
      url: `${SITE}/`,
      logo: `${SITE}/assets/img/logo-color-640.png`,
      image: `${SITE}/assets/img/og-image.jpg`,
      email: "oscar@wisecargo.com.co",
      telephone: "+57 315 3386887",
      description: "Aliado estratégico en desarrollo económico y competitividad territorial para alcaldías, gobernaciones y secretarías de desarrollo económico en Colombia.",
      areaServed: { "@type": "Country", name: "Colombia" },
      knowsAbout: ["Desarrollo económico local", "Competitividad territorial", "Fortalecimiento empresarial de Mipymes", "Inteligencia artificial para Mipymes", "Formalización empresarial", "SGSST para Mipymes", "Proyectos BPIN", "Contratación estatal en Colombia"]
    },
    { "@type": "WebSite", "@id": `${SITE}/#website`, url: `${SITE}/`, name: "360° Consultores", inLanguage: "es-CO", publisher: { "@id": `${SITE}/#organization` } },
    {
      "@type": "Service",
      "@id": `${SITE}/#servicio`,
      name: "Programa de Aceleración Mipyme 360°",
      serviceType: "Programa de fortalecimiento empresarial para Mipymes",
      description: "Seminario-taller de 4 horas con cinco consultores e inteligencia artificial, Kit Digital 360° y una ruta de asesoría técnica individual para las Mipymes de un territorio.",
      provider: { "@id": `${SITE}/#organization` },
      areaServed: { "@type": "Country", name: "Colombia" },
      audience: { "@type": "Audience", audienceType: "Alcaldías, gobernaciones y secretarías de desarrollo económico" },
      url: `${SITE}/`
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE}/#preguntas`,
      inLanguage: "es-CO",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
    }
  ]
};

// Anillo de cristal para el hero (5 segmentos con la geometría del manual de marca)
const PATHS = [
  "M65.8 212.4A250 250 0 0 1 289.1 50.2L292.8 135.2A165 165 0 0 0 145.4 242.2Z",
  "M310.9 50.2A250 250 0 0 1 534.2 212.4L454.6 242.2A165 165 0 0 0 307.2 135.2Z",
  "M540.9 233.2A250 250 0 0 1 455.6 495.7L402.7 429.1A165 165 0 0 0 459.0 255.9Z",
  "M438.0 508.5A250 250 0 0 1 162.0 508.5L208.9 437.6A165 165 0 0 0 391.1 437.6Z",
  "M144.4 495.7A250 250 0 0 1 59.1 233.2L141.0 255.9A165 165 0 0 0 197.3 429.1Z"
];
const NAMES = ["violet", "blue", "coral", "amber", "lime"];
const HEX = ["#7C5CFF", "#2D9CFF", "#FF6FAE", "#FFB547", "#B6F03C"];
const ring = `<g filter="url(#soft)">\n${PATHS.map((d, i) => `            <g class="seg" data-i="${i}"><path d="${d}" fill="url(#gl-${NAMES[i]})" stroke="#fff" stroke-opacity=".9" stroke-width="3" stroke-linejoin="round"/><path d="${d}" fill="url(#gl-shine)"/></g>`).join("\n")}\n          </g>`;
const ringflat = PATHS.map((d, i) => `<path d="${d}" fill="${HEX[i]}"/>`).join("");

let html = read("src/index.template.html")
  .replace("<!--@critical-->", () => read("assets/css/critical.css").trim())
  .replace("<!--@jsonld-->", () => JSON.stringify(jsonld))
  .replace("<!--@sprite-->", () => read("src/sprite.html").trim())
  .replace("<!--@faq-->", () => faqHtml)
  .replace("<!--@ring-->", () => ring)
  .replaceAll("<!--@ringflat-->", () => ringflat);

// Macro de imágenes: {{pic:nombre|ancho|alto|alt|clase|eager|lazy}} -> <picture> AVIF + WebP 1x/2x
const pic = (_, name, w, h, alt, cls, mode) => {
  const base = `assets/img/${name}`;
  const set = (ext) => `${base}-1x.${ext} 1x, ${base}-2x.${ext} 2x`;
  const attrs = mode === "eager" ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"';
  return `<picture><source type="image/avif" srcset="${set("avif")}"><source type="image/webp" srcset="${set("webp")}"><img src="${base}-1x.webp" srcset="${set("webp")}" width="${w}" height="${h}" alt="${alt}" ${cls ? `class="${cls}" ` : ""}${attrs}></picture>`;
};
html = html.replace(/\{\{pic:([^|}]+)\|(\d+)\|(\d+)\|([^|}]*)\|([^|}]*)\|(eager|lazy)\}\}/g, pic);
writeFileSync(join(root, "index.html"), html);
const critical = read("assets/css/critical.css").trim();
// Versión B (/v2/): mismas fuentes de contenido, rutas un nivel arriba
{
  let v2 = read("src/v2.template.html")
    .replace("<!--@critical-->", () => read("assets/css/critical.css").trim().replaceAll("url(assets/", "url(../assets/"))
    .replace("<!--@sprite-->", () => read("src/sprite.html").trim())
    .replace("<!--@faq-->", () => faqHtml);
  v2 = v2.replace(/\{\{pic:([^|}]+)\|(\d+)\|(\d+)\|([^|}]*)\|([^|}]*)\|(eager|lazy)\}\}/g, (...m) => pic(...m).replaceAll('"assets/img/', '"../assets/img/').replaceAll(" assets/img/", " ../assets/img/"));
  writeFileSync(join(root, "v2/index.html"), v2);
}
for (const [src, out] of [["src/privacy.template.html", "politica-privacidad.html"], ["src/404.template.html", "404.html"]]) {
  writeFileSync(join(root, out), read(src).replace("<!--@critical-->", () => critical));
}
console.log(`index.html generado (${(html.length / 1024).toFixed(1)} KB)`);
