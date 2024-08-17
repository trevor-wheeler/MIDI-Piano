if (window.location.pathname === '/') {
    // Wait for DOM to load before executing main function
    document.addEventListener('DOMContentLoaded', main);
}

// GLOBAL
import { keyStatus, knobSettings } from './objects.js';
import { piano, effectMap, createPopup } from './main.js';
var keyMouseDown = false;
var knobMouseDown = false;
var x;
var y;

function main() {
    WebMidi.enable().then(onEnabled).catch(err => alert(err));
    
    updateOrientation();
    
    // Select all keys that arent hidden
    const keys = document.querySelectorAll('.key:not(.hidden)');
    const mobileKeys = document.querySelectorAll('.mobile-key:not(.hidden)')

    const handles = document.querySelectorAll('.knob-handle');
    const savePresetBtn = document.getElementById('save-preset-btn');
    const clearBtn = document.getElementById('clear-btn');
    const defaultBtn = document.getElementById('default-btn');
    // Keep track of when the user isn't holding down the mouse
    document.addEventListener('mouseup', () => {
        keyMouseDown = false;
        knobMouseDown = false;
        document.body.style.cursor = 'default';
    });
    // Keep track of the cursor position
    document.addEventListener('mousemove', event => {
        x = event.clientX;
        y = event.clientY;
    })
    
    // For each key
    keys.forEach(key => {
        let note = key.getAttribute('data-note');
        let octave = key.getAttribute('data-octave');

        // When clicked play note
        key.addEventListener('mouseenter', () => {
            octave = key.getAttribute('data-octave');
            keyMouseDown && instrument(note, note+octave, parseInt(octave), true)
        });
        key.addEventListener('mousedown', () => {
            octave = key.getAttribute('data-octave');
            keyMouseDown = true;
            instrument(note, note+octave, parseInt(octave), true);
        });

        // When mouse button is released release the note
        key.addEventListener('mouseleave', () => {
            octave = key.getAttribute('data-octave');
            keyMouseDown && instrument(note, note+octave, parseInt(octave), false)
        });
        key.addEventListener('mouseup', () => {
            octave = key.getAttribute('data-octave');
            instrument(note, note+octave, parseInt(octave), false)
        });
    });

    // For each mobile key
    mobileKeys.forEach(key => {
        let note = key.getAttribute('data-note');
        let octave = key.getAttribute('data-octave');

        // When touched play note
        key.addEventListener('touchstart', () => {
            instrument(note, note+octave, parseInt(octave), true);
        });

        // When touch ends release note 
        key.addEventListener('touchend', () => {
            instrument(note, note+octave, parseInt(octave), false);
        });
    });

    // For each handle
    handles.forEach(handle => {
        var knob = document.getElementById(handle.dataset.pedal + handle.dataset.effect);

        // When knob is clicked handle the click control
        handle.addEventListener('mousedown', () => knobClickControl(handle, knob));

        let scrolling;
        handle.addEventListener('wheel', (event) => {
            // Prevent default scroll behavior
            event.preventDefault();
            // Reset Timeout if scrolling continues
            clearTimeout(scrolling);

            knob.style.setProperty('--dg-arc-color', 'var(--button-active)');
            var knobValue = parseInt(knob.getAttribute('value'));
            var translatedValue;

            // Move knob in intervals of 5
            if (event.deltaY > 0 && knobValue > 0) {
                knobValue -= 5;
                knobValue < 0 ? knobValue = 0: null;
            } else if (event.deltaY < 0 && knobValue < 200) {
                knobValue += 5;
                knobValue > 200 ? knobValue = 200: null;
            }

            // Update knob curve
            knob.setAttribute('value', knobValue);
            // Update knob labels and return formatted value
            translatedValue = translateKnobs(handle, knob, knobValue);

            // If scrolling stops for 300ms apply effects
            scrolling = setTimeout(() => {
                knob.style.setProperty('--dg-arc-color', 'var(--button)')
                // If preset is not selected update local storage
                localStorage.getItem('preset') === 'none' ? localStorage.setItem(knob.id, knobValue) : null;
                // Unless its the octave knob
                knob.id === 'pianooctave' ? localStorage.setItem(knob.id, knobValue) : null;
                applyEffects(translatedValue, knob);
            }, 300);
        });
    })

    savePresetBtn.onclick = (event) => createPopup(event.target);
    clearBtn.onclick = () => getLocalPreset('clear');
    defaultBtn.onclick = () => getLocalPreset('default');

    // Update the orientation when the window is resized
    window.addEventListener('resize', updateOrientation);
}

function knobClickControl(handle, knob) {

    // Get the users cursor position
    let initialY = y;
    let movement;
    var translatedValue;
    var knobValue = parseInt(knob.getAttribute('value'));

    knobMouseDown = true;
    document.body.style.cursor = 'pointer';
    knob.style.setProperty('--dg-arc-color', 'var(--button-active)');

    // Run this loop until the user lifts up on their mouse
    let interval = setInterval(() => {
        if (knobMouseDown) {
            // Difference between the starting cursor position and the current cursor position
            movement = initialY - y + knobValue;
            // Dont let the knob movement be greater than 200 or less than 0
            if (movement > 200) {
                movement = 200;
            }
            else if (movement < 0) {
                movement = 0;
            }
        
            // Update the knob to display the new value
            knob.setAttribute('value', movement);
            translatedValue = translateKnobs(handle, knob, movement);
        }
        else {
            knob.style.setProperty('--dg-arc-color', 'var(--button)');
            // If preset is not selected update local storage
            localStorage.getItem('preset') === 'none' ? localStorage.setItem(knob.id, movement) : null;
            // Unless its the octave knob
            knob.id === 'pianooctave' ? localStorage.setItem(knob.id, movement) : null;
            applyEffects(translatedValue, knob);
            clearInterval(interval);
        }
    }, 10);
}

export function updateKnobs(handles, presets) {
    if (handles) {
        // For each knob
        for (let i = 0; i < handles.length; i++) {
            var knob = document.getElementById(handles[i].dataset.pedal + handles[i].dataset.effect);
            var knobValue = parseInt(knob.getAttribute('value'));

            // If there is not a preset selected get knob values from local storage
            if (!presets) {
                if (localStorage.getItem(knob.id) !== null) {
                    knobValue = localStorage.getItem(knob.id)
                }
                else {
                    // If there are no knob values in local storage call getLocalPreset to get them
                    getLocalPreset('defaultWithOctave');
                    break;
                }


            }
            // If there is a preset selected try to get the knob values from the preset
            else {
                // If the preset doesn't contain a value for the knob use the value from local storage
                knobValue = presets[knob.id] || localStorage.getItem(knob.id);
            }

            // Update knob curve
            knob.setAttribute('value', knobValue);
            // Update knob label and return translated value
            var translatedValue = translateKnobs(handles[i], knob, knobValue);
            // Apply the translated value to the effect pedal
            applyEffects(translatedValue, knob);
        }
    }
    // If they updateKnobs function is called with no arguments set all knobs to 0
    else {
        const handles = document.querySelectorAll('.knob-handle');
        handles.forEach(handle => {
            var knob = document.getElementById(handle.dataset.pedal + handle.dataset.effect);
            knob.setAttribute('value', 0);
            translateKnobs(handle, knob, 0);
        });
    }
}

function onEnabled() {
    const devices = document.getElementById('devices');

    // Check for MIDI inputs
    if (WebMidi.inputs.length > 0) {
        // For each MIDI input create a dropdown option
        WebMidi.inputs.forEach(input => createDropdown(input, devices));
    }
    else {
        // Display "No devices"
        let msg = document.createElement('span');
        msg.textContent = "No devices";
        msg.classList.add('text')
        devices.appendChild(msg);
    }
}

function createDropdown(input, devices) {
    const midiBtn = document.getElementById('midi-btn');
    
    // Create a new dropdown option
    let device = document.createElement('button');
    device.classList.add('text', 'dropdown-item');
    device.textContent = input.name;
    device.id = input.id;

    // Create onclick function
    device.onclick = function() {

        // If device is already selected unselect it
        if (this.classList.contains('active')) {
            this.classList.remove('active');
            midiBtn.textContent = "MIDI: None";
            // Disconnect device
            WebMidi.getInputById(this.id).removeListener();
            console.log(`${this.textContent} disconnected`);
        }

        // If device isn't already selected select it
        else {
            // If any other device is selected unselect it
            Array.from(devices.children).forEach(device => {
                if (device.classList.contains('active')) {
                    device.classList.remove('active')
                    // Diconnect device
                    WebMidi.getInputById(device.id).removeListener()
                    console.log(`${device.textContent} disconnected`)
                }
            });

            // Connect device
            this.classList.add('active');
            midiBtn.textContent = `MIDI: ${this.textContent}`;
            connectDevice(this.id);
            console.log(`${this.textContent} connected`);
        }
    };

    // Append option to dropdown menu
    devices.appendChild(device);
}

function connectDevice(midiId) {
    // Listen for notes played
    WebMidi.getInputById(midiId).addListener("noteon", event => {
        let note;
        let octave = event.note.octave;
        event.note.accidental === '#' ? note = event.note.name + event.note.accidental : note = event.note.name;
        
        instrument(note, note+octave, parseInt(octave), true);
    });

    // Listen for notes released
    WebMidi.getInputById(midiId).addListener("noteoff", event => {
        let note;
        let octave = event.note.octave;
        event.note.accidental === '#' ? note = event.note.name + event.note.accidental : note = event.note.name;
        
        instrument(note, note+octave, parseInt(octave), false);
    });
}

function instrument(note, keyName, octave, event) {
    
    // Check if ToneJS is running if not start it
    if (Tone.context.state != "running") {
        Tone.start();
    }

    // Dont handle animation or trigger attack for keys out of range
    if (octave < 1 || octave > 7 && note !== 'C' ) {
        return
    }

    // Handle key animations
    handleAnimations(note, keyName, octave, event);

    if (event) {
        piano.triggerAttack(keyName);
    }
    else if (!event) {
        piano.triggerRelease(keyName);
    }
}

function handleAnimations(note, keyName, octave, event) {
    var key;
    
    // If user is on desktop select desktop keys
    if (window.innerWidth > 1200) {
        key = document.querySelector(`.key[data-note="${note}"][data-octave="${octave}"]`);
    }
    // If user is on mobile select mobile keys
    else {
        key = document.querySelector(`.mobile-key[data-note="${note}"][data-octave="${octave}"]`);
    }

    // Only display animation for keys in visible octave
    if (!key) {
        return
    }

    // If key is pressed down display animation
    if (event) {
        key.style.transition = 'all 0.1s ease-in-out';
        key.classList.add('active');
        // Set the keys animation status to in progress for 300ms
        keyStatus[keyName].animationInProgress = true;
        setTimeout(() => keyStatus[keyName].animationInProgress = false, 300);
    }
    // If key is lifted up display animation
    else if (!event) {
        let interval = setInterval(() => {
            // If the keys animation isn't in progress, display next animation 
            // Else continue checking animation status until its no longer in progress, then display next animation
            if (!keyStatus[keyName].animationInProgress) {
                key.classList.remove('active');
                // Wait 300 ms before removing transition
                setTimeout(() => key.style.transition = 'none', 300);
                clearInterval(interval);
            }
        }, 10);
    }

}

export function translateKnobs(handle, knob, knobValue) {
    let config = knobSettings[knob.id];

    // Adjust effect range to fit knob range
    let step = (config.max - config.min) / 200;
    let translatedValue = knobValue * step;

    // If knob is is at 0 dont display rounded edges
    if (translatedValue === 0) {
        knob.style.strokeLinecap = 'butt';
    }
    else {
        knob.style.strokeLinecap = 'round';
    }

    // Adjust knob value to respect minimum effect value
    translatedValue += config.min
    // Only show decimal places if value is a decimal number
    if (translatedValue % 1 == 0) {
        translatedValue = translatedValue.toFixed(0);
    }
    else {
        translatedValue = translatedValue.toFixed(config.places);
    }
    // If knob uses custom values use those instead
    if (!config.numeric) {
        translatedValue = config.customValues[translatedValue];
    }

    let unformatted = translatedValue;

    // Add value type if applicable
    translatedValue += config.type;
    // Return translated value to knob label
    handle.innerHTML = translatedValue;

    return unformatted;
}

export function applyEffects(value, knob) {
    const keys = document.querySelectorAll('.key:not(.hidden)');

    // Adjust percentage to normal range
    if (knobSettings[knob.id].type === '%') {
        value *= 0.01;
    }

    // If octave knob apply octave changes
    if (knob.id === 'pianooctave') {
        keys.forEach(key => {
            let octave = parseInt(key.getAttribute('data-octave'));
            let group = parseInt(key.getAttribute('data-group'));
            value = parseInt(value);
            octave = value + group - 1;

            key.setAttribute('data-octave', octave);
        });
    }
    // Else apply knob values to effects
    else {
        effectMap[knob.id](value);
    }
}

function getLocalPreset(preset) {
    fetch('static/piano/config.json')
     // Convert response to JSON
    .then(response => response.json())
    .then(data => {
        // If any presets are selected unselect them
        localStorage.setItem('preset', 'none');
        const presets = document.querySelectorAll('.preset');
        presets.forEach(preset => {
            preset.classList.contains('active') ? preset.classList.remove('active') : null;
        })

        // Select preset in config
        preset = data.presets[preset];
        // Update local storage
        for (let effect in preset) {
            localStorage.setItem(effect, preset[effect])
        }
        
        // Update knobs
        const handles = document.querySelectorAll('.knob-handle');
        updateKnobs(handles, preset);
    })
    .catch(error => console.error('Error:', error));
}

function updateOrientation() {
    const mobilePianoElements = document.querySelectorAll('.mobile-piano, .mobile-key');
    const mobilePiano = document.getElementById('mobile-piano-container');

    // Remove previous width and height inline styling
    mobilePiano.removeAttribute('style');

    // If window width is less than window height
    if (window.innerWidth < window.innerHeight) {
        // Display piano vertically
        mobilePianoElements.forEach(element => element.classList.add('vertical'));
        // If window width is greater than 428px change the width of the piano to be fixed
        if (window.innerWidth > 431) {
            mobilePiano.style.width = `${mobilePiano.offsetHeight * 0.35}px`;
        }
    // If window width is greator than window height
    } else {
        // Display piano horizontally
        mobilePianoElements.forEach(element => element.classList.remove('vertical'));
        // If window height is greater than 428px change the height of the piano to be fixed
        if (window.innerHeight > 428) {
            mobilePiano.style.height = `${mobilePiano.offsetWidth * 0.35}px`;
        }
    }
}