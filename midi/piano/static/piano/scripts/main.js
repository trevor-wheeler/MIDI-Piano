document.addEventListener('DOMContentLoaded', main);

import { samples } from './objects.js';

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
export const distort = new Tone.Distortion;

// Effect chain
piano.connect(delay);
delay.connect(reverb);
reverb.connect(distort);
distort.connect(gain);
gain.connect(limiter);
limiter.toDestination();

// Map
export const effectMap = {
    'attackpiano': (value) => piano.attack = value,
    'releasepiano': (value) => piano.release = value,
    'curvepiano': (value) => piano.curve = value,
    'timedelaydelay': (value) => delay.delayTime.value = value,
    'feedbackdelay': (value) => delay.feedback.value = value,
    'wetdelay': (value) => delay.wet.value = value,
    'predelayreverb': (value) => reverb.preDelay = value,
    'decayreverb': (value) => reverb.decay = value,
    'wetreverb': (value) => reverb.wet.value = value,
    'distortiondistort': (value) => distort.distortion = value,
    'oversampledistort': (value) => distort.oversample = value,
    'wetdistort': (value) => distort.wet.value = value
}

function theme() {
    let theme = localStorage.getItem('theme');

    // Find out what the users default theme is
    if (theme === 'auto') {
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

function main() {
    theme();
    volume();
}