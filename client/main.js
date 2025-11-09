// client/main.js

// Wait for the DOM to be fully loaded before running script
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. INITIALIZATION ---

    const canvas = new Canvas('drawing-canvas');
    const socket = new WebSocketHandler(window.location.origin);
    
    // ▼▼▼ NEW: Initialize the Stats Widget ▼▼▼
    const stats = new StatsWidget();
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    // Initialize the canvas (set size, add listeners)
    canvas.init();

    // --- 2. WIRE UP TOOLBAR --- (No changes here)

    const colorPicker = document.getElementById('color-picker');
    const strokeWidthSlider = document.getElementById('stroke-width');
    const strokeValueSpan = document.getElementById('stroke-value');
    const brushBtn = document.getElementById('brush-btn');
    const eraserBtn = document.getElementById('eraser-btn');
    const undoBtn = document.getElementById('undo-btn');

    // ▼▼▼ FIX: Use 'input' event for live color change ▼▼▼
    colorPicker.addEventListener('input', (e) => {
        canvas.setColor(e.target.value);
    });

    strokeWidthSlider.addEventListener('input', (e) => {
        const width = e.target.value;
        canvas.setStrokeWidth(width);
        strokeValueSpan.textContent = width;
    });

    brushBtn.addEventListener('click', () => {
        canvas.setTool('brush');
        brushBtn.classList.add('active');
        eraserBtn.classList.remove('active');
    });

    eraserBtn.addEventListener('click', () => {
        canvas.setTool('eraser');
        eraserBtn.classList.add('active');
        brushBtn.classList.remove('active');
    });

    undoBtn.addEventListener('click', () => {
        socket.sendUndo();
    });

    // --- 3. CONNECT CANVAS AND WEBSOCKET ---

    // WHEN the canvas has a new stroke (from user drawing)
    document.addEventListener('add-stroke', (e) => {
        const strokeData = e.detail;
        socket.sendStroke(strokeData);
    });

    // WHEN the websocket receives the *entire* history (on join or after an undo)
    document.addEventListener('history-received', (e) => {
        const history = e.detail;
        canvas.redrawAll(history);
    });

    // WHEN the websocket receives a *single* new stroke from another user
    document.addEventListener('new-stroke', (e) => {
        const strokeData = e.detail;
        canvas.drawStroke(strokeData);
    });

    // ▼▼▼ NEW: Listen for stats updates from websocket.js ▼▼▼
    
    // WHEN the user count changes
    document.addEventListener('users-updated', (e) => {
        stats.updateUserCount(e.detail);
    });

    // WHEN a new ping time is calculated
    document.addEventListener('latency-updated', (e) => {
        stats.updateLatency(e.detail);
    });
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
});