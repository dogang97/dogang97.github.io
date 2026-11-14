/* ============================================================
   도경환 · Portfolio
   - scroll reveal with stagger
   - pointer gloss on glass surfaces
   - nav scrolled state
   - project detail modal (content comes from each card's <template>)
   - animated stat counters
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav ---------- */
  var nav = document.getElementById("nav");
  var lastY = -1;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (y === lastY) return;
    lastY = y;
    if (y > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- reveal ---------- */
  var revealables = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  // stagger siblings inside a grid
  revealables.forEach(function (el) {
    var parent = el.parentElement;
    if (!parent) return;
    var sibs = Array.prototype.filter.call(parent.children, function (c) {
      return c.hasAttribute && c.hasAttribute("data-reveal");
    });
    var idx = sibs.indexOf(el);
    if (idx > 0) el.style.setProperty("--delay", Math.min(idx * 70, 420) + "ms");
  });

  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- counter ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (isNaN(target)) return;
    if (reduceMotion) return; // static text already shows the final value
    var start = performance.now();
    var dur = 1400;

    function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = val.toLocaleString("en-US") + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    el.textContent = "0" + suffix;
    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window && !reduceMotion) {
    var co = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            co.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------- pointer gloss ---------- */
  var glassEls = Array.prototype.slice.call(document.querySelectorAll(".glass"));
  glassEls.forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width) * 100;
      var y = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty("--mx", x + "%");
      el.style.setProperty("--my", y + "%");
    });
  });

  /* ---------- modal ---------- */
  var modal = document.getElementById("modal");
  var modalTag = document.getElementById("modalTag");
  var modalPeriod = document.getElementById("modalPeriod");
  var modalTitle = document.getElementById("modalTitle");
  var modalOrg = document.getElementById("modalOrg");
  var modalBody = document.getElementById("modalBody");
  var lastFocused = null;

  function openModal(card) {
    var tpl = card.querySelector("template.project__detail");
    if (!tpl) return;

    lastFocused = document.activeElement;
    modalTag.textContent = (card.querySelector(".tag") || {}).textContent || "";
    modalPeriod.textContent = (card.querySelector(".project__period") || {}).textContent || "";
    modalTitle.textContent = (card.querySelector("h3") || {}).textContent || "";
    modalOrg.textContent = (card.querySelector(".project__org") || {}).textContent || "";

    modalBody.innerHTML = "";
    modalBody.appendChild(tpl.content.cloneNode(true));

    modal.hidden = false;
    document.body.classList.add("is-locked");
    var closeBtn = modal.querySelector(".modal__close");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("is-locked");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll(".project"));

  cards.forEach(function (card) {
    card.addEventListener("click", function () { openModal(card); });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  modal.addEventListener("click", function (e) {
    var t = e.target;
    if (t && t.hasAttribute && t.hasAttribute("data-close")) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
    if (e.key === "Tab" && !modal.hidden) {
      var f = modal.querySelectorAll("button, [href], input, [tabindex]:not([tabindex='-1'])");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- smooth anchor offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 66;
      window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });
})();
