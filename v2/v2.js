/* Versión B: navegación, objetos 3D con parallax, agenda pinneada, carruseles, ruta y marquesina. */
(function () {
  "use strict";
  var doc = document;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var raf = function (fn) {
    var t = false;
    return function () { if (t) return; t = true; requestAnimationFrame(function () { t = false; fn(); }); };
  };

  /* ---------- Navegación ---------- */
  var nav = $("#vnav"), toggle = $(".vnav-toggle"), lastY = window.scrollY;
  var sections = ["inicio", "reto", "como-funciona", "servicios", "kit", "contratacion", "hoja-de-ruta", "equipo", "preguntas", "contacto"].map(function (id) { return doc.getElementById(id); });
  var sideNum = $("#vside-num"), sideFill = $("#vside-fill");
  function onScrollNav() {
    var y = window.scrollY, vh = window.innerHeight;
    nav.classList.toggle("is-scrolled", y > 24);
    if (!doc.body.classList.contains("vmenu-open")) {
      if (y > 480 && y > lastY + 6) nav.classList.add("is-hidden");
      else if (y < lastY - 6 || y < 480) nav.classList.remove("is-hidden");
    }
    lastY = y;
    var cur = 0;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < vh * 0.4) cur = i; });
    var id = sections[cur] && sections[cur].id;
    $$(".vnav-links a").forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + id); });
    if (sideNum) sideNum.textContent = (cur + 1 < 10 ? "0" : "") + (cur + 1);
    var h = doc.documentElement.scrollHeight - vh;
    if (sideFill) sideFill.style.transform = "scaleY(" + clamp(y / Math.max(h, 1), 0, 1).toFixed(3) + ")";
  }
  window.addEventListener("scroll", raf(onScrollNav), { passive: true });
  onScrollNav();
  function setMenu(open) {
    doc.body.classList.toggle("vmenu-open", open);
    doc.body.style.overflow = open ? "hidden" : "";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    nav.classList.remove("is-hidden");
    if (open) setTimeout(function () { var a = $("#vmenu a"); if (a) a.focus({ preventScroll: true }); }, 300);
  }
  toggle.addEventListener("click", function () { setMenu(!doc.body.classList.contains("vmenu-open")); });
  $$("#vmenu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && doc.body.classList.contains("vmenu-open")) { setMenu(false); toggle.focus(); } });

  /* ---------- Partículas de esferas ---------- */
  var pbox = $(".particles");
  if (pbox && !reduce) {
    var cols = ["#7C5CFF", "#2D9CFF", "#C9CDE6", "#7C5CFF", "#12204A"];
    for (var i = 0; i < 18; i++) {
      var p = doc.createElement("i"), s = 6 + Math.random() * 22;
      p.style.width = p.style.height = s + "px";
      p.style.left = (Math.random() * 100).toFixed(1) + "%";
      p.style.top = (Math.random() * 100).toFixed(1) + "%";
      p.style.setProperty("--c", cols[i % cols.length]);
      p.style.setProperty("--d", (10 + Math.random() * 10).toFixed(1) + "s");
      p.style.setProperty("--dl", (-Math.random() * 10).toFixed(1) + "s");
      p.setAttribute("data-depth", ((Math.random() - 0.5) * 0.08).toFixed(3));
      pbox.appendChild(p);
    }
  }

  /* ---------- Objetos 3D: parallax con el mouse y giro con el scroll ---------- */
  var objs = $$("[data-depth]");
  var mx = 0, my = 0;
  function applyObjs() {
    var y = window.scrollY, vh = window.innerHeight;
    objs.forEach(function (o) {
      var r = o.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var d = +o.getAttribute("data-depth") || 0, spin = +o.getAttribute("data-spin") || 0;
      var center = (r.top + r.height / 2 - vh / 2);
      var tx = mx * d * 600, ty = my * d * 600 + center * d * -2;
      o.style.transform = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0) rotate(" + (y * spin).toFixed(2) + "deg)";
    });
  }
  if (!reduce) {
    var objRaf = raf(applyObjs);
    window.addEventListener("scroll", objRaf, { passive: true });
    if (fine) window.addEventListener("pointermove", function (e) { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; objRaf(); }, { passive: true });
    applyObjs();
  }

  /* ---------- Tarjetas con inclinación 3D y botones magnéticos ---------- */
  if (fine && !reduce) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
    $$(".magnetic").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* ---------- Marquesina que acelera con la velocidad del scroll ---------- */
  var mq = $("#vmarquee");
  if (mq && !reduce) {
    var mxPos = 0, vel = 0, prevY = window.scrollY, dir = -1;
    (function loop() {
      var y = window.scrollY, dy = y - prevY; prevY = y;
      if (dy !== 0) dir = dy > 0 ? -1 : 1;
      vel += (Math.abs(dy) * 0.12 - vel) * 0.1;
      mxPos += dir * (0.6 + vel);
      var half = mq.scrollWidth / 2;
      if (mxPos <= -half) mxPos += half;
      if (mxPos > 0) mxPos -= half;
      mq.style.transform = "translate3d(" + mxPos.toFixed(1) + "px,0,0)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Agenda de la jornada: la fila activa sigue al scroll ---------- */
  var sec = $("#servicios"), wrap = $("#vsched-wrap"), rows = $$(".vrow"), prevs = $$(".vprev");
  var pinMq = window.matchMedia("(min-width:1024px)");
  var current = -1;
  function setRow(i) {
    if (i === current) return;
    current = i;
    rows.forEach(function (r, k) { r.classList.toggle("is-on", k === i); });
    prevs.forEach(function (p, k) { p.classList.toggle("is-on", k === i); });
  }
  function schedUpdate() {
    if (!doc.body.classList.contains("is-sched-pinned")) return;
    var r = wrap.getBoundingClientRect(), total = wrap.offsetHeight - window.innerHeight;
    var p = clamp(-r.top / Math.max(total, 1), 0, 0.999);
    setRow(Math.floor(p * rows.length));
  }
  function setPin() {
    doc.body.classList.toggle("is-sched-pinned", pinMq.matches && !reduce);
    schedUpdate();
  }
  if (sec && rows.length) {
    setRow(0);
    rows.forEach(function (r, k) {
      r.addEventListener("click", function () {
        if (doc.body.classList.contains("is-sched-pinned")) {
          var top = wrap.getBoundingClientRect().top + window.scrollY, total = wrap.offsetHeight - window.innerHeight;
          window.scrollTo({ top: top + total * (k + 0.5) / rows.length, behavior: reduce ? "auto" : "smooth" });
        } else setRow(k);
      });
    });
    setPin();
    pinMq.addEventListener("change", setPin);
    window.addEventListener("scroll", raf(schedUpdate), { passive: true });
    doc.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#eje-"]');
      if (!a) return;
      var row = doc.getElementById(a.getAttribute("href").slice(1));
      if (row && doc.body.classList.contains("is-sched-pinned")) { e.preventDefault(); row.click(); }
    });
  }

  /* ---------- Carruseles: arrastre, flechas, puntos y avance automático ---------- */
  $$("[data-carousel]").forEach(function (car) {
    var view = $(".vcar-view", car), track = $(".vcar-track", car), items = $$(".vcar-track > li", car), dots = $(".vcar-dots", car);
    var idx = +car.getAttribute("data-start") || 0, timer = null;
    items.forEach(function (_, i) { var d = doc.createElement("i"); dots.appendChild(d); });
    function go(i, user) {
      idx = (i + items.length) % items.length;
      var it = items[idx];
      var x = it.offsetLeft + it.offsetWidth / 2 - view.clientWidth / 2;
      track.style.transform = "translate3d(" + (-x).toFixed(1) + "px,0,0)";
      items.forEach(function (el, k) { el.classList.toggle("is-on", k === idx); });
      $$("i", dots).forEach(function (d, k) { d.classList.toggle("on", k === idx); });
      if (user) restart();
    }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(idx + 1); }, 4500); }
    $(".prev", car).addEventListener("click", function () { go(idx - 1, true); });
    $(".next", car).addEventListener("click", function () { go(idx + 1, true); });
    items.forEach(function (el, k) { el.addEventListener("click", function () { if (k !== idx) go(k, true); }); });
    var sx = 0, dx = 0, down = false, base = 0;
    view.addEventListener("pointerdown", function (e) { down = true; sx = e.clientX; dx = 0; base = new DOMMatrix(getComputedStyle(track).transform).m41; track.classList.add("dragging"); });
    window.addEventListener("pointermove", function (e) { if (!down) return; dx = e.clientX - sx; track.style.transform = "translate3d(" + (base + dx) + "px,0,0)"; });
    window.addEventListener("pointerup", function () {
      if (!down) return; down = false; track.classList.remove("dragging");
      if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1), true); else go(idx);
    });
    car.addEventListener("mouseenter", function () { clearInterval(timer); });
    car.addEventListener("mouseleave", restart);
    window.addEventListener("resize", raf(function () { go(idx); }));
    window.addEventListener("load", function () { go(idx); });
    go(idx); restart();
  });

  /* ---------- Hoja de ruta: la línea y la esfera avanzan con el scroll ---------- */
  var route = $("#vroute"), rFill = $("#vroute-fill"), rBall = $("#vroute-ball");
  if (route && rFill) {
    var rUpd = raf(function () {
      var r = route.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3), 0, 1);
      rFill.style.transform = "scaleX(" + p.toFixed(3) + ")";
      rBall.style.left = (p * 100).toFixed(2) + "%";
    });
    window.addEventListener("scroll", rUpd, { passive: true });
    rUpd();
  }
})();
