import { createHologramMaterial } from '../utils/HologramMaterial.js';
const THREE = window.THREE;

export class ShopScene {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.isSpinning = false;
        this.currentSpeed = 0.0005;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x02040a, 0.012);

        // Camera
        this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 1.5, 14);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();
        this.activeColor = new THREE.Color(0x22d3ee);

        this.buildStarField();
        this.buildPlatform();
        this.buildBeam();
        this.buildCore();
        this.initLights();
        this.animate();

        window.addEventListener('resize', this.onResize.bind(this));
    }

    // --- STAR FIELD (8000 particles) ---
    buildStarField() {
        const geo = new THREE.BufferGeometry();
        const count = 8000;
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            pos[i] = (Math.random() - 0.5) * 200;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            size: 0.12, color: 0xffffff,
            transparent: true, opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        this.starField = new THREE.Points(geo, mat);
        this.scene.add(this.starField);
    }

    // --- FLOOR & CEILING PLATFORM ---
    buildPlatform() {
        this.platformRings = [];

        const createDisk = (y, flip) => {
            const group = new THREE.Group();
            // Dark platform disk
            const diskGeo = new THREE.CylinderGeometry(7, 7.2, 0.6, 64);
            const diskMat = new THREE.MeshPhongMaterial({ color: 0x080808, shininess: 100 });
            const disk = new THREE.Mesh(diskGeo, diskMat);
            disk.position.y = y;
            group.add(disk);

            // Neon ring
            const ringGeo = new THREE.TorusGeometry(5, 0.06, 16, 100);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.8 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = y + (flip ? -0.35 : 0.35);
            group.add(ring);
            this.platformRings.push(ringMat);

            // Inner ring
            const ring2Geo = new THREE.TorusGeometry(3, 0.04, 16, 80);
            const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4 });
            const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
            ring2.rotation.x = Math.PI / 2;
            ring2.position.y = y + (flip ? -0.35 : 0.35);
            group.add(ring2);
            this.platformRings.push(ring2Mat);

            return group;
        };

        const floor = createDisk(-5, false);
        const ceiling = createDisk(9, true);
        this.scene.add(floor);
        this.scene.add(ceiling);
    }

    // --- CENTRAL BEAM ---
    buildBeam() {
        const geo = new THREE.CylinderGeometry(2.5, 4, 14, 32, 1, true);
        this.beamMat = new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            transparent: true,
            opacity: 0.06,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        this.beam = new THREE.Mesh(geo, this.beamMat);
        this.beam.position.y = 2;
        this.scene.add(this.beam);
    }

    // --- WIREFRAME CORE ---
    buildCore() {
        const geo = new THREE.IcosahedronGeometry(0.8, 0);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff, wireframe: true,
            transparent: true, opacity: 0.25
        });
        this.core = new THREE.Mesh(geo, mat);
        this.core.position.y = 1.5;
        this.scene.add(this.core);
    }

    // --- LIGHTS ---
    initLights() {
        this.pointLight = new THREE.PointLight(0x22d3ee, 4, 40);
        this.pointLight.position.set(0, 1.5, 0);
        this.scene.add(this.pointLight);

        const rim = new THREE.PointLight(0xff0055, 2, 50);
        rim.position.set(10, 5, -8);
        this.scene.add(rim);

        this.scene.add(new THREE.AmbientLight(0x303040, 0.8));
    }

    // --- PUBLIC API ---
    setSpinning(spinning) {
        this.isSpinning = spinning;
    }

    setColor(hexColor) {
        this.activeColor = new THREE.Color(hexColor);
    }

    // --- ANIMATION LOOP ---
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const time = this.clock.getElapsedTime();

        // Star rotation (accelerates when spinning)
        const targetSpeed = this.isSpinning ? 0.06 : 0.0005;
        this.currentSpeed += (targetSpeed - this.currentSpeed) * 0.04;
        if (this.starField) {
            this.starField.rotation.y += this.currentSpeed;
            this.starField.rotation.z += this.currentSpeed * 0.15;
        }

        // Core rotation
        if (this.core) {
            this.core.rotation.y += 0.015 + this.currentSpeed * 5;
            this.core.rotation.x = Math.sin(time * 0.5) * 0.3;
        }

        // Beam rotation
        if (this.beam) this.beam.rotation.y -= 0.008;

        // Pulse
        const pulse = Math.sin(time * 2.5) * 0.5 + 0.5;
        if (this.pointLight) {
            this.pointLight.intensity = this.isSpinning ? 12 : 3 + pulse * 3;
            this.pointLight.color.copy(this.activeColor);
        }
        if (this.beamMat) {
            this.beamMat.opacity = this.isSpinning ? 0.25 : 0.04 + pulse * 0.08;
            this.beamMat.color.copy(this.activeColor);
        }

        // Ring colors
        this.platformRings.forEach(mat => mat.color.copy(this.activeColor));

        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }
}
