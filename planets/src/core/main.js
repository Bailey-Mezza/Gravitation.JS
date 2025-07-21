/*
This is the old code for my main followed by the new code for my main which is more decoupled. 
The idea is that users can import parts of the code they like and add their own code if they
want to add their own ideas to the simulation.
*/

// import { canvas, content } from './canvas.js';
// import { camera } from './camera.js';
// import { registerEvents } from '../ui/events.js';
// import { registerMobileEvents } from '../ui/mobileEvents.js';
// import { bindSliderToPrediction } from '../ui/userControls.js';
// import { getPresets } from '../logic/utils.js';

// import { init, animate } from './simulation.js';

// // Shared state
// export let planets = [];
// export let suns = [];
// export let distantStars = [];
// export let scale = 1;
// export let isPaused = false;
// export let followTarget = { value: null };
// export let presets = [];

// // References passed to event handlers
// const scaleRef = { value: scale };
// const isPausedRef = { value: isPaused };

// //Recognise if mobile device is being used 
// const isMobile = /Mobi|Android/i.test(navigator.userAgent);
// console.log(isMobile);


// // Initialize and start simulation
// async function start() {
//     const initData = init(canvas);
//     suns = initData.suns;
//     planets = initData.planets;
//     distantStars = initData.distantStars;
//     presets = await getPresets();

//     bindSliderToPrediction(planets, suns);

//     if (isMobile) {
//         registerMobileEvents(
//             planets,
//             scaleRef,
//             isPausedRef,
//             followTarget,
//             camera,
//             suns,
//             presets
//         );
//     } else {
//         registerEvents(
//             planets,
//             scaleRef,
//             isPausedRef,
//             followTarget,
//             camera,
//             suns,
//             presets
//         );
//     }

//     animate({
//         content, canvas, camera,
//         suns, planets, distantStars,
//         scaleRef, isPausedRef,
//         followTargetRef: followTarget
//     });
// }

// start();

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
const mouse = { x: innerWidth / 2, y: innerHeight / 2 };

async function start() {
  ({ suns, planets, distantStars } = initBodies(canvas));
  presets = await getPresets();

  const engine = new PhysicsEngine(suns, planets);
  const renderer = new Renderer(canvas, content, camera, scaleRef);

  bindSliderToPrediction(engine);

  const register = /Mobi|Android/i.test(navigator.userAgent)
    ? registerMobileEvents
    : registerEvents;

  register(planets, scaleRef, isPausedRef, followTarget, camera, suns, presets, engine);

  function loop() {
    requestAnimationFrame(loop);

    if (!isPausedRef.value) {
      engine.simulateStep();
    } else if (planets.length > 0 && !planets[0].predictedPath) {
      engine.predictPaths(10000);
    }

    const allBodies = [...suns, ...planets];
    renderer.render(allBodies, distantStars, followTarget.value, isPausedRef.value);
    renderer.checkCollisions(allBodies);
  }

  loop();
}

start();
