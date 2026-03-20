const THREE = window.THREE;

export class NexusCore {
    constructor(scene) {
        this.scene = scene;
        this.model = null;
        this.mixer = null;
    }

    init() {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            const loadingText = document.querySelector('#loading-screen p');
            
            loader.load('assets/nexus_model.glb', 
                (gltf) => {
                    this.model = gltf.scene;
                    
                    // 1. Auto-center the model around its own bounding box center
                    const box = new THREE.Box3().setFromObject(this.model);
                    const center = box.getCenter(new THREE.Vector3());
                    this.model.position.sub(center); // Moves model so its center = origin

                    // Scale to ~320 units — dominant center piece
                    const size = box.getSize(new THREE.Vector3()).length();
                    const scalar = 500 / size;
                    this.model.scale.set(scalar, scalar, scalar);

                    // 3. Keep original materials (they look great already)
                    this.model.traverse((child) => {
                        if (child.isMesh && child.material) {
                            child.material.side = THREE.DoubleSide;
                            child.material.depthWrite = true;
                        }
                    });

                    this.scene.add(this.model);

                    if (gltf.animations && gltf.animations.length > 0) {
                        this.mixer = new THREE.AnimationMixer(this.model);
                        gltf.animations.forEach((clip) => {
                            this.mixer.clipAction(clip).play();
                        });
                    }

                    resolve();
                },
                (xhr) => {
                    if (loadingText) {
                        const percent = (xhr.total > 0) ? (xhr.loaded / xhr.total * 100).toFixed(0) : 0;
                        loadingText.innerText = `SYNCHRONIZING NEXUS CORE: ${percent}%`;
                    }
                },
                (error) => {
                    console.error('Error loading Nexus Core:', error);
                    reject(error);
                }
            );
        });
    }

    update(time) {
        if (this.model) {
            this.model.rotation.y += 0.002;
            // Float gently above the hex grid center (hexes are at y=-5)
            this.model.position.y = 80 + Math.sin(time * 0.4) * 4;
        }
        if (this.mixer) {
            this.mixer.update(0.016); 
        }
    }
}
