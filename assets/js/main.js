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

  var vsw = $("#vswitch");
  if (vsw && C.showVersionSwitcher) vsw.hidden = false;

  /* ---------- Navegación: barra que se oculta al bajar, indicador deslizante y progreso 360° ---------- */
  var header = $("#site-header"), toggle = $(".nav-toggle"), menu = $("#menu");
  var navLinks = $("#nav-links"), ind = $(".nav-ind", navLinks || doc);
  var npFill = $(".np-fill"), npNum = $("#np-num"), npLabel = $("#np-label"), npText = $(".np-text");
  var SECS = [{ id: "inicio", label: "Inicio" }].concat($$(".nav-links a").map(function (a) { return { id: a.getAttribute("href").slice(1), label: a.getAttribute("data-label") }; }));
  SECS.forEach(function (o) { o.el = doc.getElementById(o.id); });
  var activeId = "inicio";
  function moveInd(a) {
    if (!ind) return;
    if (!a) { ind.classList.remove("on"); return; }
    ind.style.width = a.offsetWidth + "px";
    ind.style.transform = "translateX(" + a.offsetLeft + "px)";
    ind.classList.add("on");
  }
  function linkFor(id, scope) { return $(scope + ' a[href="#' + id + '"]'); }
  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    $$(".nav-links a, .menu-list a").forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + id); });
    $$(".nav-links a").forEach(function (a) { if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    if (!navLinks || !navLinks.matches(":hover")) moveInd(linkFor(id, ".nav-links"));
    var i = 0; SECS.forEach(function (o, k) { if (o.id === id) i = k; });
    if (npNum) { npNum.textContent = (i < 10 ? "0" : "") + i; npLabel.textContent = SECS[i].label; npText.classList.remove("swap"); void npText.offsetWidth; npText.classList.add("swap"); }
  }
  if (navLinks) {
    $$(".nav-links a").forEach(function (a) { a.addEventListener("mouseenter", function () { moveInd(a); }); a.addEventListener("focus", function () { moveInd(a); }); });
    navLinks.addEventListener("mouseleave", function () { moveInd(linkFor(activeId, ".nav-links")); });
  }
  var lastY = window.scrollY;
  function navOnScroll() {
    if (!header) return;
    var y = window.scrollY, vh = window.innerHeight;
    var docH = doc.documentElement.scrollHeight - vh;
    if (npFill) npFill.setAttribute("stroke-dasharray", (clamp(y / Math.max(docH, 1), 0, 1) * 100).toFixed(1) + " 100");
    header.classList.toggle("is-scrolled", y > 24);
    if (!doc.body.classList.contains("menu-open")) {
      if (y > 480 && y > lastY + 6) header.classList.add("is-hidden");
      else if (y < lastY - 6 || y < 480) header.classList.remove("is-hidden");
    }
    lastY = y;
    var line = y + vh * 0.38, cur = "inicio";
    SECS.forEach(function (o) { if (o.el && o.el.getBoundingClientRect().top + y <= line) cur = o.id; });
    setActive(cur);
  }
  function setMenu(open) {
    doc.body.classList.toggle("menu-open", open);
    doc.body.style.overflow = open ? "hidden" : "";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    $(".nt-label", toggle).textContent = open ? "Cerrar" : "Menú";
    if (header) header.classList.remove("is-hidden");
    if (open) setTimeout(function () { var a = $(".menu-list a.is-active") || $(".menu-list a"); if (a) a.focus({ preventScroll: true }); }, 300);
  }
  if (toggle && menu && header) {
    toggle.addEventListener("click", function () { setMenu(!doc.body.classList.contains("menu-open")); });
    $$("#menu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    doc.addEventListener("keydown", function (e) {
      if (!doc.body.classList.contains("menu-open")) return;
      if (e.key === "Escape") { setMenu(false); toggle.focus(); }
      if (e.key === "Tab") {
        var f = [toggle].concat($$("#menu a")), i = f.indexOf(doc.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    window.matchMedia("(min-width:1180px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });
  }
  activeId = ""; navOnScroll();
  window.addEventListener("scroll", raf(navOnScroll), { passive: true });
  window.addEventListener("resize", raf(function () { moveInd(linkFor(activeId, ".nav-links")); }));
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { moveInd(linkFor(activeId, ".nav-links")); });
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

  /* ---------- Anillo del eslogan: se separa en 5 ejes con el scroll ---------- */
  var MIDS = [-126, -54, 18, 90, 162];
  var tagRing = $("#tag-ring");
  var segs = tagRing ? $$(".seg", tagRing) : [];
  segs.forEach(function (s, i) {
    var a = MIDS[i] * Math.PI / 180;
    s.style.setProperty("--dx", (Math.cos(a) * 90).toFixed(1));
    s.style.setProperty("--dy", (Math.sin(a) * 90).toFixed(1));
  });
  if (segs.length && !reduce) {
    var tagSec = tagRing.closest(".tagline");
    var updRing = raf(function () {
      var r = tagSec.getBoundingClientRect(), vh = window.innerHeight;
      var d = Math.abs(r.top + r.height / 2 - vh / 2) / (vh * 0.85);
      var e = clamp(d, 0, 1); e = e * e * (3 - 2 * e);
      segs.forEach(function (s) { s.style.setProperty("--ex", e.toFixed(3)); });
    });
    window.addEventListener("scroll", updRing, { passive: true });
    updRing();
  }
  // Anillo de cierre: se ensambla al entrar
  ["#contact-ring-segs"].forEach(function (sel) {
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


  /* ---------- Hilo conductor: une las secciones y se dibuja con el scroll ---------- */
  var thread = $("#thread"), main = $("#contenido");
  if (thread && main) {
    var nodes = [], tFill = $("#thread-fill"), tHead = $("#thread-head"), t0 = 0, t1 = 0, rx = 8;
    var layout = function () {
      $$(".thread-node, .thread-branch", thread).forEach(function (n) { n.remove(); });
      nodes = [];
      var mTop = main.getBoundingClientRect().top + window.scrollY;
      var eyebrows = $$("[data-node]", main);
      if (!eyebrows.length) return;
      var left0 = eyebrows[0].getBoundingClientRect().left;
      rx = Math.max(6, left0 - (window.innerWidth >= 1280 ? 36 : 12));
      eyebrows.forEach(function (e) {
        var r = e.getBoundingClientRect(), y = r.top + window.scrollY - mTop + r.height / 2;
        var n = doc.createElement("i"); n.className = "thread-node"; n.style.left = rx + "px"; n.style.top = y + "px";
        var br = doc.createElement("i"); br.className = "thread-branch"; br.style.left = rx + "px"; br.style.top = y + "px"; br.style.width = Math.max(0, r.left - rx - 2) + "px";
        thread.appendChild(br); thread.appendChild(n);
        nodes.push({ y: y, n: n, b: br });
      });
      t0 = nodes[0].y;
      var last = $("#contacto [data-node]");
      t1 = last ? nodes[nodes.length - 1].y : main.offsetHeight - 200;
      thread.style.setProperty("--rx", rx + "px");
      thread.style.setProperty("--ty", t0 + "px");
      thread.style.setProperty("--th", (t1 - t0) + "px");
      update();
    };
    var update = function () {
      var mTop = main.getBoundingClientRect().top + window.scrollY;
      var tip = window.scrollY + window.innerHeight * 0.6 - mTop;
      var p = reduce ? 1 : clamp((tip - t0) / Math.max(1, t1 - t0), 0, 1);
      tFill.style.setProperty("--p", p.toFixed(4));
      thread.style.setProperty("--p", p.toFixed(4));
      var hy = t0 + p * (t1 - t0);
      tHead.style.setProperty("--hy", hy.toFixed(1) + "px");
      tHead.style.setProperty("--rot", (window.scrollY * 0.25).toFixed(1) + "deg");
      nodes.forEach(function (o) { var on = reduce || o.y <= hy + 1; o.n.classList.toggle("on", on); o.b.classList.toggle("on", on); });
    };
    window.addEventListener("scroll", raf(update), { passive: true });
    window.addEventListener("resize", raf(layout));
    window.addEventListener("load", layout);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(layout);
    if ("ResizeObserver" in window) { var lastH = 0; new ResizeObserver(raf(function () { if (Math.abs(main.offsetHeight - lastH) > 40) { lastH = main.offsetHeight; layout(); } })).observe(main); }
    layout();
  }

  /* ---------- Cifras que cuentan al aparecer ---------- */
  var counters = $$(".count");
  var runCount = function (el) {
    var to = +el.getAttribute("data-to"), from = 0, t0c = performance.now(), dur = 1400;
    var step = function (t) {
      var k = clamp((t - t0c) / dur, 0, 1), e = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length && !reduce && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { setTimeout(function () { runCount(x.target); }, 350); cio.unobserve(x.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { c.textContent = "0"; cio.observe(c); });
  }

  /* ---------- Parallax suave ---------- */
  var plx = $$("[data-parallax]");
  if (plx.length && !reduce) {
    var plxUpd = raf(function () {
      var vh = window.innerHeight;
      plx.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var f = +el.getAttribute("data-parallax"), off = (r.top + r.height / 2 - vh / 2) * -f;
        var img = el.querySelector("img") || el;
        img.style.transform = "translate3d(0," + off.toFixed(1) + "px,0) scale(1.06)";
      });
    });
    window.addEventListener("scroll", plxUpd, { passive: true });
    plxUpd();
  }

  /* ---------- Luz que sigue al cursor en las tarjetas ---------- */
  if (window.matchMedia("(hover:hover)").matches && !reduce) {
    doc.addEventListener("pointermove", function (e) {
      var c = e.target.closest && e.target.closest(".glass");
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  }

  /* ---------- Videos en bucle (solo si no hay ahorro de datos ni movimiento reducido) ---------- */
  (function loops() {
    var conn = navigator.connection || {};
    if (reduce || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || "")) return;
    $$("video.loop").forEach(function (v) {
      v.addEventListener("playing", function () { v.classList.add("on"); });
      var start = function () {
        if (!("IntersectionObserver" in window)) { v.play().catch(function () {}); return; }
        new IntersectionObserver(function (en) {
          if (en[0].isIntersecting) { v.play().catch(function () {}); } else { v.pause(); }
        }, { threshold: 0.15 }).observe(v);
      };
      if (v.id === "hero-video") {
        var go = function () { (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(start); };
        if (doc.readyState === "complete") go(); else window.addEventListener("load", go);
      } else start();
    });
  })();

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
