import { Renderer } from '/planets/src/ui/renderer.js';
import FarStars from '/planets/src/core/stars.js';
import { randomIntFromRange } from '/planets/src/logic/utils.js';
import { PhysicsEngine } from '/planets/src/core/physicsEngine.js';
import Sun from '/planets/src/bodies/sun.js';
import Planet from '/planets/src/bodies/planet.js';

const cameraSpeed = 10;
const cameraKeys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false,
    q: false
};


window.addEventListener('keydown', e => {
    if (e.key in cameraKeys) cameraKeys[e.key] = true;
});

window.addEventListener('keyup', e => {
    if (e.key in cameraKeys) cameraKeys[e.key] = false;
});


const canvas = document.getElementById('starfieldCanvas');
const ctx = canvas.getContext('2d');

const distantStars = [];

const scaleRef = { value: 1 };
const isPausedRef = { value: false };
const camera = { x: 510, y: 300 };
const planets = [];
const suns = [];
let safeZone = [];
let player = [];

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
        { x: 343.78190209378863, y: 286.5159146151228 },           // position
        { x: 0.15457709523485677, y: -1.499185796718796 },           // velocity
        50                        // radius
    ));

    suns.push(new Sun(
        10000,                    // mass
        { x: 684.2180979062115, y: 303.48408538487655 },           // position
        { x: -0.15457709523485677, y: 1.499185796718796 },           // velocity
        50                        // radius
    ));

    safeZone = {
        x: 1300,
        y: -1000,
        width: 1000,
        height: 2000
    };

    player =  {
        x: -200,
        y: 300,
        velocityX: 0,
        velocityY: 0,
        radius: 10
    }

}

const renderer = new Renderer(canvas, ctx, camera, scaleRef);
const engine = new PhysicsEngine(suns, planets);

function loop() {
    requestAnimationFrame(loop);

    if (cameraKeys.ArrowUp || cameraKeys.w) camera.y -= cameraSpeed;
    if (cameraKeys.ArrowDown || cameraKeys.s) camera.y += cameraSpeed;
    if (cameraKeys.ArrowLeft || cameraKeys.a) camera.x -= cameraSpeed;
    if (cameraKeys.ArrowRight || cameraKeys.d) camera.x += cameraSpeed;

    if (!isPausedRef.value) {
        engine.simulateStep();
    }

    renderer.render([...suns, ...planets], distantStars, null, isPausedRef.value);

    // Draw the safe zone
    ctx.save();
    ctx.fillStyle = 'rgba(0, 255, 157, 0.3)';
    ctx.fillRect(safeZone.x, safeZone.y, safeZone.width, safeZone.height);
    ctx.restore();

    //draw player
    ctx.save();
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle ='rgb(255, 255, 255)';
    ctx.fill();
    ctx.closePath();
}

init();
loop();


//You've been knocked off orbit and have encountered a binary star system that threatens to send you further into deep space. Can you use your knowledge and the last of your fuel to slingshot yourself as fast as you can into safe space again? Best of luck captain.