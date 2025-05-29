import { G } from './constants.js';
import { randomIntFromRange } from './utils.js';
import { applyMutualGravity } from './utils.js';

import Sun from './bodies/Sun.js';
import Planet from './bodies/Planet.js';
import FarStars from './stars.js';
import { getDistance } from './utils.js';
import { screenToWorld } from './camera.js';

export function init(canvas) {
  const distantStars = [];
  const planets = [];

  // Create far stars
  for (let i = 0; i < 4000; i++) {
    const x = randomIntFromRange(-10000, 10000);
    const y = randomIntFromRange(-5000, 5000);
    const radius = Math.random() * 1.5;
    distantStars.push(new FarStars(x, y, radius));
  }

  // Create sun
  const sunMass = 10000;
  const sunRadius = 50;
  const sunPos = { x: canvas.width / 2, y: canvas.height / 2 };
  const sunVelocity = { x: 0, y: 0 };
  const sun = new Sun(sunMass, sunPos, sunVelocity, sunRadius);

  // Create planets
  for (let i = 0; i < 3; i++) {
    const planetMass = randomIntFromRange(20, 40);
    const planetRadius = 10;
    const r = randomIntFromRange(sunRadius + 100, canvas.height / 2 - planetRadius);
    const theta = Math.random() * 2 * Math.PI;
    const planetPos = {
      x: sunPos.x + r * Math.cos(theta),
      y: sunPos.y + r * Math.sin(theta),
    };

    const orbitalSpeed = Math.sqrt(G * sunMass / r);
    const planetVelocity = {
      x: -orbitalSpeed * Math.sin(theta),
      y: orbitalSpeed * Math.cos(theta),
    };

    planets.push(new Planet(planetMass, planetPos, planetVelocity, planetRadius));
  }

  return { sun, planets, distantStars };
}


export function predictAllPaths(planets, sun, steps = 10000) {
  const predictedPlanets = planets.map(p => p.clone());
  const predictedSun = sun.clone();
  const allBodies = [predictedSun, ...predictedPlanets];
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


export function animate({ content, canvas, camera, sun, planets, distantStars, mouse, scaleRef, isPausedRef, followTargetRef }) {
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
      if (!planets[0].predictedPath) {
        predictAllPaths(planets, sun);
      }

      const worldMouse = screenToWorld(mouse.x, mouse.y, scale);

      planets.forEach(planet => {
        planet.drawPredictedPath();

        const isHovered = getDistance(worldMouse.x, worldMouse.y, planet.position.x, planet.position.y) < planet.radius;
        planet.highlighted = isHovered;
        planet.draw();
      });

      sun.draw();
      return;
    }

    sun.update();

    for (let i = 0; i < planets.length; i++) {
      const planetA = planets[i];
      planetA.highlighted = false;
      sun.gravitate(planetA);
      for (let j = i + 1; j < planets.length; j++) {
        planetA.gravitate(planets[j]);
      }
      planetA.update();
    }
  }

  loop();
}
