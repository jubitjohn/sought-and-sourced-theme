/* ============================================================
   Sought & Sourced — theme behaviour.
   Vanilla, deferred, and degrading: every control here works as
   a plain form or link if this file never loads.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- money ---------------- */
  function formatMoney(cents, format) {
    if (typeof cents === "string") cents = cents.replace(".", "");
    var value = "";
    var placeholder = /\{\{\s*(\w+)\s*\}\}/;
    var fmt = format || "${{amount}}";

    function pad(num, size) {
      var s = String(num);
      while (s.length < size) s = "0" + s;
      return s;
    }
    function group(number, precision, thousands, decimal) {
      if (isNaN(number) || number === null) return 0;
      number = (number / 100).toFixed(precision);
      var parts = number.split(".");
      var head = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands);
      var tail = parts[1] ? decimal + parts[1] : "";
      return head + tail;
    }

    var match = fmt.match(placeholder);
    switch (match ? match[1] : "amount") {
      case "amount": value = group(cents, 2, ",", "."); break;
      case "amount_no_decimals": value = group(cents, 0, ",", "."); break;
      case "amount_with_comma_separator": value = group(cents, 2, ".", ","); break;
      case "amount_no_decimals_with_comma_separator": value = group(cents, 0, ".", ","); break;
      case "amount_with_apostrophe_separator": value = group(cents, 2, "'", "."); break;
      case "amount_no_decimals_with_space_separator": value = group(cents, 0, " ", "."); break;
      case "amount_with_space_separator": value = group(cents, 2, " ", ","); break;
      default: value = group(cents, 2, ",", ".");
    }
    return fmt.replace(placeholder, value);
  }

  /* ---------------- true-scale engine ---------------- */
  var CAL_KEY = "ss-cal-factor";
  var cssPxPerMm = 3.7795;
  var probe = document.getElementById("mm-probe");
  if (probe) {
    var measured = probe.getBoundingClientRect().width / 100;
    if (measured > 0) cssPxPerMm = measured;
  }

  function readFactor() {
    try {
      var v = parseFloat(localStorage.getItem(CAL_KEY));
      return isFinite(v) && v >= 0.55 && v <= 1.75 ? v : null;
    } catch (e) { return null; }
  }
  function writeFactor(v) {
    try { localStorage.setItem(CAL_KEY, String(v)); } catch (e) {}
  }
  function applyScale(factor, calibrated) {
    document.documentElement.style.setProperty("--pxmm", cssPxPerMm * factor + "px");
    document.querySelectorAll("[data-caliper-state]").forEach(function (el) {
      el.textContent = calibrated
        ? "Calibrated to this screen — the pods above are exact."
        : "Uncalibrated — showing your browser's nominal millimetre.";
      el.style.color = calibrated ? "var(--pod)" : "var(--stamp)";
    });
  }

  var savedFactor = readFactor();
  applyScale(savedFactor === null ? 1 : savedFactor, savedFactor !== null);

  document.querySelectorAll("grade-scale").forEach(function (root) {
    var slider = root.querySelector("[data-caliper]");
    var reset = root.querySelector("[data-caliper-reset]");
    if (slider && savedFactor !== null) slider.value = savedFactor;
    if (slider) {
      slider.addEventListener("input", function () {
        var v = parseFloat(slider.value);
        applyScale(v, true);
        writeFactor(v);
      });
    }
    if (reset) {
      reset.addEventListener("click", function () {
        try { localStorage.removeItem(CAL_KEY); } catch (e) {}
        if (slider) slider.value = 1;
        applyScale(1, false);
      });
    }
  });

  /* ---------------- use router ---------------- */
  document.querySelectorAll("use-router").forEach(function (root) {
    var useWrap = root.querySelector("[data-router-use]");
    var freqWrap = root.querySelector("[data-router-freq]");
    var idle = root.querySelector("[data-router-idle]");
    var result = root.querySelector("[data-router-result]");
    var verdict = root.querySelector("[data-router-verdict]");
    var why = root.querySelector("[data-router-why]");
    var art = root.querySelector("[data-router-art]");
    var cta = root.querySelector("[data-router-cta]");
    var pickedUse = null, pickedFreq = null;

    function select(wrap, btn) {
      wrap.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
    }

    function render() {
      if (!pickedUse || !pickedFreq) return;
      var freq = pickedFreq.getAttribute("data-freq");
      var size = pickedUse.getAttribute("data-size-" + freq) || "";
      var grade = pickedUse.getAttribute("data-grade") || "";
      var trade = pickedUse.getAttribute("data-trade") || "";
      var mm = pickedUse.getAttribute("data-mm") || 7;

      idle.hidden = true;
      result.hidden = false;
      verdict.innerHTML = escapeHtml(grade) + (trade ? " <em>" + escapeHtml(trade) + "</em>" : "") + (size ? " · " + escapeHtml(size) : "");
      why.textContent = (pickedUse.getAttribute("data-why") || "") + " " + (pickedFreq.getAttribute("data-note") || "");
      if (cta) cta.setAttribute("href", pickedUse.getAttribute("data-url") || "#");

      art.innerHTML = "";
      for (var i = 0; i < 2; i++) {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "pod");
        svg.setAttribute("viewBox", "0 0 100 220");
        svg.style.setProperty("--mm", mm);
        var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
        use.setAttribute("href", "#pod");
        svg.appendChild(use);
        art.appendChild(svg);
      }
    }

    if (useWrap) useWrap.addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      pickedUse = b; select(useWrap, b); render();
    });
    if (freqWrap) freqWrap.addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      pickedFreq = b; select(freqWrap, b); render();
    });
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------------- product: variants, price, per dish ---------------- */
  var variantsEl = document.querySelector("[data-product-json]");
  var pSettingsEl = document.querySelector("[data-product-settings]");
  if (variantsEl && pSettingsEl) {
    var variants = [];
    var pset = {};
    try { variants = JSON.parse(variantsEl.textContent); } catch (e) {}
    try { pset = JSON.parse(pSettingsEl.textContent); } catch (e) {}

    var gramsPerDish = parseFloat(pset.gramsPerDish);
    if (!isFinite(gramsPerDish) || gramsPerDish <= 0) gramsPerDish = 0.6;

    var picker = document.querySelector("variant-picker");
    var priceBlock = document.querySelector("[data-price-block]");
    var variantInput = document.querySelector("[data-variant-input]");
    var addButton = document.querySelector("[data-add-button]");
    var stickyPrice = document.querySelector("[data-sticky-price]");
    var chosen = {};

    if (picker) {
      picker.querySelectorAll(".size[aria-pressed='true']").forEach(function (b) {
        chosen[b.getAttribute("data-option-position")] = b.getAttribute("data-value");
      });

      picker.addEventListener("click", function (e) {
        var b = e.target.closest(".size");
        if (!b) return;
        var pos = b.getAttribute("data-option-position");
        b.parentNode.querySelectorAll(".size").forEach(function (s) { s.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        chosen[pos] = b.getAttribute("data-value");
        update();
      });
    }

    function matchVariant() {
      return variants.find(function (v) {
        var opts = v.options || [];
        for (var i = 0; i < opts.length; i++) {
          var want = chosen[String(i + 1)];
          if (want !== undefined && opts[i] !== want) return false;
        }
        return true;
      });
    }

    function update() {
      var v = matchVariant();
      if (!v) return;
      if (variantInput) variantInput.value = v.id;

      if (priceBlock) {
        var html = '<span class="price">' + formatMoney(v.price, pset.moneyFormat) + "</span>";
        if (v.compare_at_price && v.compare_at_price > v.price) {
          html += '<span class="price--was">' + formatMoney(v.compare_at_price, pset.moneyFormat) + "</span>";
        }
        var grams = parseFloat(v.weight);
        if (pset.showPerDish && isFinite(grams) && grams > 0) {
          var dishes = Math.floor(grams / gramsPerDish);
          if (dishes > 0) {
            html += '<span class="perdish">&asymp; <b>' + formatMoney(Math.round(v.price / dishes), pset.moneyFormat) + "</b> " + escapeHtml(pset.perDishLabel || "per dish") + "</span>";
            if (pset.showWorkings) {
              html += '<p class="workings" style="width:100%">' + Math.round(grams) + " g &divide; " + gramsPerDish + " g = " + dishes + " dishes</p>";
            }
          }
        }
        priceBlock.innerHTML = html;
      }

      if (stickyPrice) stickyPrice.textContent = formatMoney(v.price, pset.moneyFormat);

      if (addButton) {
        addButton.disabled = !v.available;
        addButton.textContent = v.available ? addButton.getAttribute("data-label-add") || addButton.textContent : "Sold out";
      }

      var url = new URL(window.location.href);
      url.searchParams.set("variant", v.id);
      window.history.replaceState({}, "", url.toString());
    }

    if (addButton) addButton.setAttribute("data-label-add", addButton.textContent.trim());

    /* sticky mobile add-to-cart */
    var sticky = document.querySelector("[data-sticky-buy]");
    var buys = document.querySelector(".buys");
    if (sticky && buys && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        sticky.classList.toggle("is-visible", !entries[0].isIntersecting);
      }, { rootMargin: "0px 0px -80% 0px" }).observe(buys);
      var stickyAdd = sticky.querySelector("[data-sticky-add]");
      if (stickyAdd && addButton) stickyAdd.addEventListener("click", function () { addButton.click(); });
    }
  }

  /* ---------------- quantity ---------------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".qty button");
    if (!btn) return;
    var input = btn.parentNode.querySelector("input");
    var v = parseInt(input.value, 10) || 1;
    input.value = Math.max(1, btn.name === "plus" ? v + 1 : v - 1);
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });

  /* ---------------- gallery thumbs ---------------- */
  document.addEventListener("click", function (e) {
    var thumb = e.target.closest("[data-thumb]");
    if (!thumb) return;
    var main = document.querySelector("[data-gallery-main] img");
    if (!main) return;
    main.src = thumb.getAttribute("data-full");
    main.removeAttribute("srcset");
    document.querySelectorAll("[data-thumb]").forEach(function (t) { t.setAttribute("aria-current", "false"); });
    thumb.setAttribute("aria-current", "true");
  });

  /* ---------------- nav ---------------- */
  var navToggle = document.querySelector("[data-nav-toggle]");
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var nav = document.getElementById("SiteNav");
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------------- consignment drawer ---------------- */
  var drawer = document.getElementById("CartDrawer");
  var overlay = document.querySelector("[data-cart-overlay]");

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (overlay) overlay.classList.add("is-open");
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (overlay) overlay.classList.remove("is-open");
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-cart-close]")) { closeDrawer(); return; }
    if (e.target.closest("[data-cart-overlay]")) { closeDrawer(); return; }
    var open = e.target.closest("[data-cart-open]");
    if (open && drawer) { e.preventDefault(); refreshCart().then(openDrawer); }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });

  // Re-render the drawer server-side rather than rebuilding line HTML here,
  // so the markup stays in one place (sections/cart-drawer.liquid).
  function refreshCart() {
    if (!drawer) return Promise.resolve();
    return fetch(window.Shopify && window.Shopify.routes ? window.Shopify.routes.root + "?section_id=cart-drawer" : "/?section_id=cart-drawer")
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var body = doc.querySelector("[data-cart-body]");
        var total = doc.querySelector("[data-cart-total]");
        if (body) drawer.querySelector("[data-cart-body]").innerHTML = body.innerHTML;
        if (total) drawer.querySelector("[data-cart-total]").textContent = total.textContent;
        var foot = doc.querySelector('.cart-drawer__foot button[name="checkout"]');
        var liveFoot = drawer.querySelector('.cart-drawer__foot button[name="checkout"]');
        if (foot && liveFoot) liveFoot.disabled = foot.disabled;
      })
      .catch(function () {});
  }

  function updateCount() {
    return fetch("/cart.js", { headers: { Accept: "application/json" } })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        document.querySelectorAll("[data-cart-count]").forEach(function (el) { el.textContent = cart.item_count; });
      })
      .catch(function () {});
  }

  // Add to cart without leaving the page; falls back to a normal form POST if fetch fails.
  document.addEventListener("submit", function (e) {
    var form = e.target.closest("product-form form");
    if (!form || !drawer) return;
    e.preventDefault();
    var button = form.querySelector("[data-add-button]");
    if (button) button.setAttribute("aria-disabled", "true");

    fetch("/cart/add.js", { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (r) {
        if (!r.ok) throw new Error("add failed");
        return r.json();
      })
      .then(function () { return Promise.all([refreshCart(), updateCount()]); })
      .then(openDrawer)
      .catch(function () { form.submit(); })
      .finally(function () { if (button) button.removeAttribute("aria-disabled"); });
  });

  document.addEventListener("click", function (e) {
    var rm = e.target.closest("[data-remove-line]");
    if (!rm || !drawer) return;
    e.preventDefault();
    fetch(rm.getAttribute("href"), { headers: { Accept: "text/html" } })
      .then(function () { return Promise.all([refreshCart(), updateCount()]); })
      .catch(function () { window.location.href = rm.getAttribute("href"); });
  });

  /* ---------------- recommendations ---------------- */
  var rec = document.querySelector("[data-recommendations]");
  if (rec) {
    fetch(rec.getAttribute("data-url"))
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var inner = doc.querySelector(".band");
        if (inner) rec.innerHTML = inner.outerHTML;
      })
      .catch(function () {});
  }
})();
