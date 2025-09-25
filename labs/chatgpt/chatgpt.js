const api = typeof browser !== "undefined" ? browser : chrome;

// Initialize the ChatGPT container
const container = new ChatGPTContainer();

api.runtime.onMessage.addListener((message) => {
  if (message.action === "applyTheme") {
    container.applyStyles(message.theme);
  }
});

console.log("Fadify content script loaded");
