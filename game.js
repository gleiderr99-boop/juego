import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// 1. Escena y Cámara
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Cielo azul
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.6; // Altura de los ojos

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Luces
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(light);

// 3. Suelo y Objetivos
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0x999999 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const targets = [];
for(let i = 0; i < 10; i++) {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshPhongMaterial({ color: 0xff0000 })
    );
    box.position.set(Math.random() * 40 - 20, 1, Math.random() * -40 - 10);
    scene.add(box);
    targets.push(box);
}

// 4. Controles (Click para activar)
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());

// 5. Sistema de Disparo
const bullets = [];
document.addEventListener('mousedown', (e) => {
    if (!controls.isLocked) return;

    const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    bullet.position.copy(camera.position);
    
    // Dirección hacia donde mira la cámara
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    bullet.velocity = direction.multiplyScalar(1.2);
    
    scene.add(bullet);
    bullets.push(bullet);
});

// 6. Bucle de Animación
function animate() {
    requestAnimationFrame(animate);

    // Mover balas y detectar colisiones simples
    bullets.forEach((b, index) => {
        b.position.add(b.velocity);
        
        // Colisión básica con objetivos
        targets.forEach(t => {
            if(b.position.distanceTo(t.position) < 1.5) {
                t.position.y = -10; // "Eliminar" objetivo enviándolo abajo
                scene.remove(b);
            }
        });
    });

    renderer.render(scene, camera);
}
animate();
