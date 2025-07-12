import Body from './body.js';
import { content } from '../core/canvas.js';
import { lightenColor, shadowColor } from '../logic/utils.js';


export default class Sun extends Body {
  constructor(mass, position, velocity, radius) {
    super(mass, position, velocity, radius);
    this.color = 'rgb(237, 223, 133)';
    this.highlighted = false;
  }

  draw() {
    const gradient = content.createRadialGradient(
      this.position.x, this.position.y, 0,
      this.position.x, this.position.y, this.radius * 2.5
    );
    
    const color = this.highlighted ? 'rgb(255, 255, 255)' : this.color

    const innerColor = lightenColor(this.color);
    gradient.addColorStop(0, innerColor);
    gradient.addColorStop(0.5, color);
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

  drawPredictedPath(followTarget = null, canvas) {
  if (!this.predictedPath || this.predictedPath.length < 2) return;

  content.beginPath();

  for (let i = 0; i < this.predictedPath.length; i++) {
    let x = this.predictedPath[i].x;
    let y = this.predictedPath[i].y;

    // Apply relative position if a follow target is set and is not this body
    if (
      followTarget &&
      followTarget !== this &&
      followTarget.predictedPath &&
      followTarget.predictedPath[i]
    ) {
      x -= followTarget.predictedPath[i].x;
      y -= followTarget.predictedPath[i].y;
    }

    // // Translate to screen coordinates (camera is now 0,0 because you're following)
    const screenX = x + canvas.width / 2;
    const screenY = y + canvas.height / 2;

    if (i === 0) {
      content.moveTo(screenX, screenY);
    } else {
      content.lineTo(screenX, screenY);
    }
  }

  content.strokeStyle = this.color;
  content.lineWidth = 1;
  content.setLineDash([5, 5]);
  content.stroke();
  content.setLineDash([]);
  content.closePath();
}

}
