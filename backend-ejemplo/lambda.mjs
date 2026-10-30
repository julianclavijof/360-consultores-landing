// Ejemplo: AWS Lambda (Node.js 20) detrás de una Function URL o API Gateway HTTP API que recibe el formulario y lo envía por SES.
// Variables de entorno (sin credenciales en el código; la función usa su rol de IAM):
//   TO_EMAIL        correo que recibe las solicitudes (verificado en SES)
//   FROM_EMAIL      remitente verificado en SES (ej. formulario@su-dominio)
//   ALLOWED_ORIGIN  origen permitido para CORS (ej. https://www.360consultores.co)
//   SES_REGION      región de SES (ej. us-east-1)
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const ses = new SESv2Client({ region: process.env.SES_REGION });
const cors = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Content-Type": "application/json"
};
const reply = (statusCode, body) => ({ statusCode, headers: cors, body: JSON.stringify(body) });
const clean = (v, max = 500) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export const handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod;
  if (method === "OPTIONS") return reply(204, {});
  if (method !== "POST") return reply(405, { ok: false });
  if ((event.headers?.origin || event.headers?.Origin) !== process.env.ALLOWED_ORIGIN) return reply(403, { ok: false });

  let d;
  try { d = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, "base64").toString() : event.body); } catch { return reply(400, { ok: false }); }

  const f = { nombre: clean(d.nombre, 120), cargo: clean(d.cargo, 120), entidad: clean(d.entidad, 40), municipio: clean(d.municipio, 120), correo: clean(d.correo, 160), telefono: clean(d.telefono, 40), mensaje: clean(d.mensaje, 2000) };
  if (!f.nombre || !f.cargo || !f.entidad || !f.municipio || !emailOk(f.correo) || f.telefono.replace(/\D/g, "").length < 7 || d.autorizaTratamientoDatos !== true) return reply(422, { ok: false });
  if (Number(d.tiempoEnFormularioMs) < 3000) return reply(200, { ok: true }); // probable bot: se descarta en silencio

  const text = Object.entries(f).map(([k, v]) => `${k}: ${v}`).join("\n") + `\npagina: ${clean(d.pagina, 200)}\nenviado: ${clean(d.enviado, 40)}`;
  await ses.send(new SendEmailCommand({
    FromEmailAddress: process.env.FROM_EMAIL,
    Destination: { ToAddresses: [process.env.TO_EMAIL] },
    ReplyToAddresses: [f.correo],
    Content: { Simple: { Subject: { Data: `Solicitud de reunión: ${f.entidad} ${f.municipio}`, Charset: "UTF-8" }, Body: { Text: { Data: text, Charset: "UTF-8" } } } }
  }));
  return reply(200, { ok: true });
};
