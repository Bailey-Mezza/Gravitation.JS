import { G } from '../logic/constants.js';
import { randomIntFromRange, applyMutualGravity, getDistance } from '../logic/utils.js';
import FarStars from './stars.js';

export function init(canvas) {
  const distantStars = [];

  // Create far stars
  for (let i = 0; i < 4000; i++) {
    const x = randomIntFromRange(-10000, 10000);
    const y = randomIntFromRange(-5000, 5000);
    const radius = Math.random() * 1.5;
    distantStars.push(new FarStars(x, y, radius));
  }

  return { suns: [], planets: [], moons: [], distantStars };
}

export function predictAllPaths(planets, suns = []) {
  const allBodies = [...suns, ...planets].map(b => b.clone());
  const paths = allBodies.map(() => []);
  //console.log([paths]);

  const stepsInput = document.getElementById('total-steps');
  const steps = stepsInput ? parseInt(stepsInput.value, 10) : 10000;

  for (let step = 0; step < steps; step++) {
    for (let i = 0; i < allBodies.length; i++) {
      for (let j = i + 1; j < allBodies.length; j++) {
        applyMutualGravity(allBodies[i], allBodies[j], G);
      }
    }

    allBodies.forEach(body => {
      body.position.x += body.velocity.x;
      body.position.y += body.velocity.y;
    });

    allBodies.forEach((body, i) => {
      paths[i].push({ x: body.position.x, y: body.position.y });
    });
  }

  [...suns, ...planets].forEach((body, i) => {
    body.predictedPath = paths[i];

    //began working on perspective orbital paths, still needs work 
    //if (allBodies[i] === followTarget) {
    //         followTarget.predictedPath = paths[i];
    //     }
  });
}

let lastFrameTime, lastUpdateTime = performance.now();
let fps = 0;
const fpsArray = [];
const maxArraySize = 30;

export function animate({ content, canvas, camera, suns, planets, moons, distantStars, mouse, scaleRef, isPausedRef, followTargetRef }) {
  function loop() {
    requestAnimationFrame(loop);

    const scale = scaleRef.value;
    const isPaused = isPausedRef.value;
    const followTarget = followTargetRef.value;

    if (followTarget) {
      camera.x = followTarget.position.x;
      camera.y = followTarget.position.y;
    }

    content.setTransform(1, 0, 0, 1, 0, 0);
    content.fillStyle = `rgba(0, 0, 0, ${isPaused ? 1 : 0.05})`;
    content.fillRect(0, 0, canvas.width, canvas.height);

    content.translate(canvas.width / 2, canvas.height / 2);
    content.scale(scale, scale);
    content.translate(-camera.x, -camera.y);

    distantStars.forEach(star => star.draw());

    const allBodies = [...suns, ...planets];

    //FPS CALCULATION DIAGNOSTICS
    const now = performance.now();
    const delta = now - lastFrameTime;
    fps = 1000 / delta;
    lastFrameTime = now;

    fpsArray.push(fps);
    if (fpsArray.length > maxArraySize) {
      fpsArray.shift();
    }

    const avgFps = fpsArray.reduce((a, b) => a + b, 0) / fpsArray.length;

    const fpsWarning = document.getElementById('fps-warning');
    if (fpsWarning) {
      if (avgFps < 30) {
        fpsWarning.style.display = 'block';
      } else {
        fpsWarning.style.display = 'none';
      }
    }

    if (now - lastUpdateTime > 500) {
      const fpsData = document.getElementById('fps');
      if (fpsData) {
        fpsData.textContent = `FPS: ${Math.round(avgFps)}`;
      }
      lastUpdateTime = now;
    }

    //TOTAL BODY DIAGNOSTICS
    const totalBodiesData = document.getElementById('total-bodies');
    if (totalBodiesData) {
      totalBodiesData.textContent = `Total Bodies: ${allBodies.length}`;
    }

    if (isPaused) {
      if (suns.length && planets.length && !planets[0].predictedPath) {
        predictAllPaths(planets, suns);
      }

      allBodies.forEach(body => {
        body.drawPredictedPath(followTargetRef.value, canvas);
        body.draw();
      });
      return;
    }

    for (let i = 0; i < allBodies.length; i++) {
      for (let j = i + 1; j < allBodies.length; j++) {
        const bodyA = allBodies[i];
        const bodyB = allBodies[j];

        const distance = getDistance(
          bodyA.position.x, bodyA.position.y,
          bodyB.position.x, bodyB.position.y
        );

        const minDistance = (bodyA.radius || 0) + (bodyB.radius || 0);

        if (distance <= minDistance) {
          console.log("collision detected between", bodyA, "and", bodyB);
          // May add features to merge bodies, bounce them, or stop them in the future
        }

        applyMutualGravity(bodyA, bodyB, G);
      }
    }
    allBodies.forEach(body => {
      body.update()
      if (getDistance()) {
        console.log("collision detected");

      }
    });
  }

  loop();
}



