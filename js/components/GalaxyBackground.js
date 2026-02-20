import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export class GalaxyBackground {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.sunMesh = null;
        this.sunGlow = null;
        this.starfield = null;

        this.init();
    }

    init() {
        // Texture Loader
        const loader = new THREE.TextureLoader();
        const basePath = './assets/textures/';

        // 1. STARFIELD
        const starsGeo = new THREE.SphereGeometry(4000, 64, 64);
        const starsMat = new THREE.MeshBasicMaterial({
            map: loader.load(basePath + '8k_stars.jpg'),
            side: THREE.BackSide
        });
        this.starfield = new THREE.Mesh(starsGeo, starsMat);
        this.group.add(this.starfield);

        // 2. THE SUN
        const sunGeo = new THREE.SphereGeometry(15, 64, 64); // Large Sun
        const sunMat = new THREE.MeshBasicMaterial({
            map: loader.load(basePath + '8k_sun.jpg'),
            color: 0xffaa00
        });
        this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
        this.group.add(this.sunMesh);

        // 3. SUN GLOW (Lensflare)
        const flareMat = new THREE.SpriteMaterial({
            map: loader.load(basePath + 'lensflare0.png'),
            color: 0xffaa00,
            transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending
        });
        this.sunGlow = new THREE.Sprite(flareMat);
        this.sunGlow.scale.set(100, 100, 1);
        this.sunMesh.add(this.sunGlow);
    }

    update() {
        // Rotate Sun
        if (this.sunMesh) {
            this.sunMesh.rotation.y += 0.002;
        }
        // Slowly rotate stars for dynamism
        if (this.starfield) {
            this.starfield.rotation.y += 0.0001;
        }
    }
}
