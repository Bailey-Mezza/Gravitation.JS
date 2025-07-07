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
export function bindEditorEvents(planet, suns, planets = []) {
    if (!planet || !planets.map) return;
    massInput.oninput = () => {
        planet.mass = parseFloat(massInput.value);
        predictAllPaths(suns, planets);
    };

    velXInput.oninput = () => {
        planet.velocity.x = parseFloat(velXInput.value);
        predictAllPaths(suns, planets);
    };

    velYInput.oninput = () => {
        planet.velocity.y = parseFloat(velYInput.value);
        predictAllPaths(suns, planets);
    };

    radiusInput.oninput = () => {
        planet.radius = parseFloat(radiusInput.value);
        predictAllPaths(suns, planets);
    };

    colourInput.oninput = () => {
        planet.color = colourInput.value;
        predictAllPaths(suns, planets);
    };
}

export function bindSliderToPrediction(suns, planets) {
    const stepsSlider = document.getElementById('total-steps');
    const stepsValueDisplay = document.getElementById('steps-value');

    if (stepsSlider && stepsValueDisplay) {
        stepsSlider.addEventListener('input', () => {
            stepsValueDisplay.textContent = stepsSlider.value;
            predictAllPaths(suns, planets);
        });
    } else {
        console.warn('Slider or steps-value not found in DOM.');
    }
}
