/* Display loading bar while dataset_generator.js is running */

const utils = {};

utils.formatPercent = (n) => {
    return String((n*100).toFixed(2)) + "%";
}

utils.printProgress = (count, max) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    const percent = utils.formatPercent(count/max);
    process.stdout.write(`${count}/${max} (${percent})`);
}

/* Exports if running in node, and not browser environment */
if (typeof module !== "undefined") {
    module.exports = utils;
}