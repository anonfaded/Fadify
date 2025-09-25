// Make the class available globally for content script
class ChatGPTContainer {
  constructor() {
    this.name = "ChatGPT";
  }

  applyStyles(theme) {
    // First remove any existing custom styles
    this.removeCustomStyles();
    
    switch (theme) {
      case "faded-night":
        // Apply pitch black theme with precise targeting
        this.applyFadedNightStyles();
        break;
      case "space":
        // Apply space tiled video background with same text tones
        this.applySpaceTheme();
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
        color: #d0d0d0 !important; /* stronger dim for readability */
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

      /* Softer text tones for readability on pure black */
      .text-token-text-primary,
      [class*="text-token-text-primary"] {
        color: #d0d0d0 !important; /* dimmed from pure white */
      }

      .text-token-text-secondary,
      [class*="text-token-text-secondary"] {
        color: #b5b5b5 !important;
      }

      .text-token-text-tertiary,
      [class*="text-token-text-tertiary"] {
        color: #8e8e8e !important;
      }

      /* Ensure chat message text uses the dimmed tone */
      [data-message-author-role],
      [data-message-author-role] p,
      [data-message-author-role] span,
      [data-message-author-role] div {
        color: #d0d0d0 !important;
      }

      /* Markdown content inside messages */
      .markdown,
      .markdown p,
      .markdown li,
      .markdown span,
      .markdown strong,
      .markdown em {
        color: #d0d0d0 !important;
      }

      /* Headings slightly brighter for hierarchy */
      .markdown h1, .markdown h2, .markdown h3,
      .markdown h4, .markdown h5, .markdown h6 {
        color: #e4e4e4 !important;
      }

      /* Placeholder text in editor */
      .ProseMirror .placeholder { color: #8a8a8a !important; }

      /* Page header (top bar) - make transparent */
      #page-header {
        background-color: transparent !important;
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
    console.log("Fadify: Removing all custom styles.");
    ['fadify-faded-night-styles', 'fadify-space-styles'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    const spaceBg = document.getElementById('fadify-space-bg');
    if (spaceBg) spaceBg.remove();

    // Remove any interval timers from our gradient remover script
    if (window.fadifyIntervalId) {
      clearInterval(window.fadifyIntervalId);
      window.fadifyIntervalId = null;
    }
    
    // Remove our script element if it exists
    const styleRemover = document.getElementById('fadify-space-style-remover');
    if (styleRemover) styleRemover.remove();

    if (this._onSpaceResize) {
      window.removeEventListener('resize', this._onSpaceResize);
      this._onSpaceResize = null;
    }
  }

  applySpaceTheme() {
    console.log("Fadify: Applying Space Theme with gradient and sidebar fixes.");
    // 1) Create styles (transparent app surfaces, same dimmed text)
    let styleEl = document.getElementById('fadify-space-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'fadify-space-styles';
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      /* Space Theme - tiled video background on body */
      body, html {
        background: transparent !important;
        color: #d0d0d0 !important;
      }

      /* Let main containers be transparent so the video shows */
      #__next, #thread, #page-header {
        background-color: transparent !important;
      }
      
      /* Use the same selectors as Faded Night theme but make them transparent */
      /* Bottom section - fully transparent to show space animation */
      .text-base.mx-auto[class*="thread-content-margin"] {
        background-color: transparent !important;
      }

      /* Bottom info/footer bar - fully transparent to show space animation */
      .text-token-text-secondary.relative.mt-auto {
        background-color: transparent !important;
        color: #ffffff !important;
      }

      /*
        Targets the primary container for the input and footer area.
        This rule makes the container transparent, resolving the background issue.
      */
      #thread-bottom-container {
        background-color: transparent !important;
        border-top-color: transparent !important; /* Also removes the faint top border */
      }

      /*
        Disables the ::after pseudo-element's gradient overlay.
        This is the final fix to remove the gray fade effect at the bottom.
      */
      #thread-bottom-container.content-fade::after {
        background: none !important;
      }

      /* Sidebar panel when opened (inside the slideover) */
      div[class*="w-[var(--sidebar-width)]"][class*="bg-token-bg-elevated-secondary"],
      aside[class*="w-[var(--sidebar-width)]"][class*="bg-token-bg-elevated-secondary"] {
        background-color: transparent !important;
        color: #ffffff !important;
      }

      /* Sidebar inner sections that use elevated bg token */
      #stage-slideover-sidebar .bg-token-bg-elevated-secondary,
      #stage-slideover-sidebar [class*="bg-token-bg-elevated-secondary"] {
        background-color: transparent !important;
      }

      /* Sidebar header bar */
      #sidebar-header,
      #stage-slideover-sidebar #sidebar-header {
        background-color: transparent !important;
        color: #ffffff !important;
      }

      /* Sidebar (slideover) and tiny rail */
      #stage-slideover-sidebar {
        background-color: transparent !important;
        border-color: transparent !important;
      }

      #stage-sidebar-tiny-bar {
        background-color: transparent !important;
      }

      /* Fallback by class in case IDs change but class remains */
      .group\/tiny-bar.flex.h-full[class*="sidebar-rail-width"] {
        background-color: transparent !important;
      }

      /* Make the input area background visible */
      div.shadow-short { 
        background-color: #1a1a1a !important; 
      }

      /* Text coloring from Faded Night */
      .text-token-text-primary,
      [class*="text-token-text-primary"] {
        color: #d0d0d0 !important;
      }

      .text-token-text-secondary,
      [class*="text-token-text-secondary"] {
        color: #b5b5b5 !important;
      }

      .text-token-text-tertiary,
      [class*="text-token-text-tertiary"] {
        color: #8e8e8e !important;
      }

      /* Ensure chat message text uses the dimmed tone */
      [data-message-author-role],
      [data-message-author-role] p,
      [data-message-author-role] span,
      [data-message-author-role] div {
        color: #d0d0d0 !important;
      }

      /* Turn off all gradients */
      *[style*="linear-gradient"] {
        background: none !important;
      }

      /* Overlay strip above the composer from inspector snapshot */
      .absolute.start-0.end-0.bottom-full.z-20 {
        pointer-events: none !important;
        height: 96px !important;
        min-height: 96px !important;
        background: none !important;
      }

      /* Keep input bar readable */
      div.shadow-short { background-color: #1a1a1a !important; }

      /* Page header (top bar) - keep transparent */
      #page-header {
        background-color: transparent !important;
        color: #ffffff !important;
      }


      /* Dimmed text tones like Faded Night */
      .text-token-text-primary, [class*="text-token-text-primary"] { color: #d0d0d0 !important; }
      .text-token-text-secondary, [class*="text-token-text-secondary"] { color: #b5b5b5 !important; }
      .text-token-text-tertiary, [class*="text-token-text-tertiary"] { color: #8e8e8e !important; }
      [data-message-author-role], [data-message-author-role] p, [data-message-author-role] span, [data-message-author-role] div { color: #d0d0d0 !important; }
      .markdown, .markdown p, .markdown li, .markdown span, .markdown strong, .markdown em { color: #d0d0d0 !important; }
      .markdown h1, .markdown h2, .markdown h3, .markdown h4, .markdown h5, .markdown h6 { color: #e4e4e4 !important; }
      .ProseMirror .placeholder { color: #8a8a8a !important; }
    `;

    // 2) Add tiled video background
    const api = typeof browser !== 'undefined' ? browser : chrome;
    const videoUrl = api.runtime.getURL('assets/space-background-webm.webm');

    const bg = document.createElement('div');
    bg.id = 'fadify-space-bg';
    Object.assign(bg.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '-1',
      pointerEvents: 'none',
      display: 'grid'
    });
    document.body.appendChild(bg);

    // (No fixed bottom gradient; handled via container gradient above)

    const buildTiles = (vw, vh) => {
      // Clear existing
      while (bg.firstChild) bg.removeChild(bg.firstChild);
      const cols = Math.max(1, Math.ceil(window.innerWidth / vw));
      const rows = Math.max(1, Math.ceil(window.innerHeight / vh));
      bg.style.gridTemplateColumns = `repeat(${cols}, ${vw}px)`;
      bg.style.gridTemplateRows = `repeat(${rows}, ${vh}px)`;

      const total = cols * rows;
      for (let i = 0; i < total; i++) {
        const v = document.createElement('video');
        v.src = videoUrl;
        v.autoplay = true;
        v.loop = true;
        v.muted = true;
        v.playsInLine = true;
        v.style.width = vw + 'px';
        v.style.height = vh + 'px';
        v.style.display = 'block';
        bg.appendChild(v);
      }
    };
    
    // We no longer need the complex script, just let the CSS above handle it

    // Probe video to get intrinsic size
    const probe = document.createElement('video');
    probe.src = videoUrl;
    probe.muted = true;
    probe.playsInline = true;
    probe.addEventListener('loadedmetadata', () => {
      const vw = Math.max(64, Math.floor(probe.videoWidth));
      const vh = Math.max(64, Math.floor(probe.videoHeight));
      buildTiles(vw, vh);
      this._onSpaceResize = () => buildTiles(vw, vh);
      window.addEventListener('resize', this._onSpaceResize);
    }, { once: true });
    // Start loading metadata
    probe.load();
  }
}

// Make it available globally
window.ChatGPTContainer = ChatGPTContainer;
