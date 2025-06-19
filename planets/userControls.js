import { predictAllPaths } from './simulation.js';

const editor = document.getElementById('planet-editor');
const massInput = document.getElementById('mass-input');
const velXInput = document.getElementById('velx-input');
const velYInput = document.getElementById('vely-input');
const radiusInput = document.getElementById('radius-input');
const colourInput = document.getElementById('colour-input')

export function updateEditorUI(planet) {
    if (!planet) {
        editor.style.display = 'none';
        return;
    }
    editor.style.display = 'block';
    massInput.value = planet.mass;
    velXInput.value = planet.velocity.x;
    velYInput.value = planet.velocity.y;
    radiusInput.value = planet.radius;
    colourInput.value = planet.color;
}

// Hook inputs to the selected planet
export function bindEditorEvents(planet, planets = [], sun = null) {
    if (!planet || !planets.map) return;
    massInput.oninput = () => {
        planet.mass = parseFloat(massInput.value);
        predictAllPaths(planets, sun);
    };

    velXInput.oninput = () => {
        planet.velocity.x = parseFloat(velXInput.value);
        predictAllPaths(planets, sun);
    };

    velYInput.oninput = () => {
        planet.velocity.y = parseFloat(velYInput.value);
        predictAllPaths(planets, sun);
    };

    radiusInput.oninput = () => {
        planet.radius = parseFloat(radiusInput.value);
        predictAllPaths(planets, sun);
    };

    colourInput.oninput = () => {
        planet.color = colourInput.value;
        predictAllPaths(planets, sun);
    };
}
