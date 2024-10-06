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
            margin-bottom: 10px;
            box-shadow: 0px 0px 10px 2px black;
            touch-action: none;
        `;
        this.container.appendChild(this.canvas);

        /* Insert line break for undo button */
        const lineBreak = document.createElement("br");
        this.container.appendChild(lineBreak);

        /* Create undo button for canvas */
        this.undoBtn = document.createElement("button");
        this.undoBtn.textContent = "UNDO";
        this.container.appendChild(this.undoBtn);

        /* Create redo button for canvas */
        this.redoBtn = document.createElement("button");
        this.redoBtn.textContent = "REDO";
        this.container.appendChild(this.redoBtn);

        /* Create clear button for canvas */
        this.clearBtn = document.createElement("button");
        this.clearBtn.textContent = "CLEAR";
        this.container.appendChild(this.clearBtn);

        /* Create save button to download canvas drawing as an image */
        this.saveImageBtn = document.createElement("button");
        this.saveImageBtn.textContent = "SAVE IMAGE";
        this.container.appendChild(this.saveImageBtn);
        this.saveImageHandler = this.saveImage.bind(this, "MyDrawing.png"); // Bind this to saveImage() so click event can be added/removed

        this.ctx = this.canvas.getContext("2d"); // 2D canvas context to draw

        /* Initialise canvas */
        this.reset();
        this.#addEventListeners();
    }

    


    /* Public method to reset the canvas */
    reset(paths = []) {
        this.paths = paths; // Optionally restore paths, otherwise clear
        this.removedPaths = [];

        this.isDrawing = false;

        this.undoBtn.disabled = true; // Disabled until canvas is drawn on
        this.redoBtn.disabled = true; // Disabled until undoBtn is clicked
        this.saveImageBtn.disabled = true; // Disabled until canvas is drawn on

        this.#redraw();
    }




    #addEventListeners() {
        /* CANVAS EVENTS */

        if (window.PointerEvent) {
            /* If pointers supported, then capture pointer activity, preventing default behaviour (like scrolling) */
            this.canvas.addEventListener("pointerdown", (evt) => {
                    evt.preventDefault();

                    this.canvas.setPointerCapture(evt.pointerId);

                    const loc = this.#getInteraction(evt);
                    this.#down(loc);
                }, { passive: false }
            );

            this.canvas.addEventListener("pointermove", (evt) => {
                    evt.preventDefault();

                    if (this.isDrawing) {
                        const loc = this.#getInteraction(evt);
                        this.#move(loc);
                    }
                }, { passive: false }
            );

            this.canvas.addEventListener("pointerup", (evt) => {
                    evt.preventDefault();

                    this.canvas.releasePointerCapture(evt.pointerId);

                    this.#up();
                },{ passive: false }
            );
        }

        /* If pointer not support, capture mouse/touch events instead */
        else {  
            /* Capture mouse activity */
            this.canvas.onmousedown = (evt) => {
                const mouse = this.#getInteraction(evt);
                this.#down(mouse);
            }

            this.canvas.onmousemove = (evt) => {
                if(this.isDrawing) {
                    const mouse = this.#getInteraction(evt);
                    this.#move(mouse);
                }
            }

            this.canvas.onmouseup = () => { this.#up(); }

            /* Capture touch activity */
            this.canvas.ontouchstart = (evt) => {
                evt.preventDefault(); // Prevent default behaviour (like scrolling)

                const touch = this.#getInteraction(evt);
                this.#down(touch);
            }

            this.canvas.ontouchmove = (evt) => {
                evt.preventDefault();

                if(this.isDrawing) {
                    const touch = this.#getInteraction(evt);
                    this.#move(touch);
                }
            }

            this.canvas.ontouchend = (evt) => {
                evt.preventDefault();

                this.#up();
            }
        }

        /* BUTTON EVENTS */

        /* Undo button functionality */
        this.undoBtn.addEventListener("click", () => {
            /* Undo most recently drawn path, and add to list of removed paths for redo functionality */
            const removedPath = this.paths.pop();
            this.removedPaths.push(removedPath);

            this.redoBtn.disabled = false;

            this.#up(); // Sets isDrawing to false to prevent canvas errors, and calls #redraw()
        });

        /* Redo button functionality */
        this.redoBtn.addEventListener("click", () => {
            const mostRecentPath = this.removedPaths.pop();
            this.paths.push(mostRecentPath);

            if (this.removedPaths.length === 0) { this.redoBtn.disabled = true; }

            this.#up(); // Sets isDrawing to false to prevent canvas errors, and calls #redraw()
        });

        /* Clear button functionality */
        this.clearBtn.addEventListener("click", () => {
            /* Undo all lines and save in history */
            while (this.paths.length > 0) {
                this.removedPaths.push(this.paths.pop());
            }

            this.redoBtn.disabled = false;

            //this.#up(); // Sets isDrawing to false to prevent canvas errors, and calls #redraw()
            this.#redraw();
        });

        /* The following event listener can be overwritten outside this class: see saveImageHandler() and saveImage() */
        this.saveImageBtn.addEventListener("click", this.saveImageHandler);
    }




    /* Capture pointer, mouse, and touch events, and return location */
    #getInteraction = (evt) => {
        const rect = this.canvas.getBoundingClientRect();

        if (typeof TouchEvent !== "undefined" && evt instanceof TouchEvent) {
            evt = evt.touches[0] || evt.changedTouches[0]; // Get the first touch point
        }

        return [
            /* x-coordinate relative to left side of the canvas */
            Math.round(evt.clientX - rect.left),
            /* y-coordinate relative to the top of the canvas */
            Math.round(evt.clientY - rect.top)
        ];
    }

    /* Pointer, mouse and touch down functionality */
    #down = (loc) => {
        this.paths.push([loc]);

        this.isDrawing = true;

        /* If drawing, all previously removed paths forgotten, and redo button disabled */
        this.removedPaths = [];
        this.redoBtn.disabled = true;
    }

    /* Pointer, mouse and touch move functionality */
    #move = (loc) => {
        if (this.paths.length > 0) {
            const lastPath = this.paths[this.paths.length - 1];
            lastPath.push(loc);
        }

        this.#redraw();
    }

    /* Pointer, mouse and touch up functionality */
    #up = () => {
        this.isDrawing = false;

        this.#redraw(); // Allows drawing of single canvas clicks
    }




    /* Render canvas with drawing */
    #redraw(backgroundColor="white") {
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // Fills canvas from top-left to bottom-right

        this.#drawPaths(this.ctx, this.paths);

        if (this.paths.length > 0) {
            this.undoBtn.disabled = false; // Only undo if the canvas is drawn on
            this.clearBtn.disabled = false; // Only clear if the canvas is drawn on
            this.saveImageBtn.disabled = false; // Only save if the canvas is drawn on
        } else {
            this.undoBtn.disabled = true;
            this.clearBtn.disabled = true;
            this.saveImageBtn.disabled = true;
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
        } else {
            ctx.beginPath();
            ctx.moveTo(...path[0]); // Move to first point in the path (each item in path is an array of x,y mouse coordinates)
            for (let i=1; i<path.length; i++) { ctx.lineTo(...path[i]); }
            ctx.stroke();
        }
    }

    /* Draw multiple lines on canvas */
    #drawPaths = (ctx, paths, color="black") => {
        for (const path of paths) { this.#drawPath(ctx, path, color); }
    }




    /* Public method to save and download canvas as an image.
    This method accepts an optional argument for a file name that can be passed to it from outside the class */
    saveImage(fileName) {
        try {
            this.#up(); // Sets isDrawing to false to prevent canvas errors, and calls #redraw() to ensure no pending drawings

            const imageData = this.canvas.toDataURL("image/png"); // Get the canvas content as a data URL in PNG format
    
            const blob = this.#dataURLToBlob(imageData); // Convert the data URL to a blob so it can be downloaded
            if (!blob) { throw new Error("Failed to create a valid blob from the image data."); }
    
            const url = URL.createObjectURL(blob); // Create download URL from blob
    
            /* Create a temporary anchor element to trigger the download */
            const downloadElement = document.createElement("a");
            downloadElement.href = url;
            downloadElement.download = fileName;
            downloadElement.style.display = "none";
            /* Append the element, trigger the download, and clean up. Adding to the DOM is not necessary, but guarantees cross-browser behaviour */
            this.container.appendChild(downloadElement);
            downloadElement.click();
            this.container.removeChild(downloadElement);
    
            URL.revokeObjectURL(url); // Revoke the object URL to free up memory
        } catch (error) {
            console.error("Error saving the image:", error);
            alert("An error occurred while trying to save the image. Please try again.");
        }

    }

    /* Convert base64 encoded data URL strings to a blob */
    #dataURLToBlob(dataURL) {
        try {
            const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]; // Extract MIME type for the blob

            const byteString = atob(dataURL.split(',')[1]); // Decode base64 (ASCII to binary string)
    
            const arrayBuffer = new ArrayBuffer(byteString.length); // Create array buffer the size of the binary string
            const uint8Array = new Uint8Array(arrayBuffer); // Create unsigned 8-bit integer array (ASCII character is 8 bits = 1 byte)
            for (let i = 0; i < byteString.length; i++) { uint8Array[i] = byteString.charCodeAt(i); } // Write binary data into the array buffer
    
            return new Blob([uint8Array], { type: mimeString }); // Create a blob from the binary data
        } catch (error) {
            console.error("Error converting data URL to blob:", error);
            return null; // Trigger new error throw in saveImage()
        }
    }

}