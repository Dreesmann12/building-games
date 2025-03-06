const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
function resetLevel() {
  player.x = 50;
  player.y = 50;
  keys.forEach(key => {
      key.found = false;
      key.timerAdjusted = false; // Reset timer adjustment status
  });
  door.locked = true;
  timeLeft = 91; // Reset the timer
}

document.addEventListener("keydown", e => {
    if (e.key === "r") {
        resetLevel();
    }
});

// Timer element
const timerElement = document.createElement("div");
timerElement.style.position = "absolute";
timerElement.style.top = "10px";
timerElement.style.left = "50%";
timerElement.style.transform = "translateX(-50%)";
timerElement.style.color = "white";
timerElement.style.fontSize = "24px";
document.body.appendChild(timerElement);

let timeLeft = 91;


setInterval(updateTimer, 1000);
// Center canvas on the screen
canvas.style.position = "absolute";
canvas.style.left = "50%";
canvas.style.top = "50%";
canvas.style.transform = "translate(-50%, -50%)";

// Offscreen canvas til lys-effekten
const maskCanvas = document.createElement("canvas");
maskCanvas.width = canvas.width;
maskCanvas.height = canvas.height;
const maskCtx = maskCanvas.getContext("2d");
maskCtx.fillStyle = "black";
maskCtx.fillRect(0, 0, canvas.width, canvas.height, );

document.body.style.backgroundColor = "#222";
canvas.style.backgroundColor = "#000"; // Banen er helt sort

// Data til escape room
const player = { x: 50, y: 50, size: 20, color: "white", speed: 3 };
const door = { x: 400, y: 50, width: 50, height: 80, locked: true, Image: new Image() };
const keys = [
  { x: 10, y: 450, size: 15, question: "Hvilket kontinent er Morokko i?", answer: "Afrika", found: false, timerAdjusted: false },
  { x: 200, y: 200, size: 15, question: "Hvad er 7 * 4?", answer: "28", found: false, timerAdjusted: false },
  { x: 300, y: 300, size: 15, question: "TRUE OR FALSE: Danmark er medlem af EU og Nato", answer: "True", found: false, timerAdjusted: false }
];

function updateTimer() {
if (timeLeft >= 0) {
  timeLeft--;
  timerElement.textContent = `Time left: ${Math.floor(timeLeft)}s`;
} else {
  alert("Time's up! Game over.");
  resetLevel();
  pressedKeys["ArrowRight"] = false;
  pressedKeys["ArrowLeft"] = false;
  pressedKeys["ArrowUp"] = false;
  pressedKeys["ArrowDown"] = false;
}

keys.forEach(key => {
  if (key.found && !key.timerAdjusted) {
    timeLeft *= 0.54;
    key.timerAdjusted = true; // Mark the key as having adjusted the timer
  }
});
}
const obstacles = [
    { x: 100, y: 0, width: 50, height: 90, },
    { x: 0, y: 100, width: 70, height: 50 },
    { x: 250, y: 150, width: 60, height: 60 },
    { x: 350, y: 250, width: 70, height: 70 },
    { x: 75, y: 300, width: 80, height: 150 }
];
const pressedKeys = {};
document.addEventListener("keydown", e => { pressedKeys[e.key] = true; });
document.addEventListener("keyup", e => { pressedKeys[e.key] = false; });

// Hjælpefunktion: tjekker om to rektangler kolliderer
function rectCollision(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// Vi flytter spilleren separat for X og Y, og tjekker kollision på hver akse
function update() {
  // Beregn ønsket ny x- og y-position
  const desiredX = player.x + ((pressedKeys["ArrowRight"] ? player.speed : 0) - (pressedKeys["ArrowLeft"] ? player.speed : 0));
  const desiredY = player.y + ((pressedKeys["ArrowDown"] ? player.speed : 0) - (pressedKeys["ArrowUp"] ? player.speed : 0));

  // Først opdater x og tjek for kollision
  let collisionX = obstacles.some(ob => rectCollision(desiredX, player.y, player.size, player.size, ob.x, ob.y, ob.width, ob.height));
  if (!collisionX && desiredX >= 0 && desiredX + player.size <= canvas.width) {
    player.x = desiredX;
  }
  
  // Dernæst opdater y og tjek for kollision
  let collisionY = obstacles.some(ob => rectCollision(player.x, desiredY, player.size, player.size, ob.x, ob.y, ob.width, ob.height));
  if (!collisionY && desiredY >= 0 && desiredY + player.size <= canvas.height) {
    player.y = desiredY;
  }
  
  // Tjek for nøgler
  keys.forEach(key => {
    if (!key.found &&
        rectCollision(player.x, player.y, player.size, player.size, key.x, key.y, key.size, key.size)) {
      let answer = prompt(key.question);
      if (answer && answer.toLowerCase() === key.answer.toLowerCase()) {
        key.found = true;
        if (keys.every(k => k.found)) door.locked = false;
      }
      // Reset pressed keys after answering question
      pressedKeys["ArrowRight"] = false;
      pressedKeys["ArrowLeft"] = false;
      pressedKeys["ArrowUp"] = false;
      pressedKeys["ArrowDown"] = false;
    }
  });
  
  // Tjek for dør
  if (rectCollision(player.x, player.y, player.size, player.size, door.x, door.y, door.width, door.height)) {
    if (!door.locked) {
        alert("Tillykke du kom ud!");
        resetLevel();
        pressedKeys["ArrowRight"] = false;
        pressedKeys["ArrowLeft"] = false;
        pressedKeys["ArrowUp"] = false;
        pressedKeys["ArrowDown"] = false;
    }
  }
  
  // Sørg for, at spilleren bliver inden for canvas
  if (player.x < 0) player.x = 0;
  if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
  if (player.y < 0) player.y = 0;
  if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;
  
  // Opdater maskCanvas: Ryd det, så kun den nuværende position lyser op
  maskCtx.globalCompositeOperation = "source-over";
  maskCtx.fillStyle = "black";
  maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
  
  // Tegn en radial gradient omkring spilleren – gør den lidt større og lysere
  const cx = player.x + player.size / 2;
  const cy = player.y + player.size / 2;
  const grad = maskCtx.createRadialGradient(cx, cy, player.size / 2, cx, cy, 200); // Radius 200
  grad.addColorStop(0, "rgba(255,255,255,1)"); // Fuldt lys
  grad.addColorStop(1, "rgba(255,255,255,0)");
  maskCtx.fillStyle = grad;
  maskCtx.beginPath();
  maskCtx.arc(cx, cy, 200, 0, Math.PI * 2);
  maskCtx.fill();
}

function drawRoom() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawObstacles() {
  ctx.fillStyle = "gray";
  obstacles.forEach(ob => ctx.fillRect(ob.x, ob.y, ob.width, ob.height));
}

function drawDoor() {
  ctx.fillStyle = door.locked ? "red" : "green";
  ctx.fillRect(door.x, door.y, door.width, door.height);
}

function drawKeys() {
  keys.forEach(key => {
    if (!key.found) {
      ctx.fillStyle = "gold";
      ctx.beginPath();
      ctx.arc(key.x + key.size / 2, key.y + key.size / 2, key.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.x + player.size / 2, player.y + player.size / 2, player.size / 2, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoom();
  drawObstacles();
  drawDoor();
  drawKeys();
  drawPlayer();
  
  // Tegn maskCanvas ovenpå med globalCompositeOperation "multiply"
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(maskCanvas, 0, 0);
  ctx.globalCompositeOperation = "source-over";
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();

