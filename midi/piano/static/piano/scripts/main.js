document.addEventListener('DOMContentLoaded', main);
// Get presets before DOM is loaded
getPresets();

import { samples } from './objects.js';
import { updateKnobs } from './midi.js'

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

export function createPopup(element) {
    let body = document.querySelector('main');
    let popup = document.createElement('div');
    popup.classList.add('centered-page', 'overlay');
    popup.id = 'popup'

    // Try to close any other popup windows 
    try {
        closePopup();
    }
    catch {
        // Do nothing if theres no other popup windows open
    }

    // If the save preset button was clicked display the save preset form
    if (element.id === 'save-preset-btn') {
        popup.innerHTML = `<div class="popup flex-col">
        <input class="text-input login-input" type="text" id="preset-name" placeholder="Preset name">
        <div class="buttons-container">
        <button class="button popup-btn form-button" id="cancel-btn">Cancel</button>
        <button class="button popup-btn form-button disabled" id="save-btn">Save</button></div></div>`

        body.append(popup);
        let saveBtn = document.getElementById('save-btn');
        let input = document.getElementById('preset-name');

        // Focus cursor
        input.focus();

        // Dont let users save presets with empty name field
        input.addEventListener('input', () => {
            input.value.length === 0 ? saveBtn.classList.add('disabled') : saveBtn.classList.remove('disabled');
        });
        saveBtn.addEventListener('click', () => savePreset(input));
    }
    // If the delete button was clicked display the confirmation form
    else {
        popup.innerHTML = `<div class="popup flex-col">
        <span>Are you sure you want to delete ${element.textContent}?</span>
        <div class="buttons-container">
        <button class="button popup-btn form-button" id="confirm-btn">Yes</button>
        <button class="button popup-btn form-button" id="cancel-btn">No</button></div></div>`

        body.append(popup);
        document.getElementById('confirm-btn').addEventListener('click', () => deletePreset(element.id));
    }

    document.getElementById('cancel-btn').addEventListener('click', closePopup);
}

function savePreset(input) {
    var preset = {};
    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
    // Create preset object with name of preset
    preset.values = {};
    preset.name = input.value;

    // Add knob values to preset object
    for (let effect in effectMap) {
        preset.values[effect] = localStorage.getItem(effect);
    }

    // Send preset to database
    fetch('api/preset', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(preset)
    })
    .then(response => response.json())
    .then(preset => {
        // Set new preset as active preset
        localStorage.setItem('preset', preset['id']);

        const presetsContainer = document.getElementById('presets');
        // Refresh presets container
        presetsContainer.innerHTML = '';
        getPresets();
    })
    .catch(error => {
        console.error('Error:', error);
    });
    // Close
    closePopup();
}

function deletePreset(id) {
    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
    var preset = document.getElementById(id);

    // Send delete request to server
    fetch('api/preset', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        // Send ID of preset to delete
        body: JSON.stringify(id)
    })
    // If the response is 200 remove the preset from the presets container
    .then(response => {
        if (response.status === 200) {
            preset.classList.contains('active') ? localStorage.setItem('preset', 'none') : null;

            // If preset was active reset knob values and active preset in local storage
            if (preset.classList.contains('active')) {
                const handles = document.querySelectorAll('.knob-handle');
                localStorage.setItem('preset', 'none');
                updateKnobs(handles);
            }
            preset.remove();
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
    // Close
    closePopup();
}

function closePopup() {
    let popup = document.getElementById('popup');
    popup.remove();
}

function getTheme() {
    let theme = localStorage.getItem('theme');

    const getThemePreference = () => {
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

    // Check for theme in local storage
    if (!theme || theme && theme === 'auto') {
        getThemePreference();
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

function getPresets() {
    const presetsContainer = document.getElementById('presets');
    fetch(`api/presets`)
    // Convert response to JSON
    .then(response => response.json())
    .then(presets => {
        // For every preset in object create new html element
        for (let id in presets) {
            let preset = document.createElement('div');
            preset.classList.add('preset');
            preset.id = id;
            preset.innerHTML = `${presets[id]}<i class="trash bi bi-trash3"></i>`;

            // Prepend html element to presets container
            presetsContainer.prepend(preset);
        }
    })
    // Apply click functionality to all presets
    .then(() => {
        // Try to get activePreset from local storage if undefined set it to none
        let activePreset = localStorage.getItem('preset') || 'none';
        localStorage.setItem('preset', activePreset);
    
        // If activePreset does not equal none then apply the preset
        if (activePreset !== 'none') {
            var preset = document.getElementById(activePreset);
            preset.classList.add('active');
            if (window.location.pathname === '/') {
                applyPreset(preset.id);
            }
        }
        else if (window.location.pathname === '/') {
            // Update knobs to display correct values
            const handles = document.querySelectorAll('.knob-handle');
            updateKnobs(handles);
        }
    })
    .then(applyPresetFunctionality)
    .catch(error => {
        console.error('Error:', error);
    });
}

function applyPresetFunctionality() {
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

                // Unapply preset
                localStorage.setItem('preset', 'none');

                // Only update knobs if preset was unselected on the home page
                if (window.location.pathname === '/') {
                    const handles = document.querySelectorAll('.knob-handle');
                    updateKnobs(handles);
                }
            }
            // Deselect other presets if possible then select clicked preset
            else {
                presets.forEach(preset => preset.classList.contains('active') ? preset.classList.remove('active') : null);
                preset.classList.add('active');
                // Apply preset
                localStorage.setItem('preset', preset.id);
                applyPreset(preset.id);
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

export function applyPreset(id) {
    fetch(`api/${id}`)
    // Convert response to JSON
    .then(response => response.json())
    .then(knobValues => {
        // If request was made from home route update knobs and apply effects
        if (window.location.pathname === '/') {
            const handles = document.querySelectorAll('.knob-handle');
            updateKnobs(handles, knobValues);
        }
        // If request was not made from home route redirect the user to home
        else {
            window.location.href = '/';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// IDK why I did this? Kinda weird
function main() {
    getTheme();
    volume();

    if (window.location.pathname === '/') {
        // Initial knob load
        updateKnobs();
    }
    else if (window.location.pathname === '/login') {
        localStorage.setItem('preset', 'none');
    }

    // When searchbar is clicked update preset list
    let presets;
    const searchBar = document.getElementById('preset-searchbar');
    searchBar.onclick = () => presets = document.querySelectorAll('.preset');

    searchBar.addEventListener('input', () => {
        let query = searchBar.value.toLowerCase();
        // For each preset check if it matches the search query, if it doesn't, hide it
        presets.forEach(preset => {
            let name = preset.textContent.toLowerCase();
            name.includes(query) ?
            preset.style.display = 'block' :
            preset.style.display = 'none';
        });
    });   
}