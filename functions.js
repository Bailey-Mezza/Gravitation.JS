var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var content = canvas.getContext('2d');
content.fillStyle = '#000000'
content.fillRect(0, 0, canvas.width, canvas.height);

//variables
var mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
}

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

const G = 0.2;
let isPaused = false;
let scale = 1;


//Utility Functions
function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getDistance(x1, y1, x2, y2) {
    let xDistance = x2 - x1;
    let yDistance = y2 - y1;

    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

function applyMutualGravity(parent, child) {
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


//Objects
let camera = {
    x: canvas.width/2,
    y: canvas.height/2
};

class Body {
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
            { x: this.position.x, y: this.position.y },
            { x: this.velocity.x, y: this.velocity.y },
            this.radius
        );
    }
}

class Sun extends Body {
    constructor(mass, position, velocity, radius) {
        super(mass, position, velocity, radius);
        this.color = 'rgb(237, 223, 133)';
    }

    draw() {
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

class Planet extends Body {
    constructor(mass, position, velocity, radius) {
        super(mass, position, velocity, radius);
        this.color = colorArray[randomIntFromRange(0, colorArray.length-1)];
        this.highlighted = false;
    }

    draw() {
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

}


function FarStars(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius; 

    this.draw = () => {
        content.beginPath();
        content.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        content.fillStyle = 'rgba(255, 255, 255, 0.8)';
        content.fill();
        content.closePath();
    }
}


//Implementation
let sun, planet, planets, distantStars;
function init() {
    distantStars = [], planets = [];
    //const numofplanets = randomIntFromRange(5,10);

    //Far stars
    for (let index = 0; index < 4000; index++) {
        const x = randomIntFromRange(-10000, 10000);
        const y = randomIntFromRange(-5000, 5000);
        const radius = Math.random() * 1.5;
        distantStars.push(new FarStars(x, y, radius));
    }

    //Sun variables and declaration
    const sunMass = 10000;
    const sunPos = { x: canvas.width / 2, y: canvas.height / 2 };
    const sunVelocity = { x: 0, y: 0 };
    const sunRadius = 50;
    sun = new Sun(sunMass, sunPos, sunVelocity, sunRadius);

    //Planet variables and declaration
    for (let index = 0; index < 3 ; index++) {
        const planetMass = randomIntFromRange(20, 40);
        const planetRadius = 10;
        const maxRadius = Math.min(canvas.width, canvas.height) / 2 - planetRadius;
        const minimumOrbit = sunRadius + 100;
        const r = randomIntFromRange(minimumOrbit, maxRadius);
        const theta = Math.random() * Math.PI * 2;
        const planetPos = { x: sunPos.x + r * Math.cos(theta), y: sunPos.y + r * Math.sin(theta) };

        const orbitalSpeed = Math.sqrt(G * sunMass / r);
        const planetVelocity = {
            x: -orbitalSpeed * Math.sin(theta),
            y: orbitalSpeed * Math.cos(theta)
        };

        planets.push(new Planet(planetMass, planetPos, planetVelocity, planetRadius));
    }
}


//Animate loop
function animate() {
    requestAnimationFrame(animate);
    content.setTransform(1, 0, 0, 1, 0, 0);
    let alpha = 0.05
    content.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    content.fillRect(0, 0, canvas.width, canvas.height);
    //content.clearRect(0, 0, innerWidth, innerHeight);

    distantStars.forEach(farStar => {
        farStar.draw();
    })

    sun.update();

    for (let i = 0; i < planets.length; i++) {
        const planetA = planets[i];
        planetA.highlighted = false;
        sun.gravitate(planetA);
        for (let j = i + 1; j < planets.length; j++) {
            const planetB = planets[j];
            planetA.gravitate(planetB);
        }
        planetA.update();
    }
}

init();
animate();