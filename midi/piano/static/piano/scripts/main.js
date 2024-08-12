document.addEventListener('DOMContentLoaded', main);

import { samples } from './objects.js';
import { createPopup } from './midi.js';

// Instruments
export const piano = new Tone.Sampler({
    urls: samples,
    baseUrl: "static/piano/samples/",
    release: "1",
    curve: "exponential"
});

// Effects
const limiter = new Tone.Limiter(-30);
const gain = new Tone.Gain;
export const delay = new Tone.FeedbackDelay;
export const reverb = new Tone.Reverb;
export const distortion = new Tone.Distortion;

// Effect chain
piano.connect(delay);
delay.connect(reverb);
reverb.connect(distortion);
distortion.connect(gain);
gain.connect(limiter);
limiter.toDestination();

// Map
export const effectMap = {
    'pianoattack': (value) => piano.attack = value,
    'pianorelease': (value) => piano.release = value,
    'pianocurve': (value) => piano.curve = value,
    'delaydelaytime': (value) => delay.delayTime.value = value,
    'delayfeedback': (value) => delay.feedback.value = value,
    'delaywet': (value) => delay.wet.value = value,
    'reverbpredelay': (value) => reverb.preDelay = value,
    'reverbdecay': (value) => reverb.decay = value,
    'reverbwet': (value) => reverb.wet.value = value,
    'distortiondistortion': (value) => distortion.distortion = value,
    'distortionoversample': (value) => distortion.oversample = value,
    'distortionwet': (value) => distortion.wet.value = value
}

function getTheme() {
    let theme;

    // If default theme is dark set local storage to dark
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        localStorage.setItem('theme', 'dark');
        theme = 'dark';
    }
    // If default theme is light set local storage to light
    else {
        localStorage.setItem('theme', 'light');
        theme = 'light';
    }


    // Update body to reflect theme
    document.body.classList.add(theme);
    const themeBtn = document.getElementById('theme-btn');

    // When theme button is clicked switch between themes
    themeBtn.onclick = () => {
        // If theme is dark set theme to light
        if (theme === 'dark') {
            document.body.classList = 'light';
            localStorage.setItem('theme', 'light');
            theme = 'light';
        }
        // If theme is light set theme to dark
        else if (theme === 'light') {
            document.body.classList = 'dark';
            localStorage.setItem('theme', 'dark');
            theme = 'dark';
        }
    }
}

function volume() {
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const track = document.querySelector('.track');
    const login = document.querySelectorAll('#login-container');

    // Don't display volume slider on login pages
    if (login.length > 0) {
        volumeIcon.style.display = 'none';
        volumeSlider.style.display = 'none';
        track.style.display = 'none';
    }

    const getIcon = (volume) => {
        // If muted display mute icon
        if (volume < 1) {
            volumeIcon.className = '';
            volumeIcon.classList.add('bi', 'bi-volume-mute-fill');
        }
        // If volume above 50% display volume up icon 
        else if (volume > 13) {
            volumeIcon.className = '';
            volumeIcon.classList.add('bi', 'bi-volume-up-fill');
        }
        // If volume below 50% display volume down icon
        else {
            volumeIcon.className = '';
            volumeIcon.classList.add('bi', 'bi-volume-down-fill');
        }
    }

    // Look for volume in local storage if its not there set the volume to default
    var volume = localStorage.getItem('volume') || volumeSlider.value;
    var percentage = volume * 4;

    // When page is loaded update volume slider to display correct volume
    getIcon(volume);
    volumeIcon.style.left = `calc(${percentage}% - (32px * ${percentage / 100}))`;
    volumeSlider.value = volume;
    track.style.background = `linear-gradient(to right, 
    var(--button-active) ${percentage + (0.5 - percentage / 100)}%,
    #fff ${percentage + (0.5 - percentage / 100)}%)`;

    gain.gain.value = percentage * 0.01;

    // When handle is moved update slider to display correct volume
    volumeSlider.addEventListener('input', () => {
        volume = volumeSlider.value;
        percentage = volume * 4;
        localStorage.setItem('volume', volume);

        gain.gain.value = percentage * 0.01;

        volumeIcon.style.left = `calc(${percentage}% - (32px * ${percentage / 100}))`;
        track.style.background = `linear-gradient(to right, var(--button-active) ${percentage + (0.5 - percentage / 100)}%, #fff ${percentage + (0.5 - percentage / 100)}%)`;
        getIcon(volume);
    })
}

function presets() {
    const presets = document.querySelectorAll('.preset');
    const icons = document.querySelectorAll('.trash');
    
    // If preset is active display fill icon else display regular icon
    const toggleIcons = () => {
        icons.forEach((icon, i) => {
            icon.className = '';
            presets[i].classList.contains('active') ? 
            icon.classList.add('trash', 'bi', 'bi-trash3-fill') : 
            icon.classList.add('trash', 'bi', 'bi-trash3');
        })
    }

    presets.forEach(preset => {
        preset.onclick = () => {
            // If selected, unselect
            if (preset.classList.contains('active')) {
                preset.classList.remove('active');
            }
            // Deselect other presets if possible then select clicked preset
            else {
                presets.forEach(preset => preset.classList.contains('active') ? preset.classList.remove('active') : null);
                preset.classList.add('active');
                // Apply Preset here TODO
            }
            // Update icons
            toggleIcons();
        }
    });

    // For each trash icon
    icons.forEach((icon, i) => {
        // Update icons on hover
        icon.addEventListener('mouseenter', () => {
            icon.className = '';
            // If preset is active dont change icon on mouse over else change icon on mouse over
            presets[i].classList.contains('active') ? 
            icon.classList.add('trash', 'bi', 'bi-trash3-fill') : 
            icon.classList.add('trash', 'bi', 'bi-trash3-fill');
        });
        icon.addEventListener('mouseleave', () => {
            icon.className = '';
            // If preset is active dont change icon on mouse leave else change icon on mouse leave
            presets[i].classList.contains('active') ? 
            icon.classList.add('trash', 'bi', 'bi-trash3-fill') : 
            icon.classList.add('trash', 'bi', 'bi-trash3');
        });

        // Display confirmation when trash icon is clicked
        icon.onclick = (event) => {
            event.stopPropagation();
            createPopup(presets[i]);
        }
    });
}

// IDK why I did this? Kinda weird
function main() {
    getTheme();
    volume();
    presets();
}