// client/ui-widgets.js

class StatsWidget {
    constructor() {
        this.fpsEl = document.getElementById('fps');
        this.latencyEl = document.getElementById('latency');
        this.userCountEl = document.getElementById('user-count');

        this.frames = 0;
        this.lastFrameTime = performance.now();
        
        this.startFpsCounter();
    }

    startFpsCounter() {
        const loop = () => {
            this.frames++;
            const now = performance.now();
            if (now >= this.lastFrameTime + 1000) {
                this.fpsEl.textContent = `FPS: ${this.frames}`;
                this.frames = 0;
                this.lastFrameTime = now;
            }
            requestAnimationFrame(loop);
        };
        loop();
    }

    updateLatency(ms) {
        this.latencyEl.textContent = `Ping: ${ms}ms`;
    }

    updateUserCount(count) {
        this.userCountEl.textContent = `Users: ${count}`;
    }
}