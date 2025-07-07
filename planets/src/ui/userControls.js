import { predictAllPaths } from '../core/simulation.js';

const editor = document.getElementById('planet-editor');
const massInput = document.getElementById('mass-input');
const velXInput = document.getElementById('velx-input');
const velYInput = document.getElementById('vely-input');
const radiusInput = document.getElementById('radius-input');
const colourInput = document.getElementById('colour-input');

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
export function bindEditorEvents(planet, planets = [], suns = []) {
    if (!planet || !planets.map) return;
    massInput.oninput = () => {
        planet.mass = parseFloat(massInput.value);
        predictAllPaths(planets, suns);
    };

    velXInput.oninput = () => {
        planet.velocity.x = parseFloat(velXInput.value);
        predictAllPaths(planets, suns);
    };

    velYInput.oninput = () => {
        planet.velocity.y = parseFloat(velYInput.value);
        predictAllPaths(planets, suns);
    };

    radiusInput.oninput = () => {
        planet.radius = parseFloat(radiusInput.value);
        predictAllPaths(planets, suns);
    };

    colourInput.oninput = () => {
        planet.color = colourInput.value;
        predictAllPaths(planets, suns);
    };
}

export function bindSliderToPrediction(planets, suns) {
    const stepsSlider = document.getElementById('total-steps');
    const stepsValueDisplay = document.getElementById('steps-value');

    if (stepsSlider && stepsValueDisplay) {
        stepsSlider.addEventListener('input', () => {
            stepsValueDisplay.textContent = stepsSlider.value;
            predictAllPaths(planets, suns);
        });
    } else {
        console.warn('Slider or steps-value not found in DOM.');
    }
}
