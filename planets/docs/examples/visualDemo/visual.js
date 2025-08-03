import { Renderer } from '/planets/src/ui/renderer.js';
import FarStars from '/planets/src/core/stars.js';
import { randomIntFromRange } from '/planets/src/logic/utils.js';

const canvas = document.getElementById('starfieldCanvas');
const ctx = canvas.getContext('2d');
let mouseDown = false;

addEventListener('mousedown',
    () => {
        mouseDown = true;
    }
)

addEventListener('mouseup',
    () => {
        mouseDown = false;
    }
)

const distantStars = [];

const scaleRef = { value: 1 };
const isPausedRef = { value: false };
const camera = { x: 0, y: 0 };

function init() {
    const canvasWidth = canvas.width + 1000;
    const canvasHeight = canvas.height + 1000;
    for (let index = 0; index < 2000; index++) {
        const x = randomIntFromRange(-canvasWidth / 2, canvasWidth / 2);
        const y = randomIntFromRange(-canvasHeight / 2, canvasHeight / 2);
        const radius = randomIntFromRange(0, 2);
        distantStars.push(new FarStars(x, y, radius));
    }
}

const renderer = new Renderer(canvas, ctx, camera, scaleRef);
renderer.angle = 0;

function loop() {
    requestAnimationFrame(loop);

    if (mouseDown) {
        renderer.angle += 0.005;
    } else {
        renderer.angle += 0.001;
    }

    renderer.render([], distantStars, null, isPausedRef.value);
}

init();
loop();

// Code copy and display
document.getElementById('copyButton').addEventListener('click', () => {
  const codeText = document.getElementById('code-block').innerText;

  navigator.clipboard.writeText(codeText)
    .then(() => {
      console.log('Code copied!');
      const btn = document.getElementById('copyButton');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 2000);
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
    });
});

document.getElementById('code-block').textContent = `import { Renderer } from '/planets/src/ui/renderer.js';
import FarStars from '/planets/src/core/stars.js';
import { randomIntFromRange } from '/planets/src/logic/utils.js';

const canvas = document.getElementById('starfieldCanvas');
const ctx = canvas.getContext('2d');
let mouseDown = false;

addEventListener('mousedown',
    () => {
        mouseDown = true;
    }
)

addEventListener('mouseup',
    () => {
        mouseDown = false;
    }
)

const distantStars = [];

const scaleRef = { value: 1 };
const isPausedRef = { value: false };
const camera = { x: 0, y: 0 };

const canvasWidth = canvas.width + 1000;
const canvasHeight = canvas.height + 1000;

function init() {
    const canvasWidth = canvas.width + 1000;
    const canvasHeight = canvas.height + 1000;
    for (let index = 0; index < 2000; index++) {
        const x = randomIntFromRange(-canvasWidth / 2, canvasWidth / 2);
        const y = randomIntFromRange(-canvasHeight / 2, canvasHeight / 2);
        const radius = randomIntFromRange(0, 2);
        distantStars.push(new FarStars(x, y, radius));
    }
}

const renderer = new Renderer(canvas, ctx, camera, scaleRef);
renderer.angle = 0;

function loop() {
    requestAnimationFrame(loop);

    if (mouseDown) {
        renderer.angle += 0.005;
    } else {
        renderer.angle += 0.001;
    }

    renderer.render([], distantStars, null, isPausedRef.value);
}

init();
loop();`;
