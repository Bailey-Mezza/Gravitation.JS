import { G } from './constants.js';
import { randomIntFromRange } from './utils.js';
import { applyMutualGravity } from './utils.js';

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


export function predictAllPaths(planets, suns = [], steps = 10000) {
  const allBodies = [...suns, ...planets].map(b => b.clone());
  const paths = allBodies.map(() => []);
  //console.log([paths]);

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
  });
}


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
    
    if (isPaused) {
      if (suns.length && planets.length && !planets[0].predictedPath) {
        predictAllPaths(planets, suns);
      }
      allBodies.forEach(body => {
        body.drawPredictedPath();
        body.draw();
      });
      return;
    }
    
    for (let i = 0; i < allBodies.length; i++) {
      for (let j = i + 1; j < allBodies.length; j++) {
        applyMutualGravity(allBodies[i], allBodies[j], G);
      }
    }
    allBodies.forEach(body => body.update());

  }
  loop();
}
