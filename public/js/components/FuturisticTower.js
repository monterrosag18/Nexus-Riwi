const THREE = window.THREE;
import { HoloBanner } from '../utils/HoloBanner.js';

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

        this.championBanner = null;

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

        // 6. Champion Visuals (Hidden by default)
        this.championGroup = new THREE.Group();
        this.group.add(this.championGroup);
    }

    addNeonSign() {
        // Create canvas for the text
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Draw text
        ctx.fillStyle = 'rgba(0, 0, 0, 0)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 120px "Courier New", monospace'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff';
        ctx.fillText('</riwi> NEXUS', canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const signMat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
            side: THREE.FrontSide
        });

        const signGeo = new THREE.PlaneGeometry(90, 22);

        for (let i = 0; i < 4; i++) {
            const anchor = new THREE.Group();
            anchor.rotation.y = (i / 4) * Math.PI * 2;

            const sign = new THREE.Mesh(signGeo, signMat);
            sign.position.y = 175;
            sign.position.z = 32; 
            sign.rotation.x = -0.15;

            anchor.add(sign);
            this.group.add(anchor);
        }
    }

    setChampion(clanData) {
        // Clear previous champion visuals
        while(this.championGroup.children.length > 0) {
            this.championGroup.remove(this.championGroup.children[0]);
        }

        if (!clanData) {
            console.log("[Tower] Resetting to default state.");
            this.materials.glow.color.setHex(0x00ffff);
            return;
        }

        console.log(`[Tower] Innovating for Champion: ${clanData.name}`);
        
        const clanColor = new THREE.Color(clanData.color);
        this.materials.glow.color.copy(clanColor);

        // --- INNOVATION: HOLOGRAPHIC DATA RING ---
        // Instead of a banner, a rotating cylinder of data wrapping the tower
        const ringGeo = new THREE.CylinderGeometry(28, 28, 12, 32, 1, true);
        
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Background black bar with low opacity for the text backing
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 50, canvas.width, 156);
        
        ctx.font = 'bold 100px "Rajdhani"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        
        // Repeated text for continuous rotation
        const text = `🏆 CAMPEÓN: ${clanData.name.toUpperCase()}  -  EL REY DE NEXUS ✨  |  `;
        const repeatedText = text.repeat(4);
        ctx.fillText(repeatedText, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        
        const ringMat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = 110; // Wrap around the main body
        this.championGroup.add(ring);
        this.championRing = ring;

        // --- ORBITAL "CROWN" PARTICLES ---
        const particleCount = 12;
        const particleGeo = new THREE.SphereGeometry(1.5, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({ color: clanColor });
        
        this.orbitals = [];
        for (let i = 0; i < particleCount; i++) {
            const pivot = new THREE.Group();
            pivot.position.y = 285; // Around the top tip
            pivot.rotation.y = (i / particleCount) * Math.PI * 2;
            
            const p = new THREE.Mesh(particleGeo, particleMat);
            p.position.x = 12; // Radius
            pivot.add(p);
            
            this.championGroup.add(pivot);
            this.orbitals.push({ pivot, startY: 285, phase: i * 0.5 });
        }
    }

    update(time) {
        // Pulse base glow
        const pulse = (Math.sin(time * 2) + 1) * 0.5;
        this.materials.glow.opacity = 0.5 + pulse * 0.5;

        // Rotate Champion Ring
        if (this.championRing) {
            this.championRing.rotation.y = time * 0.5;
            this.championRing.position.y = 110 + Math.sin(time) * 5; // Floating effect
        }

        // Animate Orbitals
        if (this.orbitals) {
            this.orbitals.forEach(o => {
                o.pivot.rotation.y += 0.02;
                o.pivot.position.y = o.startY + Math.sin(time * 2 + o.phase) * 3;
            });
        }
    }
}
