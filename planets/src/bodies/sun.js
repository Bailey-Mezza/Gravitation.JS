import Body from './body.js';
import { content } from '../core/canvas.js';
import { lightenColor, shadowColor } from '../logic/utils.js';

/**
 * Sun: a glowing Body with a radial gradient + shadow "halo".
 * Units: position in px, velocity in px/tick. Renders on Canvas2D.
 *
 * @typedef {{x:number, y:number}} Vec2
 *
 * @param {string} name
 * @param {number} mass
 * @param {Vec2} position
 * @param {Vec2} velocity
 * @param {number} radius
 */
export default class Sun extends Body {
  constructor( mass, position, velocity, radius) {
    super( mass, position, velocity, radius);
    // Base "sunny" color; used for gradient + shadow unless highlighted.
    this.color = 'rgb(237, 223, 133)';
    // When true, becomes brighter (currently switches mid color to white).
    this.highlighted = false;
  }

  draw(ctx = content) {
    if (!ctx) return;  
     // Creates a cool radial gradient centered on the sun.
    // Inner radius = 0, outer radius = 2.5x the circle radius (extends the glow).          
    const gradient = content.createRadialGradient(
      this.position.x, this.position.y, 0,
      this.position.x, this.position.y, this.radius * 2.5
    );
    
        // If highlighted, make the middle of the gradient white to pop.
    const color = this.highlighted ? 'rgb(255, 255, 255)' : this.color

     // Color stops go from bright center -> base/white mid -> transparent edge.
    const innerColor = lightenColor(this.color);
    gradient.addColorStop(0, innerColor);
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');

   // Soft outer glow using canvas shadows.
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
