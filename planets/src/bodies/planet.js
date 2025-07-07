import Body from './body.js';
import { colorArray, G } from '../logic/constants.js';
import { content } from '../core/canvas.js';
import { randomIntFromRange, applyMutualGravity } from '../logic/utils.js';

export default class Planet extends Body {
  constructor(mass, position, velocity, radius) {
    super(mass, position, velocity, radius);
    this.color = colorArray[randomIntFromRange(0, colorArray.length - 1)];
    this.highlighted = false;
  }

  draw() {
    content.beginPath();
    content.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    content.fillStyle = this.highlighted ? 'rgb(255, 255, 255)' : this.color;
    content.fill();
    content.closePath();
  }

  gravitate(child) {
    applyMutualGravity(this, child, G);
  }

  drawPredictedPath() {
    if (!this.predictedPath || this.predictedPath.length < 2) return;
    content.beginPath();
    content.moveTo(this.predictedPath[0].x, this.predictedPath[0].y);
    for (let i = 1; i < this.predictedPath.length; i++) {
      content.lineTo(this.predictedPath[i].x, this.predictedPath[i].y);
    }
    content.strokeStyle = this.color;
    content.lineWidth = 1;
    content.setLineDash([5, 5]);
    content.stroke(); 
    content.setLineDash([]);
    content.closePath();
  }
}
