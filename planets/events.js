import { canvas } from './canvas.js';
import { screenToWorld, camera } from './camera.js';
import { getDistance, getWorldMousePosition } from './utils.js';
import { predictAllPaths } from './simulation.js';

export function registerEvents(mouse, planets, scaleRef, isPausedRef, followTargetRef, cameraRef, sun) {
    let draggingPlanet = null;
    let offsetX = 0;
    let offsetY = 0;

    window.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;


    });

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
            const worldMouse = screenToWorld(mouse.x, mouse.y, scale);

            for (let planet of planets) {
                const dist = getDistance(worldMouse.x, worldMouse.y, planet.position.x, planet.position.y);
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
    });

    window.addEventListener('mousedown', (event) => {
        if (!isPausedRef.value) return;

        const worldClick = getWorldMousePosition(event, scaleRef.value);

        for (let planet of planets) {
            const dist = getDistance(worldClick.x, worldClick.y, planet.position.x, planet.position.y);
            if (dist < planet.radius) {
                draggingPlanet = planet;
                offsetX = worldClick.x - planet.position.x;
                offsetY = worldClick.y - planet.position.y;
                break;
            }
        }
    });

    window.addEventListener('mousemove', function (event) {
        if (draggingPlanet && isPausedRef.value) {
            const worldMouse = getWorldMousePosition(event, scaleRef.value);
            draggingPlanet.position.x = worldMouse.x - offsetX;
            draggingPlanet.position.y = worldMouse.y - offsetY;
            predictAllPaths(planets, sun); 
        }
    });

    window.addEventListener('mouseup', function () {
        draggingPlanet = null;
    });
}
