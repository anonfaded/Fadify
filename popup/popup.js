const api = typeof browser !== "undefined" ? browser : chrome;

const logUnsupported = (...args) => {
  console.debug("Fadify UnsupportedGuard:", ...args);
};

const isHttpUrl = url => typeof url === "string" && /^https?:/i.test(url);

const pickBestTabCandidate = tabs => {
  if (!Array.isArray(tabs) || tabs.length === 0) {
    return null;
  }

  const httpTabs = tabs.filter(tab => isHttpUrl(tab?.url));
  if (httpTabs.length) {
    return (
      httpTabs.find(tab => tab?.active) ||
      httpTabs.find(tab => tab?.highlighted) ||
      httpTabs[0]
    );
  }

  return (
    tabs.find(tab => tab?.active) ||
    tabs.find(tab => tab?.highlighted) ||
    tabs[0] ||
    null
  );
};

const tabsQuery = options => new Promise((resolve, reject) => {
  try {
    const maybePromise = api.tabs.query(options, tabs => {
      if (api.runtime?.lastError) {
        reject(api.runtime.lastError);
        return;
      }
      resolve(Array.isArray(tabs) ? tabs : []);
    });

    if (maybePromise && typeof maybePromise.then === "function") {
      maybePromise.then(resolve).catch(reject);
    }
  } catch (error) {
    reject(error);
  }
});

const windowsGetLastFocused = options => new Promise((resolve, reject) => {
  try {
    const maybePromise = api.windows?.getLastFocused?.(options, window => {
      if (api.runtime?.lastError) {
        reject(api.runtime.lastError);
        return;
      }
      resolve(window || null);
    });

    if (maybePromise && typeof maybePromise.then === "function") {
      maybePromise.then(resolve).catch(reject);
    }
  } catch (error) {
    reject(error);
  }
});

const queryActiveTab = async () => {
  try {
    const focusedWindow = await windowsGetLastFocused({ populate: true, windowTypes: ["normal"] }).catch(error => {
      logUnsupported("windows.getLastFocused failed", error);
      return null;
    });

    if (focusedWindow?.tabs?.length) {
      const tabs = focusedWindow.tabs;
      const activeHttp = tabs.find(tab => tab?.active && isHttpUrl(tab?.url));
      if (activeHttp) {
        logUnsupported("Active tab from getLastFocused (active)", activeHttp.url);
        return activeHttp;
      }

      const highlightedHttp = tabs.find(tab => tab?.highlighted && isHttpUrl(tab?.url));
      if (highlightedHttp) {
        logUnsupported("Active tab from getLastFocused (highlighted)", highlightedHttp.url);
        return highlightedHttp;
      }

      const fallbackHttp = pickBestTabCandidate(tabs);
      if (fallbackHttp) {
        logUnsupported("Fallback tab from getLastFocused", fallbackHttp.url ?? "<unknown>");
        return fallbackHttp;
      }
      logUnsupported("getLastFocused returned no viable tab");
    }

    const primaryTabs = await tabsQuery({ active: true, lastFocusedWindow: true, windowType: "normal" }).catch(error => {
      logUnsupported("Primary tabs.query failed", error);
      return [];
    });

    let candidate = pickBestTabCandidate(primaryTabs);
    if (candidate) {
      logUnsupported("Active tab from primary query", candidate.url);
      return candidate;
    }

    const fallbackTabs = await tabsQuery({ active: true, lastFocusedWindow: true }).catch(error => {
      logUnsupported("Fallback tabs.query failed", error);
      return [];
    });

    candidate = pickBestTabCandidate(fallbackTabs);
    if (candidate) {
      logUnsupported("Active tab from fallback query", candidate.url);
      return candidate;
    }

    const currentWindowTabs = await tabsQuery({ active: true, currentWindow: true, windowType: "normal" }).catch(error => {
      logUnsupported("Current-window tabs.query failed", error);
      return [];
    });

    candidate = pickBestTabCandidate(currentWindowTabs);
    if (candidate) {
      logUnsupported("Active tab from currentWindow query", candidate.url);
      return candidate;
    }

    logUnsupported("Unable to resolve active tab");
    return null;
  } catch (error) {
    logUnsupported("queryActiveTab threw", error);
    return null;
  }
};

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
  const appsBody = document.querySelector('[data-apps-body]');
  const appsEmpty = document.querySelector('[data-apps-empty]');
  const appGrids = new Map(
    Array.from(document.querySelectorAll('[data-app-grid]')).map(grid => [grid.dataset.appGrid, grid])
  );
  const unsupportedScreen = document.querySelector('[data-unsupported]');
  const unsupportedClose = document.querySelector('[data-unsupported-close]');
  let unsupportedDismissed = false;

  const tooltip = document.createElement("div");
  tooltip.className = "tab-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.dataset.visible = "false";
  document.body.appendChild(tooltip);

  const tooltipOffset = 18;

  const supportedHostnames = new Set([
    "chat.openai.com",
    "chatgpt.com",
    "www.chatgpt.com"
  ]);

  const isSupportedUrl = url => {
    if (!url) return false;
    try {
      const { hostname } = new URL(url);
      if (supportedHostnames.has(hostname)) {
        return true;
      }
      return hostname.endsWith(".chatgpt.com");
    } catch (error) {
      return false;
    }
  };

  let lastEvaluatedUrl = "";

  const toggleUnsupportedScreen = visible => {
    if (!unsupportedScreen) {
      logUnsupported("Overlay element missing");
      return;
    }
    const shouldShow = Boolean(visible && !unsupportedDismissed);
    
    if (shouldShow) {
      unsupportedScreen.removeAttribute('hidden');
      unsupportedScreen.style.display = 'flex';
    } else {
      unsupportedScreen.setAttribute('hidden', '');
      unsupportedScreen.style.display = 'none';
    }
    
    unsupportedScreen.dataset.visible = shouldShow ? "true" : "false";
    logUnsupported("Overlay visibility set to", shouldShow, {
      requested: visible,
      dismissed: unsupportedDismissed,
      actualDisplay: unsupportedScreen.style.display
    });
  };

  if (unsupportedClose) {
    logUnsupported("Dismiss control attached");
    unsupportedClose.addEventListener("click", event => {
      event.preventDefault();
      logUnsupported("Dismiss button clicked");
      unsupportedDismissed = true;
      toggleUnsupportedScreen(false);
    });
  } else {
    logUnsupported("Dismiss control missing");
  }

  const evaluateActiveTabSupport = () => {
    queryActiveTab()
      .then(tab => {
        const url = tab?.url ?? "";
        lastEvaluatedUrl = url;
        logUnsupported("Evaluating active tab", url || "<unknown>");

        if (!url) {
          logUnsupported("No URL detected; keeping overlay hidden");
          toggleUnsupportedScreen(false);
          return;
        }

        const supported = isSupportedUrl(url);
        logUnsupported("Is supported?", supported);

        if (supported) {
          unsupportedDismissed = false;
          toggleUnsupportedScreen(false);
        } else {
          toggleUnsupportedScreen(true);
        }
      })
      .catch(error => {
        console.warn("Fadify UnsupportedGuard: unable to evaluate active tab", error);
        toggleUnsupportedScreen(false);
      });
  };

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

  const appsDataUrl = api.runtime?.getURL ? api.runtime.getURL("data/apps.json") : "../data/apps.json";

  const createAppCard = app => {
    const isAvailable = Boolean(app?.url);
    const isComingSoon = app?.status === "coming-soon";
    const element = document.createElement(isAvailable ? "a" : "div");
    element.classList.add("app-card");
    if (isComingSoon) {
      element.classList.add("app-card--soon");
    }

    if (isAvailable) {
      element.href = app.url;
      element.target = "_blank";
      element.rel = "noopener noreferrer";
    }

    if (app?.preview) {
      element.style.setProperty("--app-preview", `url('${app.preview}')`);
    } else {
      element.style.setProperty("--app-preview", "linear-gradient(135deg, rgba(54, 60, 110, 0.6), rgba(20, 24, 52, 0.95))");
    }

    const overlay = document.createElement("div");
    overlay.className = "app-overlay";

    if (isComingSoon) {
      const statusBadge = document.createElement("span");
      statusBadge.className = "app-status";
      statusBadge.textContent = app?.statusNote || "Coming soon";
      overlay.appendChild(statusBadge);
    }

    const nameEl = document.createElement("span");
    nameEl.className = "app-name";
    nameEl.textContent = app?.name ?? "Untitled";

    if (isAvailable) {
      const linkIndicator = document.createElement("i");
      linkIndicator.className = "fa-solid fa-external-link-alt app-link-indicator";
      linkIndicator.setAttribute("aria-hidden", "true");
      nameEl.appendChild(linkIndicator);
    }

    overlay.appendChild(nameEl);

    if (app?.description) {
      const meta = document.createElement("span");
      meta.className = "app-meta";
      meta.textContent = app.description;
      overlay.appendChild(meta);
    }

    element.appendChild(overlay);
    return element;
  };

  const renderApps = data => {
    if (!appsBody || !appsEmpty) return;
    let totalRendered = 0;

    const categories = Array.isArray(data?.categories) ? data.categories : [];

    categories.forEach(category => {
      const grid = appGrids.get(category?.id);
      const categoryWrapper = category?.id
        ? document.querySelector(`[data-app-category="${category.id}"]`)
        : null;

      if (!grid || !categoryWrapper) {
        return;
      }

      grid.innerHTML = "";

      const apps = Array.isArray(category.apps) ? category.apps : [];

      if (apps.length === 0) {
        categoryWrapper.hidden = true;
        return;
      }

      categoryWrapper.hidden = false;

      apps.forEach(app => {
        const card = createAppCard(app);
        grid.appendChild(card);
        totalRendered += 1;
      });
    });

    const hasApps = totalRendered > 0;
    appsBody.hidden = !hasApps;
    appsEmpty.hidden = hasApps;
  };

  const loadApps = () => {
    if (!appsBody || !appsEmpty) {
      return;
    }

    fetch(appsDataUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(renderApps)
      .catch(error => {
        console.warn("Fadify: Unable to load apps catalog", error);
        appsBody.hidden = true;
        appsEmpty.hidden = false;
      });
  };

  loadApps();
  evaluateActiveTabSupport();

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
      .then(tab => {
        if (!tab || !tab.id) {
          logUnsupported("sendTheme: no active tab");
          return;
        }

        const url = tab.url || "";
        if (!isSupportedUrl(url)) {
          logUnsupported("sendTheme: skipping unsupported tab", url || "<unknown>");
          return;
        }

        try {
          const maybePromise = api.tabs.sendMessage(tab.id, { action: "applyTheme", theme });
          if (maybePromise && typeof maybePromise.then === "function") {
            maybePromise.catch(error => {
              console.warn("Fadify: Unable to message tab", error);
            });
          }
        } catch (error) {
          console.warn("Fadify: Unable to message tab", error);
        }
      })
      .catch(error => {
        console.warn("Fadify: Unable to resolve tab for theme message", error);
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
