// server/drawing-state.js

// This is our server-side "database" for the canvas state.
// It's just an array of all the strokes ever drawn.
let history = [];

/**
 * Adds a new stroke event to the history.
 * @param {object} drawEvent - The stroke data (points, color, width)
 */
function addEvent(drawEvent) {
  history.push(drawEvent);
}

/**
 * Removes the last stroke event from the history.
 */
function undoLast() {
  history.pop();
}

/**
 * Returns the entire drawing history.
 * @returns {Array} The array of stroke events.
 */
function getHistory() {
  return history;
}

/**
 * Clears all history.
 */
function clearHistory() {
  history = [];
}

module.exports = {
  addEvent,
  undoLast,
  getHistory,
  clearHistory
};