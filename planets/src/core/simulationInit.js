import { randomIntFromRange } from '../logic/utils.js';
import FarStars from './stars.js';

export function initBodies() {
  const distantStars = [];

  for (let i = 0; i < 4000; i++) {
    const x = randomIntFromRange(-10000, 10000);
    const y = randomIntFromRange(-5000, 5000);
    const radius = Math.random() * 1.5;
    distantStars.push(new FarStars(x, y, radius));
  }

  return {
    suns: [],
    planets: [],
    distantStars
  };
}
