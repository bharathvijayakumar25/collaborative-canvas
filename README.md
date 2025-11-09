# Aura Canvas: Ethereal Engine

This is my submission for the collaborative canvas assignment. It's a real-time, multi-user drawing app built on Node.js, Socket.io, and a custom canvas rendering engine.

I didn't just want it to *work*, I wanted it to feel amazing. So I went all-out on the UI with a "frosted glass" (glassmorphism) toolbar, animated mesh-gradient orbs, and floating particles. The whole thing feels alive.

## 🚀 Features

* **Real-time Drawing:** See other users' strokes as they draw (well, as they finish their stroke).
* **Live User Cursors:** See where other users are on the canvas, complete with their name and color.
* **Global Undo:** Undo any stroke on the canvas, even if someone else drew it. It syncs for everyone.
* **Global Clear:** A floating "X" button that clears the canvas for all connected users.
* **Live Stats Pannel:** A slick widget that shows:
    * Live User Count
    * Your Ping (Latency)
    * Your current FPS

## 🏃 How to Run

1.  Clone the repo.
2.  Run `npm install` in the root folder to get the server dependencies (express, socket.io).
3.  Run `npm start` to boot up the server.
4.  Open `http://localhost:3000` in your browser.

## 🧪 How to Test (The Fun Part)

1.  Open `http://localhost:3000` in **two separate browser tabs** (or one in an Incognito window).
2.  Wait a second. You'll see the "Users: 2" in the stats widget on both screens.
3.  Draw in one tab. You'll see your cursor and your line appear on the *other* tab.
4.  Draw on the second tab. It will appear on the first.
5.  Click the "Undo" button. It will undo the *last line drawn*, no matter who drew it, and remove it from both screens.
6.  Click the "X" button and confirm. It will wipe the canvas for both users.

## ⚠️ Known Limitiations / What I'd Add Next

* **No Redo:** The Undo feature is fully implemeted using an op-log, but I didn't get around to adding a "Redo" button. The architecture supports it, though!
* **No Persistence:** The drawing log is all in-memory. If the server restarts, the drawing is gone. The next step would be to save the `operation-log` to a database.
* **Touch Events:** Didnt get to add `touchstart`/`touchmove` events, so it's a desktop-only experience for now.