// CloudFront Function (viewer-request, runtime cloudfront-js-2.0).
// 1) Redirige el dominio sin www (apex) al host canónico con www, conservando ruta y consulta.
// 2) Sirve /index.html en las rutas tipo directorio.
// Cambie CANONICAL_HOST si decide usar el apex como host canónico (y invierta la condición).
var CANONICAL_HOST = "www.360consultores.co";

function handler(event) {
  var req = event.request;
  var host = (req.headers.host && req.headers.host.value) || "";
  if (host && host !== CANONICAL_HOST) {
    var qs = "";
    var q = req.querystring;
    var parts = [];
    for (var k in q) { parts.push(q[k].multiValue ? q[k].multiValue.map(function (m) { return k + "=" + m.value; }).join("&") : k + "=" + q[k].value); }
    if (parts.length) qs = "?" + parts.join("&");
    return { statusCode: 301, statusDescription: "Moved Permanently", headers: { location: { value: "https://" + CANONICAL_HOST + req.uri + qs }, "cache-control": { value: "max-age=3600" } } };
  }
  if (req.uri.endsWith("/")) req.uri += "index.html";
  return req;
}
