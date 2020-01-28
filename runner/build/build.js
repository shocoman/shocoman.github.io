class ObjectAnimation {
    constructor(sprite_sheet_path, cols_num, rows_num, frames_num, frame_pos, frame_size, col_offset = 0, row_offset = 0) {
        this.img = loadImage(sprite_sheet_path);
        this.cols_number = cols_num;
        this.rows_number = rows_num;
        this.number_of_frames = frames_num;
        this.current_frame = 0;
        this.frame_pos = frame_pos;
        this.frame_size = frame_size;
        this.column_offset = col_offset;
        this.row_offset = row_offset;
    }
    draw(pos, size, is_flipped) {
        if (is_flipped) {
            scale(-1, 1);
            translate(-size.x, 0);
        }
        image(this.img, pos.x * (is_flipped ? -1 : 1), pos.y, size.x, size.y, this.frame_pos.x + this.get_current_col() * (this.frame_size.x + this.column_offset), this.frame_pos.y + this.get_current_row() * (this.frame_size.y + this.row_offset), this.frame_size.x, this.frame_size.y);
    }
    next_frame() {
        this.current_frame += 1;
        if (this.current_frame >= this.number_of_frames) {
            this.current_frame = 0;
        }
    }
    play() {
        this.is_paused = !this.is_paused;
    }
    get_current_col() {
        return this.current_frame % this.cols_number;
    }
    get_current_row() {
        return int(this.current_frame / this.cols_number);
    }
}
class AnimationManager {
    constructor() {
        this.anims = {};
        this.paused = false;
        this.is_flipped = false;
        this.speed = 5;
    }
    load(name, sprite_sheet_path, cols_num, rows_num, frames_num, frame_pos, frame_size) {
        let new_animation = new ObjectAnimation(sprite_sheet_path, cols_num, rows_num, frames_num, frame_pos, frame_size);
        this.anims[name] = new_animation;
    }
    show(name, pos, size, frame = undefined) {
        if (frame != undefined)
            this.anims[name].current_frame = frame;
        this.anims[name].draw(pos, size, this.is_flipped);
        if (!this.paused && frameCount % this.speed == 0)
            this.anims[name].next_frame();
    }
    play() {
        this.paused = !this.paused;
    }
    flip() {
        this.is_flipped = !this.is_flipped;
    }
    set_speed(speed) {
        this.speed = speed;
    }
}
var ObstacleType;
(function (ObstacleType) {
    ObstacleType[ObstacleType["Pterodactyl"] = 0] = "Pterodactyl";
    ObstacleType[ObstacleType["Other"] = 1] = "Other";
})(ObstacleType || (ObstacleType = {}));
class Obstacle {
    constructor(x, y, w, h, obstacleAnimManager) {
        this.pos = createVector(x, y);
        this.size = createVector(w, h);
        this.type = ObstacleType.Pterodactyl;
        this.animManager = obstacleAnimManager;
    }
    setType(newType) {
        this.type = newType;
    }
    update(xSpeed) {
        this.pos.x -= xSpeed;
    }
    draw() {
        if (this.type == ObstacleType.Pterodactyl) {
            this.animManager.show('pterodactyl', this.pos, this.size);
        }
        else {
            fill(120, 0, 10);
            ellipse(this.pos.x, this.pos.y, this.size.x, this.size.y);
        }
    }
}
var PlayerState;
(function (PlayerState) {
    PlayerState[PlayerState["Running"] = 0] = "Running";
    PlayerState[PlayerState["Jumping"] = 1] = "Jumping";
})(PlayerState || (PlayerState = {}));
class Player {
    constructor(position, size, animManager) {
        this.pos = position;
        this.vel = createVector();
        this.acc = createVector(0, 1);
        this.size = size;
        this.animManager = animManager;
        this.playerState = PlayerState.Jumping;
    }
    jump() {
        this.playerState = PlayerState.Jumping;
        let jumpForce = createVector(0, -20);
        this.vel.add(jumpForce);
    }
    update(obstacles) {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        if (this.pos.y + this.size.y > height - floorLevel) {
            this.playerState = PlayerState.Running;
            this.pos.y = (height - floorLevel) - this.size.y;
            this.vel.y = 0;
        }
        if (this.obstacleCollision(obstacles)) {
            console.log("Game Over!");
        }
    }
    obstacleCollision(obstacles) {
        for (const b of obstacles) {
            if (AABBcollision(this.pos, this.size, b.pos, b.size)) {
                return true;
            }
        }
        return false;
    }
    draw() {
        if (this.playerState == PlayerState.Jumping) {
            if (this.vel.y < 0) {
                this.animManager.show('jump', this.pos, this.size, 0);
            }
            else {
                this.animManager.show('jump', this.pos, this.size, 1);
            }
        }
        else if (this.playerState == PlayerState.Running) {
            this.animManager.show('run', this.pos, this.size);
        }
    }
}
let floorLevel = 100;
let obstacleSpeed = 5;
let score = 0;
let player;
let obstacles;
let obstacleAnimManager;
function setup() {
    createCanvas(800, 600);
    let playerAnimManager = new AnimationManager();
    playerAnimManager.load('run', './sprites/engineer/run.png', 8, 1, 8, createVector(0, 0), createVector(64, 112));
    playerAnimManager.load('jump', './sprites/engineer/jump.png', 2, 1, 2, createVector(0, 0), createVector(64, 112));
    obstacleAnimManager = new AnimationManager();
    obstacleAnimManager.load('pterodactyl', './sprites/dino.png', 2, 1, 2, createVector(259, 0), createVector(92, 90));
    obstacleAnimManager.set_speed(18);
    player = new Player(createVector(width / 8, height / 2), createVector(50, 100), playerAnimManager);
    obstacles = new Array();
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
    });
    updateAndDrawScore();
    spawnSometimes();
}
function spawnSometimes() {
    if (obstacles.length > 0)
        return;
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
function obstacleCleaner(obstacles) {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (obstacles[i].pos.x + obstacles[i].size.x < 0) {
            obstacles.splice(i, 1);
        }
    }
}
function mousePressed() {
    if (player.playerState == PlayerState.Running)
        player.jump();
}
function AABBcollision(pos1, size1, pos2, size2) {
    return pos1.x + size1.x > pos2.x &&
        pos1.y + size1.y > pos2.y &&
        pos1.x < pos2.x + size2.x &&
        pos1.y < pos2.y + size2.y;
}
function updateAndDrawScore() {
    score += 1;
    if (score % 1000 === 0) {
        obstacleSpeed += 1;
    }
    textSize(25);
    noStroke();
    fill(0, 200, 0);
    textFont("ComicSansMS");
    text(`Score: ${floor(score / 10)}`, 0, 25);
}
//# sourceMappingURL=build.js.map