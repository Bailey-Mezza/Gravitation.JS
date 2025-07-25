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

        //console.log("Follow target path length:", followTarget?.predictedPath?.length);
        //console.log(followTarget);
        
        for (let i = 0; i < this.predictedPath.length; i++) {
            let px = this.predictedPath[i].x;
            let py = this.predictedPath[i].y;

            //
            // Apply relative shift if following a target
            if (followTarget && followTarget.predictedPath.length > i) {
                py -= followTarget.predictedPath[i].x - followTarget.x;
                px -= followTarget.predictedPath[i].y - followTarget.y;
            }

            // Convert to camera coordinates
            px -= camera.x;
            py -= camera.y;

            if (i === 0) {
                content.moveTo(px, py);
            } else {
                // console.log(px, py);
                
                content.lineTo(px, py);
            }
        }

        content.strokeStyle = 'rgba(255, 255, 255, 1)';
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


function FarStars(x, y, radius) {
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

let movingCircles;
//Implementation
function init() {
    movingCircles = [];
    distantStars = [];

    for (let index = 0; index < 4000; index++) {
        const x = randomIntFromRange(-10000, 10000);
        const y = randomIntFromRange(-5000, 5000);
        const radius = Math.random() * 1.5;
        distantStars.push(new FarStars(x, y, radius));
    }

    for (let index = 0; index < 10; index++) {
        const radius = 20;
        const x = radius;
        const y = (radius * 2) + index * 60;
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

    for (let i = 0; i < movingCircles.length; i++) {
        movingCircles[i].predictedPath = paths[i];

        if (movingCircles[i] === followTarget) {
            followTarget.predictedPath = paths[i];
        }
    }
}


//Animate loop
function animate() {
    requestAnimationFrame(animate);

    // Create a semi-transparent gradient overlay
    const gradient = content.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.1)");
    gradient.addColorStop(1, "rgba(207, 0, 0, 0.1)");
    content.fillStyle = gradient;
    content.fillRect(0, 0, canvas.width, canvas.height);

    distantStars.forEach(farStar => {
        farStar.draw();
    })

    if (followTarget) {
        camera.x = followTarget.x - canvas.width / 2;
        camera.y = followTarget.y - canvas.height / 2;
    }

    if (isPaused) {
        // console.log("is paused");
        // console.log(movingCircles[0].predictedPath.slice(0, 5));

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
            console.log('Pause');
            predictAllPaths();
        }
    }

});




init();
animate();