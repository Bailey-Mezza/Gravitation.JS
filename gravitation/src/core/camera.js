// camera.js
import { canvas } from './canvas.js';

/**
 * Get the current drawable size in *device pixels*.
 * Uses canvas.width/height or falls back to the window size.
 */
const size = () => ({
  w: canvas?.width ?? window.innerWidth,
  h: canvas?.height ?? window.innerHeight
});

// Centered camera that doesn't move until manually setting x/y, it stays centered on current size.
export const camera = {
  _x: null,
  _y: null,
  get x() { return (this._x ?? size().w / 2); },
  set x(v) { this._x = v; },
  get y() { return (this._y ?? size().h / 2); },
  set y(v) { this._y = v; }
};

//Convert pixel coordinates to world coordinates.
//Screen coordinates are assumed top-left origin while the world coords are centered on the camera.
export function screenToWorld(x, y, scale = 1) {
  const { w, h } = size();
  return {
    x: (x - w / 2) / scale + camera.x,
    y: (y - h / 2) / scale + camera.y
  };
}
