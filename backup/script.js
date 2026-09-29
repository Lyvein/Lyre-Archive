const img = document.querySelector('.parallax-wrap img');

// =========================================================
// PAGE TRANSITION
//
// IN: current-page theme, blur/translucent → solid
// LOADING: same theme
// OUT: same theme, solid → blur/translucent
// =========================================================

const panel = document.getElementById('transition-panel');
const outPanel = document.getElementById('out-panel');
const loader = document.getElementById('loader');

const TRANSITION_DURATION = 1400;
const LOADING_DURATION = 1500;

const currentPageTheme = document.body.dataset.pageTheme || 'home';
const arrivingFromTransition =
  sessionStorage.getItem('siteTransitioning') === '1';

function setPanelTheme(element, theme) {
  if (!element) return;
  element.dataset.transitionTheme = theme;
}

function forceReflow(element) {
  if (!element) return;
  element.getBoundingClientRect();
}

setPanelTheme(panel, currentPageTheme);

// =========================================================
// ARRIVING ON DESTINATION PAGE
// =========================================================

if (loader && arrivingFromTransition) {
  const departingTheme =
    sessionStorage.getItem('departingTheme') || 'home';

  // Loading and OUT both retain the departing page's colour.
  loader.dataset.transitionTheme = departingTheme;
  loader.classList.add('active');

  if (outPanel) {
    setPanelTheme(outPanel, departingTheme);
    outPanel.classList.remove('leaving');
    forceReflow(outPanel);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // The solid OUT panel covers the loader. Hide the loader
        // before the panel starts moving so it cannot mask the animation.
        loader.style.transition = 'none';
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        loader.classList.remove('active', 'wipe-out');
        forceReflow(loader);

        outPanel.classList.add('leaving');

        setTimeout(() => {
          loader.removeAttribute('data-transition-theme');

          document.documentElement.classList.remove('is-arriving');
          document.documentElement.removeAttribute('data-departing-theme');
          document.documentElement.removeAttribute('data-target-theme');

          sessionStorage.removeItem('siteTransitioning');
          sessionStorage.removeItem('departingTheme');
          sessionStorage.removeItem('targetTheme');

          forceReflow(loader);

          requestAnimationFrame(() => {
            loader.style.transition = '';
            loader.style.opacity = '';
            loader.style.visibility = '';
          });
        }, TRANSITION_DURATION);
      });
    });
  } else {
    // Fallback if the OUT panel is missing.
    loader.style.transition = 'none';
    loader.style.opacity = '0';
    loader.style.visibility = 'hidden';

    document.documentElement.classList.remove('is-arriving');
    document.documentElement.removeAttribute('data-departing-theme');
    document.documentElement.removeAttribute('data-target-theme');

    sessionStorage.removeItem('siteTransitioning');
    sessionStorage.removeItem('departingTheme');
    sessionStorage.removeItem('targetTheme');
  }
} else {
  // Normal direct visit or refresh.
  document.documentElement.classList.remove('is-arriving');
  document.documentElement.removeAttribute('data-departing-theme');
  document.documentElement.removeAttribute('data-target-theme');

  if (loader) {
    loader.classList.remove('active', 'wipe-out');
    loader.removeAttribute('data-transition-theme');
  }

  if (outPanel) {
    outPanel.classList.remove('leaving');
  }
}

// =========================================================
// NAVIGATION
// =========================================================

document.querySelectorAll('nav a').forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');

    if (!href || href.startsWith('#') || href.startsWith('http')) {
      return;
    }

    const targetURL = new URL(href, window.location.href);
    const currentURL = new URL(window.location.href);

    if (targetURL.pathname === currentURL.pathname) {
      e.preventDefault();
      return;
    }

    e.preventDefault();

    if (!panel) {
      window.location.href = href;
      return;
    }

    // Transition IN uses the page being left.
    setPanelTheme(panel, currentPageTheme);
    panel.classList.remove('covering');
    forceReflow(panel);

    requestAnimationFrame(() => {
      panel.classList.add('covering');

      setTimeout(() => {
        if (loader) {
          loader.dataset.transitionTheme = currentPageTheme;
          loader.classList.add('active');
        }

        setTimeout(() => {
          sessionStorage.setItem('departingTheme', currentPageTheme);
          sessionStorage.setItem('siteTransitioning', '1');

          window.location.href = href;
        }, LOADING_DURATION);
      }, TRANSITION_DURATION);
    });
  });
});

// =========================================================
// HOME PAGE PARALLAX
// =========================================================

const MAX_SHIFT = 4;

if (img) {
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    const shiftX = -x * MAX_SHIFT;
    const shiftY = -y * MAX_SHIFT;

    img.style.transform =
      `translate(
        calc(-50% + ${shiftX}%),
        calc(-50% + ${shiftY}%)
      ) scale(1.02)`;
  });

  document.addEventListener('mouseleave', () => {
    img.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  document.addEventListener('mouseenter', () => {
    img.style.transition = 'transform 0.15s ease-out';
  });
}

// =========================================================
// CLICK / DRAG VFX
// =========================================================

function spawnFx(x, y, type) {
  const el = document.createElement('div');

  el.className = `click-fx ${type}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;

  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

let lastTrailTime = 0;
const TRAIL_INTERVAL = 40;

document.addEventListener('mousedown', (e) => {
  spawnFx(e.clientX, e.clientY, 'ripple');
});

document.addEventListener('mousemove', (e) => {
  const now = Date.now();

  if (now - lastTrailTime > TRAIL_INTERVAL) {
    spawnFx(e.clientX, e.clientY, 'trail');
    lastTrailTime = now;
  }
});

// =========================================================
// AMBIENT GLOWING SPARKS
// =========================================================

function initSparks(containerId, count = 25) {
  const container = document.getElementById(containerId);
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const spark = document.createElement('div');

    spark.className = 'spark';
    spark.style.left = `${Math.random() * 100}%`;
    spark.style.top = `${Math.random() * 100}%`;
    spark.style.animationDuration = `${4 + Math.random() * 6}s`;
    spark.style.animationDelay = `${Math.random() * 8}s`;

    container.appendChild(spark);
  }
}

initSparks('sparks');