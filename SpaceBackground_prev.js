export class SpaceBackground {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.galaxyPoints = null;

        // Galaxy Parameters
        // Galaxy Parameters
        this.params = {
            count: 80000,
            size: 0.005,
            radius: 6,
            branches: 3,
            spin: 1,
            randomness: 0.2,
            randomnessPower: 3,
            insideColor: '#00f0ff', // Cyan Core
            outsideColor: '#1b00ff' // Deep Violet/Blue Rim
        };
    }

    init() {
        // 1. Scene
        this.scene = new THREE.Scene();

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.x = 3;
        this.camera.position.y = 3;
        this.camera.position.z = 4;
        this.scene.add(this.camera);

        // 3. Renderer
        const canvas = document.createElement('canvas');
        canvas.id = 'bg-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = 0;
        canvas.style.left = 0;
        canvas.style.width = '100%'; // CSS handles size
        canvas.style.height = '100%';
        canvas.style.zIndex = -1; // Behind everything
        canvas.style.pointerEvents = 'none'; // Click-through
        document.body.appendChild(canvas);

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true, // Transparent bg if needed
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 4. Generate Galaxy
        this.generateGalaxy();

        // 5. Resize Listener
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // 6. Animation Loop
        const clock = new THREE.Clock();

        const tick = () => {
            const elapsedTime = clock.getElapsedTime();

            // Rotate Galaxy
            if (this.galaxyPoints) {
                this.galaxyPoints.rotation.y = elapsedTime * 0.05;
                // Subtle shine effect or movement could go here
            }

            // Render
            this.renderer.render(this.scene, this.camera);
            window.requestAnimationFrame(tick);
        };

        tick();
    }

    generateGalaxy() {
        // We will create a "Dual Nebula" effect
        // Left side: Volumetric Orange/Red (The "Fire" nebula from image)
        // Right side: Deep Blue/Cold (The "Ice" space from image)

        const geometry = new THREE.BufferGeometry();
        const count = 10000; // High count for volume
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const randoms = new Float32Array(count * 3); // For movement

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Positioning: Spread wide across the screen
            // We want more density on the sides

            // Random position in a wide box
            const x = (Math.random() - 0.5) * 15;
            const y = (Math.random() - 0.5) * 10;
            const z = (Math.random() - 0.5) * 8;

            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;

            // Randoms for animation (Brownian motion)
            randoms[i3] = Math.random();
            randoms[i3 + 1] = Math.random();
            randoms[i3 + 2] = Math.random();

            // Color Logic based on X position
            const color = new THREE.Color();

            if (x < -1) {
                // LEFT SIDE (Orange/Red Nebula)
                // Mix of Red, Orange, and some Purple
                if (Math.random() > 0.5) {
                    color.set('#ff4d00'); // Orange
                } else {
                    color.set('#a61c3c'); // Deep Red
                }
                // Fade out towards center
            } else if (x > 1) {
                // RIGHT SIDE (Blue/Cyan Nebula)
                if (Math.random() > 0.5) {
                    color.set('#00f0ff'); // Cyan
                } else {
                    color.set('#0055ff'); // Deep Blue
                }
            } else {
                // CENTER (Mix/Transition - Darker)
                color.set('#1b00ff');
                color.multiplyScalar(0.5); // Darker in center
            }

            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            // Sizes: Varied for depth
            sizes[i] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));

        // Material with custom shader-like behavior via size attenuation
        const material = new THREE.PointsMaterial({
            size: 0.05,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        this.galaxyPoints = new THREE.Points(geometry, material);
        this.scene.add(this.galaxyPoints);

        // Add distant stars
        this.addBackgroundStars();
    }

    addBackgroundStars() {
        const geometry = new THREE.BufferGeometry();
        const count = 5000;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 10; // Push back
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            size: 0.02,
            sizeAttenuation: true,
            color: '#ffffff',
            transparent: true,
            opacity: 0.6,
            depthWrite: false
        });
        this.scene.add(new THREE.Points(geometry, material));
    }
}
