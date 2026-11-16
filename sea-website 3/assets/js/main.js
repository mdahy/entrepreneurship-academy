/* Social Entrepreneurship Academy — site behaviour (no dependencies) */
(function () {
  "use strict";

  var doc = document;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  /* ---------- Active page ---------- */
  var page = doc.body.getAttribute("data-page");
  $$("[data-nav]").forEach(function (a) {
    if (a.getAttribute("data-nav") === page) a.setAttribute("aria-current", "page");
  });

  /* ---------- Header shadow ---------- */
  var header = $(".site-header");
  var toTop = $(".to-top");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
      var brand = $(".brand");
      if (brand) brand.focus({ preventScroll: true });
    });
  }

  /* ---------- Priority navigation ("More" menu) ----------
     Like the original builder, links that don't fit on one line
     move into a "More" dropdown instead of wrapping. */
  var nav = $(".primary-nav");
  var list = $("#nav-list");
  var moreItem = $(".nav-more");
  var moreMenu = $("#more-menu");
  var moreToggle = $(".more-toggle");

  function layoutNav() {
    if (!nav || !list || !moreItem) return;
    // put everything back first
    $$("li", moreMenu).forEach(function (li) { list.insertBefore(li, moreItem); });
    moreItem.hidden = true;
    if (getComputedStyle(nav).display === "none") return;

    var available = nav.clientWidth;
    var items = $$(":scope > li:not(.nav-more)", list);
    if (list.scrollWidth <= available) return;

    moreItem.hidden = false;
    for (var i = items.length - 1; i > 0 && list.scrollWidth > available; i--) {
      moreMenu.insertBefore(items[i], moreMenu.firstChild);
    }
  }

  function closeMore() {
    if (!moreMenu) return;
    moreMenu.classList.remove("is-open");
    moreToggle.setAttribute("aria-expanded", "false");
  }
  if (moreToggle) {
    moreToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = moreMenu.classList.toggle("is-open");
      moreToggle.setAttribute("aria-expanded", String(open));
    });
    doc.addEventListener("click", function (e) {
      if (!moreItem.contains(e.target)) closeMore();
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && moreMenu.classList.contains("is-open")) { closeMore(); moreToggle.focus(); }
    });
  }
  var navTimer;
  window.addEventListener("resize", function () {
    clearTimeout(navTimer);
    navTimer = setTimeout(layoutNav, 80);
  });
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(layoutNav);
  layoutNav();

  /* ---------- Mobile drawer ---------- */
  var drawer = $("#drawer");
  var menuBtn = $(".menu-toggle");
  var lastFocus = null;

  function focusables() {
    return $$("a[href], button:not([disabled])", drawer);
  }
  function openDrawer() {
    lastFocus = doc.activeElement;
    drawer.hidden = false;
    // next frame so the transition runs
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { drawer.classList.add("is-open"); });
    });
    menuBtn.setAttribute("aria-expanded", "true");
    doc.body.classList.add("no-scroll");
    var close = $(".drawer-close", drawer);
    if (close) close.focus();
  }
  function closeDrawer() {
    drawer.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    doc.body.classList.remove("no-scroll");
    var done = function () { drawer.hidden = true; };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) done();
    else setTimeout(done, 280);
    if (lastFocus) lastFocus.focus();
  }
  if (drawer && menuBtn) {
    menuBtn.addEventListener("click", openDrawer);
    $$("[data-close-drawer]", drawer).forEach(function (el) { el.addEventListener("click", closeDrawer); });
    $$(".drawer-list a", drawer).forEach(function (a) { a.addEventListener("click", closeDrawer); });
    drawer.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeDrawer(); return; }
      if (e.key !== "Tab") return;
      var f = focusables();
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 768 && !drawer.hidden) closeDrawer();
    });
  }

  /* ---------- "Show more / Show less" on modules ---------- */
  $$(".module[data-collapsible]").forEach(function (mod) {
    var btn = $(".toggle-more", mod);
    var body = $(".module-body", mod);
    if (!btn || !body) return;
    mod.classList.add("is-collapsed");
    btn.hidden = false;
    btn.addEventListener("click", function () {
      var collapsed = mod.classList.toggle("is-collapsed");
      btn.setAttribute("aria-expanded", String(!collapsed));
      btn.textContent = collapsed ? "+ Show more" : "− Show less";
      if (collapsed) {
        var top = mod.getBoundingClientRect().top;
        if (top < 0) mod.scrollIntoView({ block: "start" });
      }
    });
  });


  /* ---------- Participants gallery ---------- */
  $$("[data-gallery]").forEach(function (gal) {
    var slides = $$(".gallery-slide", gal);
    var thumbs = $$(".gallery-thumbs button", gal);
    var prev = $(".gallery-prev", gal), next = $(".gallery-next", gal);
    if (slides.length < 2) { if (prev) prev.hidden = true; if (next) next.hidden = true; return; }
    var i = 0;
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("is-active", k === i); s.setAttribute("aria-hidden", String(k !== i)); });
      thumbs.forEach(function (t, k) { t.setAttribute("aria-current", String(k === i)); });
      var live = $(".gallery-status", gal);
      if (live) live.textContent = "Photo " + (i + 1) + " of " + slides.length;
    }
    prev.addEventListener("click", function () { show(i - 1); });
    next.addEventListener("click", function () { show(i + 1); });
    thumbs.forEach(function (t, k) { t.addEventListener("click", function () { show(k); }); });
    gal.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(i - 1);
      if (e.key === "ArrowRight") show(i + 1);
    });
    var x0 = null;
    gal.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    gal.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1);
      x0 = null;
    });
    show(0);
  });

  /* ---------- Forms ----------
     Works with Netlify Forms out of the box (free). On other hosts,
     set data-endpoint on the form to any free form backend URL. */
  $$("form[data-ajax]").forEach(function (form) {
    var status = $(".form-status", form);
    var rules = {
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Enter an email address like name@example.com."; },
      message: function (v) { return v.trim().length > 9 || "Write a message of at least 10 characters."; },
      consent: function (v, el) { return el.checked || el.getAttribute("data-error") || "Tick the box to continue."; }
    };
    function check(el) {
      var rule = rules[el.name];
      if (!rule) return true;
      var res = rule(el.value, el);
      var field = el.closest(".form-field");
      var err = field && $(".error", field);
      if (res === true) {
        field && field.classList.remove("has-error");
        el.removeAttribute("aria-invalid");
        return true;
      }
      field && field.classList.add("has-error");
      el.setAttribute("aria-invalid", "true");
      if (err) err.textContent = res;
      return false;
    }
    $$("input, textarea", form).forEach(function (el) {
      el.addEventListener("blur", function () { if (el.value || el.type === "checkbox") check(el); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      var fields = $$("input[name], textarea[name]", form).filter(function (el) { return rules[el.name]; });
      var bad = fields.filter(function (el) { return !check(el); });
      if (bad.length) { bad[0].focus(); return; }

      var btn = $("button[type=submit]", form);
      var label = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending…";
      var endpoint = form.getAttribute("data-endpoint") || "/";
      var asJson = form.getAttribute("data-format") === "json";
      var fd = new FormData(form);
      var body = asJson ? JSON.stringify(Object.fromEntries(fd.entries())) : new URLSearchParams(fd).toString();

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": asJson ? "application/json" : "application/x-www-form-urlencoded", "Accept": "application/json" },
        body: body
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json().catch(function () { return {}; });
      }).then(function (res) {
        if (res && (res.success === false || res.success === "false")) throw new Error(res.message || "rejected");
        form.reset();
        status.textContent = form.getAttribute("data-success") || "Sent.";
        status.className = "form-status is-ok";
      }).catch(function () {
        var mail = form.getAttribute("data-fallback-email");
        status.innerHTML = "The message couldn’t be sent from this page. " +
          (mail ? "Email us at <a href=\"mailto:" + mail + "\">" + mail + "</a> instead." : "Please try again later.");
        status.className = "form-status is-err";
      }).finally(function () {
        btn.disabled = false;
        btn.textContent = label;
        status.focus();
      });
    });
  });
})();
