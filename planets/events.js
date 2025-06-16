import { canvas } from './canvas.js';
import { camera } from './camera.js';
import { getDistance, getWorldMousePosition } from './utils.js';
import { predictAllPaths } from './simulation.js';
import Planet from './bodies/Planet.js';
import { updateEditorUI, bindEditorEvents } from './userControls.js';

export function registerEvents(mouse, planets, scaleRef, isPausedRef, followTargetRef, cameraRef, sun) {
    let draggingPlanet = null;
    let offsetX = 0;
    let offsetY = 0;
    let didDrag = false;
    let lastMouseEvent = null;


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
            for (let planet of planets) {
                const dist = getDistance(lastMouseEvent.x, lastMouseEvent.y, planet.position.x, planet.position.y);
                // console.log('Mouse world position:', worldMouse);
                // console.log('Planet position:', planet.position);
                // console.log('Distance:', dist, 'Radius:', planet.radius)
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

        if (event.code === 'KeyI' && isPausedRef.value) {
            for (let planet of planets) {
                const dist = getDistance(lastMouseEvent.x, lastMouseEvent.y, planet.position.x, planet.position.y);
                let selectedPlanet = null;
                if (dist < planet.radius) {
                    if (selectedPlanet === planet) {
                        selectedPlanet = null;
                        updateEditorUI(null);
                    } else {
                        selectedPlanet = planet;
                        updateEditorUI(planet);
                        bindEditorEvents(planet);
                    }
                    break;
                }
            }
        }
    });

    window.addEventListener('mousedown', () => {
        if (!isPausedRef.value) return;
        didDrag = false;

        for (let planet of planets) {
            const dist = getDistance(lastMouseEvent.x, lastMouseEvent.y, planet.position.x, planet.position.y);
            if (dist < planet.radius) {
                didDrag = true;
                draggingPlanet = planet;
                offsetX = lastMouseEvent.x - planet.position.x;
                offsetY = lastMouseEvent.y - planet.position.y;
                break;
            }
        }
    });

    window.addEventListener('mousemove', function (event) {
        const worldMouse = getWorldMousePosition(event, scaleRef.value);
        lastMouseEvent = worldMouse;

        if (isPausedRef.value && lastMouseEvent.x > (canvas.width / 5) && lastMouseEvent.x < canvas.width-(canvas.width / 5)) {
            canvas.style.cursor = 'crosshair';
        } else {
            canvas.style.cursor = 'default';
        }

        for (let planet of planets) {
            planet.highlighted = false;
        }

        for (let planet of planets) {
            const dist = getDistance(worldMouse.x, worldMouse.y, planet.position.x, planet.position.y);
            if (dist < planet.radius) {
                canvas.style.cursor = 'default';
                planet.highlighted = true;
                //console.log(planet.highlighted);
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

    window.addEventListener('click', function () {
        if (didDrag || !isPausedRef.value) return;

        let clickedOnPlanet = false;
        for (let planet of planets) {
            const dist = getDistance(lastMouseEvent.x, lastMouseEvent.y, planet.position.x, planet.position.y);
            if (dist < planet.radius) {
                clickedOnPlanet = true;
                break;
            }
        }

        if (lastMouseEvent.x > (canvas.width / 5) && lastMouseEvent.x < canvas.width-(canvas.width / 5)) {
            if (!clickedOnPlanet) {
                const planetMass = 10;
                const planetRadius = 10;
                const planetPos = {
                    x: lastMouseEvent.x,
                    y: lastMouseEvent.y
                };
                const planetVelocity = {
                    x: 1,
                    y: -1
                };
                planets.push(new Planet(planetMass, planetPos, planetVelocity, planetRadius));
            }
        }

    });
}
