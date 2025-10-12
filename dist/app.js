function tweakInstagram() {
  // ---- Variables start ----
  const Pages = Object.freeze({
    MAIN: Symbol("/"),
    EXPLORE: Symbol("/explore"),
    REELS: Symbol("/reels"),
    INBOX: Symbol("/direct"),
  });

  let currentPage = Pages.MAIN;
  let lastPath;
  let backgroundImage = null;
  let imageRendered = false;
  // ---- Variables end ----

  // ---- Navigation handling start ----
  function updateActivePage() {
    const path = location.pathname;
    if (path === lastPath) return;

    lastPath = path;
    imageRendered = false;

    if (path === Pages.MAIN.description) currentPage = Pages.MAIN;
    else if (path.startsWith(Pages.EXPLORE.description))
      currentPage = Pages.EXPLORE;
    else if (path.startsWith(Pages.REELS.description))
      currentPage = Pages.REELS;
    else if (path.startsWith(Pages.INBOX.description))
      currentPage = Pages.INBOX;
  }

  // Patch history changes to detect navigation
  const _pushState = history.pushState;
  const _replaceState = history.replaceState;

  history.pushState = function (...args) {
    _pushState.apply(this, args);
    updateActivePage();
  };
  history.replaceState = function (...args) {
    _replaceState.apply(this, args);
    updateActivePage();
  };
  window.addEventListener("popstate", updateActivePage);
  // ---- Navigation handling end ----

  // ---- Message listener start ----
  window.addEventListener("message", (event) => {
    const image = event?.data?.image;
    if (!image) return;

    backgroundImage = image;
    imageRendered = false; // allow re-render if a new image arrives
    console.log("📸 Background image received");
  });
  // ---- Message listener end ----

  // ---- DOM modification ----
  function replaceMainSectionWithDora() {
    const isSettingsOpen = document.querySelector('svg[aria-label="Options"]');
    if (currentPage === Pages.INBOX || isSettingsOpen || imageRendered) return;

    const section = document.querySelector("section");
    if (!section) return;

    const parent = section.parentElement;
    section.remove();

    const waitForImage = setInterval(async () => {
      if (!backgroundImage) return;
      clearInterval(waitForImage);

      imageRendered = true;

      // remove old wrapper if exists
      if (window.__doraBackgroundWrapper) {
        window.__doraBackgroundWrapper.remove();
        window.__doraBackgroundWrapper = null;
      }

      const wrapper = document.createElement("div");
      Object.assign(wrapper.style, {
        position: "fixed", // ✅ fills entire screen
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      });

      const img = document.createElement("img");
      img.src = backgroundImage;

      Object.assign(img.style, {
        width: "100%",
        height: "100%",
        objectFit: "contain", // ✅ responsive & cropped
        transition: "opacity 700ms ease, transform 700ms ease",
        opacity: "0",
        transform: "translateY(8px)",
        display: "block",
      });

      wrapper.appendChild(img);
      (parent || document.body).appendChild(wrapper);
      window.__doraBackgroundWrapper = wrapper;

      // Wait for image decoding before fading in
      try {
        if (img.decode) await img.decode();
      } catch {}

      requestAnimationFrame(() => {
        setTimeout(() => {
          img.style.opacity = "1";
          img.style.transform = "translateY(0)";
        }, 20);
      });

      // ✅ Handle orientation and resizing
      function adjustWrapperSize() {
        wrapper.style.width = `${window.innerWidth}px`;
        wrapper.style.height = `${window.innerHeight}px`;
      }

      adjustWrapperSize();
      window.addEventListener("resize", adjustWrapperSize);
      window.addEventListener("orientationchange", adjustWrapperSize);
    }, 300);
  }

  // ---- UI cleanup start ----
  function removeAppInstallPopups() {
    document.querySelectorAll('svg[aria-label="Close"]').forEach((btn) => {
      const container = btn.closest('div[data-visualcompletion="ignore"]');
      if (container) container.remove();
    });
  }
  // ---- UI cleanup end ----

  // ---- DOM observer start ----
  const observer = new MutationObserver(() => {
    replaceMainSectionWithDora();
    removeAppInstallPopups();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  // ---- DOM observer end ----
}

// ---- Helper: Load random image ----
async function loadRandomImage() {
  const path = "static/dora";
  try {
    const response = await fetch(`${path}/meta.json`);
    const names = await response.json();
    if (!names?.length) return { image: null };

    const randomName = names[Math.floor(Math.random() * names.length)];
    const fileResponse = await fetch(`${path}/${randomName}`);
    if (!fileResponse.ok) throw new Error(`Failed to fetch ${randomName}`);

    const blob = await fileResponse.blob();
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    return { image: base64 };
  } catch (err) {
    console.error("Failed to load image:", err);
    return { image: null };
  }
}

// ---- Cordova integration ----
document.addEventListener("deviceready", () => {
  const ref = cordova.InAppBrowser.open(
    "https://www.instagram.com/accounts/login/",
    "_blank",
    "location=no,toolbar=no,hidden=no"
  );

  ref.addEventListener("loadstop", async () => {
    if (window.initialized) return;

    const code = `(${tweakInstagram.toString()})();`;
    ref.executeScript({ code });

    const imageData = await loadRandomImage();
    const messageJson = JSON.stringify(imageData);

    ref.executeScript({
      code: `
        window.dispatchEvent(new MessageEvent('message', { data: ${messageJson} }));
      `,
    });

    window.initialized = true;
  });

  ref.addEventListener("exit", () => {
    console.log("📴 Instagram closed, exiting app...");
    if (Capacitor?.Plugins?.App?.exitApp) {
      Capacitor.Plugins.App.exitApp(); // ✅ closes Android app
    } else {
      alert(JSON.stringify(Capacitor.Plugins));
    }
  });
});
