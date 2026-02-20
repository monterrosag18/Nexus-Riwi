import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { createHologramMaterial } from '../utils/HologramMaterial.js';
import { VolumetricBeam } from '../utils/VolumetricBeam.js';

export class ShopScene {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Scene Setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000205, 0.0015); // Deep Void Blue

        this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 30, 180);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.container.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2(0, 0);
        this.targetCameraPos = new THREE.Vector2(0, 0);

        this.initLights();
        this.buildStage();
        this.buildHologram(); // The central item

        this.animate();

        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    initLights() {
        const ambientLight = new THREE.AmbientLight(0x000510, 2.0); // Darker, moodier
        this.scene.add(ambientLight);

        // Rim Light (Cyberpunk Pink - Stronger)
        const rimLight = new THREE.PointLight(0xff0055, 3, 300);
        rimLight.position.set(100, 60, -50);
        this.scene.add(rimLight);

        // Fill Light (Cyan - Softer)
        const fillLight = new THREE.PointLight(0x00f0ff, 1.5, 300);
        fillLight.position.set(-100, 20, 50);
        this.scene.add(fillLight);
    }

    buildStage() {
        // --- 1. FLOOR GRID (Infinite & Reflective-ish) ---
        const gridHelper = new THREE.GridHelper(2000, 100, 0x002266, 0x000511);
        gridHelper.position.y = -50;
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.15;
        this.scene.add(gridHelper);

        // --- 2. VOLUMETRIC GOD RAY (The "Realism" Upgrade) ---
        this.volumetricBeam = new VolumetricBeam(0x00f0ff);
        this.volumetricBeam.mesh.position.y = -50; // Base of unit
        this.scene.add(this.volumetricBeam.mesh);

        // --- 3. PROJECTOR BASE (Detailed Mesh) ---
        const baseGroup = new THREE.Group();
        baseGroup.position.y = -30;

        // Main Ring
        const ringGeo = new THREE.CylinderGeometry(40, 48, 6, 64);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a0a, metalness: 0.95, roughness: 0.15
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        baseGroup.add(ring);

        // Glowing Core
        const coreGeo = new THREE.CylinderGeometry(28, 28, 7, 32);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 1;
        baseGroup.add(core);

        // Floating Tech Rings
        this.techRings = [];
        for (let i = 0; i < 4; i++) {
            const tGeo = new THREE.TorusGeometry(55 + (i * 15), 0.3, 16, 100);
            const tMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.15 });
            const tMesh = new THREE.Mesh(tGeo, tMat);
            tMesh.rotation.x = Math.PI / 2;
            tMesh.userData = { speed: (i + 1) * 0.3, axis: i % 2 === 0 ? 1 : -1 };
            this.techRings.push(tMesh);
            baseGroup.add(tMesh);
        }

        this.scene.add(baseGroup);

        // --- 4. PARTICLES (Data Dust - More localized) ---
        const pGeo = new THREE.BufferGeometry();
        const count = 1500;
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            const r = Math.random() * 100 + 20; // Ring distribution
            const theta = Math.random() * Math.PI * 2;
            pos[i] = Math.cos(theta) * r;
            pos[i + 1] = (Math.random() - 0.5) * 150;
            pos[i + 2] = Math.sin(theta) * r;
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const pMat = new THREE.PointsMaterial({
            size: 0.5, color: 0x00ffff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending
        });
        this.particles = new THREE.Points(pGeo, pMat);
        this.scene.add(this.particles);
    }

    buildHologram() {
        // Placeholder Item (Sphere) - will be replaced by specific items
        const geometry = new THREE.IcosahedronGeometry(20, 2); // Low poly look handled by shader

        // USE OUR NEW HOLOGRAPHIC SHADER
        this.holoMaterial = createHologramMaterial(0x00f0ff);

        this.hologram = new THREE.Mesh(geometry, this.holoMaterial);
        this.hologram.position.y = 10;
        this.scene.add(this.hologram);

        // --- REALISM ADDITION: GROUND REFLECTION (Fake) ---
        this.reflection = this.hologram.clone();
        this.reflection.scale.y = -1; // Invert
        this.reflection.position.y = -70; // Position below floor (-30 base - 40 gap)
        this.reflection.material = this.holoMaterial.clone();
        this.reflection.material.uniforms.opacity.value = 0.15; // Faint
        this.reflection.material.uniforms.glitchStrength.value = 0.5; // More glitchy in reflection
        this.scene.add(this.reflection);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const time = this.clock.getElapsedTime();

        // 1. Update Hologram Shader
        if (this.holoMaterial) {
            this.holoMaterial.uniforms.time.value = time;
        }

        // 2. Update Volumetric Beam
        if (this.volumetricBeam) {
            this.volumetricBeam.update(time);
        }

        // 3. Animate Hologram Mesh
        if (this.hologram) {
            this.hologram.rotation.y += 0.005;
            this.hologram.rotation.z = Math.sin(time * 0.3) * 0.05;
            this.hologram.position.y = 10 + Math.sin(time * 0.8) * 3;
        }

        // 4. Animate Base Rings
        this.techRings.forEach(ring => {
            ring.rotation.z += ring.userData.speed * 0.005 * ring.userData.axis;
            // Wobble
            ring.rotation.x = (Math.PI / 2) + Math.sin(time * ring.userData.speed) * 0.05;
        });

        // 5. Particles Rotate
        if (this.particles) {
            this.particles.rotation.y = time * 0.05;
        }

        // 6. Parallax Camera
        this.camera.position.x += (this.targetCameraPos.x * 40 - this.camera.position.x) * 0.03;
        this.camera.position.y += (40 + this.targetCameraPos.y * 15 - this.camera.position.y) * 0.03;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }
}
