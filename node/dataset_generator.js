/* Run with node: node dataset_generator.js */

/* Use canvas graphics API backed by Cairo: npm install canvas */
const {createCanvas} = require("canvas");
const canvas = createCanvas(400, 400);
const ctx = canvas.getContext("2d");

const constants = require("../common/constants.js");
const utils = require("../common/utils.js");
const draw = require("../common/draw.js");

const fs = require("fs");

const fileNames = fs.readdirSync(constants.RAW_DIR);
const samples = [];
let id = 1; // ID given to each individual sample
fileNames.forEach(fn => {
    const content = fs.readFileSync(
        constants.RAW_DIR + "/" + fn
    );
    /* 716 raw data files (5728 drawings) collected from https://github.com/gniziemazity/drawing-data/tree/main/data/raw
    These data files are in a different format than those produced by the Data Creator:
    "username" key is "student", and the key order is different.
    The following code formats and destructures the data correctly */
    const {session:user_id, student, username, drawings} = JSON.parse(content);
    const user_name = username !== undefined ? username : student;
    for (let label in drawings) {
        /* Write metadata for all samples to samples.json file in dataset folder */
        samples.push({
            id,
            label,
            user_name,
            user_id
        });

        /* Write all drawing data to json dataset folder with ids */
        const paths = drawings[label];
        fs.writeFileSync(
            constants.JSON_DIR + "/" + id + ".json",
            JSON.stringify(paths)
        );

        /* Generate images from the paths data */
        generateImageFile(
            constants.IMG_DIR + "/" + id + ".png",
            paths
        );

        /* Progress bar while generating images */
        utils.printProgress(id, fileNames.length*8) // Each file contains 8 drawings

        id++;
    }
});

/* Generate meta-data for samples */
fs.writeFileSync(constants.SAMPLES,
    JSON.stringify(samples)
);

/* Create list of samples metadata. Non-standard; written this way to avoid CORS, web servers and live server extension issues */
fs.writeFileSync(constants.SAMPLES_JS,
    `const samples = ${JSON.stringify(samples)};`
);

/* Code adapted from SketchPad.js */
function generateImageFile(outFile, paths) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw.paths(ctx, paths);

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outFile, buffer);
}