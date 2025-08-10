import { PhysicsEngine } from '/planets/src/core/physicsEngine.js';
import { Renderer } from '/planets/src/ui/renderer.js';
import { randomIntFromRange } from '/planets/src/logic/utils.js';
import Sun from '/planets/src/bodies/sun.js';
import Planet from '/planets/src/bodies/planet.js';
const canvas = document.getElementById('starfieldCanvas');
const ctx = canvas.getContext('2d');

const scaleRef = { value: 1 };
const isPausedRef = { value: false };
const camera = { x: 0, y: 0 };
const planets = [];
const suns = [];
const G = 0.2;

const engine = new PhysicsEngine(suns, planets);
const renderer = new Renderer(canvas, ctx, camera, scaleRef);

suns.push(new Sun(
    10000,                    // mass
    { x: 0, y: 0 },           // position
    { x: 0, y: 0 },           // velocity
    50                        // radius
));

for (let index = 0; index < 1000; index++) {
    const planetMass = randomIntFromRange(1, 20);
    const planetRadius = randomIntFromRange(1, 15);;
    const maxRadius = Math.min(canvas.width, canvas.height) / 2 - planetRadius;
    //sun radius + 100
    const minimumOrbit = 150;
    const r = randomIntFromRange(minimumOrbit, maxRadius);
    const theta = Math.random() * Math.PI * 2;
    //sun position relative to planet
    const planetPos = { x: 0 + r * Math.cos(theta), y: 0 + r * Math.sin(theta) };

    //sun mass relative to velocity
    const orbitalSpeed = Math.sqrt(G * 10000 / r);
    const planetVelocity = {
        x: -orbitalSpeed * Math.sin(theta),
        y: orbitalSpeed * Math.cos(theta)
    };

    planets.push(new Planet(planetMass, planetPos, planetVelocity, planetRadius));
}

function loop() {
    requestAnimationFrame(loop);

    if (!isPausedRef.value) {
        engine.simulateStep();
    }

    renderer.render([...suns, ...planets], [], null, isPausedRef.value);
}

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

document.getElementById('code-block').textContent = `import { PhysicsEngine } from '/planets/src/core/physicsEngine.js';
import { Renderer } from '/planets/src/ui/renderer.js';
import { randomIntFromRange } from '/planets/src/logic/utils.js';
import Sun from '/planets/src/bodies/sun.js';
import Planet from '/planets/src/bodies/planet.js';
const canvas = document.getElementById('starfieldCanvas');
const ctx = canvas.getContext('2d');

const scaleRef = { value: 1 };
const isPausedRef = { value: false };
const camera = { x: 0, y: 0 };
const planets = [];
const suns = [];
const G = 0.2;

const engine = new PhysicsEngine(suns, planets);
const renderer = new Renderer(canvas, ctx, camera, scaleRef);

suns.push(new Sun(
    10000,                    // mass
    { x: 0, y: 0 },           // position
    { x: 0, y: 0 },           // velocity
    50                        // radius
));

for (let index = 0; index < 1000; index++) {
    const planetMass = randomIntFromRange(1, 20);
    const planetRadius = randomIntFromRange(1, 15);;
    const maxRadius = Math.min(canvas.width, canvas.height) / 2 - planetRadius;
    //sun radius + 100
    const minimumOrbit = 150;
    const r = randomIntFromRange(minimumOrbit, maxRadius);
    const theta = Math.random() * Math.PI * 2;
    //sun position relative to planet
    const planetPos = { x: 0 + r * Math.cos(theta), y: 0 + r * Math.sin(theta) };

    //sun mass relative to velocity
    const orbitalSpeed = Math.sqrt(G * 10000 / r);
    const planetVelocity = {
        x: -orbitalSpeed * Math.sin(theta),
        y: orbitalSpeed * Math.cos(theta)
    };

    planets.push(new Planet(planetMass, planetPos, planetVelocity, planetRadius));
}

function loop() {
    requestAnimationFrame(loop);

    if (!isPausedRef.value) {
        engine.simulateStep();
    }

    renderer.render([...suns, ...planets], [], null, isPausedRef.value);
}

loop();`;

document.getElementById("expandButton").addEventListener("click", function() {
  const container = document.querySelector(".code-container");
  container.classList.toggle("fullscreen");
  
  // Change button text depending on state
  this.textContent = container.classList.contains("fullscreen") ? "Close" : "Expand";
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelector(".code-container").classList.remove("fullscreen");
    document.getElementById("expandButton").textContent = "Expand";
  }
});