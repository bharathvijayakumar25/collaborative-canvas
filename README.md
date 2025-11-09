# Aura Canvas: Ethereal Engine

This is a real-time, multi-user, collaborative canvas application built with Node.js, WebSockets, and an advanced offscreen canvas replay engine.

It features a "glassmorphism" UI with a generative, CSS-only "live aurora" background.

## 🚀 Setup & Running

1.  **Clone the repository**
    ```sh
    git clone [your-repo-url]
    cd collaborative-canvas
    ```

2.  **Install server dependencies**
    ```sh
    npm install express socket.io
    ```

3.  **Run the server**
    ```sh
    node server/server.js
    ```

4.  **Open the App**
    * Open `http://localhost:3000` in your browser.

## 🧪 How to Test (Multi-User)

1.  Open `http://localhost:3000` in **two separate browser tabs** (or one in Incognito).
2.  Watch the "Users: 1" widget change to "Users: 2".
3.  Draw in one tab. You will see the live cursor and the completed stroke appear in the second tab.
4.  Draw in both tabs simultaneously.
5.  (Once implemented) Click "Undo" in Tab A and watch a stroke drawn by Tab B disappear on both screens.

## ⚠️ Known Limitations & Future Work

* **Undo/Redo:** The UI buttons exist, but the server-side logic to add `undo` ops to the log is not fully implemented.
* **Persistence:** The operation log is held in-memory. If the server restarts, all drawings are lost. The next step is to save the `ops` array to a database.
* **Efficiency:** The client currently replays the *entire* op-log on `resize` and `addOp`. This is inefficient and should be optimized to only apply the new op or use a cached base layer.

## 🕒 Time Spent

* **Initial Baseline (v1):** ~4-5 hours
* **"Ethereal Engine" UI/UX (v2):** ~3-4 hours
* **"Op-Log" Architecture Rewrite (v3):** ~6-8 hours