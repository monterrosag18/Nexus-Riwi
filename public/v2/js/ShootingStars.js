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
        const color = new THREE.Color().setHSL(Math.random() * 0.1 + 0.5, 0.9, 0.9); 
        
        // Geometry: Thicker and longer for higher impact
        const length = 200 + Math.random() * 400;
        const geo = new THREE.CylinderGeometry(0.8, 0.8, length, 8, 1, true);
        const mat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const star = new THREE.Mesh(geo, mat);
        
        // Random starting position in a far sphere
        const angle = Math.random() * Math.PI * 2;
        const radius = 4000 + Math.random() * 1000;
        const x = Math.cos(angle) * radius;
        const y = (Math.random() - 0.5) * 3000;
        const z = Math.sin(angle) * radius;
        
        star.position.set(x, y, z);
        
        // Velocity (faster)
        const velocity = new THREE.Vector3(-x, -y * 0.5, -z).normalize().multiplyScalar(80 + Math.random() * 120);
        
        // Align rotation to velocity
        star.lookAt(star.position.clone().add(velocity));
        star.rotateX(Math.PI/2);

        this.group.add(star);
        this.stars.push({
            mesh: star,
            velocity: velocity,
            life: 1.0,
            decay: 0.005 + Math.random() * 0.01 // Slower decay for longer trails
        });
    }

    update(time) {
        // Spawn logic: Much more frequent (0.5 to 2.0 seconds)
        if (time > this.nextSpawn) {
            this._spawn();
            this.nextSpawn = time + 0.5 + Math.random() * 1.5; 
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
