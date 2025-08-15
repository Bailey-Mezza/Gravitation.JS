/*
 * This file is part of Gravitate.JS.
 *
 * Gravitate.JS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * Gravitate.JS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Gravitate.JS.  If not, see <https://www.gnu.org/licenses/>.
 */

import { getDistance } from '../logic/utils.js';

export class Renderer {
  constructor(canvas, context, camera, scaleRef) {
    this.canvas = canvas;
    this.ctx = context;
    this.camera = camera;
    this.scaleRef = scaleRef;
 // Basic FPS tracking (smoothed over last N frames)
    this.fpsArray = [];
    this.maxArraySize = 30;
    this.lastFrameTime = performance.now();
    this.lastUpdateTime = performance.now();
    this.angle = 0;
  }

  render(bodies, distantStars, followTarget, isPaused) {
    const ctx = this.ctx;
    const scale = this.scaleRef.value;

    // If following a body, keep camera centered on it
    if (followTarget) {
      this.camera.x = followTarget.position.x;
      this.camera.y = followTarget.position.y;
    }

    // Clear with alpha (low alpha = motion trails when running)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = `rgba(0, 0, 0, ${isPaused ? 1 : 0.05})`;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // World transform: rotate around screen center (optional)
    //have to set this.angle manually
    ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    ctx.rotate(this.angle); // this.angle should be increasing in loop
    ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);

    // Camera + zoom (center screen, scale, then move world by camera)
    ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-this.camera.x, -this.camera.y);

     // Background stars
    distantStars.forEach(star => star.draw(ctx));

    //fps calculations
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    const fps = 1000 / delta;
    this.lastFrameTime = now;

    this.fpsArray.push(fps);
    if (this.fpsArray.length > this.maxArraySize) {
      this.fpsArray.shift();
    }

    const avgFps = this.fpsArray.reduce((a, b) => a + b, 0) / this.fpsArray.length;

    // DOM overlays, this UI is optional
    const fpsWarning = document.getElementById('fps-warning');
    if (fpsWarning) {
      fpsWarning.style.display = avgFps < 30 ? 'block' : 'none';
    }

    if (now - this.lastUpdateTime > 500) {
      const fpsData = document.getElementById('fps');
      if (fpsData) {
        fpsData.textContent = `FPS: ${Math.round(avgFps)}`;
      }
      this.lastUpdateTime = now;
    }

    const totalBodiesData = document.getElementById('total-bodies');
    if (totalBodiesData) {
      totalBodiesData.textContent = `Total Bodies: ${bodies.length}`;
    }

    // Draw predicted paths while paused, then draw the actual bodies
    bodies.forEach(body => {
      if (isPaused && body.predictedPath) {
        body.drawPredictedPath();
      }
      body.draw(ctx);
    });
  }

  // Returns the first colliding pair in the simulation (O(n^2)); null if none
  //May have future updates to further collision detection 
  checkCollisions(bodies) {
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const bodyA = bodies[i];
        const bodyB = bodies[j];

        const distance = getDistance(
          bodyA.position.x, bodyA.position.y,
          bodyB.position.x, bodyB.position.y
        );

        const minDistance = (bodyA.radius || 0) + (bodyB.radius || 0);
        if (distance <= minDistance) {
          return { bodyA, bodyB };
        }
      }
    }
    return null;
  } 
}
