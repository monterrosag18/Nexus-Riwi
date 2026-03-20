const THREE = window.THREE;

/**
 * CrystalMonument — Clan territory marker inspired by the reference image.
 *
 * Structure (bottom→top):
 *  1. Hexagonal base pedestal + 8 crystal spikes radiating outward
 *  2. Central glowing obelisk / crystal pillar
 *  3. Clan icon panel (floating hexagonal board with clan symbol in emissive text)
 *  4. Name billboard (always face camera, canvas-drawn "Clan [Name]")
 *  5. Energy cone beacon (upward beam, AdditiveBlending)
 *  6. Floating clan-unique 3D geometry above the panel
 */

const CLAN_SHAPES = {
    turing:   'atom',
    tesla:    'bolt',
    mccarthy: 'gem',
    hamilton: 'pyramid',
    thompson: 'shield',
};

export class CrystalMonument {
    constructor(scene, camera, name, colorHex, position) {
        this.scene    = scene;
        this.camera   = camera;  // for billboard facing
        this.name     = name;
        this.colorHex = colorHex;
        this.color    = new THREE.Color(colorHex);
        this.pos      = new THREE.Vector3(position.x, 0, position.z);

        this.group = new THREE.Group();
        this.group.position.copy(this.pos);
        scene.add(this.group);

        this.nameMesh = null;   // billboard
        this.icon3d   = null;   // rotating clan icon
        this._build();
    }

    _build() {
        this._buildBase();
        this._buildCrystalSpikes();
        this._buildObelisk();
        this._buildIconPanel();
        this._buildIcon();
        this._buildNameBillboard();
        this._buildBeacon();
    }

    // ── 1. HEXAGONAL PEDESTAL ───────────────────────────────────────────
    _buildBase() {
        const mat = new THREE.MeshStandardMaterial({
            color: 0x0d101f,
            metalness: 0.9, roughness: 0.15,
            emissive: this.colorHex, emissiveIntensity: 0.1
        });
        const geo = new THREE.CylinderGeometry(22, 26, 4, 6);
        const base = new THREE.Mesh(geo, mat);
        base.position.y = 2;
        this.group.add(base);

        // Inner glowing hex ring
        const ringMat = new THREE.MeshBasicMaterial({
            color: this.colorHex, transparent: true, opacity: 0.95,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(18, 0.7, 8, 6), ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 4.1;
        this.group.add(ring);

        // Outer trim ring
        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(23, 0.3, 8, 6), ringMat.clone());
        ring2.rotation.x = Math.PI / 2;
        ring2.position.y = 1.5;
        this.group.add(ring2);

        // Local point light
        const pl = new THREE.PointLight(this.colorHex, 3.0, 150);
        pl.position.y = 10;
        this.group.add(pl);
    }

    // ── 2. CRYSTAL SPIKES ───────────────────────────────────────────────
    _buildCrystalSpikes() {
        const crystalMat = new THREE.MeshPhysicalMaterial({
            color: this.colorHex,
            emissive: this.colorHex,
            emissiveIntensity: 0.6,
            metalness: 0.0,
            roughness: 0.0,
            transmission: 0.5,     // glass-like
            thickness: 1.5,
            transparent: true,
            opacity: 0.85
        });

        // 6 primary large spikes
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            const height = 18 + Math.random() * 12;
            const radius = 2 + Math.random() * 1.5;
            const geo = new THREE.ConeGeometry(radius, height, 4, 1);

            const spike = new THREE.Mesh(geo, crystalMat);
            spike.position.set(
                Math.cos(a) * (14 + Math.random() * 6),
                4 + height / 2,
                Math.sin(a) * (14 + Math.random() * 6)
            );
            // Tilt outward
            spike.rotation.z = (Math.random() * 0.4 - 0.2);
            spike.rotation.x = (Math.random() * 0.3 - 0.15);
            spike.lookAt(new THREE.Vector3(
                this.group.position.x + Math.cos(a) * 50,
                5,
                this.group.position.z + Math.sin(a) * 50
            ));
            this.group.add(spike);
        }

        // 8 secondary smaller spikes
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
            const height = 8 + Math.random() * 8;
            const geo = new THREE.ConeGeometry(1 + Math.random(), height, 3, 1);
            const spike = new THREE.Mesh(geo, crystalMat);
            spike.position.set(
                Math.cos(a) * (20 + Math.random() * 5),
                4 + height / 2,
                Math.sin(a) * (20 + Math.random() * 5)
            );
            spike.rotation.z = Math.random() * 0.6 - 0.3;
            this.group.add(spike);
        }
    }

    // ── 3. CENTRAL CRYSTAL OBELISK ──────────────────────────────────────
    _buildObelisk() {
        const obeliskMat = new THREE.MeshPhysicalMaterial({
            color: this.colorHex,
            emissive: this.colorHex,
            emissiveIntensity: 0.9,
            metalness: 0.1,
            roughness: 0.0,
            transmission: 0.4,
            thickness: 3.0,
            transparent: true,
            opacity: 0.9
        });

        // Main body — tall tapered prism
        const bodyGeo = new THREE.CylinderGeometry(1.5, 4, 55, 6, 1);
        const body = new THREE.Mesh(bodyGeo, obeliskMat);
        body.position.y = 31.5;
        this.group.add(body);

        // Sharp top crystal point
        const tipGeo = new THREE.ConeGeometry(1.5, 12, 6, 1);
        const tip = new THREE.Mesh(tipGeo, obeliskMat);
        tip.position.y = 64;
        this.group.add(tip);

        // Glowing core inside the obelisk
        const coreGeo = new THREE.CylinderGeometry(0.6, 1.5, 50, 6);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0.6,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 29;
        this.group.add(core);
    }

    // ── 4. FLOATING CLAN ICON PANEL (hexagonal HUD board) ───────────────
    _buildIconPanel() {
        // Hexagonal flat disc
        const panelGeo = new THREE.CylinderGeometry(10, 10, 0.8, 6);
        const panelMat = new THREE.MeshStandardMaterial({
            color: 0x050518,
            metalness: 0.95, roughness: 0.05,
            emissive: this.colorHex, emissiveIntensity: 0.15,
            transparent: true, opacity: 0.9
        });
        const panel = new THREE.Mesh(panelGeo, panelMat);
        panel.position.y = 38;
        this.group.add(panel);

        // Neon border ring
        const borderMat = new THREE.MeshBasicMaterial({
            color: this.colorHex, transparent: true, opacity: 0.95,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const border = new THREE.Mesh(new THREE.TorusGeometry(10, 0.5, 6, 6), borderMat);
        border.rotation.x = Math.PI / 2;
        border.position.y = 38.6;
        this.group.add(border);

        // 6 tech corner accents
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            const dot = new THREE.Mesh(new THREE.SphereGeometry(0.8, 6, 6), borderMat);
            dot.position.set(Math.cos(a) * 10, 38.9, Math.sin(a) * 10);
            this.group.add(dot);
        }
    }

    // ── 5. 3D CLAN ICON above the panel ─────────────────────────────────
    _buildIcon() {
        const iconKey = this.name.toLowerCase();
        const type    = CLAN_SHAPES[iconKey] || 'gem';

        const mat = new THREE.MeshStandardMaterial({
            color: this.colorHex,
            emissive: this.colorHex,
            emissiveIntensity: 1.2,
            metalness: 0.3, roughness: 0.1
        });

        const g = new THREE.Group();

        switch (type) {
            case 'atom': {
                g.add(new THREE.Mesh(new THREE.SphereGeometry(3.5, 16, 16), mat));
                [0, Math.PI / 3, -Math.PI / 3].forEach(rx => {
                    const r = new THREE.Mesh(new THREE.TorusGeometry(7, 0.4, 8, 32), mat);
                    r.rotation.x = rx;
                    g.add(r);
                });
                break;
            }
            case 'bolt': {
                const shape = new THREE.Shape();
                shape.moveTo(0, 8); shape.lineTo(4, 0); shape.lineTo(2, 0);
                shape.lineTo(4, -8); shape.lineTo(-2, 0); shape.lineTo(1, 0); shape.closePath();
                const geo = new THREE.ExtrudeGeometry(shape, { depth: 2, bevelEnabled: true, bevelSize: 0.3, bevelThickness: 0.3 });
                geo.center();
                g.add(new THREE.Mesh(geo, mat));
                break;
            }
            case 'gem': {
                g.add(new THREE.Mesh(new THREE.OctahedronGeometry(6, 0), mat));
                break;
            }
            case 'pyramid': {
                g.add(new THREE.Mesh(new THREE.ConeGeometry(6, 10, 4), mat));
                break;
            }
            case 'shield': {
                const box = new THREE.Mesh(new THREE.BoxGeometry(9, 11, 2.5), mat);
                g.add(box);
                const top = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 2.5, 16, 1, false, 0, Math.PI), mat);
                top.rotation.z = -Math.PI / 2;
                top.position.y = 6.5;
                g.add(top);
                break;
            }
        }

        g.position.y = 51;
        this.icon3d = g;
        this.group.add(g);
    }

    // ── 6. CLAN NAME BILLBOARD ───────────────────────────────────────────
    _buildNameBillboard() {
        const W = 512, H = 128;
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');
        const hex = '#' + this.color.getHexString();

        // Background pill
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        this._roundRect(ctx, 10, 10, W - 20, H - 20, 20);
        ctx.fill();

        // Border glow
        ctx.strokeStyle = hex;
        ctx.lineWidth = 3;
        ctx.shadowColor = hex;
        ctx.shadowBlur = 15;
        this._roundRect(ctx, 10, 10, W - 20, H - 20, 20);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // "Clan " prefix in smaller text
        ctx.font = '600 28px "Rajdhani", "Orbitron", monospace';
        ctx.fillStyle = hex;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✦  CLAN  ✦', W / 2, 32);

        // Clan NAME large
        ctx.font = '900 62px "Rajdhani", "Orbitron", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = hex;
        ctx.shadowBlur = 20;
        ctx.fillText(this.name.toUpperCase(), W / 2, 82);
        ctx.shadowBlur = 0;

        const tex = new THREE.CanvasTexture(canvas);
        const geo = new THREE.PlaneGeometry(80, 20);
        const mat = new THREE.MeshBasicMaterial({
            map: tex, transparent: true, depthWrite: false
        });
        const board = new THREE.Mesh(geo, mat);
        board.position.y = 14; // below the base
        this.nameMesh = board;
        this.group.add(board);
    }

    // ── 7. ENERGY BEACON BEAM ────────────────────────────────────────────
    _buildBeacon() {
        const beamMat = new THREE.MeshBasicMaterial({
            color: this.colorHex, transparent: true, opacity: 0.06,
            side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
        });
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 20, 200, 32, 1, true), beamMat);
        beam.position.y = 100;
        this.group.add(beam);
    }

    // Helper: rounded rectangle path
    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    update(time) {
        // Rotate icon
        if (this.icon3d) {
            this.icon3d.rotation.y = time * 1.4;
            this.icon3d.position.y = 51 + Math.sin(time * 1.8) * 2.5;
        }

        // Keep name billboard facing camera
        if (this.nameMesh && this.camera) {
            this.nameMesh.lookAt(this.camera.position);
        }
    }
}
