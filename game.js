import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// --- ESCENA Y UI ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
scene.fog = new THREE.Fog(0x111111, 0, 60);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scoreElement = document.getElementById('score');
let score = 0;

// --- SONIDO (Sintetizador simple) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playShootSound() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// --- EL ARMA (Modelo básico) ---
const gunGroup = new THREE.Group();
const gunBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.8),
    new THREE.MeshPhongMaterial({ color: 0x222222 })
);
gunBody.position.set(0.3, -0.3, -0.5); // Posición a la derecha de la cámara
gunGroup.add(gunBody);
camera.add(gunGroup); // El arma sigue a la cámara
scene.add(camera);

// --- LUCES Y MUNDO ---
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));
const floor = new THREE.Mesh(new THREE.GridHelper(200, 40, 0xffffff, 0x444444));
scene.add(floor);

// --- CONTROLES Y DISPARO ---
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => {
    controls.lock();
    document.getElementById('instructions').style.display = 'none';
});

let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const bullets = [];

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') moveForward = true;
    if (e.code === 'KeyS') moveBackward = true;
    if (e.code === 'KeyA') moveLeft = true;
    if (e.code === 'KeyD') moveRight = true;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') shoot();
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') moveForward = false;
    if (e.code === 'KeyS') moveBackward = false;
    if (e.code === 'KeyA') moveLeft = false;
    if (e.code === 'KeyD') moveRight = false;
});

function shoot() {
    if (!controls.isLocked) return;
    playShootSound();
    
    const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    bullet.position.copy(camera.position);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    bullet.velocity = dir.multiplyScalar(2);
    bullets.push(bullet);
    scene.add(bullet);

    // Retroceso visual del arma
    gunGroup.position.z += 0.1;
}

// --- ENEMIGOS ---
const targets = [];
function spawnTarget() {
    const target = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 16),
        new THREE.MeshPhongMaterial({ color: 0x00ff00, emissive: 0x003300 })
    );
    target.position.set(Math.random() * 40 - 20, 1, Math.random() * -40 - 10);
    scene.add(target);
    targets.push(target);
}
for(let i=0; i<10; i++) spawnTarget();

// --- ANIMACIÓN ---
let velocity = new THREE.Vector3();
let prevTime = performance.now();

function animate() {
    requestAnimationFrame(animate);
    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    if (controls.isLocked) {
        // Movimiento
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.x -= velocity.x * 10.0 * delta;
        if (moveForward) velocity.z -= 100.0 * delta;
        if (moveBackward) velocity.z += 100.0 * delta;
        if (moveLeft) velocity.x -= 100.0 * delta;
        if (moveRight) velocity.x += 100.0 * delta;

        controls.moveForward(-velocity.z * delta);
        controls.moveRight(velocity.x * delta);

        // Efecto de balanceo del arma (Bobbing)
        if (moveForward || moveBackward || moveLeft || moveRight) {
            gunGroup.position.y = Math.sin(time * 0.01) * 0.02;
        }
        // Suavizar retroceso
        gunGroup.position.z += (0 - gunGroup.position.z) * 0.1;
    }

    // Lógica de balas
    bullets.forEach((b, i) => {
        b.position.add(b.velocity);
        targets.forEach((t, ti) => {
            if (b.position.distanceTo(t.position) < 1) {
                scene.remove(t);
                targets.splice(ti, 1);
                scene.remove(b);
                bullets.splice(i, 1);
                score += 10;
                scoreElement.innerText = score;
                spawnTarget();
            }
        });
    });

    renderer.render(scene, camera);
    prevTime = time;
}
animate();
