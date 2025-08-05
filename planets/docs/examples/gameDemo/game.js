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
const planets = [];
const suns = [];
let safeZone = [];
let player = {
    x: -600,
    y: 25,
}
const canvasWidth = canvas.width + 1000;
const canvasHeight = canvas.height + 1000;
const worldBounds = {
    xMin: -canvasWidth / 2,
    xMax: canvasWidth / 2,
    yMin: -canvasHeight / 2,
    yMax: canvasHeight / 2
};
let spaceship = null;
let gameState = "prelaunch";
const spaceshipSprite = new Image();
spaceshipSprite.src = 'shuttleSprite.png';

let gameIntroText = `You've been knocked off orbit and have encountered a binary star system that threatens to send you further into deep space. Can you use your knowledge and the last of your fuel to slingshot yourself as fast as you can into safe space again? Best of luck captain.`;

let displayedText = '';
let textIndex = 0;
let introFinished = false;
let showTimer = false;
let launchTime = null;
let finalTime = null;

const mouse = { x: 0, y: 0 };

canvas.addEventListener('mousemove', e => {
    const worldPos = getWorldMousePosition(e, scaleRef.value);
    mouse.x = worldPos.x + 250;
    mouse.y = worldPos.y;
});


canvas.addEventListener('click', () => {
    if (gameState === 'prelaunch' && introFinished) {
        const dx = mouse.x - player.x;
        const dy = mouse.y - player.y;

        spaceship = new Spaceship(
            1,
            { x: player.x, y: player.y },
            { x: dx * 0.01, y: dy * 0.01 },
            spaceshipSprite
        );

        planets.push(spaceship);
        gameState = 'launched';
        launchTime = performance.now();
        showTimer = true;
    }

});

window.addEventListener('keydown', () => {
    if (!introFinished) {
        displayedText = gameIntroText;
        textIndex = gameIntroText.length;
        introFinished = true;
    }
});

canvas.addEventListener('click', () => {
    if (!introFinished) {
        displayedText = gameIntroText;
        textIndex = gameIntroText.length;
        introFinished = true;
    }
});


//Spaceship object to be used
class Spaceship extends Planet {
    constructor(mass, position, velocity, sprite) {
        super(mass, position, velocity, 10);
        this.sprite = sprite;
    }

    draw() {
        const angle = Math.atan2(this.velocity.y, this.velocity.x);

        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(angle);
        ctx.drawImage(this.sprite, -25, -15, 50, 30);
        ctx.restore();
    }
}

function init() {
    for (let index = 0; index < 2000; index++) {
        const x = randomIntFromRange(worldBounds.xMin, worldBounds.xMax);
        const y = randomIntFromRange(worldBounds.yMin, worldBounds.yMax);
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

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}


const renderer = new Renderer(canvas, ctx, camera, scaleRef);
const engine = new PhysicsEngine(suns, planets);

function loop() {
    requestAnimationFrame(loop);

    if (!introFinished) {
        // Typewriter effect
        if (textIndex < gameIntroText.length) {
            displayedText += gameIntroText[textIndex];
            textIndex++;
        }

        // Draw intro text box
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(50, canvas.height - 150, canvas.width - 100, 100);

        ctx.fillStyle = 'white';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        drawWrappedText(ctx, displayedText, 60, canvas.height - 400, canvas.width - 120, 20);
        ctx.restore();

        return; // Skip rest of game loop until intro is done
    }


    if (!isPausedRef.value) {
        engine.simulateStep();

        const collision = renderer.checkCollisions([...suns, ...planets]);
        if (collision) {
            isPausedRef.value = true;
            gameState = 'gameover';
            finalTime = (performance.now() - launchTime) / 1000;
        }
        if (spaceship) {
            const { x, y } = spaceship.position;
            if (
                x < worldBounds.xMin ||
                y < worldBounds.yMin ||
                y > worldBounds.yMax
            ) {
                isPausedRef.value = true;
                gameState = 'gameover';
                finalTime = (performance.now() - launchTime) / 1000;
            } else if (x > worldBounds.xMax) {
                isPausedRef.value = true;
                gameState = 'victory';
                finalTime = (performance.now() - launchTime) / 1000;
            }
        }
    }

    renderer.render([...suns, ...planets], distantStars, null, isPausedRef.value);

    if (showTimer) {
        let timeToShow;

        if (gameState === 'launched') {
            const now = performance.now();
            timeToShow = (now - launchTime) / 1000;
        } else if (finalTime != null) {
            timeToShow = finalTime;
        }

        if (timeToShow != null) {
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.font = '20px monospace';
            ctx.fillText(`Time: ${timeToShow.toFixed(2)}s`, camera.x - canvas.width / 2 + 20, camera.y - canvas.height / 2 + 30);
            ctx.restore();
        }
    }

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
        ctx.drawImage(spaceshipSprite, -25, -15, 50, 30);
        ctx.restore();
    } else if (gameState === 'launched' && spaceship) {
        camera.x = spaceship.position.x;
        camera.y = spaceship.position.y;
    }

    if (gameState === 'gameover') {
        ctx.save();
        ctx.fillStyle = 'red';
        ctx.font = '40px sans-serif';
        ctx.fillText('💥 GAME OVER 💥', camera.x - 150, camera.y - 100);
        ctx.restore();
    }
    if (gameState === 'victory') {
        ctx.save();
        ctx.fillStyle = 'limegreen';
        ctx.font = '40px sans-serif';
        ctx.fillText('🏁 YOU WIN! 🏁', camera.x - 120, camera.y - 100);
        ctx.restore();
    }

}

init();
loop();


// Code copy and display
document.getElementById('copyButton').addEventListener('click', () => {
    const codeText = document.getElementById('code-block').innerText;

    navigator.clipboard.writeText(codeText)
        .then(() => {
            console.log('Code copied!');
            const btn = document.getElementById('copyButton');
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = 'Copy', 2000);
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
        });
});

document.getElementById('code-block').textContent = `import { Renderer } from '/planets/src/ui/renderer.js';
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
const canvasWidth = canvas.width + 1000;
const canvasHeight = canvas.height + 1000;
const worldBounds = {
    xMin: -canvasWidth / 2,
    xMax: canvasWidth / 2,
    yMin: -canvasHeight / 2,
    yMax: canvasHeight / 2
};
let spaceship = null;
let gameState = "prelaunch";
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
        super(mass, position, velocity, 10);
        this.sprite = sprite;
    }

    draw() {
        const angle = Math.atan2(this.velocity.y, this.velocity.x);

        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(angle);
        ctx.drawImage(this.sprite, -25, -15, 50, 30);
        ctx.restore();
    }
}

function init() {
    const canvasWidth = canvas.width + 1000;
    const canvasHeight = canvas.height + 1000;
    for (let index = 0; index < 2000; index++) {
        const x = randomIntFromRange(worldBounds.xMin, worldBounds.xMax);
        const y = randomIntFromRange(worldBounds.yMin, worldBounds.yMax);
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

        const collision = renderer.checkCollisions([...suns, ...planets]);
        if (collision) {
            isPausedRef.value = true;
            gameState = 'gameover';
        }
        if (spaceship) {
            const { x, y } = spaceship.position;
            if (
                x < worldBounds.xMin ||
                y < worldBounds.yMin ||
                y > worldBounds.yMax
            ) {
                isPausedRef.value = true;
                gameState = 'gameover';
            } else if (x > worldBounds.xMax) {
                isPausedRef.value = true;
                gameState = 'victory';
            }
        }
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
        ctx.drawImage(spaceshipSprite, -25, -15, 50, 30);
        ctx.restore();
    } else if (gameState === 'launched' && spaceship) {
        camera.x = spaceship.position.x;
        camera.y = spaceship.position.y;
    }

    if (gameState === 'gameover') {
        ctx.save();
        ctx.fillStyle = 'red';
        ctx.font = '40px sans-serif';
        ctx.fillText('💥 GAME OVER 💥', camera.x - 150, camera.y - 100);
        ctx.restore();
    }
    if (gameState === 'victory') {
        ctx.save();
        ctx.fillStyle = 'limegreen';
        ctx.font = '40px sans-serif';
        ctx.fillText('🏁 YOU WIN! 🏁', camera.x - 120, camera.y - 100);
        ctx.restore();
    }

}

init();
loop();`;
