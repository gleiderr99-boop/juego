const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let car = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    speed: 0,
    angle: 0
};

let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function update() {

    // Acelerar
    if (keys["w"]) car.speed += 0.2;
    if (keys["s"]) car.speed -= 0.2;

    // Girar
    if (keys["a"]) car.angle -= 0.05;
    if (keys["d"]) car.angle += 0.05;

    // Nitro
    if (keys["Shift"]) car.speed += 0.5;

    // Fricción
    car.speed *= 0.98;

    // Movimiento
    car.x += Math.cos(car.angle) * car.speed;
    car.y += Math.sin(car.angle) * car.speed;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);

    // Carro
    ctx.fillStyle = "cyan";
    ctx.fillRect(-15, -10, 30, 20);

    ctx.restore();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
