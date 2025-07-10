import { canvas } from '../core/canvas.js';
import { screenToWorld } from '../core/camera.js';
import { presets } from '../core/main.js';

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

export function getAllBodies(suns, planets) { 
  return [...suns, ...planets];
}

export function lightenColor(rgb) {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return rgb;

    let [r, g, b] = match.slice(1).map(Number);
    r = Math.min(255, Math.floor(r * 1.075));
    g = Math.min(255, Math.floor(g * 1.143));
    b = Math.min(255, Math.floor(b * 1.503));

    return `rgb(${r}, ${g}, ${b})`;
  };

  export function shadowColor(rgb) {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return 'rgba(0, 0, 0, 0.8)';

  let [r, g, b] = match.slice(1).map(Number);
  r = Math.min(255, Math.floor(r * 1.075));
  g = Math.min(255, Math.floor(g * 1.143));
  b = Math.min(255, Math.floor(b * 0.751));

  return `rgba(${r}, ${g}, ${b}, 0.8)`;
}

export function hexToRGB(hex) {
  const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthand, (_, r, g, b) =>
    r + r + g + g + b + b
  );

  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return null;

  const [r, g, b] = match.slice(1).map(x => parseInt(x, 16));
  return `rgb(${r}, ${g}, ${b})`;
}

export function rgbToHex(rgb) {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return '#000000'; // fallback

  const [r, g, b] = match.slice(1).map(Number);

  const toHex = (n) => n.toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export async function getPresets() {
  try {
    const res = await fetch('../public/presets.json');
    if (!res.ok) throw new Error("Failed to load presets");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error loading presets:", err);
    return [];
  }
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

