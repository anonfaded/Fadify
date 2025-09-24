// Make the class available globally for content script
class ChatGPTContainer {
  constructor() {
    this.name = "ChatGPT";
  }

  applyStyles(theme) {
    switch (theme) {
      case "dark":
        document.body.style.background = "#1a1a1a";
        document.body.style.color = "#f0f0f0";
        break;
      case "aqua":
        document.body.style.background = "#e0ffff";
        document.body.style.color = "#000";
        break;
      default:
        document.body.style.background = "";
        document.body.style.color = "";
    }
    console.log("Fadify: Applied theme:", theme);
  }
}

// Make it available globally
window.ChatGPTContainer = ChatGPTContainer;
