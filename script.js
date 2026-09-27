const img = document.querySelector('.parallax-wrap img');

// How far the image can shift, in percentage points.
// The image is 120% of viewport size, so it has 20% total slack (10% each side)
// before you'd see an edge. Keep this comfortably under that.
const MAX_SHIFT = 6; // percent

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
