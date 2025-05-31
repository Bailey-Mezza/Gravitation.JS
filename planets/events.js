import { canvas } from './canvas.js';
import { G } from './constants.js';
import { screenToWorld, camera } from './camera.js';
import { getDistance, getWorldMousePosition } from './utils.js';
import { predictAllPaths } from './simulation.js';
import Planet from './bodies/Planet.js';

export function registerEvents(mouse, planets, scaleRef, isPausedRef, followTargetRef, cameraRef, sun) {
    let draggingPlanet = null;
    let offsetX = 0;
    let offsetY = 0;
    let didDrag = false;


    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    window.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            isPausedRef.value = !isPausedRef.value;
        }
        if (!isPausedRef.value) return;

        const panSpeed = 20 / scaleRef.value;
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                camera.y -= panSpeed; break;
            case 'ArrowDown':
            case 'KeyS':
                camera.y += panSpeed; break;
            case 'ArrowLeft':
            case 'KeyA':
                camera.x -= panSpeed; break;
            case 'ArrowRight':
            case 'KeyD':
                camera.x += panSpeed; break;
            case 'Digit1':
                scaleRef.value = Math.min(scaleRef.value + 0.05, 2); break;
            case 'Digit2':
                scaleRef.value = Math.max(scaleRef.value - 0.05, 0.1); break;
        }

        if (event.code === 'KeyO' && isPausedRef.value) {
            const scale = scaleRef.value;
            const worldMouse = getWorldMousePosition(event, scaleRef.value);

            for (let planet of planets) {
                const dist = getDistance(worldMouse.x, worldMouse.y, planet.position.x, planet.position.y);
                // console.log('Mouse world position:', worldMouse);
                // console.log('Planet position:', planet.position);
                console.log('Distance:', dist, 'Radius:', planet.radius)
                if (dist < planet.radius) {

                    if (followTargetRef.value === planet) {
                        followTargetRef.value = null;
                    } else {
                        followTargetRef.value = planet;
                        cameraRef.x = planet.position.x;
                        cameraRef.y = planet.position.y;
                    }
                    break;
                }
            }
        }
    });

    window.addEventListener('mousedown', (event) => {
        if (!isPausedRef.value) return;
        didDrag = false;

        const worldMouse = getWorldMousePosition(event, scaleRef.value);

        for (let planet of planets) {
            const dist = getDistance(worldMouse.x, worldMouse.y, planet.position.x, planet.position.y);
            if (dist < planet.radius) {
                didDrag = true;
                draggingPlanet = planet;
                offsetX = worldMouse.x - planet.position.x;
                offsetY = worldMouse.y - planet.position.y;
                break;
            }
        }
    });

    window.addEventListener('mousemove', function (event) {
        const worldMouse = getWorldMousePosition(event, scaleRef.value);
        
        for (let planet of planets) {
            planet.highlighted = false;
        }
        
        for (let planet of planets) {
            const dist = getDistance(worldMouse.x, worldMouse.y, planet.position.x, planet.position.y);
            if (dist < planet.radius) {
                planet.highlighted = true;
                console.log(planet.highlighted);
                
                break;
            }
        }

        if (draggingPlanet && isPausedRef.value) {
            draggingPlanet.position.x = worldMouse.x - offsetX;
            draggingPlanet.position.y = worldMouse.y - offsetY;
            predictAllPaths(planets, sun);
        }
    });

    window.addEventListener('mouseup', function () {
        draggingPlanet = null;
    });

    window.addEventListener('click', function (event) {
        if (didDrag || !isPausedRef.value) return;

        const worldMouse = getWorldMousePosition(event, scaleRef.value);

        let clickedOnPlanet = false;
        for (let planet of planets) {
            const dist = getDistance(worldMouse.x, worldMouse.y, planet.position.x, planet.position.y);
            if (dist < planet.radius) {
                clickedOnPlanet = true;
                break;
            }
        }

        if (!clickedOnPlanet) {
            const planetMass = 40;
            const planetRadius = 10;
            const r = 75;
            const theta = Math.random() * 2 * Math.PI;
            const planetPos = {
                x: worldMouse.x,
                y: worldMouse.y
            };

            const orbitalSpeed = Math.sqrt(G * 10000 / r);
            const planetVelocity = {
                x: -orbitalSpeed * Math.sin(theta),
                y: orbitalSpeed * Math.cos(theta),
            };
            planets.push(new Planet(planetMass, planetPos, planetVelocity, planetRadius));
        }
    });
}
