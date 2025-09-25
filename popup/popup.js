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
  const preferences = window.FadifyPreferences;
  const versionLabel = document.querySelector('[data-extension-version]');

  const tooltip = document.createElement("div");
  tooltip.className = "tab-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.dataset.visible = "false";
  document.body.appendChild(tooltip);

  const tooltipOffset = 18;

  const getTooltipText = target =>
    target?.dataset?.tooltip || target?.getAttribute?.("aria-label") || target?.title || target?.textContent?.trim();

  let tooltipAnchor = null;

  const setTooltipVisible = visible => {
    tooltip.dataset.visible = visible ? "true" : "false";
    if (!visible) {
      tooltipAnchor = null;
    }
  };

  const placeTooltipForElement = element => {
    if (!element) return;
    const elementRect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const anchorMidY = elementRect.top + elementRect.height / 2;
    const minPadding = 8;

    let left = elementRect.left - tooltipRect.width - tooltipOffset;
    if (left < minPadding) {
      left = elementRect.right + tooltipOffset;
    }

    let top = anchorMidY - tooltipRect.height / 2;
    const maxTop = window.innerHeight - tooltipRect.height - minPadding;
    if (top < minPadding) {
      top = minPadding;
    } else if (top > maxTop) {
      top = maxTop;
    }

    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.top = `${Math.round(top)}px`;
  };

  const showTooltipForElement = (element, text) => {
    if (!text || !element) return;
    tooltipAnchor = element;
    tooltip.textContent = text;
    setTooltipVisible(true);
    requestAnimationFrame(() => placeTooltipForElement(element));
  };

  const hideTooltip = () => {
    setTooltipVisible(false);
  };

  const repositionTooltip = () => {
    if (tooltip.dataset.visible === "true" && tooltipAnchor) {
      placeTooltipForElement(tooltipAnchor);
    }
  };

  window.addEventListener("resize", repositionTooltip);
  window.addEventListener("scroll", repositionTooltip, true);

  if (versionLabel) {
    try {
      const manifest = api.runtime?.getManifest?.();
      if (manifest?.version) {
        versionLabel.textContent = `v${manifest.version}`;
      } else {
        versionLabel.textContent = "v1.0";
      }
    } catch (error) {
      console.warn("Fadify: Unable to read manifest version", error);
      versionLabel.textContent = "v1.0";
    }
  }

  const findCardByTheme = theme => themeCards.find(card => card.getAttribute("data-theme") === theme);

  const applyThemeSelection = theme => {
    if (!themeCards.length) return null;
    const targetCard = findCardByTheme(theme) || themeCards[0];
    if (targetCard) {
      setActiveThemeCard(targetCard, themeCards);
      return targetCard.getAttribute("data-theme");
    }
    return null;
  };

  const sendThemeToActiveTab = theme => {
    if (!theme) return;
    queryActiveTab()
      .then(([tab]) => {
        if (!tab || !tab.id) return;
        api.tabs.sendMessage(tab.id, { action: "applyTheme", theme });
      })
      .catch(error => {
        console.warn("Fadify: Unable to message tab", error);
      });
  };

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

  if (preferences) {
    preferences
      .load()
      .then(settings => {
        const storedTheme = settings?.labs?.chatgpt?.activeTheme;
        const resolvedTheme = applyThemeSelection(storedTheme);
        if (resolvedTheme) {
          sendThemeToActiveTab(resolvedTheme);
        }
      })
      .catch(error => {
        console.warn("FadifyPreferences: load failed", error);
        const resolvedTheme = applyThemeSelection();
        if (resolvedTheme) {
          sendThemeToActiveTab(resolvedTheme);
        }
      });

    preferences.subscribe(nextSettings => {
      const storedTheme = nextSettings?.labs?.chatgpt?.activeTheme;
      if (!storedTheme) return;
      const activeCard = findCardByTheme(storedTheme);
      if (activeCard && !activeCard.classList.contains("active")) {
        setActiveThemeCard(activeCard, themeCards);
        sendThemeToActiveTab(storedTheme);
      }
    });
  } else {
    const resolvedTheme = applyThemeSelection();
    if (resolvedTheme) {
      sendThemeToActiveTab(resolvedTheme);
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener("mouseenter", event => {
      const label = getTooltipText(btn);
      if (!label) return;
      showTooltipForElement(btn, label);
    });

    btn.addEventListener("mouseleave", () => {
      hideTooltip();
    });

    btn.addEventListener("focus", () => {
      const label = getTooltipText(btn);
      if (!label) return;
      showTooltipForElement(btn, label);
    });

    btn.addEventListener("blur", () => {
      hideTooltip();
    });

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

      if (preferences) {
        preferences
          .update(settings => {
            settings.labs = settings.labs || {};
            settings.labs.chatgpt = settings.labs.chatgpt || {};
            settings.labs.chatgpt.activeTheme = theme;
            return settings;
          })
          .catch(error => {
            console.warn("FadifyPreferences: update failed", error);
          });
      }

      sendThemeToActiveTab(theme);
    });
  });
});
