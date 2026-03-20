const THREE = window.THREE;

/**
 * ShootingStars — Cinematic cosmic effect for the Nexus background.
 * Spawns fast-moving glowing streaks at random intervals.
 */

export class ShootingStars {
    constructor(scene) {
        this.scene = scene;
        this.stars = [];
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.nextSpawn = 0;
    }

    _spawn() {
        const color = new THREE.Color().setHSL(Math.random() * 0.1 + 0.5, 0.8, 0.8); // Cyan/Blue tones
        
        // Geometry: A long thin line
        const length = 100 + Math.random() * 200;
        const geo = new THREE.CylinderGeometry(0.2, 0.2, length, 8, 1, true);
        const mat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const star = new THREE.Mesh(geo, mat);
        
        // Random starting position in a far sphere
        const angle = Math.random() * Math.PI * 2;
        const radius = 3000 + Math.random() * 1000;
        const x = Math.cos(angle) * radius;
        const y = (Math.random() - 0.5) * 2000;
        const z = Math.sin(angle) * radius;
        
        star.position.set(x, y, z);
        
        // Set velocity towards opposite side
        const velocity = new THREE.Vector3(-x, -y * 0.5, -z).normalize().multiplyScalar(40 + Math.random() * 60);
        
        // Align rotation to velocity
        star.lookAt(star.position.clone().add(velocity));
        star.rotateX(Math.PI/2);

        this.group.add(star);
        this.stars.push({
            mesh: star,
            velocity: velocity,
            life: 1.0,
            decay: 0.01 + Math.random() * 0.02
        });
    }

    update(time) {
        // Spawn logic
        if (time > this.nextSpawn) {
            this._spawn();
            this.nextSpawn = time + 2 + Math.random() * 5; // Spawn every 2-7 seconds
        }

        // Update existing stars
        for (let i = this.stars.length - 1; i >= 0; i--) {
            const s = this.stars[i];
            s.mesh.position.add(s.velocity);
            s.life -= s.decay;
            s.mesh.material.opacity = s.life;

            if (s.life <= 0) {
                this.group.remove(s.mesh);
                s.mesh.geometry.dispose();
                s.mesh.material.dispose();
                this.stars.splice(i, 1);
            }
        }
    }
}
