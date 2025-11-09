// client/websocket.js

class WebSocketHandler {
    constructor(serverUrl) {
        this.socket = io(serverUrl);
        this.pingTimer = null;
        this.lastPingTime = 0;
        
        this.addSocketListeners();
    }

    addSocketListeners() {
        // ▼▼▼ NEW: Handle connection and start ping loop ▼▼▼
        this.socket.on('connect', () => {
            console.log('Connected to server.');
            // Start sending pings
            if (this.pingTimer) clearInterval(this.pingTimer);
            this.pingTimer = setInterval(() => {
                this.lastPingTime = Date.now();
                this.socket.emit('ping', { t: this.lastPingTime });
            }, 2000);
        });
        // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

        // 1. Received on join: Server sends the complete drawing history
        this.socket.on('draw-history', (history) => {
            console.log('Received draw-history');
            document.dispatchEvent(new CustomEvent('history-received', {
                detail: history
            }));
        });

        // 2. Received when ANOTHER user draws: Server sends just the new stroke
        this.socket.on('new-draw', (strokeData) => {
            console.log('Received new-draw');
            document.dispatchEvent(new CustomEvent('new-stroke', {
                detail: strokeData
            }));
        });

        // 3. Received after an UNDO: Server sends the new, complete history
        this.socket.on('canvas-update', (newHistory) => {
            console.log('Received canvas-update (after undo)');
            document.dispatchEvent(new CustomEvent('history-received', {
                detail: newHistory
            }));
        });

        // ▼▼▼ NEW: Listen for stats events from server ▼▼▼
        
        // 4. Received when user count changes
        this.socket.on('users-updated', (count) => {
            document.dispatchEvent(new CustomEvent('users-updated', {
                detail: count
            }));
        });
        
        // 5. Received a pong from the server
        this.socket.on('pong', (msg) => {
            const latency = Date.now() - msg.t;
            document.dispatchEvent(new CustomEvent('latency-updated', {
                detail: latency
            }));
        });
        // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

        // Handle connection errors
        this.socket.on('connect_error', (err) => {
            console.error('Connection Error:', err.message);
            alert('Failed to connect to the server. Please refresh.');
        });
        
        // ▼▼▼ NEW: Handle disconnection ▼▼▼
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server.');
            if (this.pingTimer) clearInterval(this.pingTimer);
        });
        // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    }

    // --- EMITTERS (Called by main.js) ---

    sendStroke(strokeData) {
        this.socket.emit('draw-event', strokeData);
    }

    sendUndo() {
        this.socket.emit('undo-event');
    }
}