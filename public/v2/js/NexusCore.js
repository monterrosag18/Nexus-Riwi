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
            
            // Use the moved model from assets
            loader.load('assets/nexus_model.glb', 
                (gltf) => {
                    this.model = gltf.scene;
                    
                    // Center and Scale adjustment
                    this.model.position.set(0, 0, 0);
                    
                    const box = new THREE.Box3().setFromObject(this.model);
                    const size = box.getSize(new THREE.Vector3()).length();
                    const scalar = 450 / size; 
                    this.model.scale.set(scalar, scalar, scalar);

                    // Restore original materials but enable bloom layer for emissive parts
                    this.model.traverse((child) => {
                        if (child.isMesh) {
                            child.layers.enable(1); // Enable bloom for all for now, or just specific if we knew names
                            if (child.material) {
                                child.material.transparent = true;
                                child.material.opacity = 1.0;
                                child.material.side = THREE.DoubleSide;
                            }
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
            this.model.position.y = 50 + Math.sin(time * 0.3) * 5; // Hover above the hex grid
        }
        if (this.mixer) {
            this.mixer.update(0.016); 
        }
    }
}
