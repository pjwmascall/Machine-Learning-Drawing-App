class SketchPad {
    constructor(container, draw, size=400) {
        this.container = container;
        this.draw = draw;
        /* https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API */
        this.canvas = document.createElement("canvas");
        this.canvas.width = size;
        this.canvas.height = size;
        /* Template literal to write CSS for canvas */
        this.canvas.style = `
            background-color:white;
            box-shadow: 0px 0px 10px 2px black;
        `;
        this.container.appendChild(this.canvas);
        /* Insert line break for undo button */
        const lineBreak = document.createElement("br");
        this.container.appendChild(lineBreak);
        /* Create undo button for canvas */
        this.undoButton = document.createElement("button");
        this.undoButton.textContent = "UNDO";
        this.undoButton.disabled = true; // Disabled until canvas is drawn on
        this.container.appendChild(this.undoButton);
        this.ctx = this.canvas.getContext("2d"); // 2D canvas context to draw
        /* Initialize canvas */
        this.reset();
        this.#addEventListeners();
    }

    /* Public method to reset the canvas */
    reset() {
        this.paths = [];
        this.isDrawing = false;
        this.#redraw();
    }

    #addEventListeners() {
        /* Capture mouse activity */
        this.canvas.onmousedown = (evt) => {
            const mouse = this.#getMouse(evt);
            this.paths.push([mouse]);
            this.isDrawing = true;
        }

        this.canvas.onmousemove = (evt) => {
            if(this.isDrawing) {
                const mouse = this.#getMouse(evt);
                const lastPath = this.paths[this.paths.length - 1];
                lastPath.push(mouse);
                this.#redraw();
            }
        }

        this.canvas.onmouseup = () => {
            this.isDrawing = false;
        }

        /* Add touchscreen event listeners, and give them mouse functionality */
        this.canvas.ontouchstart = (evt) => {
            const loc = evt.touches[0];
            this.canvas.onmousedown(loc);
        }

        this.canvas.ontouchmove = (evt) => {
            const loc = evt.touches[0];
            this.canvas.onmousemove(loc);
        }

        this.canvas.ontouchend = () => {
            this.canvas.onmouseup();
        }

        /* Undo button functionality */
        this.undoButton.onclick = () => {
            this.paths.pop();
            this.#redraw();
        }
    }

    /* Event listener to log mouse coordinates */
    #getMouse = (evt) => {
        const rect = this.canvas.getBoundingClientRect();
        return [
            /* x-coordinate relative to left side of the canvas */
            Math.round(evt.clientX - rect.left),
            /* y-coordinate relative to the top of the canvas */
            Math.round(evt.clientY - rect.top)
        ];
    }

    /* Event listener to render mouse events on canvas */
    #redraw() {
        /* Clears canvas from top-left to bottom-right */
        this.ctx.clearRect(
            0, 0,
            this.canvas.width, this.canvas.height
        );
        this.draw.paths(this.ctx, this.paths);
        /* Only undo if the canvas is drawn on */
        if (this.paths.length > 0) {
            this.undoButton.disabled = false;
        }
        else {
            this.undoButton.disabled = true;
        }
    }
    
}