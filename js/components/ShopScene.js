import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export class ShopScene {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000510, 0.002); // Deep dark blue fog

        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 20, 100);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();

        this.initLights();
        this.buildStage();
        this.animate();

        window.addEventListener('resize', this.onResize.bind(this));
    }

    initLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft white light
        this.scene.add(ambientLight);

        // Projector Light (Blue/Cyan)
        this.spotLight = new THREE.SpotLight(0x00ffff, 2);
        this.spotLight.position.set(0, 50, 0);
        this.spotLight.angle = Math.PI / 6;
        this.spotLight.penumbra = 0.5;
        this.spotLight.decay = 2;
        this.spotLight.distance = 200;
        this.spotLight.castShadow = true;
        this.scene.add(this.spotLight);

        // Rim Light (Orange/Gold for contrast)
        const pointLight = new THREE.PointLight(0xffaa00, 1, 100);
        pointLight.position.set(50, 20, 50);
        this.scene.add(pointLight);
    }

    buildStage() {
        // --- 1. THE PEDESTAL (Projector Base) ---
        const geometry = new THREE.CylinderGeometry(30, 40, 5, 64);
        const material = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x001133,
            emissiveIntensity: 0.2
        });
        const base = new THREE.Mesh(geometry, material);
        base.position.y = -20;
        this.scene.add(base);

        // --- 2. HOLOGRAPHIC RINGS (Floating) ---
        this.rings = [];
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });

        for (let i = 0; i < 3; i++) {
            const ringGeo = new THREE.TorusGeometry(32 + (i * 5), 0.2, 16, 100);
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.y = -15 + (i * 2);
            ring.rotation.x = Math.PI / 2;
            this.rings.push({ mesh: ring, speed: (i + 1) * 0.2 * (i % 2 === 0 ? 1 : -1) });
            this.scene.add(ring);
        }

        // --- 3. VOLUMETRIC BEAM (Cone) ---
        const beamGeo = new THREE.ConeGeometry(30, 100, 64, 1, true); // Open ended
        const beamMat = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0x00ffff) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                varying vec2 vUv;
                void main() {
                    float opacity = (1.0 - vUv.y) * 0.3; // Fade out at top
                    float scanline = sin(vUv.y * 50.0 - time * 5.0) * 0.1;
                    gl_FragColor = vec4(color, opacity + scanline);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.beam = new THREE.Mesh(beamGeo, beamMat);
        this.beam.position.y = 30; // Center of cone
        this.beam.rotation.x = Math.PI; // Flip upside down so point is at bottom? No, standard cone point is top.
        // Actually, we want a cylinder/cone fading up.
        // Let's invert it.
        this.beam.geometry = new THREE.CylinderGeometry(35, 25, 120, 64, 1, true);
        this.scene.add(this.beam);

        // --- 4. PARTICLES (Floating Dust) ---
        const particlesGeo = new THREE.BufferGeometry();
        const particlesCount = 500;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 200; // Spread x,y,z
        }
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMat = new THREE.PointsMaterial({
            size: 0.5,
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        this.particles = new THREE.Points(particlesGeo, particlesMat);
        this.scene.add(this.particles);
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const time = this.clock.getElapsedTime();

        // Rotate Rings
        this.rings.forEach(r => {
            r.mesh.rotation.z += r.speed * 0.01;
            r.mesh.position.y += Math.sin(time * 2 + r.speed) * 0.02; // Float
        });

        // Pulse Beam
        if (this.beam) {
            this.beam.material.uniforms.time.value = time;
            this.beam.rotation.y -= 0.005;
        }

        // Float Particles
        if (this.particles) {
            this.particles.rotation.y = time * 0.05;
            this.particles.position.y = Math.sin(time * 0.2) * 2;
        }

        this.renderer.render(this.scene, this.camera);
    }
}
