export class SpaceBackground {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.galaxyPoints = null;

        // Galaxy Parameters
        // Galaxy Parameters
        this.params = {
            count: 50000, // Reduced slightly for clarity
            size: 0.005, // Smaller stars for realism
            radius: 5,
            branches: 4, // More complex shape
            spin: 1,
            randomness: 0.5, // More scattered stars
            randomnessPower: 3,
            insideColor: '#ff4d00', // Deep intense orange core
            outsideColor: '#0a0a20' // Very dark blue/black outer rim
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
        // Disposition
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.params.count * 3);
        const colors = new Float32Array(this.params.count * 3);

        const colorInside = new THREE.Color(this.params.insideColor);
        const colorOutside = new THREE.Color(this.params.outsideColor);

        for (let i = 0; i < this.params.count; i++) {
            const i3 = i * 3;

            // Position
            const radius = Math.random() * this.params.radius;
            const spinAngle = radius * this.params.spin;
            const branchAngle = (i % this.params.branches) / this.params.branches * Math.PI * 2;

            const randomX = Math.pow(Math.random(), this.params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * this.params.randomness * radius;
            const randomY = Math.pow(Math.random(), this.params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * this.params.randomness * radius;
            const randomZ = Math.pow(Math.random(), this.params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * this.params.randomness * radius;

            positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY; // Flat galaxy on Y axis
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            // Color
            const mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside, radius / this.params.radius);

            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Material
        const material = new THREE.PointsMaterial({
            size: this.params.size,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });

        // Points
        // Points
        this.galaxyPoints = new THREE.Points(geometry, material);
        this.scene.add(this.galaxyPoints);

        // Add Background Stars (Distant Universe)
        this.addBackgroundStars();
    }

    addBackgroundStars() {
        const bgStarsGeometry = new THREE.BufferGeometry();
        const bgStarsCount = 2000;
        const bgPositions = new Float32Array(bgStarsCount * 3);

        for (let i = 0; i < bgStarsCount; i++) {
            const i3 = i * 3;
            // Scattered far away
            const x = (Math.random() - 0.5) * 50;
            const y = (Math.random() - 0.5) * 50;
            const z = (Math.random() - 0.5) * 50;
            bgPositions[i3] = x;
            bgPositions[i3 + 1] = y;
            bgPositions[i3 + 2] = z;
        }

        bgStarsGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));

        const bgStarsMaterial = new THREE.PointsMaterial({
            size: 0.02,
            sizeAttenuation: true,
            color: '#ffffff',
            transparent: true,
            opacity: 0.6,
            depthWrite: false
        });

        const bgStars = new THREE.Points(bgStarsGeometry, bgStarsMaterial);
        this.scene.add(bgStars);
    }
}
