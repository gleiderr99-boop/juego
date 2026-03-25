import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// --- CONFIGURACIÓN ESCENA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020); // Fondo oscuro tipo "arena"
scene.fog = new THREE.Fog(0x202020, 0, 50);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- LUCES ---
const light = new THREE.HemisphereLight(0xeeeeee, 0x888888, 1);
scene.add(light);

// --- SUELO ---
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshPhongMaterial({ color: 0x444444 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// --- VARIABLES DE MOVIMIENTO ---
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();

const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());

const onKeyDown = (event) => {
    switch (event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyD': moveRight = true; break;
        case 'Space': if (camera.position.y <= 1.7) velocity.y += 15; break;
    }
};

const onKeyUp = (event) => {
    switch (event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyD': moveRight = false; break;
    }
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// --- OBJETIVOS Y BALAS ---
const targets = [];
function createTarget() {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 3, 1.5),
        new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff })
    );
    box.position.set(Math.random() * 60 - 30, 1.5, Math.random() * -60 - 5);
    scene.add(box);
    targets.push(box);
}
for(let i = 0; i < 15; i++) createTarget();

const bullets = [];
document.addEventListener('mousedown', () => {
    if (!controls.isLocked) return;
    const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffcc00 })
    );
    bullet.position.copy(camera.position);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    bullet.velocity = dir.multiplyScalar(1.5);
    scene.add(bullet);
    bullets.push(bullet);
});

// --- BUCLE DE ANIMACIÓN ---
let prevTime = performance.now();
function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    if (controls.isLocked) {
        // Fricción y movimiento
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 3.0 * delta; // Gravedad

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 150.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 150.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        camera.position.y += (velocity.y * delta);

        if (camera.position.y < 1.6) {
            velocity.y = 0;
            camera.position.y = 1.6;
        }
    }

    // Balas y colisiones
    bullets.forEach((b, i) => {
        b.position.add(b.velocity);
        targets.forEach((t, ti) => {
            if(b.position.distanceTo(t.position) < 1.5) {
                scene.remove(t);
                targets.splice(ti, 1);
                createTarget(); // Aparece otro nuevo
            }
        });
        if (b.position.length() > 200) scene.remove(b);
    });

    renderer.render(scene, camera);
    prevTime = time;
}
animate();
