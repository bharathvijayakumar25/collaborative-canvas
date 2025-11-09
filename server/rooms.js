// server/rooms.js

// Using a Map is efficient for adding/removing by ID.
const users = new Map();

function addUser(socket) {
    users.set(socket.id, socket);
    console.log(`Total users: ${users.size}`);
}

function removeUser(socketId) {
    users.delete(socketId);
    console.log(`Total users: ${users.size}`);
}

// ▼▼▼ NEW FUNCTION ▼▼▼
function getUserCount() {
    return users.size;
}
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

module.exports = {
    addUser,
    removeUser,
    getUserCount // Export the new function
};