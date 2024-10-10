import * as PIXI from 'pixi.js';

const app = new PIXI.Application();
await app.init({
    width: 480,
    height: 720,
    backgroundColor: 0x1099bb
});
document.body.appendChild(app.canvas);

// Center the canvas using CSS
app.view.style.position = 'absolute';
app.view.style.top = '50%';
app.view.style.left = '50%';
app.view.style.transform = 'translate(-50%, -50%)';

const shape = new PIXI.Graphics();
shape.beginFill(0xff0000);
shape.drawPolygon([
    -50, 50,   // Point 1
    50, 50,    // Point 2
    0, -50     // Point 3
]);
shape.endFill();

// Calculate the centroid of the triangle
const points = [-50, 50, 50, 50, 0, -50];
const centroidX = (points[0] + points[2] + points[4]) / 3;
const centroidY = (points[1] + points[3] + points[5]) / 3;

// Set the pivot to the centroid of the triangle
shape.pivot.set(centroidX, centroidY);

// Add the shape to the stage
app.stage.addChild(shape);

let angle = 0;

app.ticker.add(() => {
    angle += 0.05;
    shape.rotation = Math.sin(angle);
});

function resize() {
    const aspectRatio = 16 / 9;
    const width = window.innerWidth;
    const height = window.innerHeight;
    let newWidth, newHeight;

    if (width / height > aspectRatio) {
        newHeight = height;
        newWidth = height * aspectRatio;
    } else {
        newWidth = width;
        newHeight = width / aspectRatio;
    }

    app.renderer.resize(newWidth, newHeight);

    const scale = newWidth / 480; // Assuming 480 is the original width
    shape.scale.set(scale);

    shape.x = app.screen.width / 2;
    shape.y = app.screen.height / 2;
}

window.addEventListener('resize', resize);
resize();
