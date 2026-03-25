import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// --- ESCENA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Cielo azul
scene.fog = new THREE.Fog(0x87ceeb, 0, 100);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- LUCES ---
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(10, 20, 10);
scene.add(sun);

// --- EL AUTO (Cuerpo y Ruedas) ---
const car = new THREE.Group();

// Carrocería
const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.6, 2.5),
    new THREE.MeshPhongMaterial({ color: 0xff0000 })
);
body.position.y = 0.5;
car.add(body);

// Cabina
const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.4, 1.2),
    new THREE.MeshPhongMaterial({ color: 0x333333 })
);
cabin.position.y = 1.0;
cabin.position.z = -0.2;
car.add(cabin);

scene.add(car);

// --- PISTA (Suelo con cuadrícula) ---
const grid = new THREE.GridHelper(500, 100, 0x000000, 0x555555);
scene.add(grid);

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshPhongMaterial({ color: 0x222222 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// --- LÓGICA DE CONDUCCIÓN ---
let speed = 0;
let angle = 0;
const maxSpeed = 0.8;
const acceleration = 0.02;
const friction = 0.01;
const steering = 0.04;

const keys = { w: false, s: false, a: false, d: false };

document.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => {
    controls.lock();
    document.getElementById('instructions').style.display = 'none';
});

// --- ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);

    // Física del auto
    if (keys.w) speed += acceleration;
    if (keys.s) speed -= acceleration;

    // Fricción natural (el auto se detiene solo)
    speed *= (1 - friction);

    // Giro (solo si se mueve)
    if (Math.abs(speed) > 0.01) {
        const direction = speed > 0 ? 1 : -1;
        if (keys.a) angle += steering * direction;
        if (keys.d) angle -= steering * direction;
    }

    // Actualizar posición del auto
    car.rotation.y = angle;
    car.position.x += Math.sin(angle) * speed;
    car.position.z += Math.cos(angle) * speed;

    // Cámara sigue al auto
    const cameraOffset = new THREE.Vector3(0, 3, -7); // Altura y distancia atrás
    cameraOffset.applyQuaternion(car.quaternion);
    camera.position.copy(car.position).add(cameraOffset);
    camera.lookAt(car.position);

    // UI
    document.getElementById('speed').innerText = Math.round(speed * 200);

    renderer.render(scene, camera);
}
animate();
