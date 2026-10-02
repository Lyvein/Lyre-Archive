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

    // Prepare the OUT panel as solid and unblurred.
    outPanel.style.animation = 'none';
    outPanel.style.transition = 'none';
    outPanel.style.backgroundColor = solidColor;
    outPanel.style.backdropFilter = 'blur(0px)';
    outPanel.style.webkitBackdropFilter = 'blur(0px)';
    forceReflow(outPanel);

    // Measure its movement while the loader covers the screen.
    const startLeft = outPanel.getBoundingClientRect().left;

    outPanel.classList.add('leaving');
    const endLeft = outPanel.getBoundingClientRect().left;

    outPanel.classList.remove('leaving');
    forceReflow(outPanel);

    outPanel.style.transition =
      'transform 1.4s cubic-bezier(0.83, 0, 0.17, 1), ' +
      'background-color 1s ease, ' +
      'backdrop-filter 1s ease, ' +
      '-webkit-backdrop-filter 1s ease';

    requestAnimationFrame(() => {
      // Keep the GIF visible over the solid OUT panel.
      loader.style.backgroundColor = 'transparent';

      requestAnimationFrame(() => {
        const loadingImage = loader.querySelector('.loader-gif');

        if (loadingImage) {
          loadingImage.style.transition = 'opacity 0.2s ease';
          loadingImage.style.opacity = '0';
        }

        outPanel.classList.add('leaving');

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

// =========================================================
// RANDOM NODAL HUB LAYOUT
// =========================================================

(() => {
  const hub = document.querySelector('.lyvein-hub');
  const canvas = document.querySelector('.lyvein-kv');

  if (!hub || !canvas) return;

  const seeds = new WeakMap();

  let scheduled = 0;
  let previousSize = '';

  function layoutNodes() {
    const nodes = [...canvas.querySelectorAll('.lyvein-node')];

    if (!nodes.length) return;

    const width = canvas.clientWidth;

    if (!width) return;

    const compact = width <= 768;
    const nav = document.querySelector('nav');

    const top = Math.max(
      90,
      (nav?.getBoundingClientRect().bottom || 0) + 32
    );

    const margin = Math.min(32, width * 0.05);
    const gap = 24;

    // Measure room for each node, its number, and its label.
    const boxes = nodes.map(node => {
      if (!seeds.has(node)) {
        seeds.set(node, {
          order: Math.random(),
          x: Math.random(),
          y: Math.random()
        });
      }

      const label = node.querySelector('.node-label');

      if (label) {
        for (const property of ['left', 'top', 'transform']) {
          label.style.removeProperty(property);
        }

        if (compact) {
          label.style.left = '50%';
          label.style.top = 'calc(100% + 8px)';
          label.style.transform = 'translate(-50%, 0)';
        }
      }

      const dot = node.querySelector('.node-dot');

      const dotWidth = dot?.offsetWidth || 20;
      const labelWidth = label?.offsetWidth || 0;
      const labelHeight = label?.offsetHeight || 0;

      const labelGap = label
        ? parseFloat(getComputedStyle(label).left) - node.offsetWidth
        : 0;

      return {
        node,
        seed: seeds.get(node),

        left: compact
          ? Math.max(node.offsetWidth / 2, labelWidth / 2)
          : node.offsetWidth / 2,

        right: compact
          ? Math.max(node.offsetWidth / 2, labelWidth / 2)
          : node.offsetWidth / 2 + Math.max(0, labelGap) + labelWidth,

        above: node.offsetHeight / 2 + 28,

        below: compact
          ? node.offsetHeight / 2 + 8 + labelHeight
          : node.offsetHeight / 2,

        dotOffset: dot
          ? dot.offsetLeft + dotWidth / 2 - node.offsetWidth / 2
          : 0
      };
    });

    const left = Math.max(...boxes.map(box => box.left));
    const right = Math.max(...boxes.map(box => box.right));
    const above = Math.max(...boxes.map(box => box.above));
    const below = Math.max(...boxes.map(box => box.below));

    const cellMinWidth = left + right + gap;
    const cellMinHeight = above + below + gap;

    const availableWidth = Math.max(1, width - margin * 2);

    const maxColumns = Math.max(
      1,
      Math.min(
        nodes.length,
        Math.floor(availableWidth / cellMinWidth)
      )
    );

    const viewportHeight = window.innerHeight;

    let columns = 1;
    let bestScore = Infinity;

    for (let c = 1; c <= maxColumns; c++) {
      const rows = Math.ceil(nodes.length / c);

      const h = Math.max(
        viewportHeight - top - margin,
        rows * cellMinHeight
      );

      const cellW = availableWidth / c;
      const cellH = h / rows;

      const score =
        Math.abs(
          Math.log(
            (cellW / cellMinWidth) / (cellH / cellMinHeight)
          )
        ) +
        (c * rows - nodes.length) * 0.08;

      if (score < bestScore) {
        bestScore = score;
        columns = c;
      }
    }

    const rows = Math.ceil(nodes.length / columns);

    const height = Math.max(
      viewportHeight,
      top + margin + rows * cellMinHeight
    );

    // Allow scrolling if the network outgrows the screen.
    hub.style.height = `${height}px`;

    document.body.style.overflowY =
      height > viewportHeight ? 'auto' : '';

    const cellW = availableWidth / columns;
    const cellH = (height - top - margin) / rows;

    const points = [];

    boxes.sort((a, b) => a.seed.order - b.seed.order);

    boxes.forEach((box, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      const slackX = Math.max(
        0,
        cellW - left - right - gap
      );

      const slackY = Math.max(
        0,
        cellH - above - below - gap
      );

      const x =
        margin +
        col * cellW +
        left +
        gap / 2 +
        box.seed.x * slackX;

      const y =
        top +
        row * cellH +
        above +
        gap / 2 +
        box.seed.y * slackY;

      box.node.style.left = `${x}px`;
      box.node.style.top = `${y}px`;

      points.push({
        x: x + box.dotOffset,
        y
      });
    });

    // =====================================================
    // NETWORK CONNECTIONS
    // =====================================================

    const network = canvas.querySelector('.node-network');

    if (network) {
      network.setAttribute(
        'viewBox',
        `0 0 ${width} ${height}`
      );

      network.replaceChildren();

      const edges = [];
      const degrees = points.map(() => 0);
      const linked = new Set();

      const edgeKey = (a, b) => Math.min(a, b) + ':' + Math.max(a, b);

      const length = (a, b) => Math.hypot(
        points[a].x - points[b].x,
        points[a].y - points[b].y
      );

      function addEdge(a, b) {
        edges.push([a, b]);
        linked.add(edgeKey(a, b));

        degrees[a]++;
        degrees[b]++;
      }

      // Ensure that every node belongs to one network.
      const connected = new Set([0]);

      while (connected.size < points.length) {
        let best = null;
        let bestLength = Infinity;

        for (const a of connected) {
          points.forEach((point, b) => {
            if (connected.has(b)) return;

            const distance = length(a, b);

            if (distance < bestLength) {
              bestLength = distance;
              best = [a, b];
            }
          });
        }

        addEdge(...best);
        connected.add(best[1]);
      }

      function orientation(a, b, c) {
        return (
          (b.x - a.x) * (c.y - a.y) -
          (b.y - a.y) * (c.x - a.x)
        );
      }

      function onSegment(a, b, p) {
        return (
          Math.abs(orientation(a, b, p)) < 0.001 &&
          p.x >= Math.min(a.x, b.x) - 0.001 &&
          p.x <= Math.max(a.x, b.x) + 0.001 &&
          p.y >= Math.min(a.y, b.y) - 0.001 &&
          p.y <= Math.max(a.y, b.y) + 0.001
        );
      }

      function crossesExisting(a, b) {
        return edges.some(([c, d]) => {
          if (
            a === c || a === d ||
            b === c || b === d
          ) {
            return false;
          }

          const A = points[a];
          const B = points[b];
          const C = points[c];
          const D = points[d];

          const o1 = orientation(A, B, C);
          const o2 = orientation(A, B, D);
          const o3 = orientation(C, D, A);
          const o4 = orientation(C, D, B);

          return (
            (o1 * o2 < 0 && o3 * o4 < 0) ||
            onSegment(A, B, C) ||
            onSegment(A, B, D) ||
            onSegment(C, D, A) ||
            onSegment(C, D, B)
          );
        });
      }

      // Increase this for a denser network.
      const EXTRA_LINKS_PER_NODE = 0.65;

      // Stop adding extra links to busy nodes.
      const MAX_CONNECTIONS = 4;

      const extraBudget = Math.ceil(
        points.length * EXTRA_LINKS_PER_NODE
      );

      const maxExtraLength =
        Math.hypot(width, height) * 0.65;

      const candidates = [];

      for (let a = 0; a < points.length; a++) {
        for (let b = a + 1; b < points.length; b++) {
          const distance = length(a, b);

          if (
            !linked.has(edgeKey(a, b)) &&
            distance <= maxExtraLength
          ) {
            candidates.push({
              a,
              b,
              distance
            });
          }
        }
      }

      // Add short, noncrossing connections to form loops.
      for (let i = 0; i < extraBudget; i++) {
        let best = null;
        let bestScore = Infinity;

        for (const candidate of candidates) {
          const { a, b, distance } = candidate;

          if (
            linked.has(edgeKey(a, b)) ||
            degrees[a] >= MAX_CONNECTIONS ||
            degrees[b] >= MAX_CONNECTIONS ||
            crossesExisting(a, b)
          ) {
            continue;
          }

          const leafBonus =
            degrees[a] === 1 || degrees[b] === 1
              ? 0.7
              : 1;

          const score =
            distance *
            leafBonus *
            (1 + 0.2 * (degrees[a] + degrees[b]));

          if (score < bestScore) {
            bestScore = score;
            best = candidate;
          }
        }

        if (!best) break;

        addEdge(best.a, best.b);
      }

      // Draw the completed network.
      edges.forEach(([a, b]) => {
        const line = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'line'
        );

        const coordinates = {
          x1: points[a].x,
          y1: points[a].y,
          x2: points[b].x,
          y2: points[b].y
        };

        for (const [key, value] of Object.entries(coordinates)) {
          line.setAttribute(key, value);
        }

        network.appendChild(line);
      });
    }
  }

  // =======================================================
  // UPDATE THE LAYOUT WHEN NEEDED
  // =======================================================

  function scheduleLayout(force = false) {
    const size =
      `${canvas.clientWidth}:` +
      `${window.innerHeight}:` +
      `${canvas.querySelectorAll('.lyvein-node').length}`;

    if (!force && size === previousSize) return;

    previousSize = size;

    cancelAnimationFrame(scheduled);
    scheduled = requestAnimationFrame(layoutNodes);
  }

  layoutNodes();

  window.addEventListener('resize', () => {
    scheduleLayout();
  });

  document.fonts?.ready.then(() => {
    scheduleLayout(true);
  });

  new MutationObserver(records => {
    const nodesChanged = records.some(record =>
      [...record.addedNodes, ...record.removedNodes].some(node =>
        node.nodeType === 1 &&
        (
          node.matches('.lyvein-node') ||
          node.querySelector('.lyvein-node')
        )
      )
    );

    if (nodesChanged) {
      scheduleLayout(true);
    }
  }).observe(canvas, {
    childList: true,
    subtree: true
  });
})();