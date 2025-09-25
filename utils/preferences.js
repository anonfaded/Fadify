(function () {
  const api = typeof browser !== "undefined" ? browser : chrome;
  const STORAGE_AREA = api?.storage?.local;
  const STORAGE_EVENTS = api?.storage?.onChanged;
  const STORAGE_KEY = "fadifySettings";

  const DEFAULT_SETTINGS = Object.freeze({
    version: 1,
    labs: {
      chatgpt: {
        activeTheme: "default"
      }
    }
  });

  const clone = value => JSON.parse(JSON.stringify(value));

  const withDefaults = raw => {
    const defaults = clone(DEFAULT_SETTINGS);
    if (!raw || typeof raw !== "object") {
      return defaults;
    }

    const normalizedLabs = {
      ...defaults.labs,
      ...(typeof raw.labs === "object" && raw.labs !== null ? raw.labs : {}),
      chatgpt: {
        ...defaults.labs.chatgpt,
        ...(raw.labs && typeof raw.labs.chatgpt === "object" ? raw.labs.chatgpt : {})
      }
    };

    return {
      ...defaults,
      ...raw,
      labs: normalizedLabs
    };
  };

  const ensureStorage = () => {
    if (!STORAGE_AREA) {
      throw new Error("FadifyPreferences: storage permission missing or unavailable");
    }
  };

  const invokeStorage = (method, payload) => {
    ensureStorage();
    return new Promise((resolve, reject) => {
      let settled = false;
      const resolveOnce = value => {
        if (settled) return;
        settled = true;
        resolve(value);
      };
      const rejectOnce = error => {
        if (settled) return;
        settled = true;
        reject(error);
      };

      const callback = result => {
        const error = api.runtime?.lastError;
        if (error) {
          rejectOnce(error);
          return;
        }
        resolveOnce(result);
      };

      try {
        const maybePromise = payload !== undefined
          ? STORAGE_AREA[method](payload, callback)
          : STORAGE_AREA[method](callback);

        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise.then(resolveOnce).catch(rejectOnce);
        }
      } catch (error) {
        rejectOnce(error);
      }
    });
  };

  const storageGet = keys => invokeStorage("get", keys);
  const storageSet = items => invokeStorage("set", items);

  const subscribers = new Set();

  const notify = (next, prev) => {
    subscribers.forEach(listener => {
      try {
        listener(next, prev);
      } catch (error) {
        console.error("FadifyPreferences: subscriber error", error);
      }
    });
  };

  if (STORAGE_EVENTS && typeof STORAGE_EVENTS.addListener === "function") {
    STORAGE_EVENTS.addListener((changes, areaName) => {
      if (areaName !== "local" || !changes[STORAGE_KEY]) {
        return;
      }
      const { newValue, oldValue } = changes[STORAGE_KEY];
      const next = newValue ? withDefaults(newValue) : clone(DEFAULT_SETTINGS);
      const prev = oldValue ? withDefaults(oldValue) : null;
      notify(next, prev);
    });
  }

  const Preferences = {
    STORAGE_KEY,
    DEFAULTS: clone(DEFAULT_SETTINGS),
    async load() {
      const result = await storageGet({ [STORAGE_KEY]: DEFAULT_SETTINGS });
      return withDefaults(result[STORAGE_KEY]);
    },
    async save(settings) {
      const sanitized = withDefaults(settings);
      await storageSet({ [STORAGE_KEY]: sanitized });
      return sanitized;
    },
    async update(mutator) {
      const current = await this.load();
      const draft = clone(current);
      const maybeNext = typeof mutator === "function" ? mutator(draft) || draft : draft;
      const next = withDefaults(maybeNext);
      await storageSet({ [STORAGE_KEY]: next });
      return next;
    },
    serialize(settings) {
      const target = settings ? withDefaults(settings) : DEFAULT_SETTINGS;
      return JSON.stringify({ settings: target }, null, 2);
    },
    parse(serialized) {
      if (!serialized) {
        return clone(DEFAULT_SETTINGS);
      }
      try {
        const parsed = JSON.parse(serialized);
        const payload = parsed && typeof parsed === "object" && "settings" in parsed ? parsed.settings : parsed;
        return withDefaults(payload);
      } catch (error) {
        throw new Error("FadifyPreferences: Invalid settings payload");
      }
    },
    subscribe(listener) {
      if (typeof listener !== "function") {
        throw new TypeError("FadifyPreferences.subscribe requires a function");
      }
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    }
  };

  if (typeof window !== "undefined") {
    window.FadifyPreferences = Preferences;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Preferences;
  }
})();
