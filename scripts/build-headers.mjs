// Genera security/response-headers-policy.json (CloudFront) a partir de config.js.
// Los orígenes de analítica solo se permiten si el ID correspondiente está configurado.
// Uso: node scripts/build-headers.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(readFileSync(join(root, "config.js"), "utf8"), ctx);
const C = ctx.window.SITE_CONFIG;

const hashStyle = (file) => {
  const m = readFileSync(join(root, file), "utf8").match(/<style id="critical">([\s\S]*?)<\/style>/);
  return "'sha256-" + createHash("sha256").update(m[1]).digest("base64") + "'";
};
const hashes = [...new Set(["index.html", "politica-privacidad.html", "404.html"].map(hashStyle))];

const script = ["'self'"], connect = ["'self'"], img = ["'self'", "data:"], frame = [];
if (C.formEndpoint) connect.push(new URL(C.formEndpoint).origin);
if (C.ga4Id || C.gtmId) { script.push("https://www.googletagmanager.com"); connect.push("https://www.google-analytics.com", "https://*.google-analytics.com", "https://*.analytics.google.com", "https://www.googletagmanager.com"); img.push("https://www.google-analytics.com", "https://www.googletagmanager.com"); }
if (C.gtmId) frame.push("https://www.googletagmanager.com");
if (C.metaPixelId) { script.push("https://connect.facebook.net"); connect.push("https://www.facebook.com", "https://connect.facebook.net"); img.push("https://www.facebook.com"); }
if (C.clarityId) { script.push("https://www.clarity.ms", "https://scripts.clarity.ms"); connect.push("https://*.clarity.ms"); img.push("https://*.clarity.ms"); }
if (C.posthogKey) { const h = new URL(C.posthogHost || "https://us.i.posthog.com").origin; script.push(h.replace(".i.", "-assets.i.")); connect.push(h, h.replace(".i.", "-assets.i.")); }
if (C.sentryDsn) { script.push("https://browser.sentry-cdn.com"); connect.push("https://*.ingest.sentry.io", "https://*.ingest.us.sentry.io"); }

const csp = [
  "default-src 'self'",
  `script-src ${script.join(" ")}`,
  `style-src 'self' ${hashes.join(" ")}`,
  `img-src ${img.join(" ")}`,
  "font-src 'self'",
  `connect-src ${connect.join(" ")}`,
  frame.length ? `frame-src ${frame.join(" ")}` : "frame-src 'none'",
  "object-src 'none'", "base-uri 'self'", "form-action 'self' mailto:", "frame-ancestors 'none'", "upgrade-insecure-requests"
].join("; ");

const policy = {
  Name: "360consultores-security-headers",
  Comment: "Cabeceras de seguridad para 360consultores.co",
  SecurityHeadersConfig: {
    ContentSecurityPolicy: { Override: true, ContentSecurityPolicy: csp },
    StrictTransportSecurity: { Override: true, AccessControlMaxAgeSec: 63072000, IncludeSubdomains: true, Preload: true },
    ContentTypeOptions: { Override: true },
    ReferrerPolicy: { Override: true, ReferrerPolicy: "strict-origin-when-cross-origin" },
    FrameOptions: { Override: true, FrameOption: "DENY" }
  },
  CustomHeadersConfig: { Quantity: 1, Items: [{ Header: "Permissions-Policy", Value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()", Override: true }] }
};
writeFileSync(join(root, "security/response-headers-policy.json"), JSON.stringify(policy, null, 2) + "\n");
console.log("security/response-headers-policy.json generado.\nCSP:", csp);
