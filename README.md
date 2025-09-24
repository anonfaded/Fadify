# Fadify

Fadify is a Firefox extension that adds **live theme customization** to ChatGPT.  
It’s built with an object-oriented, containerized design — each supported website will live in its own folder for styling, so adding more websites later won’t clutter the codebase.

---

## Features
- 🎨 Live theme switching (applies instantly, no page reload required)  
- 🗂 Containerized design (each website has its own folder and logic)  
- 🔮 Currently supports **ChatGPT** (more websites planned)  
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
├── containers/
│   └── chatgpt/
│       └── content.js
└── README.md
```

- `manifest.json` → Extension metadata and permissions  
- `background.js` → Background logic  
- `popup/` → Extension UI for selecting themes  
- `containers/chatgpt/` → All ChatGPT-specific styling and logic  

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
- Add more websites with their own containers (`/containers/xyz/`)  
- More advanced theme options (fonts, layouts, animations)  
- Persist settings so themes remain active across reloads  

---

## Contributing
Pull requests are welcome. Keep new website logic inside its own container folder.

---

## License
MIT
