# Backend de ejemplo: formulario con Lambda + SES

Solo es un ejemplo; no contiene credenciales. La función usa el rol de IAM con permiso `ses:SendEmail`.

1. En SES, verifique el dominio o el correo remitente (y salga del sandbox para poder escribir a cualquier destinatario).
2. Cree una Lambda Node.js 20 con `lambda.mjs` como handler (`lambda.handler`). El SDK v3 ya viene incluido en el runtime.
3. Variables de entorno: `TO_EMAIL`, `FROM_EMAIL`, `ALLOWED_ORIGIN`, `SES_REGION`.
4. Rol de IAM mínimo: `ses:SendEmail` sobre la identidad verificada y los permisos básicos de logs.
5. Exponga la función con una Function URL (auth NONE, CORS desactivado porque la función ya responde las cabeceras) o con API Gateway HTTP API con límite de tasa.
6. Pegue la URL en `formEndpoint` de `config.js` y regenere las cabeceras: `node scripts/build-headers.mjs` (agrega el origen a `connect-src`).

Alternativa sin servidor propio: Formspree. Use su URL `https://formspree.io/f/XXXX` en `formEndpoint`; acepta el JSON que envía el formulario.
