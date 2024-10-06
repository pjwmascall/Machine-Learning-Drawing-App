    /* Public method to save and download canvas as an image.
    This method accepts an optional argument for a file name that can be passed to it from outside the class */
    saveImage(fileName) {
        this.#up(); // Sets isDrawing to false to prevent canvas errors, and calls #redraw() to ensure no pending drawings

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
        for (let i = 0; i < byteString.length; i++) { uint8Array[i] = byteString.charCodeAt(i); } // Write binary data into the array buffer

        return new Blob([uint8Array], { type: mimeString }); // Create a blob from the binary data
    }