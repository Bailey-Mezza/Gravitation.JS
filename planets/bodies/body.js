import { content } from '../canvas.js';
import { G } from '../constants.js';

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

  gravitate(child) {
        // Vector from child to sun
        let dx = this.position.x - child.position.x;
        let dy = this.position.y - child.position.y;

        // Distance between child and sun
        let r = Math.sqrt(dx * dx + dy * dy);

        // Avoid division by zero
        if (r === 0) return;

        // Force magnitude (mass can be included if needed)
        let force = G * this.mass * child.mass / (r * r);

        let ax = force * dx / r / child.mass;
        let ay = force * dy / r / child.mass;
        // let bx = -force * dx / r / child.mass;
        // let by = -force * dy / r / child.mass;

        child.velocity.x += ax;
        child.velocity.y += ay;
        // this.velocity.x += bx;
        // this.velocity.x += by;
    }

  clone() {
    return new this.constructor(
      this.mass,
      { ...this.position },
      { ...this.velocity },
      this.radius
    );
  }
}
