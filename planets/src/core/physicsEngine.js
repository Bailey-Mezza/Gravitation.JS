import { G } from '../logic/constants.js';
import { applyMutualGravity } from '../logic/utils.js';

export class PhysicsEngine {
  constructor(suns, planets) {
    this.suns = suns;
    this.planets = planets;
  }

  getAllBodies() {
    return [...this.suns, ...this.planets];
  }

  simulateStep() {
    const bodies = this.getAllBodies();
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        applyMutualGravity(bodies[i], bodies[j], G);
      }
    }
    bodies.forEach(body => body.update());
  }

  predictPaths(steps) {
    const clones = this.getAllBodies().map(b => b.clone());
    const paths = clones.map(() => []);

    for (let step = 0; step < steps; step++) {
      for (let i = 0; i < clones.length; i++) {
        for (let j = i + 1; j < clones.length; j++) {
          applyMutualGravity(clones[i], clones[j], G);
        }
      }

      clones.forEach(body => {
        body.position.x += body.velocity.x;
        body.position.y += body.velocity.y;
      });

      clones.forEach((body, i) => {
        paths[i].push({ x: body.position.x, y: body.position.y });
      });
    }

    this.getAllBodies().forEach((body, i) => {
      body.predictedPath = paths[i];
    });
  }
}
