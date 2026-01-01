// runtime initialization moved from index.html and script.js
// Provides performance polyfill, initial timestamps, and viewerModel parsing.
// Tombstone: previously inline in index.html and duplicated in script.js

// performance polyfill (safe no-op fallbacks)
(function(){function noop(){} 
  window.performance = window.performance || {};
  window.performance.mark = performance.mark || noop;
  window.performance.measure = performance.measure || noop;
  if ("now" in window.performance === false) {
    var nowOffset = Date.now();
    if (performance.timing && performance.timing.navigationStart) {
      nowOffset = performance.timing.navigationStart;
    }
    window.performance.now = function now() {
      return Date.now() - nowOffset;
    };
  }
})();

// Globals / initial timestamps & viewerModel initialization
(function () {
  var now = Date.now();
  window.initialTimestamps = {
    initialTimestamp: now,
    initialRequestTimestamp: Math.round(performance.timeOrigin ? performance.timeOrigin : now - performance.now())
  };

  window.thunderboltTag = "libs-releases-GA-local";
  window.thunderboltVersion = "1.16492.0";
})();

// Attempt to parse embedded wix-essential-viewer-model JSON if present
(function(){
  try {
    var el = document.getElementById('wix-essential-viewer-model');
    if (el && el.textContent) {
      window.viewerModel = JSON.parse(el.textContent);
    } else {
      window.viewerModel = window.viewerModel || { commonConfig: { brand: "wix", host: "VIEWER", language: "es", locale: "es-es" } };
    }
  } catch (err) {
    console.error('viewerModel parse error:', err);
    window.viewerModel = window.viewerModel || { commonConfig: {} };
  }

  try {
    window.commonConfig = window.viewerModel.commonConfig;
  } catch (e) {
    window.commonConfig = {};
  }
})();

// New: ensure a safe global toggleMenu exists early so inline onclick handlers won't throw.
// script.js will overwrite this with the full implementation when it runs.
if (typeof window.toggleMenu !== 'function') {
  window.toggleMenu = function safeToggleMenu() {
    // Dispatch an event so other scripts can respond if they prefer not to override directly.
    try {
      document.dispatchEvent(new CustomEvent('requestToggleMenu'));
    } catch (e) {
      // Fallback: toggle a minimal aria state on known elements to avoid console errors
      var menuToggle = document.getElementById('menuToggle');
      var sidebar = document.getElementById('sidebar');
      if (menuToggle && sidebar) {
        var expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        if (!expanded) {
          sidebar.classList.add('active');
          sidebar.setAttribute('aria-hidden', 'false');
          document.documentElement.classList.add('sidebar-open');
          document.body.classList.add('sidebar-open');
        } else {
          sidebar.classList.remove('active');
          sidebar.setAttribute('aria-hidden', 'true');
          document.documentElement.classList.remove('sidebar-open');
          document.body.classList.remove('sidebar-open');
        }
      }
    }
  };
}

// New: export helper for partial loading (already present)
export function loadPartial(path) {
  return fetch(path, {cache: 'no-cache'}).then(r => {
    if (!r.ok) throw new Error('failed to load partial ' + path);
    return r.text();
  });
}

/* Small initializer to add non-invasive animations on page load.
   It avoids touching the hamburger/menu elements and respects reduced-motion. */
(function setupEntranceAnimations(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function safeAdd(el, cls){
    if (!el) return;
    el.classList.add(cls);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Hero: fade up left column and slide in right visuals (if present)
    safeAdd(document.querySelector('.hero-left'), 'anim-fadeInUp');
    safeAdd(document.querySelector('.hero-right'), 'anim-slideInRight');

    // Stagger features grid (use .stagger wrapper if present, else target .features-grid)
    const featuresGrid = document.querySelector('.features-grid');
    if (featuresGrid) {
      featuresGrid.classList.add('stagger');
      // mark animate slightly after paint so CSS transitions run visibly
      requestAnimationFrame(() => setTimeout(()=> featuresGrid.classList.add('animate'), 80));
    }

    // Apply fade-in-left to already-visible feature cards (they also get JS reveal)
    document.querySelectorAll('.feature.visible').forEach((f, i) => {
      // avoid affecting header/hamburger by ensuring parent is not header
      if (f.closest('.site-header')) return;
      f.classList.add('anim-fadeInLeft');
      f.style.animationDelay = (80 + i * 60) + 'ms';
    });

    // Price comparison table
    safeAdd(document.querySelector('.price-comparison .compare-table'), 'anim-fadeInRight');

    // Plans grid staggering
    const plansGrid = document.querySelector('.plans-grid');
    if (plansGrid) {
      plansGrid.classList.add('anim-stagger');
      // add stagger behavior via class
      const plans = Array.from(plansGrid.children);
      plans.forEach((p, idx) => {
        p.style.transitionDelay = (90 + idx * 60) + 'ms';
        p.classList.add('anim-fadeInUp');
      });
    }

    // Location cards (observer already reveals them; add bounce class when visible)
    document.querySelectorAll('.location-card.visible').forEach((c, idx) => {
      c.classList.add('anim-bounceInUp');
      c.style.animationDelay = (idx * 80) + 'ms';
    });

    // Hero label icon float after small delay
    const heroIcon = document.querySelector('.hero-label-icon');
    if (heroIcon) {
      setTimeout(()=> heroIcon.classList.add('anim-float'), 600);
    }

    // Floating actions small entrance grow
    document.querySelectorAll('.floating-actions a').forEach((btn, i) => {
      // do not animate the hamburger or menu toggle here; these are separate controls
      btn.classList.add('anim-grow');
      btn.style.animationDelay = (220 + i * 50) + 'ms';
    });
  });
})();