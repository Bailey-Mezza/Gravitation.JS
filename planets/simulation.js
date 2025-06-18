import { G } from './constants.js';
import { randomIntFromRange } from './utils.js';
import { applyMutualGravity } from './utils.js';

import Sun from './bodies/Sun.js';
import Planet from './bodies/Planet.js';
import FarStars from './stars.js';
import { screenToWorld } from './camera.js';
import Moon from './bodies/moon.js';

export function init(canvas) {
  const distantStars = [];
  const planets = [];
  const moons = [];

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
  const predictedPlanets = planets.map(p => p.clone());
  const predictedSuns = suns.map(s => s.clone());
  const allBodies = [...predictedSuns, ...predictedPlanets];
  const paths = predictedPlanets.map(() => []);

  for (let step = 0; step < steps; step++) {
    for (let i = 0; i < allBodies.length; i++) {
      for (let j = i + 1; j < allBodies.length; j++) {
        applyMutualGravity(allBodies[i], allBodies[j], G);
      }
    }

    predictedPlanets.forEach((planet, i) => {
      planet.position.x += planet.velocity.x;
      planet.position.y += planet.velocity.y;
      paths[i].push({ x: planet.position.x, y: planet.position.y });
    });
  }

  planets.forEach((planet, i) => {
    planet.predictedPath = paths[i];
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

    if (isPaused) {
      if (suns.length && planets.length && !planets[0].predictedPath) {
        predictAllPaths(planets, suns);
      }

      planets.forEach(planet => {
        planet.drawPredictedPath();
        planet.draw();
      });
      suns.forEach(sun => sun.draw());
      return;
    }
    suns.forEach(sun => sun.update());

    for (let i = 0; i < planets.length; i++) {
      const planetA = planets[i];
      planetA.highlighted = false;

      suns.forEach(sun => sun.gravitate(planetA));

      for (let j = i + 1; j < planets.length; j++) {
        planetA.gravitate(planets[j]);
      }

      planetA.update();
    }


    // moons.forEach(moon => {
    //   moon.update();
    //   console.log(moon);
    // });
  }
  loop();
}
