import { getDistance } from '../logic/utils.js';

export class Renderer {
  constructor(canvas, context, camera, scaleRef) {
    this.canvas = canvas;
    this.ctx = context;
    this.camera = camera;
    this.scaleRef = scaleRef;

    this.fpsArray = [];
    this.maxArraySize = 30;
    this.lastFrameTime = performance.now();
    this.lastUpdateTime = performance.now();
  }

  render(bodies, distantStars, followTarget, isPaused) {
    const ctx = this.ctx;
    const scale = this.scaleRef.value;

    if (followTarget) {
      this.camera.x = followTarget.position.x;
      this.camera.y = followTarget.position.y;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = `rgba(0, 0, 0, ${isPaused ? 1 : 0.05})`;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    ctx.rotate(this.angle); // this.angle should be increasing in loop
    ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);

    ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-this.camera.x, -this.camera.y);

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

    // DOM overlays (optional UI)
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

    bodies.forEach(body => {
      if (isPaused && body.predictedPath) {
        body.drawPredictedPath(followTarget, this.canvas, ctx);
      }
      body.draw(ctx);
    });
  }

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
