
// Wait for DOM to load before executing main function
document.addEventListener('DOMContentLoaded', main);

// GLOBAL
import { keyStatus, samples, knobSettings } from './objects.js';

// Instruments
const piano = new Tone.Sampler({
    urls: samples,
    baseUrl: "static/piano/samples/",
    release: "1",
    curve: "exponential"
});

// Effects
const limiter = new Tone.Limiter(-30);
const delay = new Tone.FeedbackDelay;
const reverb = new Tone.Reverb;
const distort = new Tone.Distortion;


piano.connect(limiter);
limiter.toDestination();

function main() {
    WebMidi.enable().then(onEnabled).catch(err => alert(err));
    // Select all keys that arent hidden
    const keys = document.querySelectorAll('.key:not(.hidden)');

    const powerBtns = document.querySelectorAll('.power');
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
        let octave= key.getAttribute('data-octave');

        // When clicked play note
        key.addEventListener('mouseenter', () => keyMouseDown && instrument(note, note+octave, parseInt(octave), true));
        key.addEventListener('mousedown', () => {
            keyMouseDown = true;
            instrument(note, note+octave, parseInt(octave), true);
        });

        // When mouse button is released release the note
        key.addEventListener('mouseleave', () => keyMouseDown && instrument(note, note+octave, parseInt(octave), false));
        key.addEventListener('mouseup', () => instrument(note, note+octave, parseInt(octave), false));
    });

    // For each knob
    handles.forEach(handle => {
        var effect = handle.dataset.effect;
        var pedal = handle.dataset.pedal;
        var knob = document.getElementById(effect + pedal);
        var knobValue = parseInt(knob.getAttribute('value'));

        // Update knobs to display correct values
        translateKnobs(handle, knob, knobValue);
    
        // Listen for click
        handle.addEventListener('mousedown', () => {
            // Get the users cursor position
            let initialY = y;
            knobValue = parseInt(knob.getAttribute('value'));

            knobMouseDown = true;
            document.body.style.cursor = 'pointer';
            knob.style.setProperty('--dg-arc-color', 'var(--button-active)');
        
            // Run this loop until the user lifts up on their mouse
            let interval = setInterval(() => {
                if (knobMouseDown) {
                    // Difference between the starting cursor position and the current cursor position
                    let movement = initialY - y + knobValue;
                    // Dont let the difference be greater than 200 or less than 0
                    if (movement > 200) {
                        movement = 200;
                    }
                    else if (movement < 0) {
                        movement = 0;
                    }
        
                    // Update the knob to display the new value
                    knob.setAttribute('value', movement);
                    translateKnobs(handle, knob, movement);
                }
                else {
                    knob.style.setProperty('--dg-arc-color', 'var(--button)');
                    clearInterval(interval);
                }
            }, 10);
        });
    })

    // Power button for each pedal
    powerBtns.forEach(powerBtn => {
        addEventListener('mousedown', () => {
            let power = powerBtn.dataset.turnedOn;
            // Toggle power
            power === "true" ? powerBtn.dataset.turnedOn = false : powerBtn.dataset.turnedOn = true;

            // TODO
        });
    });

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

    // Handle key animations
    handleAnimations(note, keyName, octave, event);

    // TODO
    if (event) {
        piano.triggerAttack(keyName);
    }
    else if (!event) {
        piano.triggerRelease(keyName);
    }
}

function handleAnimations(note, keyName, octave, event) {
    var key = document.querySelector(`[data-note="${note}"][data-octave="${octave}"]`);

    // Only display animations of visible keys 
    if (octave > 1 && octave < 5 || octave === 5 && note === 'C') {
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

    applyEffects(translatedValue);

    // Add value type if applicable
    translatedValue += config.type;
    // Return translated value to knob label
    handle.innerHTML = translatedValue;
}

function applyEffects() {
    // TODO
}