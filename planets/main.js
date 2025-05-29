import { canvas } from './canvas.js';
import { content } from './canvas.js';
import { camera, screenToWorld } from './camera.js';
import { G } from './constants.js';
import { registerEvents } from './events.js';
import { randomIntFromRange } from './utils.js';

import Sun from './bodies/Sun.js';
import Planet from './bodies/Planet.js';
import FarStars from './stars.js';

import { init, animate } from './simulation.js';

// Shared state
export let mouse = { x: innerWidth / 2, y: innerHeight / 2 };
export let planets = [];
export let sun = null;
export let distantStars = [];
export let scale = 1;
export let isPaused = false;

// References passed to event handlers
const scaleRef = { value: scale };
const isPausedRef = { value: isPaused };

// Register user interaction events
registerEvents(mouse, planets, scaleRef, isPausedRef);

// Initialize and start simulation
function start() {
  ({ sun, planets, distantStars } = init(canvas));
  animate({ content, canvas, camera, sun, planets, distantStars, mouse, scaleRef, isPausedRef });
}

start();
