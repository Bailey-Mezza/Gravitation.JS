import Body from './body.js';
import { content } from '../core/canvas.js';
import { lightenColor, shadowColor } from '../logic/utils.js';


export default class Sun extends Body {
  constructor(name, mass, position, velocity, radius) {
    super(name, mass, position, velocity, radius);
    this.color = 'rgb(237, 223, 133)';
    this.highlighted = false;
  }

  draw(ctx = content) {
    if (!ctx) return;            
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
}
