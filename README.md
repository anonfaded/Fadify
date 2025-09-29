<div align="center">

<img src="assets/fadseclab/fadify-128.png" alt="Fadify Logo" width="120"/>

# 🌙 Fadify

[![Get the Add-On](https://img.shields.io/badge/Firefox-Get%20the%20Add--on-FF7139?style=for-the-badge&logo=firefox-browser&logoColor=white&labelColor=FF7139&color=FF4500)](https://addons.mozilla.org/en-US/firefox/addon/fadify/)
[![Version](https://img.shields.io/badge/version-1.0-4F46E5?style=for-the-badge&labelColor=6366F1&color=4F46E5)](https://github.com/anonfaded/Fadify)
[![License](https://img.shields.io/badge/license-GPL%20v3.0-10B981?style=for-the-badge&labelColor=059669&color=10B981)](LICENSE)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20Me-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white&labelColor=FF5E5B&color=FF5E5B)](https://ko-fi.com/D1D510FNSV)
[![Discord](https://img.shields.io/badge/Discord-Join%20Community-5865F2?style=for-the-badge&logo=discord&logoColor=white&labelColor=5865F2&color=5865F2)](https://discord.gg/kvAZvdkuuN)

**Fadify** is a powerful Firefox extension that transforms your web experience with **true dark aesthetics** and modern utilities. Works on both **desktop and mobile Firefox**.

</div>

### 📹 Demo



https://github.com/user-attachments/assets/3c03f0fd-dd89-4624-8693-1397fe675181

*See Fadify in action with live theme switching*


---

## ✨ Features

- 🎨 **Live Theme Switching** - Instant theme changes, no page reload required
- 🧪 **Lab-Based Architecture** - Modular design with dedicated folders per website  
- 💾 **Persistent Preferences** - Your theme choices are remembered across sessions
- 🌙 **Dark Themes** - Including **Faded Night** (pitch black) and **Space** themes
- 📱 **Mobile & Desktop** - Works seamlessly on Firefox for Android and desktop
- ⚡ **Lightweight & Fast** - Minimal impact on browsing performance

### Currently Supported Sites
- ✅ **ChatGPT** - Complete theming with desktop and mobile optimization
- 🔜 **More labs coming soon...**

---

## 📸 Screenshots

<div align="center">

### Main Extension Popup
<img src="assets/promo-screenshots/main.png" alt="Fadify main popup interface showing theme selection and supported sites" width="400"/>

*Clean, modern interface for quick theme switching*

### About & Credits
<img src="assets/promo-screenshots/about.png" alt="About section showing extension info and version details" width="400"/>

*Extension information and version details*

### More Apps Integration  
<img src="assets/promo-screenshots/more-apps.png" alt="More Apps section displaying FadSecLab's application ecosystem" width="400"/>

*Discover and access the full FadSecLab app ecosystem*

### Labs Overview
<img src="assets/promo-screenshots/more-labs.png" alt="Labs section showing supported websites and upcoming features" width="400"/>

*Track supported sites and upcoming lab additions*

### Development Roadmap
<img src="assets/promo-screenshots/roadmap.png" alt="Roadmap showing planned features and development timeline" width="400"/>

*Stay updated with planned features and development progress*

</div>

---

## 🏗️ Project Structure

```
Fadify/
├── manifest.json                 # Extension configuration
├── background.js                 # Background service worker  
├── popup/                        # Extension UI
│   ├── popup.html               # Main popup interface
│   ├── popup.js                 # UI logic and interactions
│   └── popup.css                # Responsive styling
├── utils/                        # Shared utilities
│   ├── preferences.js           # Settings management
│   └── Logger.js                # Debug logging
├── labs/                         # Website-specific modules
│   └── chatgpt/                 # ChatGPT lab
│       ├── ChatGPTContainer.js  # Theme definitions
│       ├── chatgpt.js           # Theme application logic
│       ├── chatgpt.css          # Theme styles
│       └── chatgpt.png          # Lab icon
├── data/                         # Extension data
│   └── apps.json                # FadSecLab apps catalog
└── assets/                       # Static resources
    ├── fadseclab/               # Icons and branding
    └── promo-screenshots/       # Documentation images
```

---

## 🚀 Installation

### From Firefox Add-ons (Recommended)
<div align="center">

[![Get the Add-On](https://img.shields.io/badge/Firefox-Get%20the%20Add--on-FF7139?style=for-the-badge&logo=firefox-browser&logoColor=white&labelColor=FF7139&color=FF4500)](https://addons.mozilla.org/en-US/firefox/addon/fadify/)

</div>

<details>
<summary><strong>📱 Manual Installation (Development)</strong></summary>

### Desktop Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/anonfaded/Fadify.git
   cd Fadify
   ```

2. **Load in Firefox:**
   - Open Firefox and navigate to `about:debugging`
   - Click **"This Firefox"** in the sidebar
   - Click **"Load Temporary Add-on"**
   - Select the `manifest.json` file

### Mobile Installation (Android)
1. **Prerequisites:**
   - Install [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/)
   - Enable USB debugging on your Android device
   - Install Firefox for Android

2. **Load on Android:**
   ```bash
   web-ext run -t firefox-android --adb-device DEVICE_ID_HERE --firefox-apk org.mozilla.fenix
   ```

3. **Start using:**
   - Visit ChatGPT or any supported site
   - Tap the Fadify icon in your toolbar
   - Choose your preferred theme

</details>

---

## 🎨 Available Themes

| Theme | Description |
|-------|-------------|
| **Default** | Clean, original site styling |
| **Faded Night** | Deep black theme for true dark mode enthusiasts |
| **Space** | Cosmic dark theme with animated stars |

---

## 🛠️ Development

### Requirements
- **Firefox 79+** (Developer Edition recommended)
- Basic knowledge of JavaScript, HTML, and CSS
- Git for version control

### Adding New Labs
1. Create a new folder in `/labs/[website-name]/`
2. Add your theme definitions, styles, and logic
3. Update the manifest.json content scripts
4. Test thoroughly across different screen sizes

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/new-lab`
3. **Follow the lab-based architecture** - keep website-specific code in dedicated folders
4. **Test on both desktop and mobile Firefox**
5. **Submit a pull request** with a clear description

### Contribution Guidelines
- Maintain the modular lab structure
- Follow existing code patterns and naming conventions
- Include screenshots for UI changes
- Test theme persistence and mobile responsiveness

---

## © Credits

### Assets & Resources
- **Animated Stars Background**: [Space Background Animation by Pavel Kalmykov](https://vimeo.com/309240312) on Vimeo
- **ChatGPT Icon**: [Chatgpt icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/chatgpt)
- **Beaker/Labs Icon**: [Beaker icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/beaker)

---

## 📜 License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by [FadSec Lab](https://github.com/anonfaded)**

[![GitHub](https://img.shields.io/badge/GitHub-anonfaded-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/anonfaded)
[![Extension](https://img.shields.io/badge/Firefox-Fadify-FF7139?style=flat-square&logo=firefox-browser&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/fadify/)

</div>
