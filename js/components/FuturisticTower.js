import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export class FuturisticTower {
    constructor() {
        this.group = new THREE.Group();
        this.materials = {
            metal: new THREE.MeshStandardMaterial({
                color: 0x333344,
                metalness: 0.8,
                roughness: 0.2,
            }),
            glass: new THREE.MeshStandardMaterial({
                color: 0x112244,
                metalness: 0.9,
                roughness: 0.1,
                transparent: true,
                opacity: 0.8
            }),
            glow: new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            })
        };

        this.buildTower();
    }

    buildTower() {
        // Build a massive, high-detail Stark-style tower

        // 1. Massive Base Structure (The anchor)
        const baseGeo = new THREE.CylinderGeometry(28, 35, 40, 16);
        const base = new THREE.Mesh(baseGeo, this.materials.metal);
        base.position.y = 20;
        this.group.add(base);

        // Sub-layers of the base
        const subBaseGeo = new THREE.CylinderGeometry(32, 32, 5, 16);
        const subBase = new THREE.Mesh(subBaseGeo, this.materials.metal);
        subBase.position.y = 5;
        this.group.add(subBase);

        // 2. Main Ascending Body (Swept back somewhat)
        const bodyGeo = new THREE.CylinderGeometry(15, 25, 120, 16);
        const body = new THREE.Mesh(bodyGeo, this.materials.glass);
        body.position.y = 100;
        this.group.add(body);

        // Metallic exoskeleton wrapping the glass body
        const exoGeo = new THREE.CylinderGeometry(16, 26, 120, 8, 1, true); // Open ended hollow tube
        const exo = new THREE.Mesh(exoGeo, new THREE.MeshStandardMaterial({
            color: 0x222233, metalness: 0.9, roughness: 0.2, wireframe: true, wireframeLinewidth: 2
        }));
        exo.position.y = 100;
        this.group.add(exo);

        // Glow strips running up the side
        const stripGeo = new THREE.BoxGeometry(2, 120, 2);
        for (let i = 0; i < 4; i++) {
            const strip = new THREE.Mesh(stripGeo, this.materials.glow);
            strip.position.y = 100;
            // Radius of body averages ~20
            strip.position.x = Math.sin((i / 4) * Math.PI * 2) * 21;
            strip.position.z = Math.cos((i / 4) * Math.PI * 2) * 21;
            // Angle the strips inward matching the taper
            strip.rotation.x = Math.cos((i / 4) * Math.PI * 2) * 0.08;
            strip.rotation.z = -Math.sin((i / 4) * Math.PI * 2) * 0.08;
            this.group.add(strip);
        }

        // 3. The "Stark" Platform / Landing Pad (Asymmetrical overhang)
        const platformBaseGeo = new THREE.CylinderGeometry(20, 12, 15, 16);
        const platformBase = new THREE.Mesh(platformBaseGeo, this.materials.metal);
        platformBase.position.y = 167.5;
        platformBase.position.z = 8; // Offset forward
        platformBase.rotation.x = 0.15; // Tilted slightly up
        this.group.add(platformBase);

        const padGeo = new THREE.CylinderGeometry(22, 22, 3, 32);
        const pad = new THREE.Mesh(padGeo, this.materials.metal);
        pad.position.y = 176;
        pad.position.z = 10;
        this.group.add(pad);

        // Glowing ring on the landing pad
        const ringGeo = new THREE.RingGeometry(18, 20, 32);
        const ring = new THREE.Mesh(ringGeo, this.materials.glow);
        ring.position.y = 177.6;
        ring.position.z = 10;
        ring.rotation.x = -Math.PI / 2;
        this.group.add(ring);

        // 4. Upper Spire
        const upperSpireGeo = new THREE.CylinderGeometry(4, 15, 50, 8);
        const upperSpire = new THREE.Mesh(upperSpireGeo, this.materials.glass);
        upperSpire.position.y = 200;
        upperSpire.position.z = -5; // Behind the pad
        this.group.add(upperSpire);

        const antennaGeo = new THREE.CylinderGeometry(0.5, 2, 60, 8);
        const antenna = new THREE.Mesh(antennaGeo, this.materials.metal);
        antenna.position.y = 255;
        antenna.position.z = -5;
        this.group.add(antenna);

        const tipGeo = new THREE.SphereGeometry(3, 16, 16);
        const tip = new THREE.Mesh(tipGeo, this.materials.glow);
        tip.position.y = 285;
        tip.position.z = -5;
        this.group.add(tip);

        // 5. NEXUS RIWI Sign
        this.addNeonSign();
    }

    addNeonSign() {
        // Create canvas for the text
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Draw text
        ctx.fillStyle = 'rgba(0, 0, 0, 0)'; // Transparent background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 120px "Courier New", monospace'; // Futuristic font feel
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glowing text effect
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff';
        ctx.fillText('</riwi> NEXUS', canvas.width / 2, canvas.height / 2);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        const signMat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
            side: THREE.FrontSide
        });

        const signGeo = new THREE.PlaneGeometry(90, 22);

        // Add 4 signs facing the 4 cardinal directions so it's never backward
        for (let i = 0; i < 4; i++) {
            const anchor = new THREE.Group();
            anchor.rotation.y = (i / 4) * Math.PI * 2;

            const sign = new THREE.Mesh(signGeo, signMat);
            // Position sign prominent on the sweeping section
            sign.position.y = 175;
            sign.position.z = 32; // Pulled out aggressively in front
            // Slight tilt to match viewing angle
            sign.rotation.x = -0.15;

            anchor.add(sign);
            this.group.add(anchor);
        }
    }

    update(time) {
        // Pulse the glowing materials
        const pulse = (Math.sin(time * 2) + 1) * 0.5; // 0 to 1
        this.materials.glow.opacity = 0.5 + pulse * 0.5;
    }
}
