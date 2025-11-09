// server/server.js
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const drawingState = require('./drawing-state');
const roomManager = require('./rooms');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve the static client files
const clientPath = path.join(__dirname, '../client');
console.log(`Serving static files from ${clientPath}`);
app.use(express.static(clientPath));

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    roomManager.addUser(socket);

    // ▼▼▼ NEW: Broadcast the new user count to ALL clients ▼▼▼
    io.emit('users-updated', roomManager.getUserCount());
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    // 1. On join, send the entire drawing history to the new user
    socket.emit('draw-history', drawingState.getHistory());

    // 2. Listen for a new drawing event from a client
    socket.on('draw-event', (strokeData) => {
        drawingState.addEvent(strokeData);
        socket.broadcast.emit('new-draw', strokeData);
    });

    // 3. Listen for a global undo request
    socket.on('undo-event', () => {
        drawingState.undoLast();
        const newHistory = drawingState.getHistory();
        io.emit('canvas-update', newHistory);
    });

    // ▼▼▼ NEW: Listen for ping and send pong ▼▼▼
    socket.on('ping', (msg) => {
        socket.emit('pong', msg); // Echo back the message
    });
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        roomManager.removeUser(socket.id);
        
        // ▼▼▼ NEW: Broadcast the new user count to ALL clients ▼▼▼
        io.emit('users-updated', roomManager.getUserCount());
        // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});