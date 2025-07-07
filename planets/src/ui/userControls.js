import { predictAllPaths } from '../core/simulation.js';
import { hexToRGB, rgbToHex }  from '../logic/utils.js';

const editor = document.getElementById('planet-editor');
const massInput = document.getElementById('mass-input');
const velXInput = document.getElementById('velx-input');
const velYInput = document.getElementById('vely-input');
const radiusInput = document.getElementById('radius-input');
const colourInput = document.getElementById('colour-input');

export function updateEditorUI(body) {
    if (!body) {
        editor.style.display = 'none';
        return;
    }
    editor.style.display = 'block';
    massInput.value = body.mass;
    velXInput.value = body.velocity.x;
    velYInput.value = body.velocity.y;
    radiusInput.value = body.radius;
    colourInput.value = rgbToHex(body.color);
}

// Hook inputs to the selected planet
export function bindEditorEvents(body, suns, planets = []) {
    if (!body || !planets.map) return;
    massInput.oninput = () => {
        body.mass = parseFloat(massInput.value);
        predictAllPaths(suns, planets);
    };

    velXInput.oninput = () => {
        body.velocity.x = parseFloat(velXInput.value);
        predictAllPaths(suns, planets);
    };

    velYInput.oninput = () => {
        body.velocity.y = parseFloat(velYInput.value);
        predictAllPaths(suns, planets);
    };

    radiusInput.oninput = () => {
        body.radius = parseFloat(radiusInput.value);
        predictAllPaths(suns, planets);
    };

    colourInput.oninput = () => {
        const rgbColor = hexToRGB(colourInput.value);
        body.color = rgbColor;
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
