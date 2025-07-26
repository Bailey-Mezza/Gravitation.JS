
document.getElementById("slide-description").textContent = "Step 1: Create an HTML file...";
document.getElementById("code-block").textContent = `// your code here...`;

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