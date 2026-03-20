const THREE = window.THREE;

export class StarSystem {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.twinkleStars = null;
        this.init();
    }

    init() {
        // ── 1. PROCEDURAL NEBULA BACKGROUND ──────────────────────────────────
        // Build a canvas texture with radial nebula gradients matching the
        // concept image: deep blue/purple base, warm orange/gold accent
        const nebulaTexture = this._createNebulaTexture();

        const bgGeo = new THREE.SphereGeometry(7000, 64, 64);
        const bgMat = new THREE.MeshBasicMaterial({
            map: nebulaTexture,
            side: THREE.BackSide
        });
        this.group.add(new THREE.Mesh(bgGeo, bgMat));

        // ── 2. BRIGHT STAR POINTS (small white dots) ──────────────────────────
        const starPts = [];
        for (let i = 0; i < 12000; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 3000 + Math.random() * 3000;
            starPts.push(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            );
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPts, 3));
        const starMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2.0,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.85
        });
        this.group.add(new THREE.Points(starGeo, starMat));

        // ── 3. BRIGHTER "FEATURED" STARS (blue-white glow) ───────────────────
        const featPts = [];
        for (let i = 0; i < 1500; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 2500 + Math.random() * 3000;
            featPts.push(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            );
        }
        const featGeo = new THREE.BufferGeometry();
        featGeo.setAttribute('position', new THREE.Float32BufferAttribute(featPts, 3));
        const featMat = new THREE.PointsMaterial({
            color: 0xaaddff,
            size: 3.5,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.twinkleStars = new THREE.Points(featGeo, featMat);
        this.group.add(this.twinkleStars);
    }

    /**
     * Build a 2048×1024 canvas simulating a space nebula:
     *  - Deep dark navy/black base
     *  - Purple/indigo cloud on the left
     *  - Warm orange/amber nebula on the right
     *  - Bright cyan-white core glow in the mid-upper area
     */
    _createNebulaTexture() {
        const W = 2048, H = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');

        // Base — deep space black
        ctx.fillStyle = '#020408';
        ctx.fillRect(0, 0, W, H);

        // Helper: radial gradient blob
        const blob = (cx, cy, r, colorInner, colorOuter, alpha = 0.6) => {
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
            g.addColorStop(0, colorInner);
            g.addColorStop(1, colorOuter);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
            ctx.globalAlpha = 1;
        };

        // Purple nebula — left
        blob(300, 400, 650, 'rgba(80,20,160,0.9)', 'rgba(10,5,30,0)', 0.55);
        blob(200, 600, 400, 'rgba(120,40,200,0.8)', 'rgba(0,0,0,0)', 0.40);

        // Indigo cloud — top center
        blob(900, 200, 500, 'rgba(30,50,160,0.8)', 'rgba(0,0,0,0)', 0.45);

        // Warm orange nebula — upper right
        blob(1700, 250, 600, 'rgba(200,100,20,0.85)', 'rgba(0,0,0,0)', 0.50);
        blob(1900, 450, 350, 'rgba(220,140,30,0.7)', 'rgba(0,0,0,0)', 0.35);

        // Cyan glow — center top (where the galaxy core would be)
        blob(1050, 300, 300, 'rgba(30,180,220,0.7)', 'rgba(0,0,0,0)', 0.40);

        // Soft magenta — bottom right
        blob(1600, 900, 500, 'rgba(180,30,120,0.6)', 'rgba(0,0,0,0)', 0.30);

        // Gold dust streak — diagonal
        ctx.save();
        ctx.globalAlpha = 0.12;
        const streak = ctx.createLinearGradient(0, 700, W, 200);
        streak.addColorStop(0, 'rgba(0,0,0,0)');
        streak.addColorStop(0.3, 'rgba(200,180,80,0.6)');
        streak.addColorStop(0.7, 'rgba(160,120,40,0.5)');
        streak.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = streak;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();

        // Procedural micro-stars (painted on canvas for density)
        ctx.globalAlpha = 1;
        for (let i = 0; i < 3000; i++) {
            const sx = Math.random() * W;
            const sy = Math.random() * H;
            const sr = Math.random() * 1.2 + 0.3;
            const bright = Math.random();
            ctx.beginPath();
            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${bright.toFixed(2)})`;
            ctx.fill();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.mapping = THREE.EquirectangularReflectionMapping;
        return tex;
    }

    update(camera) {
        if (this.twinkleStars) {
            this.twinkleStars.rotation.y += 0.00015;
            this.twinkleStars.rotation.z += 0.00005;
        }
    }
}
