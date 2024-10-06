class RetrieveLabels {

    #labels;
    #labelsPromise;

    constructor(loadingContainer) {
        this.loadingContainer = loadingContainer;
        this.loadingContainer.classList.add("loading-spinner"); // Display loading spinner while labels are retrieved
        this.#labels = [];
        this.error = null; // Track any error during label fetching
        this.#labelsPromise = this.#initLabels(); // Store promise for label retrieval
    }

    /* Initialize the labels asynchronously */
    async #initLabels() {
        try {
            this.#labels = await this.#fetchLabels();
            this.loadingContainer.classList.remove("loading-spinner");
            return this.#labels;
        }
        catch (error) {
            this.loadingContainer.classList.remove("loading-spinner")
            this.loadingContainer.textContent = "Failed to load labels. Please refresh and try again.";
            throw error; // Re-throw the error to propagate it
        }
    }

    /* Fetch the labels asynchronously */
    #fetchLabels() {
        return new Promise((resolve, reject) => 
            setTimeout(() => {
                const success = true; // Change to false to simulate an error
                if (success) {
                    /* Data labels */
                    resolve([
                        "car", "fish", "house",
                        "tree", "bicycle", "guitar",
                        "pencil", "clock"
                    ]);
                }
                else {
                    reject(new Error("Failed to fetch labels"));
                }
            },
            1000) // Wait for 1000ms to simulate database fetch
        );
    }

    /* Public method to call from outside the class.
    Returns a promise that resolves to the labels once they are retrieved */
    async getLabels() {
        if (this.error) {
            throw this.error;
        }
        return await this.#labelsPromise; // Return the labels once the promise is resolved
    }
    
}      