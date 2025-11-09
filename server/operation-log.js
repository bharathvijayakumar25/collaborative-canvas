// server/operation-log.js

class OperationLog {
    constructor(roomId) {
        this.roomId = roomId;
        this.ops = [];
        this.serverSeq = 0;
    }

    // Add a new operation, stamp it, and store it
    addOp(op) {
        const serverOp = {
            ...op,
            serverSeq: this.serverSeq++,
            serverTs: Date.now()
        };
        
        // ▼▼▼ THIS IS THE FIX ▼▼▼
        // When a 'clear' op comes in, we wipe the entire log
        // and store ONLY the clear op.
        if (serverOp.type === 'clear') {
            console.log(`Clearing log for room ${this.roomId}`);
            this.ops = [serverOp]; // Store only the clear op
            this.serverSeq = 1; // Reset sequence
        } else {
            this.ops.push(serverOp);
        }
        // ▲▲▲ END OF FIX ▲▲▲
        
        // TODO: Add persistence logic here (save to disk/DB)
        
        return serverOp;
    }

    // Get the full list of operations
    getOps() {
        return this.ops;
    }
}

module.exports = {
    OperationLog
};