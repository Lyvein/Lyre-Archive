const img = document.querySelector('.parallax-wrap img');

const MIN_LOADER_TIME = 1500; // milliseconds
const startTime = Date.now();

window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const remaining = Math.max(0, MIN_LOADER_TIME - (Date.now() - startTime));
  setTimeout(() => {
    if (loader) loader.classList.add('hidden');
  }, remaining);
});

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