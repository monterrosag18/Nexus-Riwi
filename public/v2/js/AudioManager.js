const THREE = window.THREE;

/**
 * AudioManager — handles background music and UI sound effects
 */
export class AudioManager {
    constructor(camera) {
        this.camera = camera;
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);

        this.bgMusic = new THREE.Audio(this.listener);
        this.audioLoader = new THREE.AudioLoader();
        
        this.isMuted = false;
        this.hasStarted = false;

        // Sound buffer storage
        this.buffers = {};
        
        this._init();
    }

    _init() {
        // Load background music
        this.audioLoader.load('assets/sonidoEspacial.mp3', (buffer) => {
            this.bgMusic.setBuffer(buffer);
            this.bgMusic.setLoop(true);
            this.bgMusic.setVolume(0.5);
            
            // Note: Auto-play usually blocked by browser until user click
            console.log("Audio: Background music loaded.");
        });
    }

    start() {
        if (!this.hasStarted && this.bgMusic.buffer) {
            this.bgMusic.play();
            this.hasStarted = true;
            console.log("Audio: Background music started.");
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const volume = this.isMuted ? 0 : 0.5;
        this.bgMusic.setVolume(volume);
        
        // Return mute state for UI updates
        return this.isMuted;
    }

    setVolume(value) {
        if (!this.isMuted) {
            this.bgMusic.setVolume(value);
        }
    }
}
