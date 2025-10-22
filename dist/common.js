// ---- State management ----
/**
 * Tracks device readiness, messages, and Procrastination Mode state.
 */
let _deviceReady = false;
let _message = null;
let _procrastinationModeActive = false;

export function setDeviceReady(value) { _deviceReady = value; }
export function getDeviceReady() { return _deviceReady; }

export function setMessage(value) { _message = value; }
export function getMessage() { return _message; }

export function activateProcrastinationMode() { _procrastinationModeActive = true; }
export function deactivateProcrastinationMode() { _procrastinationModeActive = false; }
export function isProcrastinationModeActive() { return _procrastinationModeActive; }

// ---- Account storage ----
/** Stores account info using Capacitor Preferences. */
export async function setAccount(account) {
  await Capacitor.Plugins.Preferences.set({ key: "account", value: account });
}

/** Retrieves stored account info. */
export async function getAccount() {
  const { value } = await Capacitor.Plugins.Preferences.get({ key: "account" });
  return value;
}

// ---- Image loading ----
/**
 * Loads an image from a given path and returns it as a base64 string.
 * @param {string} fullPath - Full path to the image file.
 */
export async function loadImage(fullPath) {
  try {
    const fileResponse = await fetch(fullPath);
    if (!fileResponse.ok) throw new Error(`Failed to fetch ${fullPath}`);

    const blob = await fileResponse.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Failed to load image:", err);
    return null;
  }
}

/**
 * Loads a random image from a whitelist defined in meta.json.
 * @returns {Promise<string|null>} Base64 string of the selected image or null on failure.
 */
export async function loadRandomImage() {
  const path = "static/dora";
  const response = await fetch(`${path}/meta.json`);
  const names = await response.json();
  if (!names?.length) return null;

  const randomName = names[Math.floor(Math.random() * names.length)];
  return loadImage(`${path}/${randomName}`);
}