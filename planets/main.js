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

//event listeners
window.addEventListener('mousemove', 
    function (event) {
        mouse.x = event.x;
        mouse.y = event.y;
})

window.addEventListener('resize', 
    function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
})

//Utility Functions
function randomIntFromRange(min,max) {
    return Math.floor(Math.random() * (max-min+1) + min);
}

//Objects
function Sun(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = 'rgb(237, 223, 133)';

    this.update = () => {
        this.draw();
    }

    this.draw = () => {
        const gradient = content.createRadialGradient(
            this.x, this.y, 0,          
            this.x, this.y, this.radius * 2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 150, 1)');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, 'rgba(255, 255, 150, 0)');
    
        content.shadowColor = 'rgba(255, 255, 150, 0.5)';
        content.shadowBlur = 30;

        content.beginPath();
        content.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        content.fillStyle = this.color;
        content.fill();
        content.closePath();

        content.shadowColor = 'transparent';
        content.shadowBlur = 0;
    }

}

function Planet(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = colorArray[Math.floor(Math.random() * colorArray.length)];
    this.radians = Math.random() * Math.PI * 2;
    this.velocity = 0.05;
    this.distancefromCenter = {x: randomIntFromRange(125, 200), y: randomIntFromRange(125, 200)};
    this.origin = {x: x, y: y};

    this.update = function () {
        //Move points over time
        const lastPoint = {x: this.x, y: this.y};
        this.radians += this.velocity;

        this.x = this.origin.x + Math.cos(this.radians) * this.distancefromCenter.x;
        this.y = this.origin.y + Math.sin(this.radians) * this.distancefromCenter.y;
        this.draw(lastPoint);
    }

    this.draw = lastPoint => {
        content.beginPath();
        content.strokeStyle = this.color;
        content.lineWidth = radius;
        content.moveTo(lastPoint.x, lastPoint.y);
        content.lineTo(this.x, this.y);
        content.stroke();
        content.closePath();
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
let sun, planets, distantStars;
function init() {
    distantStars = [], planets = [];
    const numofplanets = randomIntFromRange(5,10);

    for (let index = 0; index < 200; index++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 1.5;
        distantStars.push(new FarStars(x, y, radius));
    }

    sun = new Sun(canvas.width/2, canvas.height/2, 40);
    for (let index = 0; index < numofplanets; index++) {
        const radius = 5;
        planets.push(new Planet(canvas.width/2, canvas.height/2, radius));
    }
}

//Animate loop
function animate() {
    requestAnimationFrame(animate);
    content.fillStyle = 'rgba(0, 0, 0, 0.05)';
    content.fillRect(0, 0, canvas.width, canvas.height);
    //content.clearRect(0, 0, innerWidth, innerHeight);

    distantStars.forEach(farStar => {
        farStar.draw();
    })

    sun.update();
    planets.forEach(planet => {
        planet.update();
    });
}

init();
animate();