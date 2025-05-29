import { content } from './canvas.js';

export default function FarStars(x, y, radius) {
  this.x = x;
  this.y = y;
  this.radius = radius;

  this.draw = () => {
    content.beginPath();
    content.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    content.fillStyle = 'rgba(255, 255, 255, 0.8)';
    content.fill();
    content.closePath();
  };
}
