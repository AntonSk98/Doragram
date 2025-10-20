import {
  getDeviceReady,
  getMessage,
  getAccount,
  activateProcrastinationMode,
  isProcrastinationModeActive,
  deactivateProcrastinationMode,
} from "./common.js";

function tweakInstagram() {
  // if (localStorage.getItem("procrastinationMode")) {
  //   return;
  // }
  // ---- Variables start ----
  const Pages = Object.freeze({
    MAIN: Symbol("/"),
    EXPLORE: Symbol("/explore"),
    REELS: Symbol("/reels"),
    INBOX: Symbol("/direct"),
    EDIT_ACCOUNT: Symbol("/accounts/edit"),
    MY_ACCOUNT: Symbol(window._account),
  });

  let procrastinationModeRequiredClicks = 20;

  let currentPage = Pages.MAIN;
  let lastPath;
  let randomImage = null;
  let backgroundImage = null;
  let imagesRendered = false;
  // ---- Variables end ----

  // ---- Navigation handling start ----
  function updateActivePage() {
    const path = location.pathname;
    if (path === lastPath) return;

    lastPath = path;
    imagesRendered = false;

    if (path === Pages.MAIN.description) currentPage = Pages.MAIN;
    else if (path.startsWith(Pages.EXPLORE.description))
      currentPage = Pages.EXPLORE;
    else if (path.startsWith(Pages.REELS.description))
      currentPage = Pages.REELS;
    else if (path.startsWith(Pages.INBOX.description))
      currentPage = Pages.INBOX;
    else if (path.startsWith(Pages.EDIT_ACCOUNT.description)) {
      currentPage = Pages.EDIT_ACCOUNT;
    } else if (path.includes(Pages.MY_ACCOUNT.description)) {
      currentPage = Pages.MY_ACCOUNT;
    }
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
    const background = event?.data?.background;
    if (imagesRendered) {
      return;
    }
    if (image && background) {
      randomImage = image;
      backgroundImage = background;
      imagesRendered = false;
    }
  });
  // ---- Message listener end ----

  // ---- DOM modification ----
  function replaceMainSectionWithDora() {
    if (
      currentPage === Pages.INBOX ||
      currentPage === Pages.EDIT_ACCOUNT ||
      currentPage === Pages.MY_ACCOUNT ||
      imagesRendered
    )
      return;

    const section = document.querySelector("section");
    if (!section) return;

    const parent = section.parentElement;
    section.style.display = "none";

    const waitForImage = setInterval(async () => {
      if (!randomImage || !backgroundImage) return;
      clearInterval(waitForImage);

      imagesRendered = true;

      // remove old wrapper if exists
      if (window.__doraBackgroundWrapper) {
        window.__doraBackgroundWrapper.remove();
        window.__doraBackgroundWrapper = null;
      }

      const wrapper = document.createElement("div");
      Object.assign(wrapper.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundImage: `url(${backgroundImage})`, // ✅ use base64 image as background
        backgroundSize: "cover", // ✅ fills screen
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        zIndex: "0",
      });

      const img = document.createElement("img");
      img.src = randomImage;
      Object.assign(img.style, {
        width: "100%",
        height: "100%",
        objectFit: "contain",
        transition: "opacity 700ms ease, transform 700ms ease",
        opacity: "0",
        transform: "translateY(8px)",
        display: "block",
        position: "relative",
        zIndex: "1",

        // 💫 Core trick: create soft fade at the edges
        maskImage:
          "radial-gradient(circle at center, black 70%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(circle at center, black 70%, transparent 100%)",

        // ✨ add gentle glow to visually blur edges
        filter: "drop-shadow(0 0 20px rgba(0,0,0,0.4))",
      });

      img.addEventListener("click", () => {
        activateProcrastinationModeIfReady();
      });

      wrapper.appendChild(img);
      (parent || document.body).appendChild(wrapper);
      window.__doraBackgroundWrapper = wrapper;
      section.remove();

      try {
        if (img.decode) await img.decode();
      } catch {}

      requestAnimationFrame(() => {
        setTimeout(() => {
          img.style.opacity = "1";
          img.style.transform = "translateY(0)";
        }, 20);
      });

      function adjustWrapperSize() {
        wrapper.style.width = `${window.innerWidth}px`;
        wrapper.style.height = `${window.innerHeight}px`;
      }

      adjustWrapperSize();
      window.addEventListener("resize", adjustWrapperSize);
      window.addEventListener("orientationchange", adjustWrapperSize);
    }, 300);
  }

  function activateProcrastinationModeIfReady() {
    procrastinationModeRequiredClicks = procrastinationModeRequiredClicks - 1;
    if (procrastinationModeRequiredClicks == 0) {
      var messageObj = { my_message: "hi" };
      var stringifiedMessageObj = JSON.stringify(messageObj);
      webkit.messageHandlers.cordova_iab.postMessage(stringifiedMessageObj);
      window.location.reload();
      return;
    }
    if (procrastinationModeRequiredClicks < 5) {
      alert(
        `You are ${procrastinationModeRequiredClicks} clicks away before entering procrastination mode!`
      );
    }
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

export async function loadInstagram() {
  // Wait until both deviceReady and message exist
  while (!getDeviceReady() || !getMessage()) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const account = await getAccount();

  const ref = cordova.InAppBrowser.open(
    "https://www.instagram.com/accounts/login/",
    "_blank",
    "location=no,toolbar=no,hidden=no,hardwareback=yes"
  );

  let procrastinationAlertShown = false;

  ref.addEventListener("loadstop", () => {
    if (isProcrastinationModeActive()) {
      const procrastinationModeLimitInMinutes = 5;
      if (!procrastinationAlertShown) {
        alert(
          `🧘 Welcome to Procrastination Mode!\n\nTo help you stay focused, Instagram will automatically close in ${procrastinationModeLimitInMinutes} minutes.`
        );
        setTimeout(() => {
          alert(
            "⏰ Time’s up! Procrastination Mode is ending now - stay focused out there!"
          );
          ref.close();
        }, procrastinationModeLimitInMinutes * 60 * 1000);
      }
      procrastinationAlertShown = true;
      return;
    }
    ref.executeScript({ code: `window._account = '${account}';` });
    const code = `(${tweakInstagram.toString()})();`;
    ref.executeScript({ code });

    ref.executeScript({
      code: `
        window.dispatchEvent(new MessageEvent('message', { data: ${getMessage()} }));
      `,
    });
    window.initialized = true;
  });

  ref.addEventListener("exit", () => deactivateProcrastinationMode());

  ref.addEventListener("message", (a) => activateProcrastinationMode());
}
