import { canvas } from './canvas.js';
import { G } from './constants.js';
import { camera } from './camera.js';
import { getDistance, getWorldMousePosition } from './utils.js';
import { predictAllPaths } from './simulation.js';
import Sun from './bodies/Sun.js';
import Planet from './bodies/Planet.js';
import { updateEditorUI, bindEditorEvents } from './userControls.js';

const pauseSymbol = document.getElementById('pause-symbol');
const playSymbol = document.getElementById('play-symbol');
const toggleButton = document.querySelector('.popup-button');
const infoBox = document.querySelector('.diagnos-info');

export function registerEvents(mouse, planets, scaleRef, isPausedRef, followTargetRef, cameraRef, suns) {
    let draggingPlanet = null;
    let offsetX = 0;
    let offsetY = 0;
    let didDrag = false;
    let lastMouseEvent = null;
    let inputMode = 'default';
    let diagnosticsOpen = false;
    let sunMode = false;


    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    window.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            isPausedRef.value = !isPausedRef.value;
            showSymbol(isPausedRef.value);
            updateEditorUI(null);
        }
        predictAllPaths(planets, suns);
        //console.log(event);

        if (!isPausedRef.value) return;

        const panSpeed = 20 / scaleRef.value;
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                camera.y -= panSpeed; break;
            case 'ArrowDown':
            case 'KeyS':
                camera.y += panSpeed; break;
            case 'ArrowLeft':
            case 'KeyA':
                camera.x -= panSpeed; break;
            case 'ArrowRight':
            case 'KeyD':
                camera.x += panSpeed; break;
            case 'Digit1':
                scaleRef.value = Math.min(scaleRef.value + 0.05, 2); break;
            case 'Digit2':
                scaleRef.value = Math.max(scaleRef.value - 0.05, 0.1); break;
        }

        if (event.code === 'KeyO') {
            for (let planet of planets) {
                const dist = getDistance(lastMouseEvent.x, lastMouseEvent.y, planet.position.x, planet.position.y);
                // console.log('Mouse world position:', worldMouse);
                // console.log('Planet position:', planet.position);
                // console.log('Distance:', dist, 'Radius:', planet.radius)
                if (dist < planet.radius) {

                    if (followTargetRef.value === planet) {
                        followTargetRef.value = null;
                    } else {
                        followTargetRef.value = planet;
                        cameraRef.x = planet.position.x;
                        cameraRef.y = planet.position.y;
                    }
                    break;
                }

            }
        }

        if (event.code === 'KeyI') {
            for (let planet of planets) {
                const dist = getDistance(lastMouseEvent.x, lastMouseEvent.y, planet.position.x, planet.position.y);
                let selectedPlanet = null;
                if (dist < planet.radius) {
                    if (selectedPlanet === planet) {
                        selectedPlanet = null;
                        updateEditorUI(null);
                    } else {
                        selectedPlanet = planet;
                        updateEditorUI(planet);
                        bindEditorEvents(planet, planets, suns);
                    }
                    break;
                }
            }
            predictAllPaths(planets, suns);
        }

        if (event.code === 'KeyP') {
            // Create sun
            const sunMass = 10000;
            const sunRadius = 50;
            const sunPos = { x: canvas.width / 2, y: canvas.height / 2 };
            const sunVelocity = { x: 0, y: 0 };
            const sun = new Sun(sunMass, sunPos, sunVelocity, sunRadius);
            suns.push(sun);

            // Create planets
            for (let i = 0; i < 3; i++) {
                const planetMass = 10;
                const planetRadius = 10;
                const rMin = sunRadius + 100;
                const rMax = canvas.height / 2 - planetRadius;
                const r = rMin + Math.random() * (rMax - rMin);
                const theta = Math.random() * 2 * Math.PI;
                const planetPos = {
                    x: sunPos.x + r * Math.cos(theta),
                    y: sunPos.y + r * Math.sin(theta),
                };

                const orbitalSpeed = Math.sqrt(G * sunMass / r);
                const planetVelocity = {
                    x: -orbitalSpeed * Math.sin(theta),
                    y: orbitalSpeed * Math.cos(theta),
                };

                planets.push(new Planet(planetMass, planetPos, planetVelocity, planetRadius));
            }
            predictAllPaths(planets, suns);
        }

        if (event.code === 'KeyT') {
            // Three Body Problem
            for (let i = 0; i < 3; i++) {
                const planetMass = 10;
                const planetRadius = 10;
                const rMin = sunRadius + 100;
                const rMax = canvas.height / 2 - planetRadius;
                const r = rMin + Math.random() * (rMax - rMin);
                const theta = Math.random() * 2 * Math.PI;
                const planetPos = {
                    x: sunPos.x + r * Math.cos(theta),
                    y: sunPos.y + r * Math.sin(theta),
                };

                const orbitalSpeed = Math.sqrt(G * sunMass / r);
                const planetVelocity = {
                    x: -orbitalSpeed * Math.sin(theta),
                    y: orbitalSpeed * Math.cos(theta),
                };

                planets.push(new Planet(planetMass, planetPos, planetVelocity, planetRadius));
            }
            predictAllPaths(planets, suns);
        }

        if (event.code === 'Backspace' || event.code === 'Delete') {
            for (let i = planets.length - 1; i >= 0; i--) {
                const planetToRemove = planets[i];
                const dist = getDistance(lastMouseEvent.x, lastMouseEvent.y, planetToRemove.position.x, planetToRemove.position.y);
                if (dist < planetToRemove.radius) {
                    planets.splice(i, 1);
                    break;
                }
            }
        }

        if (event.code === 'KeyL') {
            sunMode = !sunMode;
        }
    });

    window.addEventListener('mousedown', () => {
        if (!isPausedRef.value) return;
        didDrag = false;

        for (let planet of planets) {
            const dist = getDistance(lastMouseEvent.x, lastMouseEvent.y, planet.position.x, planet.position.y);
            if (dist < planet.radius) {
                didDrag = true;
                draggingPlanet = planet;
                offsetX = lastMouseEvent.x - planet.position.x;
                offsetY = lastMouseEvent.y - planet.position.y;
                break;
            }
        }
    });

    window.addEventListener('mousemove', function (event) {
        const worldMouse = getWorldMousePosition(event, scaleRef.value);
        lastMouseEvent = worldMouse;

        const threshold = 60; // pixels from bottom
        const isNearBottom = window.innerHeight - event.clientY < threshold;
        const popupButton = document.querySelector('.popup-button');
        if (diagnosticsOpen || isNearBottom) {
            popupButton.style.opacity = '1';
        } else {
            popupButton.style.opacity = '0.05';
        }

        const isHoveringCanvas = event.target === canvas;

        if (isPausedRef.value && isHoveringCanvas) {
            inputMode = 'add-planet';
            canvas.style.cursor = 'crosshair';
        } else {
            inputMode = 'default';
            canvas.style.cursor = 'default';
        }

        for (let planet of planets) {
            planet.highlighted = false;
        }

        for (let planet of planets) {
            const dist = getDistance(worldMouse.x, worldMouse.y, planet.position.x, planet.position.y);
            if (dist < planet.radius) {
                inputMode = 'default';
                canvas.style.cursor = 'default';
                planet.highlighted = true;
                break;
            }
        }

        if (draggingPlanet && isPausedRef.value) {
            draggingPlanet.position.x = worldMouse.x - offsetX;
            draggingPlanet.position.y = worldMouse.y - offsetY;
            predictAllPaths(planets, suns);
        }
    });

    window.addEventListener('mouseup', function () {
        draggingPlanet = null;
    });

    window.addEventListener('click', function () {
        if (didDrag || !isPausedRef.value || inputMode !== 'add-planet') return;

        if (!sunMode) {
            const planetMass = 1;
            const planetRadius = 10;
            const planetPos = {
                x: lastMouseEvent.x,
                y: lastMouseEvent.y
            };
            const planetVelocity = {
                x: 1,
                y: -1
            };
            planets.push(new Planet(planetMass, planetPos, planetVelocity, planetRadius));
            predictAllPaths(planets, suns);
        } else {
            const sunMass = 10000;
            const sunRadius = 50;
            const sunPos = {
                x: lastMouseEvent.x,
                y: lastMouseEvent.y
            }; 
            const sunVelocity = { x: 0, y: 0 };
            const sun = new Sun(sunMass, sunPos, sunVelocity, sunRadius);
            suns.push(sun);
            predictAllPaths(planets, suns);
        }

    });

    toggleButton.addEventListener('click', function () {
        diagnosticsOpen = !diagnosticsOpen;
        const isVisible = infoBox.style.display === 'block';
        infoBox.style.display = isVisible ? 'none' : 'block';
        toggleButton.querySelector('p').textContent = isVisible ? '↑' : '↓';
        popupButton.style.opacity = '1'
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
