let floorLevel = 100;
let obstacleSpeed = 5;
let score = 0;

let player: Player;
let obstacles: Obstacle[];


let obstacleAnimManager: AnimationManager;

function setup() {
    createCanvas(800, 600);
    // frameRate(15);

    let playerAnimManager = new AnimationManager();
    playerAnimManager.load('run', './sprites/engineer/run.png', 8, 1, 8, createVector(0, 0), createVector(64, 112));
    playerAnimManager.load('jump', './sprites/engineer/jump.png', 2, 1, 2, createVector(0, 0), createVector(64, 112));


    obstacleAnimManager = new AnimationManager();
    obstacleAnimManager.load('pterodactyl', './sprites/dino.png', 2, 1, 2, createVector(259, 0), createVector(92, 90));
    obstacleAnimManager.set_speed(18);

    player = new Player(createVector(width / 8, height / 2), createVector(50, 100), playerAnimManager);
    obstacles = new Array<Obstacle>();



}

function draw() {
    background(0);

    player.update(obstacles);
    player.draw();

    drawFloor();

    obstacleCleaner(obstacles);
    obstacles.forEach(obs => {
        obs.update(obstacleSpeed);
        obs.draw();
    })

    updateAndDrawScore();

    spawnSometimes();



}


function spawnSometimes() {
    if (obstacles.length > 0) return;

    let obstacleSize = 100;
    let obstacleType = random() > 0.5 ? "high" : "low";
    let obstacleHeight = obstacleType == "high" ? height / 2 : (height - floorLevel) - obstacleSize;

    let randomValue = random();
    let doSpawn = randomValue > 0.99;
    if (doSpawn) {
        let obstacle = new Obstacle(width + 100, obstacleHeight, obstacleSize, obstacleSize, obstacleAnimManager);
        obstacles.push(obstacle);
    }

}

function drawFloor() {
    stroke(220);
    line(0, height - floorLevel, width, height - floorLevel);
}

function obstacleCleaner(obstacles: Obstacle[]) {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (obstacles[i].pos.x + obstacles[i].size.x < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function mousePressed() {
    if (player.playerState == PlayerState.Running) player.jump();
    // obstacleSpeed++;
    // obstacles.push(new Obstacle(createVector(mouseX, mouseY), createVector(100, 100), 10));
}