/*
 * This file is part of Gravitate.JS.
 *
 * Gravitate.JS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * Gravitate.JS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Gravitate.JS.  If not, see <https://www.gnu.org/licenses/>.
 */

import { canvas } from '../core/canvas.js';
import { screenToWorld } from '../core/camera.js';

// random integer function [min, max]
export function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/// returns the euclidean distance between two points in pixels
export function getDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Convert mouse event (screen) to world coords at current scale
export function getWorldMousePosition(event, scale) {
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    return screenToWorld(screenX, screenY, scale);
}

// Convenience: merge arrays of bodies into one array
export function getAllBodies(suns, planets) { 
  return [...suns, ...planets];
}

// Brighten an 'rgb' string a bit, clamped to 255
// Returns the original string if it doesn't match the rgb() pattern.
//Currently used to brighten the suns centers
export function lightenColor(rgb) {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return rgb;

    let [r, g, b] = match.slice(1).map(Number);
    r = Math.min(255, Math.floor(r * 1.075));
    g = Math.min(255, Math.floor(g * 1.143));
    b = Math.min(255, Math.floor(b * 1.503));

    return `rgb(${r}, ${g}, ${b})`;
  };

  // Shadow color based on an rgb() input; returns rgba(..., 0.8)
// Falls back to a dark shadow if parsing fails.
//Currently used for sun gradient edges
  export function shadowColor(rgb) {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return 'rgba(0, 0, 0, 0.8)';

  let [r, g, b] = match.slice(1).map(Number);
  r = Math.min(255, Math.floor(r * 1.075));
  g = Math.min(255, Math.floor(g * 1.143));
  b = Math.min(255, Math.floor(b * 0.751));

  return `rgba(${r}, ${g}, ${b}, 0.8)`;
}

// Convert hexadecimal color notation to 'rgb(r, g, b)'
// Returns null on invalid input.
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

// Convert 'rgb(r, g, b)' → '#rrggbb'
// Returns white on invalid input.
export function rgbToHex(rgb) {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return '#FFFFFF'; // fallback

  const [r, g, b] = match.slice(1).map(Number);

  const toHex = (n) => n.toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Load presets JSON (returns [] on error)
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

// Apply Newtonian gravity between two bodies (symmetrical)
// Mutates velocities in-place; assumes dt = 1 time unit.
export function applyMutualGravity(parent, child, G) {
  const dx = parent.position.x - child.position.x;
  const dy = parent.position.y - child.position.y;
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r === 0) return;// avoids divide-by-zero for overlapping bodies

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

