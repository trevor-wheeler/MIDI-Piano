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

export var knobSettings = {
    'pianoattack': {
        'numeric': true,
        'min': 0,
        'max': 10,
        'type': 's',
        'float': true,
        'places': 2,
        'customValues': []
    },
    'pianorelease': {
        'numeric': true,
        'min': 0.05,
        'max': 10,
        'type': 's',
        'float': true,
        'places': 2,
        'customValues': []
    },
    'pianocurve': {
        'numeric': false,
        'min': 0,
        'max': 1,
        'type': '',
        'float': false,
        'places': 0,
        'customValues': ['linear', 'expo']
    },
    'pianooctave': {
        'numeric': true,
        'min': 1,
        'max': 5,
        'type': '',
        'float': false,
        'places': 0,
        'customValues': []
    },
    'delaydelaytime': {
        'numeric': true,
        'min': 0,
        'max': 100,
        'type': '%',
        'float': false,
        'places': 0,
        'customValues': []
    },
    'delayfeedback': {
        'numeric': true,
        'min': 0,
        'max': 100,
        'type': '%',
        'float': false,
        'places': 0,
        'customValues': []
    },
    'delaywet': {
        'numeric': true,
        'min': 0,
        'max': 100,
        'type': '%',
        'float': false,
        'places': 0,
        'customValues': []
    },
    'reverbpredelay': {
        'numeric': true,
        'min': 0,
        'max': 10,
        'type': 's',
        'float': true,
        'places': 2,
        'customValues': []
    },
    'reverbdecay': {
        'numeric': true,
        'min': 0.5,
        'max': 100,
        'type': 's',
        'float': true,
        'places': 1,
        'customValues': []
    },
    'reverbwet': {
        'numeric': true,
        'min': 0,
        'max': 100,
        'type': '%',
        'float': false,
        'places': 0,
        'customValues': []
    },
    'distortiondistortion': {
        'numeric': true,
        'min': 0,
        'max': 100,
        'type': '%',
        'float': false,
        'places': 0,
        'customValues': []
    },
    'distortionoversample': {
        'numeric': false,
        'min': 0,
        'max': 2,
        'type': '',
        'float': false,
        'places': 0,
        'customValues': ['none', '2x', '4x']
    },
    'distortionwet': {
        'numeric': true,
        'min': 0,
        'max': 100,
        'type': '%',
        'float': false,
        'places': 0,
        'customValues': []
    },
}