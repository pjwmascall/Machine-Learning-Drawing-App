/* Adapted from SketchPad.js, used in dataset_generator.js */

const draw = {};

/* Basic canvas drawing functionality */
draw.path = (ctx, path, color="black") => {
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
draw.paths = (ctx, paths, color="black") => {
    for (const path of paths) { draw.path(ctx, path, color); }
}

/* Exports if running in node, and not browser environment */
if(typeof module !== "undefined") {
    module.exports = draw;
}