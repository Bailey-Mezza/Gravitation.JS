import { Body } from './body.js';

export class Sun extends Body {
    constructor(mass, position, velocity, radius) {
        super(mass, position, velocity, radius);
        this.color = 'rgb(237, 223, 133)';
    }

    draw(content) {
        // More intense glow for the sun
        const gradient = content.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, this.radius * 2.5
        );
        gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');

        content.shadowColor = 'rgba(255, 255, 100, 0.8)';
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