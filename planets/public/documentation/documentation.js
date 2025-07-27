
const slideDescription = document.getElementById("slide-description");
const codeDescription = document.getElementById("code-block");


const slides = [
    {
        description: `
      <p>Welcome! This guide helps you integrate the physics renderer and engine from <strong>Gravitation.JS</strong> into your own project.</p>
      <p><strong>Step 1:</strong> Create an HTML file with a <code>&lt;canvas&gt;</code> element where the simulation will be drawn. You can set dimensions via attributes, CSS, or make it fullscreen in JS.</p>
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
      <p><strong>Step 3:</strong> Import the Engine and Renderer.</p>
    `,
        code: `<!-- Add this to main.js -->
import { PhysicsEngine } from './engine/physicsEngine.js';
import { Renderer } from './ui/renderer.js';`
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
        code: `<!-- Add this to main.js -->
const engine = new PhysicsEngine(suns, planets);
const renderer = new Renderer(canvas, ctx, camera, scaleRef);`
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


renderSlide(currentSlide);
refreshNav();


// 🔹 Step 1: Create Your HTML File
// Create an HTML file with a <canvas> element where the simulation will be drawn.

// html
// Copy
// Edit
// <!-- index.html -->
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <title>My Physics Project</title>
// </head>
// <body>
//   <canvas id="canvas" width="800" height="600"></canvas>

//   <script type="module" src="main.js"></script>
// </body>
// </html>
// 💡 Use type="module" in the script tag so ES6 imports work.

// 🔹 Step 2: Create Your JavaScript Entry File
// Create main.js in the same directory. This is where you'll write your custom logic using the engine.

// 🔹 Step 3: Import the Engine and Renderer
// In your main.js, import the required classes:

// js
// Copy
// Edit
// // main.js
// import { PhysicsEngine } from './engine/physicsEngine.js';
// import { Renderer } from './ui/renderer.js';
// 🔹 Step 4: Set Up Your Simulation
// Set up the canvas, camera, scale, and any objects like planets or suns.

// js
// Copy
// Edit
// const canvas = document.getElementById('canvas');
// const ctx = canvas.getContext('2d');

// const scaleRef = { value: 1 };
// const isPausedRef = { value: false };
// const camera = { x: 0, y: 0 };
// const planets = [];
// const suns = [];
// 🔹 Step 5: Create and Configure Engine and Renderer
// js
// Copy
// Edit
// const engine = new PhysicsEngine(suns, planets);
// const renderer = new Renderer(canvas, ctx, camera, scaleRef);
// You can add custom bodies like this:

// js
// Copy
// Edit
// suns.push({
//   position: { x: 0, y: 0 },
//   velocity: { x: 0, y: 0 },
//   mass: 10000,
//   radius: 50
// });

// planets.push({
//   position: { x: 300, y: 0 },
//   velocity: { x: 0, y: 2 },
//   mass: 1,
//   radius: 10
// });
// 🧠 You may want to use the actual Sun and Planet classes if you're exporting them too.

// 🔹 Step 6: Animate Your Simulation
// Start a simple loop to update and render each frame:

// js
// Copy
// Edit
// function loop() {
//   requestAnimationFrame(loop);

//   if (!isPausedRef.value) {
//     engine.simulateStep();
//   }

//   renderer.render([...suns, ...planets], [], null, isPausedRef.value);
// }

// loop();