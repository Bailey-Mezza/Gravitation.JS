import { G } from '../logic/constants.js';
import { applyMutualGravity } from '../logic/utils.js';

export class PhysicsEngine {
  constructor(suns, planets) {
    this.suns = suns;
    this.planets = planets;
  }

  //convenient way to get all active bodies in a system
  getAllBodies() {
    return [...this.suns, ...this.planets];
  }

  simulateStep() {
    const bodies = this.getAllBodies();
    //nested for loop to apply gravity for each unique pair
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        applyMutualGravity(bodies[i], bodies[j], G);
      }
    }
    bodies.forEach(body => body.update());
  }

  // Predict future positions without changing the live bodies
  predictPaths(steps) {
    const clones = this.getAllBodies().map(b => b.clone());// independent copies
    const paths = clones.map(() => []); // path per body

    for (let step = 0; step < steps; step++) {
      // Gravity between clone pairs, same nested loop as simulateStep
      for (let i = 0; i < clones.length; i++) {
        for (let j = i + 1; j < clones.length; j++) {
          applyMutualGravity(clones[i], clones[j], G);
        }
      }

      // Integrate positions
      clones.forEach(body => {
        body.position.x += body.velocity.x;
        body.position.y += body.velocity.y;
      });

      // Record the point for each step bodies take
      clones.forEach((body, i) => {
        paths[i].push({ x: body.position.x, y: body.position.y });
      });
    }

    // Finally Attach predicted paths back to the real bodies for rendering
    this.getAllBodies().forEach((body, i) => {
      body.predictedPath = paths[i];
    });
  }
}
