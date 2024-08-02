
// Wait for DOM to load before executing main function
document.addEventListener('DOMContentLoaded', main);

// GLOBAL
import { keyStatus, samples } from './objects.js';

// Instruments
var piano = new Tone.Sampler({
    urls: samples,
    baseUrl: "static/piano/samples/",
    release: "1",
    curve: "exponential"
});

var limiter = new Tone.Limiter(-30);

piano.connect(limiter);
limiter.toDestination();

function main() {
    WebMidi.enable().then(onEnabled).catch(err => alert(err));
    // Select all keys that arent hidden
    const keys = document.querySelectorAll('.key:not(.hidden)');
    // Keep track of when the user isn't holding down the mouse
    var mouseDown = false;
    document.addEventListener('mouseup', () => mouseDown = false)
    
    // For each key
    keys.forEach(key => {
        let note = key.getAttribute('data-note');
        let octave= key.getAttribute('data-octave');

        // When clicked play note
        key.addEventListener('mouseenter', () => mouseDown && instrument(note, note+octave, parseInt(octave), true));
        key.addEventListener('mousedown', () => {
            mouseDown = true;
            instrument(note, note+octave, parseInt(octave), true);
        });

        // When mouse button is released release the note
        key.addEventListener('mouseleave', () => mouseDown && instrument(note, note+octave, parseInt(octave), false));
        key.addEventListener('mouseup', () => instrument(note, note+octave, parseInt(octave), false));
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