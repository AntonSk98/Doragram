// ------------------------
// data-visualcompletion="ignore-dynamic" -> there add custom page :)
// ------------------------
function removeExplore() {
  const exploreSvgs = document.querySelectorAll('svg[aria-label="Explore"]');
  exploreSvgs.forEach((svg) => {
    // Find closest ancestor <span> with aria-describedby
    const span = svg.closest("span[aria-describedby]");
    if (span) {
      // The span is wrapped in a <div>, hide that div
      const outerDiv = span.closest("div");
      if (outerDiv) {
        outerDiv.remove();
      }
    }
  });
}

function removeUseTheAppSuggestions() {
  const closeButtons = document.querySelectorAll('svg[aria-label="Close"]');
  closeButtons.forEach((closeButton) => {
    const divContainer = closeButton.closest(
      'div[data-visualcompletion="ignore"]'
    );
    if (divContainer) {
      divContainer.remove();
      return;
    }
  });
}

function removeReels() {
  const exploreSvgs = document.querySelectorAll('svg[aria-label="Reels"]');
  exploreSvgs.forEach((svg) => {
    // Find closest ancestor <span> with aria-describedby
    const span = svg.closest("span[aria-describedby]");
    if (span) {
      // The span is wrapped in a <div>, hide that div
      const outerDiv = span.closest("div");
      if (outerDiv) {
        outerDiv.remove();
      }
    }
  });
}

function disableMainPageWithUpdates() {
  const article = document.querySelector("article");
  if (!article) {
    return;
  }
  const conttainer = article.closest("div");
  if (conttainer) {
    conttainer.remove();
  }

  const loadingSvg = document.querySelector('svg[aria-label*="Loading"]');
  if (!loadingSvg) {
    return;
  }

  const divLoadingState = loadingSvg.closest(
    'div[data-visualcompletion="loading-state"]'
  );
  if (!divLoadingState) {
    return;
  }

  const divLoadingStateContainer = divLoadingState.closest("div");
  if (!divLoadingStateContainer) {
    return;
  }

  divLoadingStateContainer.remove();
}

function removeStories() {
  const storyTrays = document.querySelectorAll(
    'div[data-pagelet="story_tray"]'
  );
  storyTrays.forEach((div) => div.remove());
}

function insertCustomSettings() {
  const titleSvg = document.querySelector('svg[aria-label*="Facebook"]');
  if (!titleSvg) {
    return;
  }
  const closestLink = titleSvg.closest("a");
  if (!closestLink) {
    return;
  }

  const parentDiv = closestLink.parentElement;
  if (!parentDiv) {
    return;
  }

  // Check if the custom-settings div already exists
  if (closestLink.querySelector("div[custom-settings]")) {
    return; // Do nothing if it already exists
  }

  // Create and insert the div with custom-settings attribute
  const div = document.createElement("div");
  div.setAttribute("custom-settings", "");
  div.textContent = "Hello World";

  // Append the new div to the parentDiv
  parentDiv.appendChild(div);
}

function disableHeader() {
  const header = document.querySelector("header");
  if (!header) {
    return;
  }

  const h1 = header.querySelector("h1");
  if (!h1) {
    return;
  }

  h1.remove();
}

function blockInstagramReels() {
  // Override XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    if ((url.includes("graphql/query") || url.includes("/api/graphql"))) {
      alert('hello!')
      return;
    }
    return originalXHROpen.apply(this, arguments);
  };
}

// ------------------------
// Device ready & InAppBrowser
// ------------------------
document.addEventListener("deviceready", () => {
  const ref = cordova.InAppBrowser.open(
    "https://www.instagram.com/accounts/login/",
    "_blank",
    "location=no,toolbar=no,hidden=no"
  );

  // On every page load
  ref.addEventListener("loadstop", () => {
    // Convert functions to string and inject
    const code = `
      (${checkMainPage.toString()})();
      (${blockInstagramReels.toString()})();
      (${removeExplore.toString()})();
      (${disableMainPageWithUpdates.toString()})();
      (${removeReels.toString()})();
      (${removeStories.toString()})();
      (${removeUseTheAppSuggestions.toString()})();
      (${insertCustomSettings.toString()})();
      (${disableHeader.toString()})();
      
      
      

      const observer = new MutationObserver(() => {
        (${checkMainPage.toString()})();
        (${removeExplore.toString()})();
        (${disableMainPageWithUpdates.toString()})();
        (${removeReels.toString()})();
        (${removeStories.toString()})();
        (${removeUseTheAppSuggestions.toString()})();
        (${insertCustomSettings.toString()})();
        (${disableHeader.toString()})();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    `;

    ref.executeScript({ code });
  });
});
