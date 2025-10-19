// game.js

// -------------------------------
// CONFIGURATION
// -------------------------------
const MAX_CIRCLES = 5;        // maximum number of active circles
const SPAWN_INTERVAL = 2000;   // ms between spawns
const SCREEN_PADDING = 100;     // keep inside viewport edges
const MIN_SPEED = 0.5;         // slowest possible movement
const MAX_SPEED = 3;           // fastest possible movement
const MIN_SIZE = 30;           // smallest circle size (px)
const MAX_SIZE = 70;           // largest circle size (px)
// -------------------------------

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createCircle() {
  const circle = document.createElement('div');
  circle.classList.add('circle');
  circle.setAttribute('tabindex', '-1'); // prevent focus outline

  // random size
  const size = random(MIN_SIZE, MAX_SIZE);
  circle.style.width = `${size}px`;
  circle.style.height = `${size}px`;

  const { innerWidth, innerHeight } = window;

  // random starting position
  let x = random(SCREEN_PADDING, innerWidth - size - SCREEN_PADDING);
  let y = random(SCREEN_PADDING, innerHeight - size - SCREEN_PADDING);

  // random direction and speed
  const angle = random(0, Math.PI * 2);
  const speed = random(MIN_SPEED, MAX_SPEED);
  circle.vx = Math.cos(angle) * speed;
  circle.vy = Math.sin(angle) * speed;

  document.body.appendChild(circle);

  // movement loop
  function move() {
    const { innerWidth, innerHeight } = window;

    x += circle.vx;
    y += circle.vy;

    // bounce on horizontal edges
    if (x <= 0 || x + size >= innerWidth) {
      circle.vx *= -1;
      x = Math.max(0, Math.min(innerWidth - size, x));
    }

    // bounce on vertical edges
    if (y <= 0 || y + size >= innerHeight) {
      circle.vy *= -1;
      y = Math.max(0, Math.min(innerHeight - size, y));
    }

    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;

    if (!circle.classList.contains('remove')) {
      requestAnimationFrame(move);
    }
  }

  // click to remove
  circle.addEventListener('click', () => {
    circle.classList.add('remove');
    setTimeout(() => circle.remove(), 300);
  });

  requestAnimationFrame(move);
}

// spawn new circles periodically
function spawnCircles() {
  setInterval(() => {
    const circles = document.querySelectorAll('.circle');
    if (circles.length < MAX_CIRCLES) {
      createCircle();
    }
  }, SPAWN_INTERVAL);
}

// start game when DOM is ready
window.addEventListener('DOMContentLoaded', spawnCircles);