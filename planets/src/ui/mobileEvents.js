import { canvas } from '../core/canvas.js';
import { camera } from '../core/camera.js';
import { getDistance, getWorldMousePosition, getAllBodies } from '../logic/utils.js';
import Sun from '../bodies/sun.js';
import Planet from '../bodies/planet.js';
import { updateEditorUI, bindEditorEvents } from './userControls.js';

//Getting elements from HTML
const LONG_PRESS_DURATION = 600; // milliseconds

const pauseSymbol = document.getElementById('pause-symbol');
const playSymbol = document.getElementById('play-symbol');
const pausePlayContainer = document.getElementById('pause-play-symbol');
const toggleButton = document.querySelector('.popup-button');
const infoBox = document.querySelector('.diagnos-info');
const addBodyMenu = document.getElementById('addBody');
const presetMenu = document.getElementById('preset-menu-container');
const presetBoxes = document.querySelectorAll('.preset-box');
const addSunOption = document.querySelector('#addBody p:nth-of-type(1)');
const addPlanetOption = document.querySelector('#addBody p:nth-of-type(2)');
const instructionHelpTips = document.querySelector('#help-tips .dropdown-content');

export function registerMobileEvents(planets, scaleRef, isPausedRef, followTargetRef, cameraRef, suns, presets, engine) {
    let lastTouchEvent = null;
    let draggingBody = null;
    let offsetX = 0;
    let offsetY = 0;
    let didDrag = false;
    let inputMode = 'default';
    let diagnosticsOpen = false;
    let position = {};
    let allBodies = [];
    let lastTouchDistance = null;
    let lastPanTouch = null;
    let steps = 10000;
    let longPressTimer = null;

    const mobileControls = `
        <div><p><strong>Tap the play or pause button</strong> to pause or unpause the simulation.</p></div><hr />
        <div><p><strong>Swipe</strong> to pan the camera (when paused).</p></div><hr />
        <div><p><strong>Pinch in</strong> to zoom out, <strong>Pinch out</strong> to zoom in.</p></div><hr />
        <div><p><strong>Long Press</strong> a planet to open the planet editor (when paused).</p></div><hr />
        <div><p><strong>Three-finger Tap</strong> opens the preset menu (when paused).</p></div><hr />
        <div><p><strong>Single Tap</strong> (when paused) opens new body menu.</p></div><hr />
        <div><p><strong>Drag</strong> a planet to move it (when paused).</p></div>
    `;
    instructionHelpTips.innerHTML = mobileControls;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });

    if (!playSymbol || !pauseSymbol) {
        console.warn('Play or Pause symbol not found in DOM');
        return;
    }

    // Show play symbol on first tap anywhere
    document.body.addEventListener('touchstart', function initialTouch() {
        playSymbol.classList.add('show');
        document.body.removeEventListener('touchstart', initialTouch);
    });

    // Tapping play pauses the sim and shows pause symbol
    playSymbol.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        isPausedRef.value = true;
        updatePauseState();
    });

    // Tapping pause resumes the sim and hides pause symbol
    pauseSymbol.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        isPausedRef.value = false;
        updatePauseState();
    });

    function updatePauseState() {
        if (isPausedRef.value) {
            playSymbol.classList.remove('show');
            pauseSymbol.classList.add('show');
        } else {
            pauseSymbol.classList.remove('show');
            playSymbol.classList.add('show');
        }

        // Reflect in your app
        updateEditorUI(null);
        addBodyMenu.style.display = 'none';
        engine.predictPaths(steps);
    }

    window.addEventListener('touchstart', (event) => {
        if (!isPausedRef.value) return;
        const touch = event.touches[0];
        if (!touch) return;

        const worldTouch = getWorldMousePosition(touch, scaleRef.value);
        lastTouchEvent = worldTouch;
        didDrag = false;
        lastPanTouch = { x: touch.clientX, y: touch.clientY };
        draggingBody = null;

        allBodies = getAllBodies(suns, planets);

        // Reset highlight
        for (let body of allBodies) {
            body.highlighted = false;
        }

        // Check if finger is on a planet
        for (let body of allBodies) {
            const dist = getDistance(worldTouch.x, worldTouch.y, body.position.x, body.position.y);
            if (dist < body.radius) {
                didDrag = true;
                draggingBody = body;
                offsetX = worldTouch.x - body.position.x;
                offsetY = worldTouch.y - body.position.y;
                body.highlighted = true;
                // Long press detection to open planet editor
                if (draggingBody) {
                    console.log("nice");

                    longPressTimer = setTimeout(() => {
                        updateEditorUI(draggingBody);
                        bindEditorEvents(draggingBody, engine);
                        engine.predictPaths(steps);
                    }, LONG_PRESS_DURATION);
                }
                break;
            }
        }

        // Hover logic — adapt to finger being over canvas
        const isTouchingCanvas = document.elementFromPoint(touch.clientX, touch.clientY) === canvas;
        if (isPausedRef.value && isTouchingCanvas) {
            inputMode = 'add-planet';
            canvas.style.cursor = 'crosshair';
        } else {
            inputMode = 'default';
            canvas.style.cursor = 'default';
        }

        lastTouchEvent = lastPanTouch;
    });

    window.addEventListener('touchmove', function (event) {
        const touches = event.touches;
        const panSpeed = 20 / scaleRef.value;

        // === 2-FINGER ZOOM ===
        if (touches.length === 2) {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (lastTouchDistance !== null) {
                const delta = distance - lastTouchDistance;
                const zoomFactor = delta * 0.002; // sensitivity
                scaleRef.value = Math.min(Math.max(scaleRef.value + zoomFactor, 0.1), 2);
            }

            lastTouchDistance = distance;
            return;
        } else {
            lastTouchDistance = null; // reset pinch
        }

        const touch = touches[0];
        const worldTouch = getWorldMousePosition(touch, scaleRef.value);
        lastTouchEvent = worldTouch;

        if (draggingBody && isPausedRef.value) {
            draggingBody.position.x = worldTouch.x - offsetX;
            draggingBody.position.y = worldTouch.y - offsetY;
            engine.predictPaths(steps);
            didDrag = true;
            if (addBodyMenu) {
                addBodyMenu.style.display = 'none';
            }
            return; // prevent pan
        }

        if (lastPanTouch) {
            const dx = touch.clientX - lastPanTouch.x;
            const dy = touch.clientY - lastPanTouch.y;

            camera.x -= dx * panSpeed * 0.05;
            camera.y -= dy * panSpeed * 0.05;

            lastPanTouch = { x: touch.clientX, y: touch.clientY };
        }

        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }

        // const threshold = 60;
        // const isNearBottom = window.innerHeight - touch.clientY < threshold;
        // const popupButton = document.querySelector('.popup-button');
        // popupButton.style.opacity = (diagnosticsOpen || isNearBottom) ? '1' : '0.05';
    }, { passive: false });


    window.addEventListener('touchend', () => {
        draggingBody = null;
        lastTouchDistance = null;
        lastPanTouch = null;
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    });

    window.addEventListener('touchend', function (event) {
        if (didDrag || !isPausedRef.value || inputMode !== 'add-planet') return;

        const touch = event.changedTouches[0];
        if (!touch) return;

        position = {
            x: lastTouchEvent.x,
            y: lastTouchEvent.y
        };

        const rect = canvas.getBoundingClientRect();
        const screenX = touch.clientX - rect.left;
        const screenY = touch.clientY - rect.top;

        if (addBodyMenu) {
            addBodyMenu.style.left = `${screenX}px`;
            addBodyMenu.style.top = `${screenY}px`;
            addBodyMenu.style.display = 'block';
        }
    });

    if (addSunOption && addPlanetOption) {
        addSunOption.addEventListener('click', function () {
            if (!isPausedRef.value) return;
            const sunMass = 10000;
            const sunRadius = 50;
            const sunPos = { x: position.x, y: position.y };
            const sunVelocity = { x: 0, y: 0 };
            suns.push(new Sun(sunMass, sunPos, sunVelocity, sunRadius));
            engine.predictPaths(steps);
            hideMenu();
        });

        addPlanetOption.addEventListener('click', function () {
            if (!isPausedRef.value) return;
            const planetMass = 1;
            const planetRadius = 10;
            const planetPos = { x: position.x, y: position.y };
            const planetVelocity = { x: 1, y: -1 };
            planets.push(new Planet(planetMass, planetPos, planetVelocity, planetRadius));
            engine.predictPaths(steps);
            hideMenu();
        });
    }

    function hideMenu() {
        const menu = document.getElementById('addBody');
        if (menu) menu.style.display = 'none';
    }

}