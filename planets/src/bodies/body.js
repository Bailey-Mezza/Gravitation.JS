import { content } from '../core/canvas.js';
import { G } from '../logic/constants.js';
import { applyMutualGravity } from '../logic/utils.js';

export default class Body {
  constructor(mass, position, velocity, radius) {
    this.mass = mass;
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.color = 'rgb(237, 223, 133)';
  }

  draw() {
    content.beginPath();
    content.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    content.fillStyle = this.color;
    content.fill();
    content.closePath();
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.draw();
  }

  clone() {
    return new this.constructor(
      this.mass,
      { ...this.position },
      { ...this.velocity },
      this.radius
    );
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
