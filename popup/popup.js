const api = typeof browser !== "undefined" ? browser : chrome;

const queryActiveTab = () => new Promise((resolve, reject) => {
  try {
    const maybePromise = api.tabs.query(
      { active: true, currentWindow: true },
      tabs => {
        if (api.runtime?.lastError) {
          reject(api.runtime.lastError);
          return;
        }
        resolve(tabs);
      }
    );

    if (maybePromise && typeof maybePromise.then === "function") {
      maybePromise.then(resolve).catch(reject);
    }
  } catch (error) {
    reject(error);
  }
});

const setActiveThemeCard = (targetCard, allCards) => {
  allCards.forEach(card => {
    const isActive = card === targetCard;
    card.classList.toggle("active", isActive);
    card.setAttribute("aria-pressed", String(isActive));
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const shell = document.querySelector(".popup-shell");
  const themeCards = Array.from(document.querySelectorAll(".theme-card"));
  const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
  const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));

  const activateTab = tabName => {
    if (!shell) return;
    shell.dataset.activeTab = tabName;

    tabButtons.forEach(btn => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
      btn.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    tabPanels.forEach(panel => {
      const isActive = panel.dataset.tabPanel === tabName;
      panel.classList.toggle("active", isActive);
      panel.toggleAttribute("hidden", !isActive);
    });
  };

  const focusTabAt = index => {
    if (tabButtons.length === 0) return;
    const normalized = ((index % tabButtons.length) + tabButtons.length) % tabButtons.length;
    const target = tabButtons[normalized];
    target.focus();
    activateTab(target.dataset.tab);
    if (target.dataset.tab !== "chatgpt") {
      const focusTarget = document.querySelector(
        `.tab-panel[data-tab-panel="${target.dataset.tab}"] h2, .tab-panel[data-tab-panel="${target.dataset.tab}"] h3`
      );
      focusTarget?.focus?.({ preventScroll: true });
    }
  };

  activateTab(shell?.dataset.activeTab || "chatgpt");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabName = btn.dataset.tab;
      if (!tabName) return;

      activateTab(tabName);

      if (tabName !== "chatgpt") {
        const focusTarget = document.querySelector(
          `.tab-panel[data-tab-panel="${tabName}"] h2, .tab-panel[data-tab-panel="${tabName}"] h3`
        );
        focusTarget?.focus?.({ preventScroll: true });
      }
    });

    btn.addEventListener("keydown", event => {
      if (["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        const currentIndex = tabButtons.indexOf(btn);
        const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
        focusTabAt(currentIndex + delta);
      }
    });
  });

  themeCards.forEach(card => {
    card.addEventListener("click", () => {
      const theme = card.getAttribute("data-theme");
      if (!theme) return;

      console.log("Theme selected:", theme);
      setActiveThemeCard(card, themeCards);

      queryActiveTab()
        .then(([tab]) => {
          if (!tab || !tab.id) return;
          api.tabs.sendMessage(tab.id, { action: "applyTheme", theme });
        })
        .catch(error => {
          console.warn("Fadify: Unable to message tab", error);
        });
    });
  });
});
