const THREE = window.THREE;

export class StarSystem {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);
        
        this.sphereBg = null;
        this.particles = null;
        this.twinkleStars = null;
        
        this.init();
    }

    init() {
        const loader = new THREE.TextureLoader();
        
        // 1. HIGH-RES STARFIELD BACKGROUND
        const textureBg = loader.load('assets/8k_stars.jpg'); 
        const geometryBg = new THREE.SphereGeometry(6000, 64, 64);
        const materialBg = new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            map: textureBg,
            transparent: true,
            opacity: 0.6
        });
        this.sphereBg = new THREE.Mesh(geometryBg, materialBg);
        this.group.add(this.sphereBg);

        // 2. STARDUST PARTICLES (Static)
        const starPoints = [];
        for (let i = 0; i < 10000; i++) {
            const star = new THREE.Vector3(
                Math.random() * 8000 - 4000,
                Math.random() * 8000 - 4000,
                Math.random() * 8000 - 4000
            );
            if (star.length() > 600) {
                starPoints.push(star);
            }
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(starPoints);
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.2,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        this.particles = new THREE.Points(geometry, material);
        this.group.add(this.particles);

        // 3. AMBIENT DARK NEBULA DUST
        const dustGeometry = new THREE.BufferGeometry();
        const dustCoords = [];
        for (let i = 0; i < 6000; i++) {
            dustCoords.push(
                Math.random() * 5000 - 2500,
                Math.random() * 5000 - 2500,
                Math.random() * 5000 - 2500
            );
        }
        dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dustCoords, 3));
        const dustMaterial = new THREE.PointsMaterial({
            color: 0x444488,
            size: 1.5,
            transparent: true,
            opacity: 0.2
        });
        this.group.add(new THREE.Points(dustGeometry, dustMaterial));

        // 4. TWINKLE STARS (Rotating)
        const twinklePoints = [];
        for (let i = 0; i < 3000; i++) {
            twinklePoints.push(new THREE.Vector3(
                Math.random() * 7000 - 3500,
                Math.random() * 7000 - 3500,
                Math.random() * 7000 - 3500
            ));
        }
        const twinkleGeo = new THREE.BufferGeometry().setFromPoints(twinklePoints);
        const twinkleMat = new THREE.PointsMaterial({
            color: 0x88ccff,
            size: 2.0,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true
        });
        this.twinkleStars = new THREE.Points(twinkleGeo, twinkleMat);
        this.group.add(this.twinkleStars);
    }

    update(camera) {
        // Slow cinematic rotation
        if (this.sphereBg) {
            this.sphereBg.rotation.y += 0.0001;
        }
        if (this.twinkleStars) {
            this.twinkleStars.rotation.y += 0.0002;
            this.twinkleStars.rotation.z += 0.0001;
        }
        if (this.particles) {
            this.particles.rotation.y -= 0.00005;
        }
    }
}
