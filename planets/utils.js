import { canvas } from './canvas.js';
import { screenToWorld } from './camera.js';

export function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getWorldMousePosition(event, scale) {
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    return screenToWorld(screenX, screenY, scale);
}

export function applyMutualGravity(parent, child, G) {
  const dx = parent.position.x - child.position.x;
  const dy = parent.position.y - child.position.y;
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r === 0) return;

  const force = G * parent.mass * child.mass / (r * r);

  // Directional force vector components
  const fx = force * dx / r;
  const fy = force * dy / r;

  // Acceleration = force / mass
  child.velocity.x += fx / child.mass;
  child.velocity.y += fy / child.mass;

  parent.velocity.x -= fx / parent.mass;
  parent.velocity.y -= fy / parent.mass;
}

