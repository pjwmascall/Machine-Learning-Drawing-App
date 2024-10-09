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

utils.groupBy = (objArray, key) => {
    const groups = {};
    for (let obj of objArray) {
        const val = obj[key];
        /* Loose comparator used for null */
        if (groups[val] == null) {
            groups[val] = [];
        }
        groups[val].push(obj);
    }
    return groups;
}

/* Exports if running in node, and not browser environment */
if (typeof module !== "undefined") {
    module.exports = utils;
}