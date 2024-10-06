class AdvanceApp {

    #labels;
    #currentLabel;
    #currentLabelIndex;
    #data;
    #advanceBtnState;
    #history = [];

    constructor(container, labels, data, sketchPad) {
        this.container = container;

        this.#labels = labels;
        /* Set initial data label */
        this.#currentLabelIndex = 0;
        this.#currentLabel = this.#labels[this.#currentLabelIndex];

        this.#data = data;

        this.sketchPad = sketchPad;
        /* The click event for this button is reset here in order to give it access to private data members from this class */
        this.sketchPad.saveImageBtn.removeEventListener("click", this.sketchPad.saveImageHandler);
        this.sketchPad.saveImageBtn.addEventListener("click", () => {
            this.sketchPad.saveImage(this.#data.session + "_" + this.#data.username + "_" + this.#currentLabel) // Argument sets name of image
        });
        this.sketchPad.container.style.display = "none"; // Hide sketchpad until username entered
  
        /* Create username field */
        this.usernameField = document.createElement("input");
        this.usernameField.type = "text";
        this.usernameField.placeholder = "Enter name";  
        this.container.appendChild(this.usernameField);

        /* Create element for user instructions */
        this.instructions = document.createElement("span");
        this.container.appendChild(this.instructions);

        /* Create button to advance through the app */
        this.advanceBtn = document.createElement("button");
        this.advanceBtn.textContent = "START"; 
        this.#advanceBtnState = "START" // Assigns #start() method to button
        this.advanceBtn.addEventListener("click", () => this.#handleAdvanceBtnClick());
        this.container.appendChild(this.advanceBtn);

        /* Create button to move back through the app */
        this.previousBtn = document.createElement("button");
        this.previousBtn.textContent = "PREVIOUS";
        this.previousBtn.style.display = "none"; // Hidden initially
        this.previousBtn.addEventListener("click", () => this.#handlePreviousBtnClick());
        this.container.appendChild(this.previousBtn);
    }




    /* Event listener to change button methods */
    #handleAdvanceBtnClick() {
        if (this.#advanceBtnState === "START") { this.#start(); }
        else if (this.#advanceBtnState === "NEXT") { this.#next(); }
        else if (this.#advanceBtnState === "FINISH") { this.#finish(); }
        else if (this.#advanceBtnState === "SAVE") { this.#save(); }
    }

    /* If username is valid, hide field, show sketchpad and initialize app */
    #start() {
        const username = this.usernameField.value.trim(); // Remove leading and trailing whitespace
        if (this.#usernameIsValid(username)) {
            this.#data.username = username;
            this.usernameField.style.display = "none";

            this.instructions.textContent = `Please draw a ${this.#currentLabel}. `;

            this.advanceBtn.textContent = "NEXT";
            this.#advanceBtnState = "NEXT"; // Assigns #next() method to button

            this.sketchPad.container.style.display = ""; // Display sketchPad with default display value
        } else {
            this.usernameField.value = ""; 
        }
    }

    /* Advance through app state on button click */
    #next() {
        if (this.#canvasIsDrawnOn()) {
            /* Save current state in history before moving forward */
            this.#history.push({ label: this.#currentLabel, paths: [...this.sketchPad.paths] });
            
            this.previousBtn.disabled = false; // Enable previous button now the history is saved
            this.previousBtn.style.display = "";

            this.#saveAndResetCanvas();

            /* Move to the next label */
            this.#currentLabelIndex++;
            if (this.#currentLabelIndex >= this.#labels.length) {
                this.#finish(); // Finish the app if no more labels
            } else {
                this.#currentLabel = this.#labels[this.#currentLabelIndex] // Get next label

                this.instructions.textContent = `Please draw a ${this.#currentLabel}. `;
            }
        }
    }

    /* Once all user drawings have been provided, present data saving options */
    #finish() {
        this.sketchPad.container.style.display = "none";

        this.previousBtn.textContent = "GO BACK";

        this.instructions.textContent = "Thank you! "

        this.advanceBtn.textContent = "SAVE"; 
        this.#advanceBtnState = "SAVE"; // Assigns #save() method to button
    }




    /* Handle previous button click */
    #handlePreviousBtnClick() {
        if (this.previousBtn.textContent === "GO BACK") {
            /* If app was in finished state, change it back */ 
            this.previousBtn.textContent = "PREVIOUS";

            this.sketchPad.container.style.display = "";
        }

        const previousLabel = this.#getPreviousLabel();
        if (previousLabel !== null ) {
            this.instructions.textContent = `Please draw a ${previousLabel}. `;

            this.advanceBtn.textContent = "NEXT";
            this.#advanceBtnState = "NEXT"; // Re-assigns next method to button
        }

        /* Disable previous button if no more history */
        if (this.#history.length === 0) { this.previousBtn.disabled = true; }
    }

    /* Move back to the previous label */
    #getPreviousLabel() {
        if (this.#history.length === 0) {
            return null; // No previous label
        }

        const previousState = this.#history.pop();

        this.#currentLabelIndex--; // Move back in the index
        this.#currentLabel = previousState.label; // Get the previous label

        this.sketchPad.reset(previousState.paths); // Restore sketchpad paths

        return this.#currentLabel;
    }




    /* Input validation for user's name.
    70 characters, case insensitive, whitespace, hyphens
    and apostrophes are permitted */
    #usernameIsValid(username) {
        if (username.length <= 0) {
            alert("Please enter your name first!");

            return false;
        }
        /* 70 characters for full name field according to UK Gov Data Standards:
        https://webarchive.nationalarchives.gov.uk/ukgwa/+/http://www.cabinetoffice.gov.uk/media/254290/GDS%20Catalogue%20Vol%202.pdf */
        else if (username.length > 70) {
            alert("Name is too long!\n\n(Please keep to 70 characters in length.)");

            return false;
        }
        /* Regular expression to check if name is real:
        https://stackoverflow.com/questions/3073850/javascript-regex-test-peoples-name */
        else if (!/^\s*([a-z]{1,}([\.,] |[-']| )?)+[a-z]+\.?\s*$/i.test(username)) {
            alert("Please enter a valid name!\n\n(Upper/lower case letters, whitespace, hyphens and apostrophes permitted.)");

            return false;
        } 
        else { return true; }
    }

    /* Check if user has drawn on the sketchpad */
    #canvasIsDrawnOn() {
        if (this.sketchPad.paths.length === 0) {
            alert("Draw something first!");
            return false;
        } else { return true; }
    }

    /* Store the current drawing with the label name, and reset the sketchpad */
    #saveAndResetCanvas() {
        this.#data.drawings[this.#currentLabel] = this.sketchPad.paths;
        this.sketchPad.reset();
    }




    /* Downloads the data locally when button is clicked */
    #save() {
        this.instructions.textContent = "File downloaded! ";

        const jsonData = JSON.stringify(this.#data);

        /* Convert the data to JSON and create a blob object */
        const blob = new Blob([jsonData], { type: 'application/json' });

        const url = URL.createObjectURL(blob);
        
        const fileName = this.#data.session + ".json"; 

        /* Create a temporary anchor tag to download the file, and hide the element */
        const downloadElement = document.createElement("a");
        downloadElement.href = url;
        downloadElement.download = fileName;
        downloadElement.style.display = "none";
        /* Add element, start download and clean up */    
        this.container.appendChild(downloadElement);
        downloadElement.click();
        this.container.removeChild(downloadElement);

        URL.revokeObjectURL(url);
    }

}