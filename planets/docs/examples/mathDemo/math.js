import { PhysicsEngine } from '/planets/src/core/physicsEngine.js';

import Sun from '/planets/src/bodies/sun.js';
import Planet from '/planets/src/bodies/planet.js';

function updateUTCClock() {
    const clockEl = document.getElementById('utc-clock');
    const now = new Date();
    // format as HH:MM:SS in UTC
    const timeStr = now.toUTCString().split(' ')[4];
    clockEl.textContent = `UTC ${timeStr}`;
}


console.log("ello");



const isPausedRef = { value: false };
const planets = [];
const suns = [];
const engine = new PhysicsEngine(suns, planets);


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
    
    
}

loop();
updateUTCClock();
setInterval(updateUTCClock, 1000);