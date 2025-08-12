import { canvas, content } from './canvas.js';
import { camera } from './camera.js';
import { registerEvents } from '../ui/events.js';
import { registerMobileEvents } from '../ui/mobileEvents.js';
import { bindSliderToPrediction } from '../ui/userControls.js';
import { getPresets } from '../logic/utils.js';

import { initBodies } from './simulationInit.js';
import { PhysicsEngine } from './physicsEngine.js';
import { Renderer } from '../ui/renderer.js';

// Shared state
let planets = [], suns = [], distantStars = [], presets = [];
const scaleRef = { value: 1 };
const isPausedRef = { value: false };
const followTarget = { value: null };

async function start() {
  // Create initial bodies and load optional presets
  ({ suns, planets, distantStars } = initBodies());
  presets = await getPresets();

  // Core systems
  const engine = new PhysicsEngine(suns, planets);
  const renderer = new Renderer(canvas, content, camera, scaleRef);

  // Hook up UI slider to prediction feature
  bindSliderToPrediction(engine);

  //decides which event file user gets based on the device they are using
  const register = /Mobi|Android/i.test(navigator.userAgent)
    ? registerMobileEvents
    : registerEvents;

    // Wire up input events (click/drag/zoom etc.)
  register(planets, scaleRef, isPausedRef, followTarget, camera, suns, presets, engine);

  // Main loop: simulate then draw
  function loop() {
    requestAnimationFrame(loop);

    if (!isPausedRef.value) {
      //compute physics calculations using engine
      engine.simulateStep();
    } else if (planets.length > 0 && !planets[0].predictedPath) {
      // While paused, precompute trajectories once for UI
      let stepNumber = 10000; // how many steps to predict ahead
      engine.predictPaths(stepNumber);
    }

    //everything to be drawn and checked for collisions
    const allBodies = [...suns, ...planets];
    //rednder the scene
    renderer.render(allBodies, distantStars, followTarget.value, isPausedRef.value);
    renderer.checkCollisions(allBodies);
  }

  loop();
}

start();
