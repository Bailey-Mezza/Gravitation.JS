// camera.js
import { canvas } from './canvas.js';

const size = () => ({
  w: canvas?.width ?? window.innerWidth,
  h: canvas?.height ?? window.innerHeight
});

// Lazy-centered camera: until you set x/y, it stays centered on current size.
export const camera = {
  _x: null,
  _y: null,
  get x() { return (this._x ?? size().w / 2); },
  set x(v) { this._x = v; },
  get y() { return (this._y ?? size().h / 2); },
  set y(v) { this._y = v; }
};

export function screenToWorld(x, y, scale = 1) {
  const { w, h } = size();
  return {
    x: (x - w / 2) / scale + camera.x,
    y: (y - h / 2) / scale + camera.y
  };
}
