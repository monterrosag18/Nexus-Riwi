const THREE = window.THREE;

export class BridgeHUD {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        // BridgeHUD cockpit frame removed — it was causing the dark diamond overlay
        // and the opacity shift when moving the mouse
    }

    update() {
        // No-op
    }
}
