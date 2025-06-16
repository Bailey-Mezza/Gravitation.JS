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

  // Create sun
  // const sunMass = 10000;
  // const sunRadius = 50;
  // const sunPos = { x: canvas.width / 2, y: canvas.height / 2 };
  // const sunVelocity = { x: 0, y: 0 };
  // const sun = new Sun(sunMass, sunPos, sunVelocity, sunRadius);

  // // Create planets
  // for (let i = 0; i < 3; i++) {
  //   const planetMass = randomIntFromRange(20, 40);
  //   const planetRadius = 10;
  //   const r = randomIntFromRange(sunRadius + 100, canvas.height / 2 - planetRadius);
  //   const theta = Math.random() * 2 * Math.PI;
  //   const planetPos = {
  //     x: sunPos.x + r * Math.cos(theta),
  //     y: sunPos.y + r * Math.sin(theta),
  //   };

  //   const orbitalSpeed = Math.sqrt(G * sunMass / r);
  //   const planetVelocity = {
  //     x: -orbitalSpeed * Math.sin(theta),
  //     y: orbitalSpeed * Math.cos(theta),
  //   };

  //   planets.push(new Planet(planetMass, planetPos, planetVelocity, planetRadius));
  // }

  // //Create moons 
  // planets.forEach(planet => {
  //   const moonMass = 2;
  //   const moonRadius = 3;

  //   const moonDistance = 30; // Distance from planet
  //   const theta = Math.random() * 2 * Math.PI;

  //   const moonPos = {
  //     x: planet.position.x + moonDistance * Math.cos(theta),
  //     y: planet.position.y + moonDistance * Math.sin(theta),
  //   };

  //   const orbitalSpeed = Math.sqrt(G * planet.mass / moonDistance);

  //   const moonVelocity = {
  //     x: planet.velocity.x - orbitalSpeed * Math.sin(theta),
  //     y: planet.velocity.y + orbitalSpeed * Math.cos(theta),
  //   };

  //   moons.push(new Moon(moonMass, moonPos, moonVelocity, moonRadius, planet));
  // });

  // return { sun, planets, moons, distantStars };
  return { sun: null, planets: [], moons: [], distantStars };
}


export function predictAllPaths(planets, sun, steps = 10000) {
  const predictedPlanets = planets.map(p => p.clone());
  const predictedSun = sun ? sun.clone() : null;
  const allBodies = predictedSun ? [predictedSun, ...predictedPlanets] : [...predictedPlanets];
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


export function animate({ content, canvas, camera, sun, planets, moons, distantStars, mouse, scaleRef, isPausedRef, followTargetRef }) {
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
      if (sun && planets.length && !planets[0].predictedPath) {
        predictAllPaths(planets, sun);
      }

      planets.forEach(planet => {
        planet.drawPredictedPath();
        planet.draw();
      });
      if (sun) {
        sun.draw();
      }
      return;
    }
    if (sun) {
      sun.update();
    }

    for (let i = 0; i < planets.length; i++) {
      const planetA = planets[i];
      planetA.highlighted = false;

      if (sun) {
        sun.gravitate(planetA);
      }

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
