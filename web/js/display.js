function createRow(container, userName, samples) {
    const row = document.createElement("div");
    row.classList.add("row");
    container.appendChild(row);

    const rowLabel = document.createElement("div");
    rowLabel.textContent = userName;
    rowLabel.classList.add("rowLabel");
    row.appendChild(rowLabel);

    for (let sample of samples) {
        const {id, label} = sample;

        const sampleContainer = document.createElement("div");
        sampleContainer.id = "sample_" + id;
        sampleContainer.classList.add("sampleContainer");

        const sampleLabel = document.createElement("div");
        sampleLabel.textContent = label;
        sampleContainer.appendChild(sampleLabel);

        const img = document.createElement("img");
        img.src = constants.IMG_DIR + "/" + id + ".png";
        img.loading = "lazy";
        img.alt = label;
        img.classList.add("thumb");
        sampleContainer.appendChild(img);
        row.appendChild(sampleContainer);
    }
}