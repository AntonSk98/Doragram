// -------------------------------
// CONFIGURATION
// -------------------------------
const MAX_CIRCLES = 5; // Max number of circles on screen
const SPAWN_INTERVAL = 2000; // ms between spawning new circles
const SCREEN_PADDING = 100; // Keep circles away from viewport edges
const MIN_SPEED = 0.5; // Slowest circle speed
const MAX_SPEED = 3; // Fastest circle speed
const MIN_SIZE = 30; // Smallest circle diameter (px)
const MAX_SIZE = 70; // Largest circle diameter (px)
// -------------------------------

/**
 * Returns a random number between min (inclusive) and max (exclusive).
 */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Creates a moving circle element with random size, position, and velocity.
 * Circles bounce off viewport edges and can be removed by clicking.
 */
function createCircle() {
  const circle = document.createElement("div");
  circle.classList.add("circle");
  circle.setAttribute("tabindex", "-1"); // prevent focus outline

  const size = random(MIN_SIZE, MAX_SIZE);
  circle.style.width = `${size}px`;
  circle.style.height = `${size}px`;

  const { innerWidth, innerHeight } = window;
  let x = random(SCREEN_PADDING, innerWidth - size - SCREEN_PADDING);
  let y = random(SCREEN_PADDING, innerHeight - size - SCREEN_PADDING);

  const angle = random(0, Math.PI * 2);
  const speed = random(MIN_SPEED, MAX_SPEED);
  circle.vx = Math.cos(angle) * speed;
  circle.vy = Math.sin(angle) * speed;

  document.body.appendChild(circle);

  function move() {
    const { innerWidth, innerHeight } = window;

    x += circle.vx;
    y += circle.vy;

    if (x <= 0 || x + size >= innerWidth) {
      circle.vx *= -1;
      x = Math.max(0, Math.min(innerWidth - size, x));
    }
    if (y <= 0 || y + size >= innerHeight) {
      circle.vy *= -1;
      y = Math.max(0, Math.min(innerHeight - size, y));
    }

    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;

    if (!circle.classList.contains("remove")) {
      requestAnimationFrame(move);
    }
  }

  // Remove circle on click with a fade
  circle.addEventListener("click", () => {
    circle.classList.add("remove");
    setTimeout(() => circle.remove(), 300);
  });

  requestAnimationFrame(move);
}

/**
 * Periodically spawns new circles until MAX_CIRCLES is reached.
 */
function spawnCircles() {
  setInterval(() => {
    const circles = document.querySelectorAll(".circle");
    if (circles.length < MAX_CIRCLES) createCircle();
  }, SPAWN_INTERVAL);
}

// Start the game once the DOM is fully loaded
window.addEventListener("DOMContentLoaded", spawnCircles);
