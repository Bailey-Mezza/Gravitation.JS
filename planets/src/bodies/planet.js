import Body from './body.js';
import { colorArray } from '../logic/constants.js';
import { content } from '../core/canvas.js';
import { randomIntFromRange } from '../logic/utils.js';

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
