const notes = ['C', 'C#', 'D', 'D#',  'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',]
export var keyStatus = createKeyStatus();
export var samples = createSamples();

function createKeyStatus() {
    var object = {};
    for (let i=1; i < 9; i++) {
        notes.forEach(note => {
            var key = note + i;
            if (i < 8 || note === 'C')
            object[key] = {'animationInProgress': false}
        });
    }
    return object;
}

function createSamples() {
    var object = {};
    for (let i=1; i < 9; i++) {
        notes.forEach(note => {
            var key = note + i;
            if (i < 8 || note === 'C')
            object[key] = `${key}.mp3`
        });
    }
    return object;
}