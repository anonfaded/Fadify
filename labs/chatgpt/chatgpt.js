const api = typeof browser !== "undefined" ? browser : chrome;

// Initialize the ChatGPT container
const container = new ChatGPTContainer();
const preferences = window.FadifyPreferences;

const defaultTheme = preferences?.DEFAULTS?.labs?.chatgpt?.activeTheme || "default";

const applyTheme = theme => {
  const resolved = theme || defaultTheme;
  container.applyStyles(resolved);
};

if (preferences) {
  preferences
    .load()
    .then(settings => {
      applyTheme(settings?.labs?.chatgpt?.activeTheme);
    })
    .catch(error => {
      console.warn("FadifyPreferences: load failed in content script", error);
      applyTheme();
    });

  preferences.subscribe(nextSettings => {
    applyTheme(nextSettings?.labs?.chatgpt?.activeTheme);
  });
} else {
  applyTheme();
}

api.runtime.onMessage.addListener((message) => {
  if (message.action === "applyTheme") {
    applyTheme(message.theme);
  }
});

console.log("Fadify content script loaded");
