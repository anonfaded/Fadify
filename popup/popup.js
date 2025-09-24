const api = typeof browser !== "undefined" ? browser : chrome;

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".theme-card").forEach(card => {
    card.addEventListener("click", () => {
      const theme = card.getAttribute("data-theme");
      console.log("Theme selected:", theme);

      // Remove active class from all cards
      document.querySelectorAll(".theme-card").forEach(c => c.classList.remove("active"));
      // Add active class to clicked card
      card.classList.add("active");

      // Send message to content script
      api.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        api.tabs.sendMessage(tabs[0].id, {
          action: "applyTheme",
          theme: theme
        });
      });
    });
  });
});
