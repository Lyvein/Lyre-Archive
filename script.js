const img = document.querySelector('.parallax-wrap img');

// =========================================================
// PAGE TRANSITION
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

  loader.dataset.transitionTheme = departingTheme;
  loader.classList.add('active');

  if (outPanel) {
    setPanelTheme(outPanel, departingTheme);
    outPanel.classList.remove('leaving');

    const solidColor = departingTheme === 'nodal-hub'
      ? 'rgba(235, 246, 250, 1)'
      : 'rgba(0, 0, 0, 1)';

    const translucentColor = departingTheme === 'nodal-hub'
      ? 'rgba(235, 246, 250, 0.58)'
      : 'rgba(0, 0, 0, 0.52)';

    // The CSS contains overlapping OUT rules. Explicitly prepare
    // this panel in a solid, unblurred state.
    outPanel.style.animation = 'none';
    outPanel.style.transition = 'none';
    outPanel.style.backgroundColor = solidColor;
    outPanel.style.backdropFilter = 'blur(0px)';
    outPanel.style.webkitBackdropFilter = 'blur(0px)';
    forceReflow(outPanel);

    // Measure the panel's starting and ending positions while
    // loading still completely covers the screen.
    const startLeft = outPanel.getBoundingClientRect().left;

    outPanel.classList.add('leaving');
    const endLeft = outPanel.getBoundingClientRect().left;

    outPanel.classList.remove('leaving');
    forceReflow(outPanel);

    // Movement takes 1.4 seconds. Once blur begins, its visual
    // change takes 0.65 seconds.
    outPanel.style.transition =
      'transform 1.4s cubic-bezier(0.83, 0, 0.17, 1), ' +
      'background-color 1s ease, ' +
      'backdrop-filter 1s ease, ' +
      '-webkit-backdrop-filter 1s ease';

    // Paint the solid OUT panel beneath the opaque loading screen.
    requestAnimationFrame(() => {
      // The panel is now in place. Remove only the loader background.
      // Its GIF remains visible over the solid OUT panel.
      loader.style.backgroundColor = 'transparent';

      requestAnimationFrame(() => {
        // The transparent loader has now been painted. Start moving
        // the solid OUT panel and fade the loading GIF.
        const loadingImage = loader.querySelector('.loader-gif');

        if (loadingImage) {
          loadingImage.style.transition = 'opacity 0.2s ease';
          loadingImage.style.opacity = '0';
        }

        outPanel.classList.add('leaving');

        // Watch actual movement rather than guessing from elapsed time.
        let blurStarted = false;

        function watchPanelPosition() {
          if (blurStarted) return;

          const currentLeft =
            outPanel.getBoundingClientRect().left;

          const distance = endLeft - startLeft;

          const progress = distance === 0
            ? 1
            : (currentLeft - startLeft) / distance;

          if (progress >= 0.15) {
            blurStarted = true;

            outPanel.style.backgroundColor = translucentColor;
            outPanel.style.backdropFilter = 'blur(20px)';
            outPanel.style.webkitBackdropFilter = 'blur(20px)';
          } else {
            requestAnimationFrame(watchPanelPosition);
          }
        }

        requestAnimationFrame(watchPanelPosition);

        setTimeout(() => {
          loader.style.transition = 'none';
          loader.style.opacity = '0';
          loader.style.visibility = 'hidden';

          loader.classList.remove('active', 'wipe-out');
          loader.removeAttribute('data-transition-theme');

          document.documentElement.classList.remove('is-arriving');
          document.documentElement.removeAttribute(
            'data-departing-theme'
          );
          document.documentElement.removeAttribute(
            'data-target-theme'
          );

          sessionStorage.removeItem('siteTransitioning');
          sessionStorage.removeItem('departingTheme');
          sessionStorage.removeItem('targetTheme');

          forceReflow(loader);

          requestAnimationFrame(() => {
            loader.style.transition = '';
            loader.style.opacity = '';
            loader.style.visibility = '';
            loader.style.backgroundColor = '';

            if (loadingImage) {
              loadingImage.style.transition = '';
              loadingImage.style.opacity = '';
            }
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

const MAX_SHIFT = 2;

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