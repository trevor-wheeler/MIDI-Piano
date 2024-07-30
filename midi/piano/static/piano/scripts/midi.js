document.addEventListener('DOMContentLoaded', main);

function main() {
    WebMidi.enable().then(onEnabled).catch(err => alert(err));
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
        console.log(`Play ${event.note.identifier}`);
    });

    // Listen for notes released
    WebMidi.getInputById(midiId).addListener("noteoff", event => {
        console.log(`Release ${event.note.identifier}`);
    });
}