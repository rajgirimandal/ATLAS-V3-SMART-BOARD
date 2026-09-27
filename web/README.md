# 🌐 ATLAS Smart Board — Wireless Classroom Interactive Panel

A standalone, ultra-responsive HTML5 / Canvas / KaTeX Smart Board web application designed for interactive flat panels (ViewSonic, Promethean, BenQ, Samsung Flip, iPad, Android boards).

Synchronizes in real time with the **ATLAS V3 Autonomous Teacher Robot** over WebSockets.

---

## 🚀 How to Deploy on GitHub Pages (Static Hosting)

GitHub Pages hosts client-side static web applications directly from a GitHub repository for free:

1. **Copy this entire `web/` folder** or its contents into your GitHub repository (e.g. `your-username/atlas-smartboard` or the `gh-pages` branch).
2. Go to your GitHub repository **Settings** → **Pages**.
3. Under **Build and deployment** → **Branch**, select `main` (or root `/`) and click **Save**.
4. Within 60 seconds, GitHub will give you a live URL:
   ```
   https://your-username.github.io/atlas-smartboard/
   ```
5. Open that URL on your interactive flat panel / smart board in Google Chrome.

---

## 🔗 How It Connects to Your ATLAS Robot

Since GitHub Pages is hosted in the cloud and your ATLAS Robot runs on your laptop, desktop, or Raspberry Pi:

### Step 1: Start the ATLAS Online Controller on Your Computer
In your terminal, run:
```bash
python online.py
```
This boots the WebSocket broadcast bridge on port `8765` and registers Hardware Robot ID: **`0353`**.

### Step 2: Open the Smart Board on Your Interactive Flat Panel
1. Open the board URL (on GitHub Pages or `http://localhost:8080`).
2. The lock screen will prompt: **Enter 4-Digit Robot Hardware ID**.
3. Type: **`0353`**.
4. The web board connects to `online.py`, verifies the robot is online, and unlocks the smart panel!
5. The status pill turns **🟢 LIVE SYNC: ATLAS V3 (0353)**.

### Option: Remote Access / School Wi-Fi (LAN)
If the board is on a smart TV and ATLAS is on your laptop:
1. Ensure both devices are on the same Wi-Fi.
2. In the Robot Address field on the lock screen, enter your laptop's local IP (e.g. `ws://192.168.1.50:8765`).
3. Type Robot ID: **`0353`** and click Connect.

---

## 🔬 Multi-Subject Support Included

| Subject | Capabilities |
| :--- | :--- |
| **📝 Notes & Dictation** | Live typewriter text, structured NCERT definitions, bullet points, teacher takeaways. |
| **📐 Mathematics** | Step-by-step KaTeX derivation cards, active line highlight glowing, Cartesian Parabola curve plotter ($y = x^2 - 4$), root & vertex coordinates. |
| **🔬 Science** | Dynamic vector graphics: Photosynthesis (light rays & chemical formula), Plant Cell (cell wall, vacuole, organelles), Electric Circuit (battery, resistor, LED, electrons), Solar System, Water Cycle. |
| **🌍 Social Science** | Interactive historical timeline cards (1857 to 1947), Geographic coordinate projection (Equator, Tropics, Prime Meridian). |
| **🖊️ Touch Drawing** | Smooth quadratic bezier stylus pen, fluorescent highlighter, virtual laser pointer, smart eraser, ruled lines, and math graph grids. |
| **✋ Reverse Doubts** | Students can tap "Ask" or "Raise Hand" on the board; doubts are instantly forwarded to ATLAS's `NonVerbalInputQueue`. |
