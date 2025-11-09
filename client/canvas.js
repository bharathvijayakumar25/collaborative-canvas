// client/canvas.js

class Canvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        this.isDrawing = false;
        this.currentStrokePoints = []; // Stores points for the *current* stroke
        
        // Drawing properties
        this.color = '#000000';
        this.strokeWidth = 5;
        this.tool = 'brush'; // 'brush' or 'eraser'

        // Bind 'this' for event handlers
        this.startDraw = this.startDraw.bind(this);
        this.draw = this.draw.bind(this);
        this.stopDraw = this.stopDraw.bind(this);
    }

    init() {
        // Set canvas to full screen
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Set default context properties
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.strokeWidth;

        // --- Event Listeners ---
        
        // Desktop Mouse Events
        this.canvas.addEventListener('mousedown', this.startDraw);
        this.canvas.addEventListener('mousemove', this.draw);
        this.canvas.addEventListener('mouseup', this.stopDraw);
        this.canvas.addEventListener('mouseleave', this.stopDraw);

        // ▼▼▼ MODIFICATION: Added Mobile Touch Events ▼▼▼
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling
            const touch = e.touches[0];
            // We need to simulate an 'offsetX/Y'
            const simEvent = { offsetX: touch.clientX, offsetY: touch.clientY };
            this.startDraw(simEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent scrolling
            const touch = e.touches[0];
            const simEvent = { offsetX: touch.clientX, offsetY: touch.clientY };
            this.draw(simEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault(); // Prevent scrolling
            
            // We need to get the *last* touch position
            const touch = e.changedTouches[0];
            
            // This handles the case where a touch ends *without* moving,
            // or to register the final point.
            if (this.isDrawing) {
                 const simEvent = { offsetX: touch.clientX, offsetY: touch.clientY };
                 this.draw(simEvent);
            }
            
            // Now, end the stroke
            this.stopDraw();
        });
        // ▲▲▲ END OF MODIFICATION ▲▲▲
    }

    // --- TOOLBAR SETTERS ---

    setColor(color) {
        this.color = color;
    }

    setStrokeWidth(width) {
        this.strokeWidth = width;
    }

    setTool(tool) {
        this.tool = tool;
    }

    // --- DRAWING EVENT HANDLERS ---

    startDraw(e) {
        this.isDrawing = true;
        this.ctx.beginPath();
        
        // Set properties for this stroke
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.strokeWidth;
        
        if (this.tool === 'eraser') {
            // Eraser uses 'destination-out' to clear pixels
            this.ctx.globalCompositeOperation = 'destination-out';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
        }

        // Move to the starting point
        this.ctx.moveTo(e.offsetX, e.offsetY);
        
        // Store the first point
        this.currentStrokePoints = [{ x: e.offsetX, y: e.offsetY }];
    }

    draw(e) {
        if (!this.isDrawing) return;

        // Draw line to new point
        this.ctx.lineTo(e.offsetX, e.offsetY);
        this.ctx.stroke();

        // Store this point
        this.currentStrokePoints.push({ x: e.offsetX, y: e.offsetY });
    }

    stopDraw() {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.ctx.closePath();

        // If the stroke was just a dot (or empty), don't send it
        if (this.currentStrokePoints.length < 2) return;

        // Create the stroke data object
        const strokeData = {
            points: this.currentStrokePoints,
            color: this.color,
            width: this.strokeWidth,
            tool: this.tool
        };

        // Fire a custom event to notify main.js that a new stroke is ready
        document.dispatchEvent(new CustomEvent('add-stroke', {
            detail: strokeData
        }));

        // Reset the points array
        this.currentStrokePoints = [];
    }

    // --- DRAWING FUNCTIONS (Called by main.js) ---

    /**
     * Draws a single, complete stroke object.
     * Used for drawing strokes from the server (history or new).
     * @param {object} stroke - The stroke data object.
     */
    drawStroke(stroke) {
        this.ctx.beginPath();
        
        // Set properties for this stroke
        this.ctx.strokeStyle = stroke.color;
        this.ctx.lineWidth = stroke.width;
        this.ctx.globalCompositeOperation = (stroke.tool === 'eraser') ? 'destination-out' : 'source-over';
        
        if (!stroke.points || stroke.points.length < 2) return;

        // Move to the first point
        this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

        // Draw lines to all subsequent points
        for (let i = 1; i < stroke.points.length; i++) {
            this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }

        // Render the stroke
        this.ctx.stroke();
        this.ctx.closePath();
        
        // Reset to default
        this.ctx.globalCompositeOperation = 'source-over';
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Clears and redraws the *entire* canvas from a history array.
     * @param {Array} history - An array of stroke objects.
     */
    redrawAll(history) {
        this.clearCanvas();
        history.forEach(stroke => {
            this.drawStroke(stroke);
        });
    }
}