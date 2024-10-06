class SketchPad {

    constructor(container, size=400) {
        this.container = container;
        /* https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API */
        this.canvas = document.createElement("canvas");
        this.canvas.width = size;
        this.canvas.height = size;
        /* Template literal to write CSS for canvas */
        this.canvas.style = `
            background-color: white;
            margin-top: 10px;
            box-shadow: 0px 0px 10px 2px black;
        `;
        this.container.appendChild(this.canvas);
        /* Insert line break for undo button */
        const lineBreak = document.createElement("br");
        this.container.appendChild(lineBreak);
        /* Create undo button for canvas */
        this.undoButton = document.createElement("button");
        this.undoButton.textContent = "UNDO";
        /* Create redo button for canvas */
        this.container.appendChild(this.undoButton);
        this.redoButton = document.createElement("button");
        this.redoButton.textContent = "REDO";
        this.container.appendChild(this.redoButton);
        this.removedPaths = []; // Empty list for storing paths for redoButton
        /* Create save button to download canvas drawing as an image */
        this.saveImageButton = document.createElement("button");
        this.saveImageButton.textContent = "SAVE IMAGE";
        this.container.appendChild(this.saveImageButton);
        this.saveImageHandler = this.saveImage.bind(this, "MyDrawing.png"); // Bind this to saveImage() so click event can be added/removed
        this.ctx = this.canvas.getContext("2d"); // 2D canvas context to draw
        /* Initialize canvas */
        this.reset();
        this.#addEventListeners();
    }

    /* Public method to reset the canvas */
    reset() {
        this.paths = [];
        this.removedPaths = [];
        this.isDrawing = false;
        this.undoButton.disabled = true; // Disabled until canvas is drawn on
        this.redoButton.disabled = true; // Disabled until UNDO button is clicked
        this.saveImageButton.disabled = true; // Disabled until canvas is drawn on
        this.#redraw();
    }

    #addEventListeners() {
        /* Capture mouse activity */
        this.canvas.onmousedown = (evt) => {
            const mouse = this.#getMouse(evt);
            this.paths.push([mouse]);
            this.isDrawing = true;
            /* If drawing, all previously removed paths forgotten, and redo button disabled */
            this.removedPaths = [];
            this.redoButton.disabled = true;
        }
        this.canvas.onmousemove = (evt) => {
            if(this.isDrawing) {
                const mouse = this.#getMouse(evt);
                if (this.paths.length > 0) {
                    const lastPath = this.paths[this.paths.length - 1];
                    lastPath.push(mouse);
                }
                this.#redraw();
            }
        }
        this.canvas.onmouseup = () => {
            this.isDrawing = false;
            this.#redraw(); // Allows drawing of single canvas clicks
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
        this.undoButton.addEventListener("click", () => {
            /* Undo most recently drawn path, and add to list of removed paths for redo functionality */
            const removedPath = this.paths.pop();
            this.removedPaths.push(removedPath);
            this.redoButton.disabled = false;
            this.canvas.onmouseup(); // Sets isDrawing to false to prevent canvas errors, and calls #redraw()
        });
        /* Redo button functionality */
        this.redoButton.addEventListener("click", () => {
            const mostRecentPath = this.removedPaths.pop();
            this.paths.push(mostRecentPath);
            if (this.removedPaths.length === 0) {
                this.redoButton.disabled = true;
            }
            this.canvas.onmouseup(); // Sets isDrawing to false to prevent canvas errors, and calls #redraw()
        });
        /* The following event listener can be overwritten outside this class, in order to pass it an optional argument */
        this.saveImageButton.addEventListener("click", this.saveImageHandler);
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
    #redraw(backgroundColor="white") {
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // Fills canvas from top-left to bottom-right
        this.#drawPaths(this.ctx, this.paths);
        /* Only undo if the canvas is drawn on */
        if (this.paths.length > 0) {
            this.undoButton.disabled = false;
            this.saveImageButton.disabled = false;
        }
        else {
            this.undoButton.disabled = true;
            this.saveImageButton.disabled = true;
        }
    }

    /* Basic canvas drawing functionality */
    #drawPath = (ctx, path, color="black") => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        /* If the path has only one point, draw a small dot */
        if (path.length === 1) {
            const [x, y] = path[0];
            ctx.beginPath();
            ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2); // Draw a small dot
            ctx.fillStyle = color;  // Use fillStyle for the dot
            ctx.fill();  // Fill the dot
        }
        else {
            ctx.beginPath();
            /* Move to first point in the path 
            (each item in path is an array of x,y mouse coordinates)*/
            ctx.moveTo(...path[0]);
            for (let i=1; i<path.length; i++) {
                ctx.lineTo(...path[i]);
            }
            ctx.stroke();
        }
    }

    /* Draw multiple lines on canvas */
    #drawPaths = (ctx, paths, color="black") => {
        for (const path of paths) {
            this.#drawPath(ctx, path, color);
        }
    }

    /* Public method to save and download canvas as an image.
    This method accepts an optional argument for a file name that can be passed to it from outside the class */
    saveImage(fileName) {
        this.canvas.onmouseup(); // Sets isDrawing to false to prevent canvas errors, and calls #redraw() to ensure no pending drawings
        const imageData = this.canvas.toDataURL("image/png"); // Get the canvas content as a data URL in PNG format
        const blob = this.#dataURLToBlob(imageData); // Convert the data URL to a blob so it can be downloaded
        const url = URL.createObjectURL(blob); // Create download URL from blob
        /* Create a temporary anchor element to trigger the download */
        const downloadElement = document.createElement("a");
        downloadElement.href = url;
        downloadElement.download = fileName;
        downloadElement.style.display = "none";
        /* Append the element, trigger the download, and clean up */
        this.container.appendChild(downloadElement);
        downloadElement.click();
        this.container.removeChild(downloadElement);
        URL.revokeObjectURL(url); // Revoke the object URL to free up memory
    }

    /* Convert base64 encoded data URL strings to a blob */
    #dataURLToBlob(dataURL) {
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]; // Extract MIME type for the blob
        const byteString = atob(dataURL.split(',')[1]); // Decode base64 (ASCII to binary string)
        const arrayBuffer = new ArrayBuffer(byteString.length); // Create array buffer the size of the binary string
        const uint8Array = new Uint8Array(arrayBuffer); // Create unsigned 8-bit integer array (ASCII character is 8 bits = 1 byte)
        /* Write binary data into the array buffer */
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }    
        return new Blob([uint8Array], { type: mimeString }); // Create a blob from the binary data
    }

}