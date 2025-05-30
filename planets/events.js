import { canvas } from './canvas.js';
import { screenToWorld, camera } from './camera.js';
import { getDistance } from './utils.js';

export function registerEvents(mouse, planets, scaleRef, isPausedRef, followTargetRef, cameraRef) {
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
        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;

        const worldMouse = screenToWorld(screenX, screenY, scaleRef.value);
        for (let planet of planets) {
            const dist = getDistance(worldMouse.x, worldMouse.y, planet.position.x, planet.position.y);
            if (dist < planet.radius) {
                draggingPlanet = planet;
                offsetX = worldMouse.x - planet.position.x;
                offsetY = worldMouse.y - planet.position.y;
                break;
            }
        }
    });

    window.addEventListener('mousemove', function (event) {
        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;

        const worldMouse = screenToWorld(screenX, screenY, scaleRef.value);

        if (draggingPlanet) {
            draggingPlanet.position.x = worldMouse.x - offsetX;
            draggingPlanet.position.y = worldMouse.y - offsetY;
        }
    });

    window.addEventListener('mouseup', function () {
        draggingPlanet = null;
    });
}
