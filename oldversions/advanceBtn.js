/* Wait until the ID of last required DOM element appears before setting attributes */
waitForContentLoad('#sketchPadContainer').then((content) => {
    sketchPadContainer.style.visibility = "hidden";

    advanceBtn.textContent = "START";
    advanceBtn.onclick = start;
});

/* Initialize index for list of data labels */
let labelIndex = 0;

/* Get name of user, then serve first data creation sketch pad */
function start() {
    if(username.value.length === 0) {
        alert ("Please enter your name first!");
        return;
    }
    else {

        data.username = username.value;
        username.style.display = "none";

        if (labels.length > 0) {
            sketchPadContainer.style.visibility = "visible";

            const label = labels[labelIndex];        
            instructions.textContent = `Please draw a ${label}.`;
            
            advanceBtn.textContent = "NEXT";
            advanceBtn.onclick = next;
        }
        else {
            instructions.textContent = "No labels loaded.";
            advanceBtn.textContent = "TRY AGAIN";
        }
    }
}

/* Serve next data creation sketch pad until all labels are associated with data */
function next() {
    if (sketchPad.paths.length === 0) {
        alert("Draw something first!");
        return;
    }
    else {
        const label = labels[labelIndex];
        data.drawings[label] = sketchPad.paths;
        sketchPad.reset();
        labelIndex++;
        if (labelIndex < labels.length) {
            const nextLabel = labels[labelIndex];
            instructions.textContent = `Please draw a ${nextLabel}.`; 
        }
        /* When data produced for all labels, create save button */
        else {
            sketchPadContainer.style.visibility = "hidden";
            instructions.textContent = "Thank you!";
            advanceBtn.textContent = "SAVE";
            advanceBtn.onclick = localSave;
        }
    }
}

/* Save created data locally */
function localSave() {
    advanceBtn.style.display = "none";
    instructions.textContent = "Take your downloaded file and place it alongside the others in the dataset!"
    
    const downloadElement = document.createElement("a");
    downloadElement.setAttribute(
        "href",
        "data:text/plain;charset=UTF-8," +
        encodeURIComponent(JSON.stringify(data))
    )

    const fileName = data.session + ".json";
    downloadElement.setAttribute("download", fileName);
    downloadElement.style.display = "none";
    
    document.body.appendChild(downloadElement);
    downloadElement.click();
    document.body.removeChild(downloadElement);
}