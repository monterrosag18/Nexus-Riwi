const THREE = window.THREE;
import { SpectralShader } from './SpectralShader.js';

export class HolographicBanner {
    constructor(scene, color = 0x00f3ff, position = {x: 0, y: 0, z: 0}, label = "CLAN") {
        this.scene = scene;
        this.group = new THREE.Group();
        this.color = new THREE.Color(color);
        this.label = label;
        
        this.init(position);
    }

    init(pos) {
        // 1. CREST GEOMETRY (Shield shape)
        const shape = new THREE.Shape();
        shape.moveTo(-15, 40);
        shape.lineTo(15, 40);
        shape.lineTo(15, -20);
        shape.quadraticCurveTo(15, -40, 0, -50);
        shape.quadraticCurveTo(-15, -40, -15, -20);
        shape.lineTo(-15, 40);

        const geometry = new THREE.ShapeGeometry(shape);
        
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
        this.mesh.position.set(pos.x, pos.y + 70, pos.z);
        this.group.add(this.mesh);

        // 2. ORBITAL RINGS AT BASE
        const ringGeo = new THREE.TorusGeometry(15, 0.5, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color: this.color, transparent: true, opacity: 0.8 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI/2;
        ring.position.set(pos.x, pos.y + 2, pos.z);
        this.group.add(ring);

        // 3. ENERGY BEAM
        const beamGeo = new THREE.CylinderGeometry(0.1, 10, 100, 32, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({ 
            color: this.color, 
            transparent: true, 
            opacity: 0.2,
            side: THREE.DoubleSide 
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(pos.x, pos.y + 50, pos.z);
        this.group.add(beam);

        this.scene.add(this.group);
    }

    update(time) {
        if (this.mesh) {
            this.mesh.material.uniforms.time.value = time;
            this.mesh.position.y = 70 + Math.sin(time * 1.5) * 5;
            this.mesh.rotation.y = Math.sin(time * 0.5) * 0.2;
        }
    }
}
