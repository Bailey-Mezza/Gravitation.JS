import { content } from '../core/canvas.js';

/**
 * Simple 2D circular body rendered on a Canvas.
 * Positions/velocities are in pixels and pixels-per-tick (no time delta).
 *
 * @typedef {{x:number, y:number}} Vec2
 *
 * @property {string} [name]            // Optional label (currently unused)
 * @property {number} mass              // Arbitrary mass; not used in rendering
 * @property {Vec2} position            // Current position on canvas (px)
 * @property {Vec2} velocity            // Change per update tick (px/tick)
 * @property {number} radius            // Circle radius in pixels
 * @property {string} color             // Fill color used for draw + path
 * @property {Vec2[]} [predictedPath]   // Optional points to draw as dashed path
 */
export default class Body {
  constructor(mass, position, velocity, radius) {
    this.name; //Can be set during initialisation, but currently optional
    this.mass = mass;
    this.position = position; //Expects {x, y}
    this.velocity = velocity;//Expects {x, y}
    this.radius = radius;
    this.color = 'rgb(237, 223, 133)';
  }

   /**
   * Draws the body as a filled circle.
   * @param {CanvasRenderingContext2D} [ctx=content] - Canvas 2D context.
   */
  draw(ctx = content) {
    //if no canvas has been initialized, drawing doesn't occur
    if (!ctx) return;            
    content.beginPath();
    content.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    content.fillStyle = this.color;
    content.fill();
    content.closePath();
  }

  //simple update integrator, updates every iteration
  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.draw();
  }

    /**
   * Create a shallow copy with new position/velocity objects so mutations
   * on the clone won't affect the original.
   * @returns {Body}
   */
  clone() {
    return new this.constructor(
      this.mass,
      { ...this.position },
      { ...this.velocity },
      this.radius
    );
  }

    /**
   * Draw a dashed line representing the predicted trajectory of the body.
   * Expects predictedPath to be an array of {x, y}.
   */
drawPredictedPath() {
    if (!this.predictedPath || this.predictedPath.length < 2) return;
    content.beginPath();
    content.moveTo(this.predictedPath[0].x, this.predictedPath[0].y);
    //connects each point in array
    for (let i = 1; i < this.predictedPath.length; i++) {
      content.lineTo(this.predictedPath[i].x, this.predictedPath[i].y);
    }
    //draw line
    content.strokeStyle = this.color;
    content.lineWidth = 1;
    content.setLineDash([5, 5]);
    content.stroke(); 
    content.setLineDash([]);
    content.closePath();
  }
}
