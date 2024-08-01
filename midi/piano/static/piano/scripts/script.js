document.addEventListener('DOMContentLoaded', main);

function main() {
    volume();
}

function volume() {
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const track = document.querySelector('.track');

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

    // When handle is moved update slider to display correct volume
    volumeSlider.addEventListener('input', () => {
        volume = volumeSlider.value;
        percentage = volume * 4;
        localStorage.setItem('volume', volume);

        volumeIcon.style.left = `calc(${percentage}% - (32px * ${percentage / 100}))`;
        track.style.background = `linear-gradient(to right, var(--button-active) ${percentage + (0.5 - percentage / 100)}%, #fff ${percentage + (0.5 - percentage / 100)}%)`;
        getIcon(volume);
    })
}