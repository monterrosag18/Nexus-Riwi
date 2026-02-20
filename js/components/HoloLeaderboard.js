import { store } from '../store.js';
import { createHologramMaterial } from '../utils/HologramMaterial.js';
import { Text } from 'https://unpkg.com/troika-three-text@0.47.1/dist/troika-three-text.esm.js';

// Pre-define Clan Colors to match style.css variables
const CLAN_COLORS = {
    turing: 0x00f0ff,
    tesla: 0xff2a2a,
    mccarthy: 0x00ff88,
    lovelace: 0xaa00ff,
    neumann: 0xff6600
};

export class HoloLeaderboard {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.cards = [];

        // Interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.targetRotation = 0;

        this.init();
    }

    init() {
        // SCENE
        this.scene = new THREE.Scene();
        // Add some environmental fog for depth
        this.scene.fog = new THREE.FogExp2(0x000000, 0.002);

        // CAMERA
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.z = 15;
        this.camera.position.y = 2;

        // RENDERER
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // LIGHTS
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x00f0ff, 1, 100);
        pointLight.position.set(0, 5, 5);
        this.scene.add(pointLight);

        console.log("HoloLeaderboard initialized. Container dimensions:", this.container.clientWidth, this.container.clientHeight);

        // CREATE CARDS
        this.createLeaderboardCards();

        // EVENTS
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.container.addEventListener('mousemove', this.onMouseMove.bind(this));

        // ANIMATION LOOP
        this.animate();
    }

    createLeaderboardCards() {
        // Get Data
        const state = store.getState();
        const clans = Object.values(state.clans).sort((a, b) => b.points - a.points);

        const cardWidth = 8;
        const cardHeight = 1.5;
        const gap = 0.5;

        // Group to hold all cards
        this.cardGroup = new THREE.Group();
        this.scene.add(this.cardGroup);

        clans.forEach((clan, index) => {
            const yPos = 3 - (index * (cardHeight + gap)); // Stack vertically

            // 1. Backing Panel (Real Hologram Material)
            const geometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
            const color = CLAN_COLORS[clan.name.toLowerCase()] || 0xffffff;

            // Use Hologram Material with high opacity for visibility
            const material = createHologramMaterial(color);
            material.uniforms.opacity.value = 0.8;
            material.side = THREE.DoubleSide;

            const cardMesh = new THREE.Mesh(geometry, material);
            cardMesh.position.y = yPos;
            cardMesh.userData = { id: clan.name, originalY: yPos }; // For interaction

            // 2. Text (Troika)
            this.addTextToCard(cardMesh, index + 1, clan, 0xffffff);

            // Add to Group
            this.cardGroup.add(cardMesh);
            this.cards.push(cardMesh);
        });
    }

    addTextToCard(parent, rank, clan, color) {
        // Use a reliable font URL (Roboto or similar standard web font that supports CORS)
        const fontURL = "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxM.woff";

        // Rank Number
        const rankText = new Text();
        rankText.text = `#${rank}`;
        rankText.fontSize = 0.8;
        rankText.position.set(-3.5, 0, 0.2); // Moved z slightly forward to avoid z-fighting
        rankText.color = rank === 1 ? 0xffd700 : (rank === 2 ? 0xc0c0c0 : (rank === 3 ? 0xcd7f32 : 0x888888));
        rankText.anchorX = 'center';
        rankText.anchorY = 'middle';
        rankText.font = fontURL;
        parent.add(rankText);
        rankText.sync();

        // Clan Name
        const nameText = new Text();
        nameText.text = clan.name.toUpperCase();
        nameText.fontSize = 0.6;
        nameText.position.set(-1.5, 0.2, 0.2);
        nameText.color = 0xffffff;
        nameText.anchorX = 'left';
        nameText.anchorY = 'middle';
        nameText.font = fontURL;
        parent.add(nameText);
        nameText.sync();

        // Points
        const pointsText = new Text();
        pointsText.text = `${clan.points.toLocaleString()} PTS`;
        pointsText.fontSize = 0.4;
        pointsText.position.set(3.5, 0, 0.2);
        pointsText.color = color; // Use white for high contrast or passed color? Use passed color (white in call)
        // Actually passed color is 0xffffff in createLeaderboardCards call, so let's stick to clan color for points
        pointsText.color = CLAN_COLORS[clan.name.toLowerCase()] || 0xffffff;

        pointsText.anchorX = 'right';
        pointsText.anchorY = 'middle';
        pointsText.font = fontURL;
        parent.add(pointsText);
        pointsText.sync();

        // Members (Subtitle)
        const membersText = new Text();
        membersText.text = `${clan.members} CODERS`;
        membersText.fontSize = 0.25;
        membersText.position.set(-1.5, -0.3, 0.2);
        membersText.color = 0xaaaaaa;
        membersText.anchorX = 'left';
        membersText.anchorY = 'middle';
        membersText.font = fontURL;
        parent.add(membersText);
        membersText.sync();
    }

    onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Tilt logic based on mouse X
        this.targetRotation = this.mouse.x * 0.2; // Max tilt 0.2 rads
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));

        const time = performance.now() * 0.001;

        // Rotate Global Group gently
        if (this.cardGroup) {
            // Smooth lerp to mouse position
            this.cardGroup.rotation.y += (this.targetRotation - this.cardGroup.rotation.y) * 0.05;
            // Add idle bobbing
            this.cardGroup.position.y = Math.sin(time * 0.5) * 0.2;
        }

        // Update Shader Uniforms
        this.cards.forEach((card, i) => {
            if (card.material.uniforms) {
                card.material.uniforms.time.value = time;
                // Add staggered float
                card.position.y = card.userData.originalY + Math.sin(time * 2 + i) * 0.05;
            }
        });

        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this.onWindowResize);
        if (this.container && this.renderer) {
            this.container.removeChild(this.renderer.domElement);
        }
        // Dispose Geometries/Materials/Textures to avoid memory leaks
        this.cards.forEach(card => {
            card.geometry.dispose();
            card.material.dispose();
        });
    }
}
