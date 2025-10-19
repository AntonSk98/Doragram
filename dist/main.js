import {
  setDeviceReady,
  setMessage,
  loadImage,
  loadRandomImage,
  setAccount,
  getAccount
} from "./common.js";
import { loadInstagram } from "./instagram.js";

document.addEventListener("deviceready", async () => {
  const randomImage = await loadRandomImage();
  const backgroundImage = await loadImage("static/dora/test.jpeg");
  const msg = JSON.stringify({
    image: randomImage,
    background: backgroundImage,
  });

  setMessage(msg);
  setDeviceReady(true);
});

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("loadInstagram");
  button.addEventListener("click", async () => {
    loadInstagram();
  });
});
