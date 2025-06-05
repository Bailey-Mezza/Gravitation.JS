const editor = document.getElementById('planet-editor');
const massInput = document.getElementById('mass-input');
const velXInput = document.getElementById('velx-input');
const velYInput = document.getElementById('vely-input');
const radiusInput = document.getElementById('radius-input');

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
}

// Hook inputs to the selected planet
export function bindEditorEvents(planet) {
    massInput.oninput = () => planet.mass = parseFloat(massInput.value);
    velXInput.oninput = () => planet.velocity.x = parseFloat(velXInput.value);
    velYInput.oninput = () => planet.velocity.y = parseFloat(velYInput.value);
    radiusInput.oninput = () => planet.radius = parseFloat(radiusInput.value);
}
