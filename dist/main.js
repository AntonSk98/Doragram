import {
  setDeviceReady,
  setMessage,
  loadImage,
  loadRandomImage,
} from "./common.js";
import { loadInstagram } from "./instagram.js";

/**
 * Initializes the application once the device APIs are ready.
 *
 * - Waits for the 'deviceready' event (Cordova-specific).
 * - Loads a random image and a background image for the Dora overlay.
 * - Packages the images into a JSON message and signals that the device is ready.
 */
document.addEventListener("deviceready", async () => {
  const randomImage = await loadRandomImage();
  const backgroundImage = await loadImage("static/dora/test.jpeg");

  const msg = JSON.stringify({
    image: randomImage,
    background: backgroundImage,
  });

  setMessage(msg); // Store the message for later injection into Instagram
  setDeviceReady(true); // Mark the device as ready for further operations
});

/**
 * Sets up the UI interaction once the DOM is fully loaded.
 *
 * - Waits for the 'DOMContentLoaded' event.
 * - Attaches a click listener to the "Load Instagram" button.
 * - Launches the Instagram InAppBrowser with tweaks when clicked.
 */
document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("loadInstagram");
  button.addEventListener("click", async () => {
    loadInstagram();
  });
});
