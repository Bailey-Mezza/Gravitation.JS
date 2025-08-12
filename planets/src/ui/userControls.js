import { hexToRGB, rgbToHex }  from '../logic/utils.js';

const editor = document.getElementById('planet-editor');
const massInput = document.getElementById('mass-input');
const velXInput = document.getElementById('velx-input');
const velYInput = document.getElementById('vely-input');
const radiusInput = document.getElementById('radius-input');
const colourInput = document.getElementById('colour-input');
const stepsSlider = document.getElementById('total-steps');
const stepsValueDisplay = document.getElementById('steps-value');

//gets the prediction steps from the slider value 
export function getPredictionSteps() {
    return stepsSlider ? parseInt(stepsSlider.value, 10) : 10000;
}

// Shows editor when a body is selected to allow for the modification of that body
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

// Hook inputs to the selected body
export function bindEditorEvents(body, engine) {
    if (!body) return;

    const updateAndPredict = () => {
        engine.predictPaths(getPredictionSteps());
    };

    massInput.oninput = () => {
        //found bug during testing that caused simulation to stop working
        if (massInput.value < 1) {
            body.mass = 1;
            console.log("A body cannot have no or negative mass, setting mass to 1");
        }
        body.mass = parseFloat(massInput.value);
        updateAndPredict();
    };

    velXInput.oninput = () => {
        body.velocity.x = parseFloat(velXInput.value);
        updateAndPredict();
    };

    velYInput.oninput = () => {
        body.velocity.y = parseFloat(velYInput.value);
        updateAndPredict();
    };

    radiusInput.oninput = () => {
        body.radius = parseFloat(radiusInput.value);
        updateAndPredict();
    };

    colourInput.oninput = () => {
        const rgbColor = hexToRGB(colourInput.value);
        body.color = rgbColor;
        updateAndPredict();
    };
}

export function bindSliderToPrediction(engine) {
    if (stepsSlider && stepsValueDisplay) {
        stepsSlider.addEventListener('input', () => {
            stepsValueDisplay.textContent = stepsSlider.value;
            engine.predictPaths(getPredictionSteps());
        });
    } else {
        console.warn('Slider or steps-value not found in DOM.');
    }
}
