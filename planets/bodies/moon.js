// Moon.js
import Body from './body.js';

export default class Moon extends Body {
  constructor(mass, position, velocity, radius, hostPlanet) {
    super(mass, position, velocity, radius);
    this.color = 'gray';
    this.hostPlanet = hostPlanet;
  }

  update() {
    // Gravitational force from host planet
    this.hostPlanet.gravitate(this);
    super.update();
  }
}
