
// Wait for DOM to load before executing main function
document.addEventListener('DOMContentLoaded', main);

// GLOBAL
import { keyStatus, knobSettings } from './objects.js';
import { piano, effectMap } from './main.js';

function main() {
    WebMidi.enable().then(onEnabled).catch(err => alert(err));
    // Select all keys that arent hidden
    const keys = document.querySelectorAll('.key:not(.hidden)');

    const savePresetBtn = document.getElementById('save-preset-btn');
    const handles = document.querySelectorAll('.knob-handle');
    // Keep track of when the user isn't holding down the mouse
    var keyMouseDown = false;
    var knobMouseDown = false;
    document.addEventListener('mouseup', () => {
        keyMouseDown = false;
        knobMouseDown = false;
        document.body.style.cursor = 'default';
    });
    // Keep track of the cursor position
    var x;
    var y;
    document.addEventListener('mousemove', event => {
        x = event.clientX;
        y = event.clientY
    })
    
    // For each key
    keys.forEach(key => {
        let note = key.getAttribute('data-note');
        let octave = key.getAttribute('data-octave');

        // When clicked play note
        key.addEventListener('mouseenter', () => {
            note = key.getAttribute('data-note');
            octave = key.getAttribute('data-octave');

            keyMouseDown && instrument(note, note+octave, parseInt(octave), true)
        });
        key.addEventListener('mousedown', () => {
            note = key.getAttribute('data-note');
            octave = key.getAttribute('data-octave');

            keyMouseDown = true;
            instrument(note, note+octave, parseInt(octave), true);
        });

        // When mouse button is released release the note
        key.addEventListener('mouseleave', () => {
            note = key.getAttribute('data-note');
            octave = key.getAttribute('data-octave');

            keyMouseDown && instrument(note, note+octave, parseInt(octave), false)
        });
        key.addEventListener('mouseup', () => {
            note = key.getAttribute('data-note');
            octave= key.getAttribute('data-octave');
        
            instrument(note, note+octave, parseInt(octave), false)
        });
    });

    // For each knob
    handles.forEach(handle => {
        var effect = handle.dataset.effect;
        var pedal = handle.dataset.pedal;
        var knob = document.getElementById(pedal + effect);
        var knobValue = parseInt(knob.getAttribute('value'));

        // Grab effect data from local storage
        if (localStorage.getItem(pedal + effect) !== null) {
            knobValue = localStorage.getItem(knob.id);
        }
        else {
            localStorage.setItem(knob.id, knobValue);
        }

        // Update knobs to display correct values
        knob.setAttribute('value', knobValue);
        var translatedValue = translateKnobs(handle, knob, knobValue);
        applyEffects(translatedValue, knob);
    
        // Listen for click
        handle.addEventListener('mousedown', () => {
            // Get the users cursor position
            let initialY = y;
            let movement;
            knobValue = parseInt(knob.getAttribute('value'));

            knobMouseDown = true;
            document.body.style.cursor = 'pointer';
            knob.style.setProperty('--dg-arc-color', 'var(--button-active)');
        
            // Run this loop until the user lifts up on their mouse
            let interval = setInterval(() => {
                if (knobMouseDown) {
                    // Difference between the starting cursor position and the current cursor position
                    movement = initialY - y + knobValue;
                    // Dont let the difference be greater than 200 or less than 0
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
                    localStorage.setItem(knob.id, movement);
                    applyEffects(translatedValue, knob);
                    clearInterval(interval);
                }
            }, 10);
        });
    })

    savePresetBtn.onclick = (event) => createPopup(event.target);
}

function createPopup(element) {
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
        <button class="button popup-btn form-button" id="cancel-btn">No</button>
        <button class="button popup-btn form-button" id="confirm-btn">Yes</button></div></div>`

        body.append(popup);
        document.getElementById('confirm-btn').addEventListener('click', () => deletePreset(element.id));
    }

    document.getElementById('cancel-btn').addEventListener('click', closePopup);
}

function savePreset(input) {
    var preset = {};
    var csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;

    preset.values = {};
    preset.name = input.value;

    for (let effect in effectMap) {
        preset.values[effect] = localStorage.getItem(effect);
    }

    fetch('api/preset/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(preset)
    })
    .catch(error => {
        console.error('Error:', error);
    });

    closePopup();
}

function deletePreset(id) {
    // TODO

    closePopup();
}

function closePopup() {
    let popup = document.getElementById('popup');
    popup.remove();
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
    var key = document.querySelector(`[data-note="${note}"][data-octave="${octave}"]`);

    // Only display animation for keys in visible octave
    if (!key) {
        return
    }

    // If key is pressed down display animation
    if (event) {
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
                clearInterval(interval);
            }
        }, 10);
    }

}

function translateKnobs(handle, knob, knobValue) {
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

function applyEffects(value, knob) {
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