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


const focusBodyUI = {
    name: document.querySelector('[data-field="name"]'),
    mass: document.querySelector('[data-field="mass"]'),
    radius: document.querySelector('[data-field="radius"]'),
    velocity: document.querySelector('[data-field="velocity"]'),
};

const fmt = (n, digits = 3) =>
    Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: digits }) : '—';

const focusBody = () => planets[2]; 

function updateFocusUI() {
  const p = focusBody();
  if (!p) return;
  // Name: use p.name if you have one, else a sensible default
  focusBodyUI.name.textContent = p.name ?? 'PLANET';

  focusBodyUI.mass.textContent   = `${fmt(p.mass)} earth weight (ew)`;
  focusBodyUI.radius.textContent = `${fmt(p.radius)} km`;

  const vx = p.velocity?.x ?? NaN;
  const vy = p.velocity?.y ?? NaN;
  focusBodyUI.velocity.textContent = `(${fmt(vx)}, ${fmt(vy)}) au/s`;
}


const isPausedRef = { value: false };
const planets = [];
const suns = [];
const engine = new PhysicsEngine(suns, planets);


//Solar System 
//The Sun
suns.push(new Sun(
  333054,                       // mass
  { x: 758, y: 281 },           // position
  { x: 0, y: 0 },               // velocity
  695700                           // radius
));

//Mercury
planets.push(new Planet(
  0.055,                        // mass
  { x: 1145.736842105263, y: 296.6842105263158 }, // position
  { x: 0, y: -13 },             // velocity
  2439                             // radius
));

//Venus
planets.push(new Planet(
  0.81,                         // mass
  { x: 1258.5263157894735, y: 312.85087719298247 },
  { x: 1, y: -11.5 },
  6051
));

//Earth
planets.push(new Planet(
  1,                            // mass
  { x: 1364.7676767676771, y: 319.3181818181818 },
  { x: 1, y: -10.4 },
  6371
));

//Mars
planets.push(new Planet(
  0.01,                         // mass
  { x: 1466.5858585858591, y: 315.68181818181813 },
  { x: 1, y: -9.74 },
  3389
));

//Jupiter
planets.push(new Planet(
  317,                          // mass
  { x: 1827.0404040404046, y: 309.09090909090907 },
  { x: 1, y: -7.8 },
  69911
));

//Saturn
planets.push(new Planet(
  95,                           // mass
  { x: 2176.5555555555566, y: 320.5 },
  { x: 1, y: -7.01 },
  58232
));

//Uranus
planets.push(new Planet(
  14,                           // mass
  { x: 2575.9365079365098, y: 320.3571428571429 },
  { x: 1, y: -6.2 },
  25362
));

//Neptune
planets.push(new Planet(
  17,                           // mass
  { x: 2886.888888888891, y: 325.8333333333333 },
  { x: 1, y: -5.9 },
  24622
));

const planetNames = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];

for (let index = 0; index < planets.length; index++) {
    planets[index].name = planetNames[index];
}


function loop() {
    requestAnimationFrame(loop);

    if (!isPausedRef.value) {
        engine.simulateStep();
    }
}

loop();
updateUTCClock();
updateFocusUI();
setInterval(updateFocusUI, 500);
setInterval(updateUTCClock, 1000);