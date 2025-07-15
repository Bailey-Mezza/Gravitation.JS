import { canvas } from '../core/canvas.js';
import { camera } from '../core/camera.js';
import { getDistance, getWorldMousePosition, getAllBodies } from '../logic/utils.js';
import { predictAllPaths } from '../core/simulation.js';
import Sun from '../bodies/sun.js';
import Planet from '../bodies/planet.js';
import { updateEditorUI, bindEditorEvents } from './userControls.js';

//Getting elements from HTML
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


export function registerMobileEvents(planets, scaleRef, isPausedRef, followTargetRef, cameraRef, suns, presets) {
    let lastTouchEvent = null;
    let draggingBody = null;
    let offsetX = 0;
    let offsetY = 0;
    let didDrag = false;
    let inputMode = 'default';
    let diagnosticsOpen = false;
    let position = {};
    let allBodies = [];

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
        predictAllPaths(suns, planets);
    }

    window.addEventListener('touchstart', (event) => {
        if (!isPausedRef.value) return;
        didDrag = false;

        // Get touch position (first touch only)
        const touch = event.touches[0];
        const touchX = touch.clientX;
        const touchY = touch.clientY;

        allBodies = getAllBodies(suns, planets);
        for (let body of allBodies) {
            const dist = getDistance(touchX, touchY, body.position.x, body.position.y);
            if (dist < body.radius) {
                didDrag = true;
                draggingBody = body;
                offsetX = touchX - body.position.x;
                offsetY = touchY - body.position.y;
                break;
            }
        }

        lastTouchEvent = { x: touchX, y: touchY };
    });

    window.addEventListener('touchmove', function (event) {
        const touch = event.touches[0];
        if (!touch) return;

        const worldTouch = getWorldMousePosition(touch, scaleRef.value);
        lastTouchEvent = worldTouch;

        // Open diagnostics menu near bottom
        const threshold = 60;
        const isNearBottom = window.innerHeight - touch.clientY < threshold;
        const popupButton = document.querySelector('.popup-button');
        if (diagnosticsOpen || isNearBottom) {
            popupButton.style.opacity = '1';
        } else {
            popupButton.style.opacity = '0.05';
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

        allBodies = getAllBodies(suns, planets);
        for (let body of allBodies) {
            body.highlighted = false;
        }

        for (let body of allBodies) {
            const dist = getDistance(worldTouch.x, worldTouch.y, body.position.x, body.position.y);
            if (dist < body.radius) {
                inputMode = 'default';
                canvas.style.cursor = 'default';
                if (isPausedRef.value) {
                    body.highlighted = true;
                }
                break;
            }
        }

        if (draggingBody && isPausedRef.value) {
            draggingBody.position.x = worldTouch.x - offsetX;
            draggingBody.position.y = worldTouch.y - offsetY;
            predictAllPaths(suns, planets);
        }
    }, { passive: true });

    window.addEventListener('touchend', function () {
        draggingBody = null;
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


}