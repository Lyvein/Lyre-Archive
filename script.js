const img = document.querySelector('.parallax-wrap img');

if (img) {
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 to 1
    const y = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1

    const rotateX = y * -6;   // tilt up/down
    const rotateY = x * 6;    // tilt left/right
    const moveX = x * 12;     // slight shift
    const moveY = y * 12;

    img.style.transform =
      `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(${moveX}px, ${moveY}px)`;
  });

  document.addEventListener('mouseleave', () => {
    img.style.transform = 'rotateX(0) rotateY(0) translate(0,0)';
  });
}
