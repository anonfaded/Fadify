# Fadify

Fadify is a Firefox extension that adds **live theme customization** to ChatGPT (and more sites soon).  
Each supported destination lives inside its own **lab** folder, keeping styles and scripts modular so adding the next website stays tidy.

---

## Features
- 🎨 Live theme switching (applies instantly, no page reload required)  
- 🧪 Lab-based architecture (each website has its own folder and logic)  
- 🔮 Currently supports **ChatGPT** (more labs planned)  
- ⚡ Simple popup UI to select themes  
- 🌙 **4 Themes Available**: Default, Dark, Aqua, and **Faded Night** (pitch black)  

---

## Project Structure
```
fadify/
│
├── manifest.json
├── background.js
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── labs/
│   └── chatgpt/
│       ├── ChatGPTContainer.js
│       ├── chatgpt.css
│       └── chatgpt.js
└── README.md
```

- `manifest.json` → Extension metadata and permissions  
- `background.js` → Background logic  
- `popup/` → Extension UI for selecting themes  
- `labs/chatgpt/` → All ChatGPT-specific styling and logic  

---

## Requirements
- **Firefox (Developer Edition recommended)**  
- Manifest V2 enabled (required for Firefox support)  
- Basic knowledge of JavaScript, HTML, and CSS  

---

## Installation (Firefox)
1. Clone this repo:
   ```bash
   git clone https://github.com/yourusername/fadify.git
   cd fadify
   ```
2. Open Firefox and visit:
   ```
   about:debugging#/runtime/this-firefox
   ```
3. Click **Load Temporary Add-on** and select `manifest.json`.  
4. Open ChatGPT, click the Fadify icon, and pick a theme.  

---

## Future Plans
- Add more websites with their own labs (`/labs/xyz/`)  
- More advanced theme options (fonts, layouts, animations)  
- Persist settings so themes remain active across reloads  

---

## Contributing
Pull requests are welcome. Keep new website logic inside its own lab folder.

---

## License
GNU General Public License v3.0
