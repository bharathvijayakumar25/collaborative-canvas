# 🏛️ Architecture Deep Dive

My main goal was to avoid a simple, buggy "pixel-pushing" implementation. The whole project is built on a server-authoritative **Operation Log** (or "op-log") model. This is the same model used by apps like Figma and Google Docs.

### The Core Idea
The server's "brain" (`operation-log.js`) is just an array of immutable operations.
`[ {op: stroke_start}, {op: stroke_append}, {op: stroke_end}, {op: undo}, {op: clear}, ... ]`

The client's canvas is just a "dumb" replay of this log. This makes synchronization and complex features like 'undo' incredibly robust and almost trivial to implement.

### The Life of a Stroke (Data Flow)

1.  **Client A `mousedown`:** A `stroke:start` op is created with a unique ID and sent to the server.
2.  **Client A `mousemove`:** `stroke:append` ops are batched (every 12ms) and sent to the server.
3.  **Client A `mouseup`:** A final `stroke:end` op (with the last point) is sent.
4.  **Server Stamps:** The server receives these ops, stamps them with a `serverSeq` (to guarantee order), and broadcasts them as a single `op` message to *everyone*.
5.  **All Clients Replay:** All clients (A, B, C...) get teh new `op`. They push it to their local log and re-draw. `canvas.js` is smart enough to just apply the *new* op without replaying the whole log.

### The WebSocket Protoccol (sic)

**Client → Server:**
* `join`: Sent on connect.
* `cursor`: Throttled mouse position.
* `stroke:start`: Begins a new stroke.
* `stroke:append`: Batched points for that stroke.
* `stroke:end`: Finishes a stroke.
* `undo`: (sends `{target: 'op-id-to-undo'}`)
* `clear`: (sends `{type: 'clear'}`)
* `ping`: Sent every 2s for latency checks.

**Server → Client:**
* `state`: (sends the *entire op-log* to a new user on join)
* `op`: (broadcasts a *single new op* to all connected users)
* `users`: (broadcasts the new user list when anyone joins/leaves)
* `cursor`: (broadcasts another user's cursor position)
* `pong`: (replies to a `ping`)

### The "Global Undo" Srategy (sic)

This was the trickiest part, and the op-log makes it easy.

1.  An "Undo" is **NOT** a `pop()` from the stack.
2.  When a user clicks Undo, the client finds the ID of the last "drawable" stroke and sends an `{type: 'undo', target: 'op-id-to-undo'}` op to the server.
3.  The server adds *this new op* to the log and broadcasts it like any other op.
4.  When clients `replayAll()`, they first build a "skip list" of all `target` IDs from `undo` ops.
5.  When they loop through the log to draw, they just check: `if (undoneIds.has(op.id)) { continue; }`.
6.  This is way better because it's non-destructive and handles multi-user conflicts perfectly. User A can undo User B's stroke.

### Performance Decisions (Why is it fast?)

* **`requestAnimationFrame`:** The main `render()` loop runs on `rAF` (via `ui-widgets.js` for FPS).
* **Offscreen Canvas:** This is the biggest optimization. All *settled* strokes (from the log) are drawn *once* to a hidden, offscreen `<canvas>` (`bgCanvas`).
* **Foreground Canvas:** The visible, on-screen `<canvas>` (`fgCanvas`) is cleared every single frame. The main `render()` loop just does one fast call: `fgCtx.drawImage(bgCanvas, 0, 0)`.
* **Result:** The browser only has to do *real* drawing for the things that move every frame:
    1.  The *one* line you are currently drawing.
    2.  Other users' live cursors.
* **Batching:** I send `stroke:append` messages in 12ms batches, not on every single pixel. This keeps the network from flooding.