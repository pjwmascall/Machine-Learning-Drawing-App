/* Create an object with methods to create user drawings */
const draw = {};

draw.path = (ctx, path, color="black") => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    /* Move to first point in the path 
    (each item in path is an array of x,y mouse coordinates)*/
    ctx.moveTo(...path[0]);
    for (let i=1; i<path.length; i++) {
        ctx.lineTo(...path[i]);
    }
    ctx.stroke();
}

draw.paths = (ctx, paths, color="black") => {
    for (const path of paths) {
        draw.path(ctx, path, color);
    }
}