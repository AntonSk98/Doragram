import {
  getDeviceReady,
  getMessage,
  getAccount,
  activateProcrastinationMode,
  isProcrastinationModeActive,
  deactivateProcrastinationMode,
} from "./common.js";

/**
 * Main function injected into the Instagram Desktop experience.
 * Its purpose is to tweak the UI and interaction flow to remove or disable distracting things like Reels and other engagement traps.
 * ******
 * Because this function runs inside the InAppBrowser after being injected, all state variables, constants, and helper functions are self-contained within this scope to avoid cross-environment issues.
 * ******
 */
function tweakInstagram() {
  // Defines pages a user could navigate to containing Instagram Paths.
  const Pages = Object.freeze({
    MAIN: Symbol("/"),
    EXPLORE: Symbol("/explore"),
    REELS: Symbol("/reels"),
    INBOX: Symbol("/direct"),
    EDIT_ACCOUNT: Symbol("/accounts/edit"),
    MY_ACCOUNT: Symbol(window._account),
  });

  let currentPage = Pages.MAIN;
  let lastPath;

  let procrastinationModeRequiredClicks = 20;

  let randomImage = null;
  let backgroundImage = null;
  let imagesRendered = false;

  /**
   * Updates the current page state based on the URL path.
   *
   * The variable lastPath prevents redundant updates when multiple history changes happen in quick succession.
   */
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
  /**
   * Patch the browser history methods to detect programmatic navigation.
   *
   * Instagram dynamically changes pages via pushState/replaceState,
   * so we intercept these calls to run updateActivePage() whenever
   * the URL changes.
   *
   * Patch the browser history methods to detect programmatic navigation.
   *
   * Instagram dynamically changes pages via pushState/replaceState,
   * so we intercept these calls to run updateActivePage() whenever
   * the URL changes.
   */
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
  // Also detect back/forward navigation
  window.addEventListener("popstate", updateActivePage);

  /**
   * Listens for messages from the main application inside the InAppBrowser.
   *
   * This listener runs at the very start of the application and is responsible
   * for receiving the main image and background image that will later be used
   * in {@link replaceMainSectionWithDora}.
   *
   * Once the images are received, they are stored in `randomImage` and
   * `backgroundImage` for later injection. The `imagesRendered` flag
   * ensures that the images are only applied once per page load.
   */
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

  // ---- DOM Modifications Starts ----
  /**
   * Determines if the main Instagram DOM should remain untouched.
   * Returns true for pages where we don't want to inject Dora (Inbox, account pages)
   * or if images are already rendered.
   */
  function shallKeepDomUntouched() {
    return (
      currentPage === Pages.INBOX ||
      currentPage === Pages.EDIT_ACCOUNT ||
      currentPage === Pages.MY_ACCOUNT ||
      imagesRendered
    );
  }

  /**
   * Creates and returns a styled wrapper div with the background image applied.
   */
  function createWrapper(background) {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      backgroundImage: `url(${background})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      zIndex: "0",
    });
    return wrapper;
  }

  /**
   * Creates and returns the main Dora image element with styles and click handler to activate procrastination mode.
   */
  function createDoraImage(src) {
    const img = document.createElement("img");
    img.src = src;
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
      maskImage:
        "radial-gradient(circle at center, black 70%, transparent 100%)",
      WebkitMaskImage:
        "radial-gradient(circle at center, black 70%, transparent 100%)",
      filter: "drop-shadow(0 0 20px rgba(0,0,0,0.4))",
    });
    img.addEventListener("click", () => activateProcrastinationModeIfReady());
    return img;
  }

  /**
   * Resolves once both randomImage and backgroundImage are available.
   */
  function waitForImages() {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (randomImage && backgroundImage) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  }

  /**
   * Replaces the main Instagram feed section with the Dora experience.
   */
  async function replaceMainSectionWithDora() {
    if (shallKeepDomUntouched()) return;

    const section = document.querySelector("section");
    if (!section) return;

    const parent = section.parentElement;
    section.style.display = "none";

    // Wait until both images are available
    await waitForImages();

    imagesRendered = true;

    // Remove previous wrapper if it exists
    if (window.__doraBackgroundWrapper) {
      window.__doraBackgroundWrapper.remove();
      window.__doraBackgroundWrapper = null;
    }

    const wrapper = createWrapper(backgroundImage);
    const img = createDoraImage(randomImage);

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

    const adjustWrapperSize = () => {
      wrapper.style.width = `${window.innerWidth}px`;
      wrapper.style.height = `${window.innerHeight}px`;
    };

    adjustWrapperSize();
    window.addEventListener("resize", adjustWrapperSize);
    window.addEventListener("orientationchange", adjustWrapperSize);
  }

  // ---- DOM Modifications ENDS ----

  /**
   * On every click on Dora image checks if the procrastination mode shall be activated.
   * If it is the case it sends out an event to the main application.
   * @returns {void}
   */
  function activateProcrastinationModeIfReady() {
    procrastinationModeRequiredClicks = procrastinationModeRequiredClicks - 1;
    if (procrastinationModeRequiredClicks <= 0) {
      var procrastinationModeActivatedEvent = JSON.stringify({
        procrastinationMode: "activated",
      });
      webkit.messageHandlers.cordova_iab.postMessage(
        procrastinationModeActivatedEvent
      );
      window.location.reload();
      return;
    }
    if (
      procrastinationModeRequiredClicks <= 5 &&
      procrastinationModeRequiredClicks >= 0
    ) {
      alert(
        `You are ${procrastinationModeRequiredClicks} clicks away before entering procrastination mode!`
      );
    }
  }

  /**
   * Observes changes to the DOM and triggers updates to the UI.
   *
   * Uses a MutationObserver to watch the entire document body for
   * added or removed child elements. Whenever changes occur, it calls
   * {@link replaceMainSectionWithDora} to ensure the Dora overlay
   * remains applied and the Instagram feed stays hidden.
   */
  const observer = new MutationObserver(() => {
    replaceMainSectionWithDora();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Launches Instagram in an InAppBrowser with custom tweaks.
 *
 * - Waits for device readiness and initial message payload.
 * - Injects account info and the tweakInstagram function.
 * - Handles Procrastination Mode with timed alerts and auto-close.
 */
export async function loadInstagram() {
  // Wait for device readiness and message payload
  await waitForDeviceAndMessage();

  const account = await getAccount();

  const ref = cordova.InAppBrowser.open(
    "https://www.instagram.com/accounts/login/",
    "_blank",
    "location=no,toolbar=no,hidden=no,hardwareback=yes"
  );

  ref.addEventListener("loadstop", () => {
    if (isProcrastinationModeActive()) {
      handleProcrastinationMode(ref);
    } else {
      injectScripts(ref, account);
    }
  });

  ref.addEventListener("exit", () => deactivateProcrastinationMode());
  ref.addEventListener("message", () => {
    resetProcrastinationAlertShown();
    activateProcrastinationMode();
  });
}

/**
 * Waits until the device is ready and the initial message exists.
 */
async function waitForDeviceAndMessage() {
  while (!getDeviceReady() || !getMessage()) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

/**
 * Handles Procrastination Mode alerts and automatic closure.
 */
function handleProcrastinationMode(ref) {
  if (!isProcrastinationModeActive()) return;

  const procrastinationModeLimitInMinutes = 5;

  if (!isProcrastinationAlertShown()) {
    alert(
      `🧘 Welcome to Procrastination Mode!\n\nTo help you stay focused, Instagram will automatically close in ${procrastinationModeLimitInMinutes} minutes.`
    );

    setTimeout(() => {
      if (!isProcrastinationModeActive()) {
        return;
      }

      alert(
        "⏰ Time’s up! Procrastination Mode is ending now - stay focused out there!"
      );
      ref.close();
    }, procrastinationModeLimitInMinutes * 60 * 1000);

    onProcrastinatinationAlertShown();
  }
}

/**
 * Injects necessary scripts and data into the Instagram InAppBrowser instance.
 */
function injectScripts(ref, account) {
  // Inject account info
  ref.executeScript({ code: `window._account = '${account}';` });

  // Inject tweakInstagram function
  const code = `(${tweakInstagram.toString()})();`;
  ref.executeScript({ code });

  // Dispatch initial message
  ref.executeScript({
    code: `
      window.dispatchEvent(new MessageEvent('message', { data: ${getMessage()} }));
    `,
  });

  window.initialized = true;
}

function resetProcrastinationAlertShown() {
  localStorage.removeItem("procrastinationAlertShown");
}

function isProcrastinationAlertShown() {
  return localStorage.getItem("procrastinationAlertShown");
}

function onProcrastinatinationAlertShown() {
  localStorage.setItem("procrastinationAlertShown", true);
}
