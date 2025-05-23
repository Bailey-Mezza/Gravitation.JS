import { Body } from './body.js';
import { G } from "./constants.js";

var colorArray = [
    '#F4A261',
    '#2A9D8F',
    '#3A86FF',
    '#E76F51',
    '#FFBE0B',
    '#FB5607',
    '#8338EC',
    '#FF006E',
    '#6A994E',
    '#D4A373',
    '#118AB2',
    '#073B4C',
    '#F28482',
    '#8D99AE'
]

export class Planet extends Body {
    constructor(mass, position, velocity, radius) {
        super(mass, position, velocity, radius);
        this.color = colorArray[Math.random * colorArray.length-1];
        this.highlighted = false;
    }

    draw(content) {
        // Simple solid circle for a planet
        content.beginPath();
        content.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        if (this.highlighted) {
            content.fillStyle = 'rgb(255, 255, 255)'
        } else {
            content.fillStyle = this.color;
        }
        content.fill();
        content.closePath();
    }

    gravitate(child) {
        applyMutualGravity(this, child);
    }

    drawPredictedPath(content) {
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

export function applyMutualGravity(parent, child) {
    // Vector from child to sun
        let dx = parent.position.x - child.position.x;
        let dy = parent.position.y - child.position.y;

        // Distance between child and sun
        let r = Math.sqrt(dx * dx + dy * dy);

        // Avoid division by zero
        if (r === 0) return;

        // Force magnitude (mass can be included if needed)
        let force = G * parent.mass * child.mass / (r * r);

        let ax = force * dx / r / child.mass;
        let ay = force * dy / r / child.mass;
        let bx = -force * dx / r / child.mass;
        let by = -force * dy / r / child.mass;

        child.velocity.x += ax;
        child.velocity.y += ay;
        parent.velocity.x += bx;
        parent.velocity.x += by;
}