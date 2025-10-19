let _deviceReady = false;
let _message = null;

export function setDeviceReady(value) {
  _deviceReady = value;
}

export function setMessage(value) {
  _message = value;
}

export function getDeviceReady() {
  return _deviceReady;
}

export function getMessage() {
  return _message;
}

export async function setAccount(account) {
  await Capacitor.Plugins.Preferences.set({ key: "account", value: account });
}

export async function getAccount() {
  const { value } = await Capacitor.Plugins.Preferences.get({ key: "account" });
  return value;
}

export async function loadImage(fullPath) {
  try {
    const fileResponse = await fetch(fullPath);
    if (!fileResponse.ok) throw new Error(`Failed to fetch ${randomName}`);

    const blob = await fileResponse.blob();
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    return base64;
  } catch (err) {
    console.error("Failed to load image:", err);
    return null;
  }
}

// ---- Helper: Load random image ----
export async function loadRandomImage() {
  const path = "static/dora";
  const response = await fetch(`${path}/meta.json`);
  const names = await response.json();
  if (!names?.length) return null;

  const randomName = names[Math.floor(Math.random() * names.length)];

  return loadImage(`${path}/${randomName}`);
}
