class RetrieveLabels {

    static #cachedLabels = null; // Static property to store cached labels
    #labelsPromise;

    constructor(loadingContainer) {
        this.loadingContainer = loadingContainer;
        this.loadingContainer.classList.add("loading-spinner"); // Display loading spinner while labels are retrieved
        
        this.#labelsPromise = this.#initLabels(); // Store promise for label retrieval
    }

    /* Initialize the labels asynchronously */
    async #initLabels() {
        if (RetrieveLabels.#cachedLabels) {
            this.loadingContainer.classList.remove("loading-spinner");

            return RetrieveLabels.#cachedLabels; // If labels are cached, use them
        }

        try {
            RetrieveLabels.#cachedLabels = await this.#fetchLabels(); // Cache labels

            this.loadingContainer.classList.remove("loading-spinner");

            return RetrieveLabels.#cachedLabels;
        } catch (error) {
            this.loadingContainer.classList.remove("loading-spinner");
            this.loadingContainer.textContent = "Failed to load labels. Please try again.";
            
            throw error;
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
                } else { 
                    reject(new Error("Failed to fetch labels")); 
                }
            },
            1000) // Wait for 1000ms to simulate database fetch
        );
    }

    /* Public method to call from outside the class.
    Returns a promise that resolves to the labels once they are retrieved */
    async getLabels() {
        if (this.error) { throw this.error; }

        return await this.#labelsPromise; // Return the labels once the promise is resolved
    }
    
}      