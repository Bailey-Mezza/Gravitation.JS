
const slideDescription = document.getElementById("slide-description");
const codeDescription = document.getElementById("code-block");


const slides = [
    {
        description: `
      <p>Welcome! This guide helps you integrate the physics renderer and engine from <strong>Gravitation.JS</strong> into your own project.</p>
      <p><strong>Step 1:</strong> Create a HTML file with a <code>&lt;canvas&gt;</code> element where the simulation will be drawn. You can set dimensions via attributes, CSS, or make it fullscreen in JS.</p>
    `,
        code: `<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>My Physics Project</title>
</head>
<body>
  <canvas id="canvas" width="800" height="600"></canvas>
</body>
</html>`
    },

    {
        description: `
      <p><strong>Step 2:</strong> Link a JavaScript file to your HTML using a <code>&lt;script type="module"&gt;</code> tag.</p>
    `,
        code: `<!-- Add this to the bottom of index.html -->
<script type="module" src="main.js"></script>`
    },
    {
        description: `
      <p><strong>Step 3:</strong> Import the Engine, Renderer, as well as any Celestial Body classes you intend to use.</p>
    `,
        code: `<!-- Add this to main.js -->
import { PhysicsEngine } from '/planets/src/core/physicsEngine.js';
import { Renderer } from '/planets/src/ui/renderer.js';
import Sun from '/planets/src/bodies/sun.js';
import Planet from '/planets/src/bodies/planet.js';`

    },
    {
        description: `
      <p><strong>Step 4:</strong> Set up the canvas, camera, scale, and any objects like planets or suns.</p>
    `,
        code: `<!-- Add this to main.js -->
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const scaleRef = { value: 1 };
const isPausedRef = { value: false };
const camera = { x: 0, y: 0 };
const planets = [];
const suns = [];`
    },
    {
        description: `
      <p><strong>Step 5:</strong> Create and Configure Engine and Renderer.</p>
    `,
        code: `<!-- Optionally, add this to main.js -->
const engine = new PhysicsEngine(suns, planets);
const renderer = new Renderer(canvas, ctx, camera, scaleRef);`
    },
    {
        description: `
      <p><strong>Step 6:</strong> If you want, add a sun and planet to your project.</p>
    `,
        code: `<!-- Add this to main.js -->
suns.push(new Sun(
  10000,                    // mass
  { x: 0, y: 0 },           // position
  { x: 0, y: 0 },           // velocity
  50                        // radius
));

planets.push(new Planet(
  1,                        // mass
  { x: 300, y: 0 },         // position
  { x: 0, y: 2 },           // velocity
  10                        // radius
));`
    },

    {
        description: `
      <p><strong>Step 7:</strong> Animate Your Simulation! Start a simple loop to update and render each frame. <br> <br>
<button onclick="window.location.href='./test.html'" class="glow-button">See It in Action</button></p>
    `,
        code: `<!-- Add this to main.js -->
function loop() {
  requestAnimationFrame(loop);

  if (!isPausedRef.value) {
    engine.simulateStep();
  }

  renderer.render([...suns, ...planets], [], null, isPausedRef.value);
}

loop();`
    },
];



function refreshNav() {
    if (currentSlide === 0) {
        prevSlideBtn.classList.remove('active');
        prevSlideBtn.classList.add('inactive');
    } else {
        prevSlideBtn.classList.remove('inactive');
        prevSlideBtn.classList.add('active');
    }

    if (currentSlide === slides.length - 1) {
        nextSlideBtn.classList.remove('active');
        nextSlideBtn.classList.add('inactive');
    } else {
        nextSlideBtn.classList.remove('inactive');
        nextSlideBtn.classList.add('active');
    }
}


let currentSlide = 0;

function renderSlide(index) {
    const slide = slides[index];
    slideDescription.innerHTML = slide.description;
    codeDescription.textContent = slide.code;
}

const nextSlideBtn = document.getElementById('nextSlide');
const prevSlideBtn = document.getElementById('prevSlide');

nextSlideBtn.addEventListener('click', () => {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        renderSlide(currentSlide);
        refreshNav();
    }
});

prevSlideBtn.addEventListener('click', () => {
    if (currentSlide > 0) {
        currentSlide--;
        renderSlide(currentSlide);
        refreshNav();
    }
});

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



renderSlide(currentSlide);
refreshNav();