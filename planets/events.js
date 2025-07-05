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
const addBodyMenu = document.getElementById('addBody');

export function registerEvents(mouse, planets, scaleRef, isPausedRef, followTargetRef, cameraRef, suns) {
    let draggingPlanet = null;
    let offsetX = 0;
    let offsetY = 0;
    let didDrag = false;
    let lastMouseEvent = null;
    let inputMode = 'default';
    let diagnosticsOpen = false;
    let position = {};

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
        predictAllPaths(planets, suns);
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
                    console.log("Planet Mass : " + planet.mass + "\n" + "Planet Position X : " + planet.position.x + " Y: " + planet.position.y + "\n" + "Planet Velocity X : " + planet.velocity.x + " Y: " + planet.velocity.y + "\n" + "Planet Radius : " + planet.radius);

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
            const threeBody = {
                masses: [1000, 1000, 1000],
                positions: [
                    { x: -0.97000436, y: 0.24308753 },  // Body A
                    { x: 0.97000436, y: -0.24308753 },  // Body B
                    { x: 0.0, y: 0.0 }   // Body C
                ],
                velocities: [
                    { x: 0.4662036850, y: 0.4323657300 },   // Body A
                    { x: 0.4662036850, y: 0.4323657300 },   // Body B
                    { x: -0.93240737, y: -0.86473146 }    // Body C
                ]
            };
            for (let i = 0; i < 3; i++) {
                const planetMass = threeBody.masses[i];
                const planetRadius = 20;

                // Scale and translate to fit canvas if needed
                const scale = 150;  // optional, to make the figure-8 visible
                const offsetX = canvas.width / 2;
                const offsetY = canvas.height / 2;

                const planetPos = {
                    x: offsetX + threeBody.positions[i].x * scale,
                    y: offsetY + threeBody.positions[i].y * scale
                };

                const planetVelocity = {
                    x: threeBody.velocities[i].x * 1.211,
                    y: threeBody.velocities[i].y * 1.211
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
    
    document.addEventListener('DOMContentLoaded', function () {
        const addSunOption = document.querySelector('#addBody p:nth-of-type(1)');
        const addPlanetOption = document.querySelector('#addBody p:nth-of-type(2)');

        addSunOption.addEventListener('click', function () {
            if (!isPausedRef.value) return;
            const sunMass = 10000;
            const sunRadius = 50;
            const sunPos = { x: position.x, y: position.y };
            const sunVelocity = { x: 0, y: 0 };
            suns.push(new Sun(sunMass, sunPos, sunVelocity, sunRadius));
            predictAllPaths(planets, suns);
            hideMenu();
        });

        addPlanetOption.addEventListener('click', function () {
            if (!isPausedRef.value) return;
            const planetMass = 1;
            const planetRadius = 10;
            const planetPos = { x: position.x, y: position.y };
            const planetVelocity = { x: 1, y: -1 };
            planets.push(new Planet(planetMass, planetPos, planetVelocity, planetRadius));
            predictAllPaths(planets, suns);
            hideMenu();
        });

        function hideMenu() {
            const menu = document.getElementById('addBody');
            if (menu) menu.style.display = 'none';
        }
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
