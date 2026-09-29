const img = document.querySelector('.parallax-wrap img');

// ---- Diagonal page transition (set up first, so it's ready before load logic runs) ----
// Sequence: click -> diagonal slide-out covers the page -> navigate ->
// new page arrives already covered -> loading spinner runs on top of
// the solid panel -> once ready, loading fades away -> THEN the panel
// slides diagonally away, revealing the page.
const panel = document.getElementById('transition-panel');
const TRANSITION_DURATION = 1400; // must match the CSS transform transition duration
const arrivingFromTransition = panel && sessionStorage.getItem('siteTransitioning') === '1';

if (panel && arrivingFromTransition) {
  sessionStorage.removeItem('siteTransitioning');
  // Snap to fully covered instantly (no slide animation) so there's no
  // flash of the page before resources are ready. Disable the transition
  // just for this one frame, then re-enable it for the later reveal slide.
  panel.style.transition = 'none';
  panel.classList.add('covering');
  requestAnimationFrame(() => {
    panel.style.transition = '';
  });
}

function revealPanel() {
  // Removing 'covering' slides the panel diagonally off-screen again,
  // this time revealing the page underneath.
  if (panel) panel.classList.remove('covering');
}

if (panel) {
  document.querySelectorAll('nav a').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;

      e.preventDefault();
      sessionStorage.setItem('siteTransitioning', '1');
      panel.classList.add('covering'); // diagonal slide-out
      setTimeout(() => {
        window.location.href = href;
      }, TRANSITION_DURATION);
    });
  });
}

// ---- Loading screen: waits for the page's actual resources ----
// window's 'load' event only fires once everything (images, and video
// METADATA) has finished loading. If you swap the hero image for an
// <video id="hero-video"> element, give it that id and this will also
// wait for the video's data to be ready before hiding the loader —
// not just its metadata — so a heavier MP4 keeps the loader up longer
// automatically, with no other changes needed.
const MIN_LOADER_TIME = 1500; // milliseconds — floor so it never flashes too fast
const startTime = Date.now();

function hideLoaderWhenReady() {
  const loader = document.getElementById('loader');
  const heroVideo = document.getElementById('hero-video');

  const pageLoaded = new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve);
  });

  const videoReady = heroVideo
    ? new Promise((resolve) => {
        if (heroVideo.readyState >= 3) resolve(); // HAVE_FUTURE_DATA or better
        else heroVideo.addEventListener('canplaythrough', resolve, { once: true });
      })
    : Promise.resolve();

  Promise.all([pageLoaded, videoReady]).then(() => {
    const remaining = Math.max(0, MIN_LOADER_TIME - (Date.now() - startTime));
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
      // Start the panel's reveal slide at the same moment the loader
      // begins fading, so the two overlap instead of leaving a static
      // pause between "spinner gone" and "slide starts."
      revealPanel();
    }, remaining);
  });
}

hideLoaderWhenReady();


// How far the image can shift, in percentage points.
// The image is 110% of viewport size, so it has 10% total slack (5% each side)
// before you'd see an edge. Keep this at or under about 5.
const MAX_SHIFT = 4; // percent

if (img) {
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 to 1
    const y = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1

    // Move opposite to cursor for a subtle "looking around" 3D feel
    const shiftX = -x * MAX_SHIFT;
    const shiftY = -y * MAX_SHIFT;

    img.style.transform =
      `translate(calc(-50% + ${shiftX}%), calc(-50% + ${shiftY}%)) scale(1.02)`;
  });

  document.addEventListener('mouseleave', () => {
    img.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  document.addEventListener('mouseenter', () => {
    img.style.transition = 'transform 0.15s ease-out';
  });
}

// ---- Click / drag VFX ----
function spawnFx(x, y, type) {
  const el = document.createElement('div');
  el.className = `click-fx ${type}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

let lastTrailTime = 0;
const TRAIL_INTERVAL = 40; // ms between trail dots as the mouse moves

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

// ---- Ambient glowing sparks ----
function initSparks(containerId, count = 25) {
  const container = document.getElementById(containerId);
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const spark = document.createElement('div');
    spark.className = 'spark';
    spark.style.left = `${Math.random() * 100}%`;
    spark.style.top = `${Math.random() * 100}%`;
    spark.style.animationDuration = `${4 + Math.random() * 6}s`; // 4-10s
    spark.style.animationDelay = `${Math.random() * 8}s`;
    container.appendChild(spark);
  }
}

initSparks('sparks');