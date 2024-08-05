const notes = ['C', 'C#', 'D', 'D#',  'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',]
export var keyStatus = createKeyStatus();
export var samples = createSamples();
export var knobSettings = {
    'attackpiano': {
        'numeric': true,
        'min': 0,
        'max': 10,
        'type': 's',
        'float': true,
        'places': 2,
        'customValues': []
    },
    'releasepiano': {
        'numeric': true,
        'min': 0,
        'max': 10,
        'type': 's',
        'float': true,
        'places': 2,
        'customValues': []
    },
    'curvepiano': {
        'numeric': false,
        'min': 0,
        'max': 1,
        'type': '',
        'float': false,
        'places': 0,
        'customValues': ['linear', 'expo']
    },
    'octavepiano': {
        'numeric': true,
        'min': 1,
        'max': 5,
        'type': '',
        'float': false,
        'places': 0,
        'customValues': []
    },
    'timedelaydelay': {
        'numeric': true,
        'min': 0,
        'max': 10,
        'type': 's',
        'float': true,
        'places': 2,
        'customValues': []
    },
    'feedbackdelay': {
        'numeric': true,
        'min': 0,
        'max': 100,
        'type': '%',
        'float': false,
        'places': 0,
        'customValues': []
    },
    'wetdelay': {
        'numeric': true,
        'min': 0,
        'max': 100,
        'type': '%',
        'float': false,
        'places': 0,
        'customValues': []
    },
    'predelayreverb': {
        'numeric': true,
        'min': 0,
        'max': 10,
        'type': 's',
        'float': true,
        'places': 2,
        'customValues': []
    },
    'decayreverb': {
        'numeric': true,
        'min': 0,
        'max': 100,
        'type': 's',
        'float': true,
        'places': 1,
        'customValues': []
    },
    'wetreverb': {
        'numeric': true,
        'min': 0,
        'max': 100,
        'type': '%',
        'float': false,
        'places': 0,
        'customValues': []
    },
    'distortiondistort': {
        'numeric': true,
        'min': 0,
        'max': 100,
        'type': '%',
        'float': false,
        'places': 0,
        'customValues': []
    },
    'oversampledistort': {
        'numeric': false,
        'min': 0,
        'max': 2,
        'type': '',
        'float': false,
        'places': 0,
        'customValues': ['none', '2x', '4x']
    },
    'wetdistort': {
        'numeric': true,
        'min': 0,
        'max': 100,
        'type': '%',
        'float': false,
        'places': 0,
        'customValues': []
    },
}

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