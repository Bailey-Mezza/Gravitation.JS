import Body from './body.js';
import { content } from '../core/canvas.js';
import { lightenColor, shadowColor } from '../logic/utils.js';


export default class Sun extends Body {
  constructor(mass, position, velocity, radius) {
    super(mass, position, velocity, radius);
    this.color = 'rgb(237, 223, 133)';
  }

  draw() {
    const gradient = content.createRadialGradient(
      this.position.x, this.position.y, 0,
      this.position.x, this.position.y, this.radius * 2.5
    );
    
    const innerColor = lightenColor(this.color);
    gradient.addColorStop(0, innerColor);
    gradient.addColorStop(0.5, this.color);
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');

    const shadow = shadowColor(this.color);
    content.shadowColor = shadow;
    content.shadowBlur = 50;

    content.beginPath();
    content.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    content.fillStyle = gradient;
    content.fill();
    content.closePath();

    content.shadowColor = 'transparent';
    content.shadowBlur = 0;
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
