import { FuturisticTower } from './FuturisticTower.js';
import { store } from '../store.js';
const THREE = window.THREE;

export class GalaxyBackground {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.tower = null;
        this.ambientLight = null;
        this.directionalLight = null;
        this.starfield = null;
        this.unsubscribe = null;

        this.init();
    }

    init() {
        // Texture Loader
        const loader = new THREE.TextureLoader();
        const basePath = './assets/textures/';

        // 1. STARFIELD
        const starsGeo = new THREE.SphereGeometry(4000, 64, 64);
        const starsMat = new THREE.MeshBasicMaterial({
            map: loader.load(basePath + 'stars.jpg'),
            side: THREE.BackSide
        });
        this.starfield = new THREE.Mesh(starsGeo, starsMat);
        this.group.add(this.starfield);

        // 2. TOWER LIGHTING
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.group.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0x00ffff, 1.0);
        this.directionalLight.position.set(50, 50, 100);
        this.group.add(this.directionalLight);

        // 3. THE TOWER (Centered in the HexGrid void)
        this.tower = new FuturisticTower();
        this.tower.group.position.set(0, -5, 0); // Positioned inside the center hole (y=-5 places base correctly)
        this.tower.group.scale.set(0.6, 0.6, 0.6); // Scale adjusted to look massive but fit the camera comfortably
        this.group.add(this.tower.group);

        // 4. FETCH WEEKLY CHAMPION
        this.updateChampion();

        // 5. SUBSCRIBE TO CHANGES
        this.unsubscribe = store.subscribe((state) => {
            if (state.weeklyChampion) {
                this.tower.setChampion(state.weeklyChampion);
                const color = new THREE.Color(state.weeklyChampion.color);
                this.directionalLight.color.copy(color);
            }
        });
    }

    async updateChampion() {
        try {
            const res = await fetch('/api/tournament/champion');
            const data = await res.json();
            if (data.champion) {
                this.tower.setChampion(data.champion);
                // Also update lighting to match champion
                const color = new THREE.Color(data.champion.color);
                this.directionalLight.color.copy(color);
            }
        } catch (e) {
            console.error("[Galaxy] Failed to fetch weekly champion:", e);
        }
    }

    update() {
        // Update Tower
        if (this.tower) {
            this.tower.group.rotation.y += 0.002;
            this.tower.update(Date.now() / 1000);
        }
        // Slowly rotate stars for dynamism
        if (this.starfield) {
            this.starfield.rotation.y += 0.0001;
        }
    }
}
