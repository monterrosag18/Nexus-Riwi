const THREE = window.THREE;

export class StarSystem {
    constructor(scene) {
        this.scene = scene;
        this.stars = null;
        this.sphereBg = null;
        this.init();
    }

    init() {
        // 1. GALAXY BACKGROUND SPHERE
        const loader = new THREE.TextureLoader();
        // Use the newly generated premium galaxy texture
        const textureBg = loader.load('../assets/galaxy.png'); 
        const geometryBg = new THREE.SphereGeometry(4000, 64, 64);
        const materialBg = new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            map: textureBg,
            transparent: true,
            opacity: 0.9
        });
        this.sphereBg = new THREE.Mesh(geometryBg, materialBg);
        this.scene.add(this.sphereBg);

        // 2. STARDUST / BACKGROUND STARS
        const starPoints = [];
        for (let i = 0; i < 8000; i++) {
            const star = new THREE.Vector3(
                Math.random() * 4000 - 2000,
                Math.random() * 4000 - 2000,
                Math.random() * 4000 - 2000
            );
            // Don't place stars too close to the center (hex grid)
            if (star.length() > 500) {
                starPoints.push(star);
            }
        }
        const starGeo = new THREE.BufferGeometry().setFromPoints(starPoints);
        const starMat = new THREE.PointsMaterial({ 
            color: 0xffffff, 
            size: 1.5, 
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true 
        });
        this.stars = new THREE.Points(starGeo, starMat);
        this.scene.add(this.stars);

        // 3. MOVING "TWINKLE" STARS (Optional / Added for depth)
        const twinklePoints = [];
        for (let i = 0; i < 2000; i++) {
            twinklePoints.push(new THREE.Vector3(
                Math.random() * 6000 - 3000,
                Math.random() * 6000 - 3000,
                Math.random() * 6000 - 3000
            ));
        }
        const twinkleGeo = new THREE.BufferGeometry().setFromPoints(twinklePoints);
        const twinkleMat = new THREE.PointsMaterial({ 
            color: 0x88ccff, 
            size: 2.2, 
            transparent: true,
            opacity: 0.6
        });
        this.twinkleStars = new THREE.Points(twinkleGeo, twinkleMat);
        this.scene.add(this.twinkleStars);
    }

    update(camera) {
        // Gentle rotation for cinematic background feel
        if (this.sphereBg) {
            this.sphereBg.rotation.y += 0.0003;
            this.sphereBg.rotation.z += 0.0001;
        }

        if (this.stars) {
            this.stars.rotation.y -= 0.0001;
        }

        if (this.twinkleStars) {
            this.twinkleStars.rotation.x += 0.0002;
            this.twinkleStars.rotation.y += 0.0001;
        }
    }
}
