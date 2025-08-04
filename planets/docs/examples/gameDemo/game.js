import { Renderer } from '/planets/src/ui/renderer.js';
import FarStars from '/planets/src/core/stars.js';
import { randomIntFromRange, getWorldMousePosition } from '/planets/src/logic/utils.js';
import { PhysicsEngine } from '/planets/src/core/physicsEngine.js';
import Sun from '/planets/src/bodies/sun.js';
import Planet from '/planets/src/bodies/planet.js';
import { camera } from '/planets/src/core/camera.js';

const canvas = document.getElementById('starfieldCanvas');
const ctx = canvas.getContext('2d');

const distantStars = [];
const scaleRef = { value: 1 };
const isPausedRef = { value: false };
// const camera = { x: -400, y: 25 };
const planets = [];
const suns = [];
let safeZone = [];
let player = {
    x: -600,
    y: 25,
}
let spaceship = null;
let gameState = "prelaunch"; // Options: "prelaunch", "launched", "won"
const spaceshipSprite = new Image();
spaceshipSprite.src = 'shuttleSprite.png';

const mouse = { x: 0, y: 0 };

canvas.addEventListener('mousemove', e => {
    const worldPos = getWorldMousePosition(e, scaleRef.value);
    mouse.x = worldPos.x + 250;
    mouse.y = worldPos.y;
});


canvas.addEventListener('click', () => {
    if (gameState === 'prelaunch') {
        const dx = mouse.x - player.x;
        const dy = mouse.y - player.y;
        const scaleFactor = 0.01;

        // Create spaceship
        spaceship = new Spaceship(
            1,
            { x: player.x, y: player.y },
            { x: dx * scaleFactor, y: dy * scaleFactor },
            spaceshipSprite
        );

        planets.push(spaceship);
        gameState = 'launched'
    }
});

//Spaceship object to be used
class Spaceship extends Planet {
    constructor(mass, position, velocity, sprite) {
        super(mass, position, velocity, 10); // radius doesn't matter much
        this.sprite = sprite;
    }

    draw() {
        const angle = Math.atan2(this.velocity.y, this.velocity.x);

        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(angle);
        ctx.drawImage(this.sprite, -25, -15, 50, 30); // adjust based on sprite size
        ctx.restore();
    }
}

function init() {
    const canvasWidth = canvas.width + 1000;
    const canvasHeight = canvas.height + 1000;
    for (let index = 0; index < 2000; index++) {
        const x = randomIntFromRange(-canvasWidth / 2, canvasWidth / 2);
        const y = randomIntFromRange(-canvasHeight / 2, canvasHeight / 2);
        const radius = randomIntFromRange(0, 2);
        distantStars.push(new FarStars(x, y, radius));
    }

    suns.push(new Sun(
        10000,                    // mass
        { x: 0, y: 0 },           // position
        { x: 0.15457709523485677, y: -1.499185796718796 },           // velocity
        50                        // radius
    ));

    suns.push(new Sun(
        10000,                    // mass
        { x: 340.43619581242287, y: 16.96817076975375 },           // position
        { x: -0.15457709523485677, y: 1.499185796718796 },           // velocity
        50                        // radius
    ));

    safeZone = {
        x: 1000,
        y: -1000,
        width: 1000,
        height: 2000
    };

    camera.x = -500;
    camera.y = player.y;

}

const renderer = new Renderer(canvas, ctx, camera, scaleRef);
const engine = new PhysicsEngine(suns, planets);

function loop() {
    requestAnimationFrame(loop);

    if (!isPausedRef.value) {
        engine.simulateStep();
    }

    renderer.render([...suns, ...planets], distantStars, null, isPausedRef.value);

    // Draw the safe zone
    ctx.save();
    ctx.fillStyle = 'rgba(0, 255, 157, 0.1)';
    ctx.fillRect(safeZone.x, safeZone.y, safeZone.width, safeZone.height);
    ctx.restore();


    if (gameState === 'prelaunch') {
        //draw line
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // draw arrowhead
        const dx = mouse.x - player.x;
        const dy = mouse.y - player.y;
        const angle = Math.atan2(dy, dx);
        const headlen = 10;
        const endX = mouse.x;
        const endY = mouse.y;

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,255,0,0.8)';
        ctx.fill();

        //draw player starter
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.drawImage(spaceshipSprite, -25, -15, 50, 30); // adjust based on sprite size
        ctx.restore();
    } else if (gameState === 'launched' && spaceship) {
        camera.x = spaceship.position.x;
        camera.y = spaceship.position.y;
    }
}

init();
loop();


//You've been knocked off orbit and have encountered a binary star system that threatens to send you further into deep space. Can you use your knowledge and the last of your fuel to slingshot yourself as fast as you can into safe space again? Best of luck captain.