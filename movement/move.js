var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var content = canvas.getContext('2d');

//variables
var mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
}

const camera = {
    x: 0,
    y: 0
};

let followTarget = null;

var colorArray = [
    '#A8DADC',
    '#457B9D',
    '#BEE9E8',
    '#1D3557'
]

//event listeners
addEventListener('mousemove',
    event => {
        mouse.x = event.x;
        mouse.y = event.y;
    })

addEventListener('resize',
    () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    })

//Utility Functions
function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

//Objects
class MovingCircle {
    constructor(x, y, radius, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocity = { x: velocity.x, y: velocity.y };
        this.color = colorArray[Math.floor(Math.random() * colorArray.length)];
        this.predictedPath = [];
    }

    clone() {
        return new MovingCircle(this.x, this.y, this.radius, { ...this.velocity });
    }


    draw() {
        content.beginPath();
        content.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, Math.PI * 2, false);
        content.fillStyle = this.color;
        content.fill();
        content.closePath();
    }


    drawPredictedPath() {
        if (!this.predictedPath.length) return;
        content.beginPath();
        content.moveTo(this.predictedPath[0].x - camera.x, this.predictedPath[0].y - camera.y);
        for (let i = 1; i < this.predictedPath.length; i++) {
            content.lineTo(this.predictedPath[i].x - camera.x, this.predictedPath[i].y - camera.y);
        }
        content.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        content.stroke();
        content.closePath();
    }

    update(direction) {
        this.draw();
        this.x += this.velocity.x;
        if (this.x + this.radius >= canvas.width) {
            this.x = this.radius;
        }

        if (direction) {
            this.y += this.velocity.y;
        } else {
            this.y -= this.velocity.y;
        }
    }
}

let movingCircles;
//Implementation
function init() {
    movingCircles = [];

    for (let index = 0; index < 10; index++) {
        const radius = 20;
        const x = radius;
        const y = (radius * 4) + index * 60;
        const velocity = { x: 2, y: 5 };
        movingCircles.push(new MovingCircle(x, y, radius, velocity));
    }
}

let counter = 0;
let direction = true;
let isPaused = false;
let simulatedCounter = 0;
let simulatedDirection = true;

function predictAllPaths() {
    const allCircles = movingCircles.map(circle =>
        new MovingCircle(circle.x, circle.y, circle.radius, { ...circle.velocity })
    );
    const paths = allCircles.map(() => []);

    const steps = 1000;
    let simulatedDirection = direction;
    let simulatedCounter = counter;

    for (let step = 0; step < steps; step++) {
        allCircles.forEach(circle => {
            circle.x += circle.velocity.x;
            if (simulatedDirection) {
                circle.y += circle.velocity.y;
            } else {
                circle.y -= circle.velocity.y;
            }
        });

        allCircles.forEach((circle, i) => {
            paths[i].push({ x: circle.x, y: circle.y });
        });

        simulatedCounter++;
        if (simulatedCounter % 10 === 0) {
            simulatedDirection = !simulatedDirection;
        }
    }

    movingCircles.forEach((circle, i) => {
        circle.predictedPath = paths[i];
    });
}


//Animate loop
function animate() {
    requestAnimationFrame(animate);

    content.clearRect(0, 0, innerWidth, innerHeight);
    if (followTarget) {
        camera.x = followTarget.x - canvas.width / 2;
        camera.y = followTarget.y - canvas.height / 2;
    }

    if (isPaused) {
        console.log("is paused");
        console.log(movingCircles[0].predictedPath.slice(0, 5));

        movingCircles.forEach(movingCircle => {
            movingCircle.drawPredictedPath();
            movingCircle.draw();
        });
        return;
    }



    movingCircles.forEach(movingCircle => {
        movingCircle.update(direction);
        // console.log("working");
    });

    counter++;
    if (counter % 10 === 0) {
        direction = !direction
    }
}

function getDistance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyO') {
        for (let circle of movingCircles) {
            const dist = getDistance(mouse.x + camera.x, mouse.y + camera.y, circle.x, circle.y);
            if (dist < circle.radius) {
                if (followTarget === circle) {
                    followTarget = null;
                } else {
                    followTarget = circle;
                }
                break;
            }
        }
    }

    if (event.code === 'Space') {
        isPaused = !isPaused;
        if (isPaused) {
            predictAllPaths();  // ← only calculate when entering pause mode
        }
    }

});




init();
animate();