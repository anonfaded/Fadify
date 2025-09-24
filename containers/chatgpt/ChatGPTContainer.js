// Make the class available globally for content script
class ChatGPTContainer {
  constructor() {
    this.name = "ChatGPT";
  }

  applyStyles(theme) {
    // First remove any existing custom styles
    this.removeCustomStyles();
    
    switch (theme) {
      case "dark":
        document.body.style.background = "#1a1a1a";
        document.body.style.color = "#f0f0f0";
        break;
      case "aqua":
        document.body.style.background = "#e0ffff";
        document.body.style.color = "#000";
        break;
      case "faded-night":
        // Apply pitch black theme with precise targeting
        this.applyFadedNightStyles();
        break;
      default:
        document.body.style.background = "";
        document.body.style.color = "";
    }
    console.log("Fadify: Applied theme:", theme);
  }

  applyFadedNightStyles() {
    // Create custom styles for Faded Night theme
    let styleElement = document.getElementById('fadify-faded-night-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'fadify-faded-night-styles';
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
      /* Faded Night Theme - Simple black background */
      body, html {
        background-color: #000000 !important;
        color: #ffffff !important;
      }
      
      /* Main container */
      #__next {
        background-color: #000000 !important;
      }
      
      /* Thread container */
      #thread {
        background-color: #000000 !important;
      }
      
      /* Input bar container - target the shadow-short class */
      div.shadow-short {
        background-color: #1a1a1a !important;
      }

      /* Page header (top bar) */
      #page-header {
        background-color: #000000 !important;
        color: #ffffff !important;
      }

      /* Sidebar panel when opened (inside the slideover) */
      div[class*="w-[var(--sidebar-width)]"][class*="bg-token-bg-elevated-secondary"],
      aside[class*="w-[var(--sidebar-width)]"][class*="bg-token-bg-elevated-secondary"] {
        background-color: #000000 !important;
        color: #ffffff !important;
      }

      /* Sidebar inner sections that use elevated bg token */
      #stage-slideover-sidebar .bg-token-bg-elevated-secondary,
      #stage-slideover-sidebar [class*="bg-token-bg-elevated-secondary"] {
        background-color: #000000 !important;
      }

      /* Sidebar header bar */
      #sidebar-header,
      #stage-slideover-sidebar #sidebar-header {
        background-color: #000000 !important;
        color: #ffffff !important;
      }

      /* Sidebar primary text tokens */
      #stage-slideover-sidebar .text-token-text-primary,
      #stage-slideover-sidebar [class*="text-token-text-primary"] {
        color: #ffffff !important;
      }

      /* Wrapper around the input bar (with thread-content-margin classes) */
      .text-base.mx-auto[class*="thread-content-margin"] {
        background-color: #000000 !important;
      }

      /* Bottom info/footer bar */
      .text-token-text-secondary.relative.mt-auto {
        background-color: #000000 !important;
        color: #ffffff !important;
      }

      /* Sidebar (slideover) and tiny rail */
      #stage-slideover-sidebar {
        background-color: #000000 !important;
        border-color: #000000 !important;
      }

      #stage-sidebar-tiny-bar {
        background-color: #000000 !important;
      }

      /* Fallback by class in case IDs change but class remains */
      .group\\/tiny-bar.flex.h-full[class*="sidebar-rail-width"] {
        background-color: #000000 !important;
      }
    `;
  }

  removeCustomStyles() {
    const styleElement = document.getElementById('fadify-faded-night-styles');
    if (styleElement) {
      styleElement.remove();
    }
  }
}

// Make it available globally
window.ChatGPTContainer = ChatGPTContainer;
