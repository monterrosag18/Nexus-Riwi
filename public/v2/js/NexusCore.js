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
                    const scalar = 450 / size; // Slightly larger for emphasis
                    this.model.scale.set(scalar, scalar, scalar);

                    this.model.traverse((child) => {
                        if (child.isMesh) {
                            child.layers.enable(1); // BLOOM
                            child.material = new THREE.MeshStandardMaterial({
                                color: 0x00f3ff,
                                emissive: 0x00f3ff,
                                emissiveIntensity: 0.8,
                                metalness: 0.9,
                                roughness: 0.1,
                                transparent: true,
                                opacity: 1.0
                            });
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
                        const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
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
            // Gentle idle rotation
            this.model.rotation.y += 0.005;
            this.model.position.y = Math.sin(time * 0.5) * 10 + 50; // Gentle floating
        }
        if (this.mixer) {
            this.mixer.update(0.016); // Approx 60fps
        }
    }
}
