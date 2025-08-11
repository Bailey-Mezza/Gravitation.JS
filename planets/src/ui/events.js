import { canvas } from '../core/canvas.js';
import { camera } from '../core/camera.js';
import { getDistance, getWorldMousePosition, getAllBodies } from '../logic/utils.js';
import Sun from '../bodies/sun.js';
// import { predictAllPaths } from '../core/simulation.js';
import Planet from '../bodies/planet.js';
import { updateEditorUI, bindEditorEvents, getPredictionSteps } from './userControls.js';

//Getting elements from HTML
const pauseSymbol = document.getElementById('pause-symbol');
const playSymbol = document.getElementById('play-symbol');
const toggleButton = document.querySelector('.popup-button');
const infoBox = document.querySelector('.diagnos-info');
const addBodyMenu = document.getElementById('addBody');
const presetMenu = document.getElementById('preset-menu-container');
const presetBoxes = document.querySelectorAll('.preset-box');
const addSunOption = document.querySelector('#addBody p:nth-of-type(1)');
const addPlanetOption = document.querySelector('#addBody p:nth-of-type(2)');

export function registerEvents(planets, scaleRef, isPausedRef, followTargetRef, cameraRef, suns, presets, engine) {
    let draggingBody = null;
    let offsetX = 0;
    let offsetY = 0;
    let didDrag = false;
    let lastMouseEvent = null;
    let inputMode = 'default';
    let diagnosticsOpen = false;
    let position = {};
    let allBodies = [];

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    window.addEventListener('keydown', (event) => {
        if (event.code === 'Space') { 
            isPausedRef.value = !isPausedRef.value;
            showSymbol(isPausedRef.value);
            updateEditorUI(null);
            addBodyMenu.style.display = 'none';
        }
        engine.predictPaths(getPredictionSteps());
        //console.log(event);

        if (!isPausedRef.value) return;

        const panSpeed = 20 / scaleRef.value;
        switch (event.code) {
            case 'KeyW':
                camera.y -= panSpeed; break;
            case 'KeyS':
                camera.y += panSpeed; break;
            case 'KeyA':
                camera.x -= panSpeed; break;
            case 'KeyD':
                camera.x += panSpeed; break;
            case 'Digit1':
                scaleRef.value = Math.min(scaleRef.value + 0.05, 2); break;
            case 'Digit2':
                scaleRef.value = Math.max(scaleRef.value - 0.05, 0.1); break;
        }

        if (event.code === 'KeyO') {
            allBodies = getAllBodies(suns, planets);
            for (let body of allBodies) {
                const dist = getDistance(lastMouseEvent.x, lastMouseEvent.y, body.position.x, body.position.y);
                // console.log('Mouse world position:', worldMouse);
                // console.log('Planet position:', planet.position);
                // console.log('Distance:', dist, 'Radius:', planet.radius)
                if (dist < body.radius) {

                    if (followTargetRef.value === body) {
                        followTargetRef.value = null;
                    } else {
                        followTargetRef.value = body;
                        cameraRef.x = body.position.x;
                        cameraRef.y = body.position.y;
                    }
                    break;
                }

            }
        }

        if (event.code === 'KeyI') {
            allBodies = getAllBodies(suns, planets);
            for (let body of allBodies) {
                const dist = getDistance(lastMouseEvent.x, lastMouseEvent.y, body.position.x, body.position.y);
                let selectedPlanet = null;
                if (dist < body.radius) {
                    if (selectedPlanet === body) {
                        selectedPlanet = null;
                        updateEditorUI(null);
                    } else {
                        selectedPlanet = body;
                        updateEditorUI(body);
                        bindEditorEvents(body, engine);
                    }
                    break;
                }
            }
            engine.predictPaths(getPredictionSteps());
        }

        if (event.code === 'KeyP') {
            presetMenu.classList.toggle('hidden');
        }


        if (event.code === 'Backspace' || event.code === 'Delete') {
            allBodies = getAllBodies(suns, planets);
            for (let i = allBodies.length - 1; i >= 0; i--) {
                const body = allBodies[i];
                const dist = getDistance(lastMouseEvent.x, lastMouseEvent.y, body.position.x, body.position.y);
                if (dist < body.radius) {
                    // Try to remove from planets
                    const planetIndex = planets.indexOf(body);
                    if (planetIndex !== -1) {
                        planets.splice(planetIndex, 1);
                        break;
                    }
                    // Try to remove from suns
                    const sunIndex = suns.indexOf(body);
                    if (sunIndex !== -1) {
                        suns.splice(sunIndex, 1);
                        break;
                    }
                }
            }
            engine.predictPaths(getPredictionSteps());
        }

    });

    window.addEventListener('mousedown', () => {
        if (!isPausedRef.value) return;
        didDrag = false;

        allBodies = getAllBodies(suns, planets);
        for (let body of allBodies) {
            const dist = getDistance(lastMouseEvent.x, lastMouseEvent.y, body.position.x, body.position.y);
            if (dist < body.radius) {
                didDrag = true;
                draggingBody = body;
                offsetX = lastMouseEvent.x - body.position.x;
                offsetY = lastMouseEvent.y - body.position.y;
                if(addBodyMenu) {
                    addBodyMenu.style.display = 'none';
                }
                break;
            }
        }
    });

    window.addEventListener('mousemove', function (event) {
        const worldMouse = getWorldMousePosition(event, scaleRef.value);
        lastMouseEvent = worldMouse;


        //Code for opening diagnostics menu when cursor is near the bottom of the screen
        const threshold = 60; // pixels from bottom
        const isNearBottom = window.innerHeight - event.clientY < threshold;
        const popupButton = document.querySelector('.popup-button');
        if (diagnosticsOpen || isNearBottom) {
            popupButton.style.opacity = '1';
        } else {
            popupButton.style.opacity = '0.05';
        }

        //Code to identify what the user is hovering with cursor to ensure planets can only be added when intended
        const isHoveringCanvas = event.target === canvas;
        if (isPausedRef.value && isHoveringCanvas) {
            inputMode = 'add-planet';
            //Change cursor style for user visibility
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
            const dist = getDistance(worldMouse.x, worldMouse.y, body.position.x, body.position.y);
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
            draggingBody.position.x = worldMouse.x - offsetX;
            draggingBody.position.y = worldMouse.y - offsetY;
            engine.predictPaths(getPredictionSteps());
        }
    });

    window.addEventListener('mouseup', function () {
        draggingBody = null;
    });

    window.addEventListener('click', function (event) {
        if (didDrag || !isPausedRef.value || inputMode !== 'add-planet') return;

        position = {
            x: lastMouseEvent.x,
            y: lastMouseEvent.y
        };

        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;

        if (addBodyMenu) {
            addBodyMenu.style.left = `${screenX}px`;
            addBodyMenu.style.top = `${screenY}px`;
            addBodyMenu.style.display = 'block';
        }
    });

    toggleButton.addEventListener('click', function () {
        diagnosticsOpen = !diagnosticsOpen;
        infoBox.classList.toggle('visible', diagnosticsOpen);
        toggleButton.querySelector('p').textContent = diagnosticsOpen ? '↓' : '↑';
        toggleButton.style.marginBottom = diagnosticsOpen ? '60px' : '8px';
    });

    if (addSunOption && addPlanetOption) {
        addSunOption.addEventListener('click', function () {
            if (!isPausedRef.value) return;
            const sunMass = 10000;
            const sunRadius = 50;
            const sunPos = { x: position.x, y: position.y };
            const sunVelocity = { x: 0, y: 0 };
            suns.push(new Sun(sunMass, sunPos, sunVelocity, sunRadius));
            engine.predictPaths(getPredictionSteps());
            hideMenu();
        });

        addPlanetOption.addEventListener('click', function () {
            if (!isPausedRef.value) return;
            const planetMass = 1;
            const planetRadius = 10;
            const planetPos = { x: position.x, y: position.y };
            const planetVelocity = { x: 1, y: -1 };
            planets.push(new Planet(planetMass, planetPos, planetVelocity, planetRadius));
            engine.predictPaths(getPredictionSteps());
            hideMenu();
        });
    }

    function hideMenu() {
        const menu = document.getElementById('addBody');
        if (menu) menu.style.display = 'none';
    }

    document.getElementById('export-button').addEventListener('click', () => {
        const state = {
            suns: suns.map(sun => ({
                mass: sun.mass,
                radius: sun.radius,
                position: sun.position,
                velocity: sun.velocity
            })),
            planets: planets.map(planet => ({
                mass: planet.mass,
                radius: planet.radius,
                position: planet.position,
                velocity: planet.velocity
            }))
        };

        const json = JSON.stringify(state, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-');

        const simName = state.name ? state.name.replace(/\s+/g, '_') : 'gravity_sim';
        const filename = `${simName}_${timestamp}.json`;

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    });

    document.getElementById('import-button').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });

    document.getElementById('import-file').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            try {
                const state = JSON.parse(content);
                console.log("Loaded state from file:", state);
                loadSimulationState(state, suns, planets);
            } catch (err) {
                console.error("Invalid JSON:", err);
            }
        };
        reader.readAsText(file);
    });

    presetBoxes.forEach(box => {
        box.addEventListener('click', () => {
            //Uncaught ReferenceError: engine is not defined
            // at loadSimulationState (events.js:364:5)
            // at HTMLDivElement.<anonymous> (events.js:334:17)

            const presetKey = box.dataset.preset;
            const presetIndex = parseInt(presetKey.replace('preset', ''), 10) - 1;
            const preset = presets[presetIndex];

            if (preset) {
                loadSimulationState(preset, suns, planets);
                document.getElementById('preset-menu-container').classList.add('hidden');
            }
        });
    });

}

function showSymbol(isPaused) {
    // Hide both
    pauseSymbol.classList.remove('show');
    playSymbol.classList.remove('show');

    // Show appropriate one
    const symbolToShow = isPaused ? pauseSymbol : playSymbol;
    symbolToShow.classList.add('show');

    // Hide after 2 seconds
    setTimeout(() => {
        symbolToShow.classList.remove('show');
    }, 2000);
}

function loadSimulationState(state, suns, planets) {
    suns.length = 0;
    planets.length = 0;

    state.suns.forEach(s => suns.push(new Sun(s.mass, s.position, s.velocity, s.radius)));
    state.planets.forEach(p => planets.push(new Planet(p.mass, p.position, p.velocity, p.radius)));

    engine.predictPaths(getPredictionSteps());
}
