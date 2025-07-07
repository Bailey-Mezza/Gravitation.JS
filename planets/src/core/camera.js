import { canvas } from './canvas.js';

export const camera = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

export function screenToWorld(x, y, scale) {
  return {
    x: (x - canvas.width / 2) / scale + camera.x,
    y: (y - canvas.height / 2) / scale + camera.y
  };
}
