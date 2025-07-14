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
        console.log("yip");
        
    } else {
        pauseSymbol.classList.remove('show');
        playSymbol.classList.remove('show'); 
        console.log('ekl');
        
    }

    // Reflect in your app
    updateEditorUI(null);
    addBodyMenu.style.display = 'none';
    predictAllPaths(suns, planets);
}


}