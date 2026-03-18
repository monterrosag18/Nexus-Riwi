const THREE = window.THREE;
import { SpectralShader } from './SpectralShader.js';

export class SpectralPrism {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.init();
    }

    init() {
        // High-poly central prism
        const geo = new THREE.CylinderGeometry(5, 15, 180, 4); // 4-sided prism
        const mat = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(SpectralShader.uniforms),
            vertexShader: SpectralShader.vertexShader,
            fragmentShader: SpectralShader.fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: true
        });

        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.position.y = 90;
        this.group.add(this.mesh);

        // ORBITAL RINGS (Mechanical base)
        const ringGeo = new THREE.TorusGeometry(30, 2, 16, 100);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 1, roughness: 0.1 });
        
        for(let i=0; i<3; i++) {
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI/2 + (i * 0.2);
            ring.position.y = 10 + (i * 5);
            this.group.add(ring);
        }

        this.scene.add(this.group);
    }

    update(time) {
        if (this.mesh) {
            this.mesh.material.uniforms.time.value = time;
            this.mesh.rotation.y = time * 0.2;
        }
    }
}
