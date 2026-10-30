/* Arranque mínimo: activa el modo JS y carga el CSS completo sin bloquear el primer pintado. */
(function () {
  var d = document.documentElement;
  d.classList.remove("no-js");
  d.classList.add("js");
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) d.classList.add("reduce");
  var l = document.getElementById("main-css");
  if (l) l.media = "all";
})();
