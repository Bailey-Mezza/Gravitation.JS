
import { PhysicsEngine } from '/planets/src/core/physicsEngine.js';
import { Renderer } from '/planets/src/ui/renderer.js';
import Sun from '/planets/src/bodies/sun.js';
import Planet from '/planets/src/bodies/planet.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const scaleRef = { value: 1 };
const isPausedRef = { value: false };
const camera = { x: 0, y: 0 };
const planets = [];
const suns = [];

const engine = new PhysicsEngine(suns, planets);
const renderer = new Renderer(canvas, ctx, camera, scaleRef);

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
));


function loop() {
  requestAnimationFrame(loop);

  if (!isPausedRef.value) {
    engine.simulateStep();
  }

  renderer.render([...suns, ...planets], [], null, isPausedRef.value);
}

loop();