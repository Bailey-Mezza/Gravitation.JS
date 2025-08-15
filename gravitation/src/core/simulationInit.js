import { randomIntFromRange } from '../logic/utils.js';
import FarStars from './stars.js';

// Build initial scene: empty system + a background field of distant stars.
// World units; stars are static decoration (not simulated).
export function initBodies() {
  const distantStars = [];

  const STAR_COUNT = 4000;
  const X_RANGE = [-10000, 10000];
  const Y_RANGE = [-5000, 5000];

  for (let i = 0; i < STAR_COUNT; i++) {
    const x = randomIntFromRange(X_RANGE[0], X_RANGE[1]);
    const y = randomIntFromRange(Y_RANGE[0], Y_RANGE[1]);
    const radius = Math.random() * 1.5; // small variation in size of stars

    distantStars.push(new FarStars(x, y, radius));
  }

  // Start with no dynamic bodies; UI/presets will add them later.
  return {
    suns: [],
    planets: [],
    distantStars
  };
}
