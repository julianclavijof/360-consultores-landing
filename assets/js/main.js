/* 360° Consultores: comportamiento de la página. Vanilla JS, sin dependencias. */
(function () {
  "use strict";
  var C = window.SITE_CONFIG || {};
  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var raf = function (fn) {
    var t = false;
    return function () { if (t) return; t = true; requestAnimationFrame(function () { t = false; fn(); }); };
  };
  var safe = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
  };

  /* ---------- Contacto configurable ---------- */
  (function applyContact() {
    var num = C.whatsappNumber, msg = C.whatsappMessage;
    if (num) {
      var url = "https://wa.me/" + num + (msg ? "?text=" + encodeURIComponent(msg) : "");
      $$('a[href^="https://wa.me/"]').forEach(function (a) { a.href = url; });
    }
    if (C.email) $$('a[href^="mailto:"]').forEach(function (a) { a.href = "mailto:" + C.email; });
    var L = C.legal || {};
    var parts = [];
    if (L.razonSocial) parts.push(L.razonSocial);
    if (L.nit) parts.push("NIT " + L.nit);
    if (L.direccion) parts.push(L.direccion);
    if (L.ciudad) parts.push(L.ciudad);
    var box = $("#footer-legal");
    if (box && parts.length) {
      box.textContent = parts.join(" · ");
      box.hidden = false;
    }
  })();

  /* ---------- Navegación ---------- */
  var toggle = $(".nav-toggle");
  function setMenu(open) {
    doc.body.classList.toggle("nav-open", open);
    doc.body.style.overflow = open ? "hidden" : "";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    if (open) { var first = $("#mobile-menu a"); if (first) first.focus({ preventScroll: true }); }
  }
  if (toggle) {
    toggle.addEventListener("click", function () { setMenu(!doc.body.classList.contains("nav-open")); });
    $$("#mobile-menu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && doc.body.classList.contains("nav-open")) { setMenu(false); toggle.focus(); }
    });
    window.matchMedia("(min-width:1180px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });
  }
  var navMap = {};
  $$(".nav-links a").forEach(function (a) { navMap[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(navMap).forEach(function (k) { navMap[k].removeAttribute("aria-current"); });
        var a = navMap[en.target.id];
        if (a) a.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(navMap).forEach(function (id) { var s = doc.getElementById(id); if (s) navIO.observe(s); });
    var heroEl = doc.getElementById("inicio");
    if (heroEl) navIO.observe(heroEl);
  }
  var topBtn = $("#to-top");
  if (topBtn) topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* ---------- Revelados ---------- */
  function splitWords(el, startIndex) {
    var idx = startIndex || 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          n.nodeValue.split(/(\s+)/).forEach(function (tok) {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(doc.createTextNode(" ")); return; }
            var w = doc.createElement("span"); w.className = "w";
            var i = doc.createElement("span"); i.textContent = tok;
            w.style.setProperty("--wi", String(Math.min(idx++, 14)));
            w.appendChild(i); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
  }
  $$(".rv-words").forEach(function (el) { splitWords(el); });
  var revealEls = $$(".reveal, .rv-words, .route-path");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach(function (el, i) {
      if (el.classList.contains("reveal") && el.parentElement) {
        var sibs = $$(":scope > .reveal", el.parentElement);
        el.style.setProperty("--d", Math.min(sibs.indexOf(el), 4) * 80 + "ms");
      }
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Eslogan: palabra por palabra al hacer scroll ---------- */
  var tag = $("#tagline-text");
  if (tag) {
    var words = [];
    (function walk(node, key) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          n.nodeValue.split(/(\s+)/).forEach(function (tok) {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(doc.createTextNode(" ")); return; }
            var s = doc.createElement("span"); s.className = "tw" + (key ? " key" : ""); s.textContent = tok;
            words.push(s); frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n, key || n.tagName === "B");
      });
    })(tag, false);
    var updateTag = function () {
      var line = window.innerHeight * 0.72;
      words.forEach(function (w) { w.classList.toggle("on", w.getBoundingClientRect().top < line); });
    };
    if (reduce) { words.forEach(function (w) { w.classList.add("on"); }); }
    else if ("IntersectionObserver" in window) {
      var tagRaf = raf(updateTag), tagOn = false;
      new IntersectionObserver(function (en) {
        var vis = en[0].isIntersecting;
        if (vis && !tagOn) { window.addEventListener("scroll", tagRaf, { passive: true }); tagOn = true; updateTag(); }
        if (!vis && tagOn) { window.removeEventListener("scroll", tagRaf); tagOn = false; }
      }, { rootMargin: "20% 0px" }).observe(tag.closest(".tagline"));
    }
  }

  /* ---------- Anillo del hero: se separa en 5 ejes con el scroll ---------- */
  var MIDS = [-126, -54, 18, 90, 162];
  var heroRing = $("#hero-ring");
  var segs = heroRing ? $$(".seg", heroRing) : [];
  segs.forEach(function (s, i) {
    var a = MIDS[i] * Math.PI / 180;
    s.style.setProperty("--dx", (Math.cos(a) * 70).toFixed(1));
    s.style.setProperty("--dy", (Math.sin(a) * 70).toFixed(1));
  });
  if (segs.length && !reduce) {
    var hero = $("#inicio");
    var upd = raf(function () {
      var p = clamp(window.scrollY / (hero.offsetHeight * 0.85), 0, 1);
      heroRing.style.setProperty("--ex", p.toFixed(3));
      segs.forEach(function (s) { s.style.setProperty("--ex", p.toFixed(3)); });
    });
    window.addEventListener("scroll", upd, { passive: true });
  }
  // Anillos de cierre: se ensamblan al entrar
  ["#contact-ring-segs", "#strip-ring-segs"].forEach(function (sel) {
    var g = $(sel);
    if (!g || reduce || !("IntersectionObserver" in window)) return;
    $$("path", g).forEach(function (p, i) {
      var a = MIDS[i] * Math.PI / 180;
      p.classList.add("seg2");
      p.style.setProperty("--dx", (Math.cos(a) * 90).toFixed(1));
      p.style.setProperty("--dy", (Math.sin(a) * 90).toFixed(1));
      p.style.setProperty("--ex", "1");
    });
    var gio = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      $$("path", g).forEach(function (p) { p.style.setProperty("--ex", "0"); });
      gio.disconnect();
    }, { threshold: 0.3 });
    gio.observe(g.parentNode);
  });

  /* ---------- Servicios: línea de tiempo con scroll pinneado ---------- */
  var sec = $("#servicios"), wrap = $("#tl-wrap"), track = $("#tl-track");
  var cards = track ? $$(".eje-card", track) : [];
  var railItems = $$(".tl-rail li"), count = $("#tl-count");
  var mqPin = window.matchMedia("(min-width:900px)");
  var pinned = false, dist = 0;
  function measure() {
    dist = Math.max(0, track.scrollWidth - window.innerWidth);
    wrap.style.height = (dist + window.innerHeight) + "px";
  }
  function progress() {
    var top = wrap.getBoundingClientRect().top + window.scrollY;
    return clamp((window.scrollY - top) / Math.max(1, wrap.offsetHeight - window.innerHeight), 0, 1);
  }
  var lastActive = -1;
  var tlUpdate = raf(function () {
    if (!pinned) return;
    var p = progress();
    track.style.transform = "translate3d(" + (-p * dist).toFixed(1) + "px,0,0)";
    var center = window.innerWidth / 2, best = 0, bd = 1e9;
    cards.forEach(function (c, i) {
      var r = c.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - center);
      if (d < bd) { bd = d; best = i; }
    });
    if (best !== lastActive) {
      lastActive = best;
      cards.forEach(function (c, i) { c.classList.toggle("active", i === best); });
      railItems.forEach(function (li, i) { li.classList.toggle("done", i < best); li.classList.toggle("active", i === best); });
      if (count) count.textContent = "Parada " + (best + 1) + " de 5";
    }
  });
  function setPin() {
    var want = mqPin.matches && !reduce && !!wrap;
    if (want === pinned) { if (pinned) { measure(); tlUpdate(); } return; }
    pinned = want;
    sec.classList.toggle("is-pinned", pinned);
    if (pinned) { measure(); lastActive = -1; tlUpdate(); }
    else { wrap.style.height = ""; track.style.transform = ""; cards.forEach(function (c) { c.classList.remove("active"); }); }
  }
  if (sec && wrap && track) {
    setPin();
    window.addEventListener("scroll", tlUpdate, { passive: true });
    window.addEventListener("resize", raf(setPin));
    window.addEventListener("load", function () { if (pinned) { measure(); tlUpdate(); } });
  }
  function goToEje(id, smooth) {
    var card = doc.getElementById(id);
    if (!card || !pinned) return false;
    var i = cards.indexOf(card);
    if (i < 0) return false;
    var trans = clamp(card.offsetLeft - (window.innerWidth - card.offsetWidth) / 2, 0, dist);
    var top = wrap.getBoundingClientRect().top + window.scrollY;
    var y = top + (dist ? trans / dist : 0) * (wrap.offsetHeight - window.innerHeight);
    window.scrollTo({ top: y, behavior: smooth && !reduce ? "smooth" : "auto" });
    return true;
  }
  doc.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#eje-"]');
    if (!a) return;
    if (goToEje(a.getAttribute("href").slice(1), true)) e.preventDefault();
  });
  if (location.hash.indexOf("#eje-") === 0) window.addEventListener("load", function () { goToEje(location.hash.slice(1), false); });

  /* ---------- Chat de WhatsApp simulado ---------- */
  var wa = $("#wa-sim");
  if (wa && !reduce && "IntersectionObserver" in window) {
    var msgs = $$(".wa-msg", wa), typing = $(".wa-typing", wa), timers = [], running = false;
    var clear = function () { timers.forEach(clearTimeout); timers = []; };
    var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
    var play = function () {
      clear(); msgs.forEach(function (m) { m.classList.remove("show"); }); typing.classList.remove("show");
      var t = 400;
      msgs.forEach(function (m, i) {
        var isOut = m.classList.contains("out");
        if (isOut) { at(t, function () { typing.classList.add("show"); }); t += 1100; at(t, function () { typing.classList.remove("show"); }); }
        at(t, function () { m.classList.add("show"); });
        t += 1300;
      });
      at(t + 4500, play);
    };
    new IntersectionObserver(function (en) {
      if (en[0].isIntersecting && !running) { running = true; play(); }
      if (!en[0].isIntersecting && running) { running = false; clear(); }
    }, { threshold: 0.4 }).observe(wa);
  } else if (wa) {
    $$(".wa-msg", wa).forEach(function (m) { m.classList.add("show"); });
  }

  /* ---------- FAQ (acordeón accesible) ---------- */
  var qs = $$(".faq-q");
  qs.forEach(function (q) {
    q.addEventListener("click", function () {
      var open = q.getAttribute("aria-expanded") === "true";
      qs.forEach(function (o) { o.setAttribute("aria-expanded", "false"); });
      q.setAttribute("aria-expanded", String(!open));
    });
    q.addEventListener("keydown", function (e) {
      var i = qs.indexOf(q);
      if (e.key === "ArrowDown") { e.preventDefault(); qs[(i + 1) % qs.length].focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); qs[(i - 1 + qs.length) % qs.length].focus(); }
      if (e.key === "Home") { e.preventDefault(); qs[0].focus(); }
      if (e.key === "End") { e.preventDefault(); qs[qs.length - 1].focus(); }
    });
  });

  /* ---------- Analítica con Consent Mode v2 ---------- */
  var KEY = "c360_consent_v1";
  var state = { analytics: false, marketing: false };
  var loaded = {};
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  var wantsGoogle = !!(C.ga4Id || C.gtmId);
  if (wantsGoogle) {
    window.gtag = gtag;
    gtag("consent", "default", { ad_storage: "denied", analytics_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", wait_for_update: 500 });
  }
  function addScript(src, attrs) {
    var s = doc.createElement("script"); s.async = true; s.src = src;
    if (attrs) Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    doc.head.appendChild(s); return s;
  }
  function loadTrackers() {
    if (wantsGoogle) {
      gtag("consent", "update", {
        analytics_storage: state.analytics ? "granted" : "denied",
        ad_storage: state.marketing ? "granted" : "denied",
        ad_user_data: state.marketing ? "granted" : "denied",
        ad_personalization: state.marketing ? "granted" : "denied"
      });
    }
    if (state.analytics) {
      if (C.gtmId && !loaded.gtm) {
        loaded.gtm = true;
        window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
        addScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(C.gtmId));
      } else if (C.ga4Id && !C.gtmId && !loaded.ga4) {
        loaded.ga4 = true;
        addScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(C.ga4Id));
        gtag("js", new Date());
        gtag("config", C.ga4Id);
      }
      if (C.clarityId && !loaded.clarity) {
        loaded.clarity = true;
        (function (c, l, a, r, i, t, y) {
          c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
          t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
          y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, doc, "clarity", "script", C.clarityId);
      }
      if (C.posthogKey && !loaded.posthog) {
        loaded.posthog = true;
        /* Fragmento oficial de PostHog */
        !function (t, e) { var o, n, p, r; e.__SV || (window.posthog = e, e._i = [], e.init = function (i, s, a) { function g(t, e) { var o = e.split("."); 2 == o.length && (t = t[o[0]], e = o[1]), t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; } (p = t.createElement("script")).type = "text/javascript", p.crossOrigin = "anonymous", p.async = !0, p.src = s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js", (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r); var u = e; for (void 0 !== a ? u = e[a] = [] : a = "posthog", u.people = u.people || [], u.toString = function (t) { var e = "posthog"; return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e; }, u.people.toString = function () { return u.toString(1) + ".people (stub)"; }, o = "init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags on onFeatureFlags identify reset opt_in_capturing opt_out_capturing".split(" "), n = 0; n < o.length; n++) g(u, o[n]); e._i.push([i, s, a]); }, e.__SV = 1); }(doc, window.posthog || []);
        window.posthog.init(C.posthogKey, { api_host: C.posthogHost || "https://us.i.posthog.com", person_profiles: "identified_only" });
      }
      if (C.sentryDsn && !loaded.sentry) {
        loaded.sentry = true;
        var ss = addScript("https://browser.sentry-cdn.com/8.40.0/bundle.min.js", { crossorigin: "anonymous" });
        ss.onload = function () { if (window.Sentry) window.Sentry.init({ dsn: C.sentryDsn, tracesSampleRate: 0 }); };
      }
    }
    if (state.marketing && C.metaPixelId && !loaded.fb) {
      loaded.fb = true;
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, doc, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", C.metaPixelId);
      window.fbq("track", "PageView");
    }
  }
  function trackEvent(name, params) {
    if (!state.analytics && !state.marketing) return;
    params = params || {};
    if (state.analytics) {
      if (C.gtmId) window.dataLayer.push(Object.assign({ event: name }, params));
      else if (C.ga4Id && window.gtag) gtag("event", name, params);
      if (window.posthog && window.posthog.capture) window.posthog.capture(name, params);
      if (window.clarity) window.clarity("event", name);
    }
    if (state.marketing && window.fbq) {
      if (name === "form_submit") window.fbq("track", "Lead");
      else if (name === "click_whatsapp" || name === "click_telefono" || name === "click_email") window.fbq("track", "Contact");
    }
  }
  doc.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-track]");
    if (el) trackEvent("click_" + el.getAttribute("data-track"), { link_url: el.getAttribute("href") || "" });
  });
  var scroll75 = false;
  window.addEventListener("scroll", raf(function () {
    if (scroll75) return;
    var h = doc.documentElement.scrollHeight - window.innerHeight;
    if (h > 0 && window.scrollY / h >= 0.75) { scroll75 = true; trackEvent("scroll_75", { percent: 75 }); }
  }), { passive: true });

  /* ---------- Banner de cookies ---------- */
  var cc = $("#cc"), prefs = $("#cc-prefs"), cfgBtn = $("#cc-config");
  var anyTracker = !!(C.ga4Id || C.gtmId || C.metaPixelId || C.clarityId || C.posthogKey || C.sentryDsn);
  function save(a, m) {
    state.analytics = a; state.marketing = m;
    safe.set(KEY, JSON.stringify({ analytics: a, marketing: m, ts: Date.now() }));
    cc.classList.remove("show");
    loadTrackers();
  }
  function showCC() { cc.classList.add("show"); $("#cc-analytics").checked = state.analytics; $("#cc-marketing").checked = state.marketing; }
  if (cc) {
    var saved = null;
    try { saved = JSON.parse(safe.get(KEY) || "null"); } catch (e) { saved = null; }
    if (saved) { state.analytics = !!saved.analytics; state.marketing = !!saved.marketing; loadTrackers(); }
    else if (anyTracker) setTimeout(showCC, 900);
    $("#cc-accept").addEventListener("click", function () { save(true, true); });
    $("#cc-reject").addEventListener("click", function () { save(false, false); });
    cfgBtn.addEventListener("click", function () {
      var open = prefs.classList.contains("show");
      if (!open) { prefs.classList.add("show"); cfgBtn.setAttribute("aria-expanded", "true"); cfgBtn.textContent = "Guardar selección"; }
      else { save($("#cc-analytics").checked, $("#cc-marketing").checked); prefs.classList.remove("show"); cfgBtn.setAttribute("aria-expanded", "false"); cfgBtn.textContent = "Configurar"; }
    });
    var again = $("#open-cookies");
    if (again) again.addEventListener("click", function (e) { e.preventDefault(); showCC(); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && cc.classList.contains("show") && !saved) cc.classList.remove("show"); });
  }

  /* ---------- Formulario ---------- */
  var form = $("#contact-form");
  if (form) {
    var status = $("#form-status"), btn = $("#f-submit"), label = $(".label", btn), t0 = Date.now();
    var rules = {
      nombre: function (v) { return v.trim().length >= 3 ? "" : "Escriba su nombre completo."; },
      cargo: function (v) { return v.trim() ? "" : "Indique su cargo."; },
      entidad: function (v) { return v ? "" : "Seleccione el tipo de entidad."; },
      municipio: function (v) { return v.trim() ? "" : "Indique el municipio o departamento."; },
      correo: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Escriba un correo válido, por ejemplo nombre@entidad.gov.co."; },
      tel: function (v) { return v.replace(/\D/g, "").length >= 7 ? "" : "Escriba un teléfono con al menos 7 dígitos."; },
      consent: function (v, el) { return el.checked ? "" : "Debe autorizar el tratamiento de sus datos para continuar."; }
    };
    var fields = { nombre: "#f-nombre", cargo: "#f-cargo", entidad: "#f-entidad", municipio: "#f-municipio", correo: "#f-correo", tel: "#f-tel", consent: "#f-consent" };
    function check(k) {
      var el = $(fields[k]), msg = rules[k](el.value, el), out = $("#e-" + k);
      out.textContent = msg;
      if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
      return !msg;
    }
    Object.keys(fields).forEach(function (k) {
      var el = $(fields[k]);
      el.addEventListener("blur", function () { if (el.value || el.checked || el.getAttribute("aria-invalid")) check(k); });
      el.addEventListener("input", function () { if (el.getAttribute("aria-invalid")) check(k); });
      el.addEventListener("change", function () { if (el.getAttribute("aria-invalid")) check(k); });
    });
    function say(kind, text) {
      status.className = "form-status show " + kind;
      status.textContent = text;
    }
    function payload() {
      var d = {};
      ["nombre", "cargo", "entidad", "municipio", "correo", "telefono", "mensaje"].forEach(function (n) { d[n] = (form.elements[n].value || "").trim(); });
      d.pagina = location.href; d.autorizaTratamientoDatos = true; d.enviado = new Date().toISOString(); d.tiempoEnFormularioMs = Date.now() - t0;
      return d;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      var firstBad = null;
      Object.keys(fields).forEach(function (k) { if (!check(k) && !firstBad) firstBad = $(fields[k]); });
      if (firstBad) { firstBad.focus(); return; }
      if (form.elements.website.value) { say("ok", "¡Gracias! Recibimos su solicitud y le escribiremos pronto para coordinar la reunión."); return; }
      var data = payload();
      if (!C.formEndpoint) {
        var body = ["Nombre: " + data.nombre, "Cargo: " + data.cargo, "Entidad: " + data.entidad, "Municipio / Departamento: " + data.municipio, "Correo: " + data.correo, "Teléfono: " + data.telefono, "", data.mensaje].join("\n");
        location.href = "mailto:" + (C.email || "") + "?subject=" + encodeURIComponent("Solicitud de reunión · Programa Mipyme 360°") + "&body=" + encodeURIComponent(body);
        say("info", "Abrimos su aplicación de correo con los datos del formulario. Si no se abrió, escríbanos a " + (C.email || "nuestro correo") + " o por WhatsApp.");
        trackEvent("form_submit", { method: "mailto" });
        return;
      }
      btn.disabled = true; form.classList.add("is-loading"); label.textContent = "Enviando";
      var ctl = "AbortController" in window ? new AbortController() : null;
      var to = setTimeout(function () { if (ctl) ctl.abort(); }, 15000);
      fetch(C.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data), signal: ctl ? ctl.signal : undefined })
        .then(function (r) { if (!r.ok) throw new Error("http " + r.status); })
        .then(function () {
          say("ok", "¡Gracias! Recibimos su solicitud y le escribiremos pronto para coordinar la reunión.");
          form.reset(); trackEvent("form_submit", { method: "endpoint" }); status.focus();
        })
        .catch(function () { say("fail", "No pudimos enviar el formulario. Intente de nuevo o escríbanos por WhatsApp."); status.focus(); })
        .then(function () { clearTimeout(to); btn.disabled = false; form.classList.remove("is-loading"); label.textContent = "Solicitar reunión"; });
    });
  }
})();
