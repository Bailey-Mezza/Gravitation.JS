import { canvas } from './canvas.js';
import { screenToWorld, camera } from './camera.js';
import { getDistance } from './utils.js';

export function registerEvents(mouse, planets, scaleRef, isPausedRef) {
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
  });

  window.addEventListener('click', (event) => {
    if (!isPausedRef.value) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;

    const worldClick = screenToWorld(screenX, screenY, scaleRef.value);
    for (let planet of planets) {
      const dist = getDistance(worldClick.x, worldClick.y, planet.position.x, planet.position.y);
      if (dist < planet.radius) {
        console.log('Clicked planet:', planet);
        break;
      }
    }
  });
}
