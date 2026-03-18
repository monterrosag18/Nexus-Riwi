const THREE = window.THREE;
import { SpectralShader } from './SpectralShader.js';

export class HolographicBanner {
    constructor(scene, color = 0x00f3ff, position = {x: 0, y: 0, z: 0}) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.color = new THREE.Color(color);
        
        this.init(position);
    }

    init(pos) {
        const geometry = new THREE.PlaneGeometry(40, 100);
        
        // Clone the spectral shader for this specific banner
        const mat = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(SpectralShader.uniforms),
            vertexShader: SpectralShader.vertexShader,
            fragmentShader: SpectralShader.fragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        mat.uniforms.uColor.value = this.color;

        this.mesh = new THREE.Mesh(geometry, mat);
        this.mesh.position.set(pos.x, pos.y + 50, pos.z);
        this.group.add(this.mesh);

        // BEAM BASE (The volumetric light source)
        const beamGeo = new THREE.CylinderGeometry(10, 15, 5, 32);
        const beamMat = new THREE.MeshBasicMaterial({ color: this.color, transparent: true, opacity: 0.5 });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(pos.x, pos.y, pos.z);
        this.group.add(beam);

        this.scene.add(this.group);
    }

    update(time) {
        if (this.mesh) {
            this.mesh.material.uniforms.time.value = time;
            // Float effect
            this.mesh.position.y = 50 + Math.sin(time * 2) * 2;
        }
    }
}
