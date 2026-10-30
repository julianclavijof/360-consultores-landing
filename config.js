/*
 * Configuración del sitio 360° Consultores.
 * Todo ID o endpoint se define aquí. Si un valor está vacío, el script o dato
 * correspondiente NO se carga ni se muestra. No guarde secretos en este archivo:
 * todo lo que aparece aquí es público.
 */
window.SITE_CONFIG = {
  // Dominio canónico (https, sin barra final). Cámbielo con: node scripts/set-domain.mjs https://su-dominio
  siteUrl: "https://www.360consultores.co",

  // Contacto
  email: "oscar@wisecargo.com.co",
  phoneDisplay: "+57 315 3386887",
  phoneTel: "+573153386887",
  whatsappNumber: "573153386887",
  whatsappMessage: "Hola, quiero agendar una reunión de alineación técnica sobre el Programa de Aceleración Mipyme 360°.",

  // Formulario: URL del endpoint (AWS Lambda + SES vía API Gateway/Function URL, o Formspree).
  // Vacío = el formulario abre el correo del usuario (mailto) como respaldo.
  formEndpoint: "",

  // Analítica y marketing (todo opcional; se carga solo con consentimiento)
  ga4Id: "",            // ej. G-XXXXXXXXXX
  gtmId: "",            // ej. GTM-XXXXXXX (si se define, el tracking se gestiona desde el contenedor)
  metaPixelId: "",
  clarityId: "",
  posthogKey: "",
  posthogHost: "https://us.i.posthog.com",
  sentryDsn: "",        // ej. https://xxx@oXXX.ingest.sentry.io/XXX

  // Verificación de Google Search Console (contenido de la meta google-site-verification).
  // Recomendado: verificar por DNS. Si usa meta, ejecute node scripts/set-domain.mjs para escribirla en el HTML.
  gscVerification: "",

  // Datos legales del pie de página y la política de privacidad (vacío = no se muestra)
  legal: {
    razonSocial: "",
    nit: "",
    direccion: "",
    ciudad: ""
  }
};
