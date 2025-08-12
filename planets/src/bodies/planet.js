import Body from './body.js';
import { colorArray } from '../logic/constants.js';
import { content } from '../core/canvas.js';
import { randomIntFromRange } from '../logic/utils.js';

/**
 * Planet extends Body with a name and an ability to be "highlighted".
 * Units: position in px, velocity in px/tick. Rendering on Canvas2D.
 *
 * @typedef {{x:number, y:number}} Vec2
 *
 * @param {string} name
 * @param {number} mass
 * @param {Vec2} position
 * @param {Vec2} velocity
 * @param {number} radius
 */
export default class Planet extends Body {
  constructor(mass, position, velocity, radius) {
    super(mass, position, velocity, radius);
    this.color = colorArray[randomIntFromRange(0, colorArray.length - 1)];
    this.highlighted = false;
  }

  draw(ctx = content) {
    if (!ctx) return;            
    content.beginPath();
    content.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    content.fillStyle = this.highlighted ? 'rgb(255, 255, 255)' : this.color;
    content.fill();
    content.closePath();
  }
}
