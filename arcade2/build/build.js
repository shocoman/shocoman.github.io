class ObjectAnimation {
    constructor(sprite_sheet_path, cols_num, rows_num, frames_num, frame_pos, frame_size, col_offset = 0, row_offset = 0) {
        this.img = loadImage(sprite_sheet_path);
        this.colsNumber = cols_num;
        this.rowsNumber = rows_num;
        this.numberOfFrames = frames_num;
        this.currentFrame = 0;
        this.framePos = frame_pos;
        this.frameSize = frame_size;
        this.columnOffset = col_offset;
        this.rowOffset = row_offset;
    }
    draw(pos, size, is_flipped) {
        push();
        if (is_flipped) {
            scale(-1, 1);
            translate(-size.x, 0);
        }
        image(this.img, pos.x * (is_flipped ? -1 : 1), pos.y, size.x, size.y, this.framePos.x + this.get_current_col() * (this.frameSize.x + this.columnOffset), this.framePos.y + this.get_current_row() * (this.frameSize.y + this.rowOffset), this.frameSize.x, this.frameSize.y);
        pop();
    }
    next_frame() {
        this.currentFrame += 1;
        if (this.currentFrame >= this.numberOfFrames) {
            this.currentFrame = 0;
        }
    }
    play() {
        this.isPaused = !this.isPaused;
    }
    get_current_col() {
        return this.currentFrame % this.colsNumber;
    }
    get_current_row() {
        return int(this.currentFrame / this.colsNumber);
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
            this.anims[name].currentFrame = frame;
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
var playerState;
(function (playerState) {
    playerState[playerState["Walking"] = 0] = "Walking";
    playerState[playerState["Jumping"] = 1] = "Jumping";
    playerState[playerState["Falling"] = 2] = "Falling";
})(playerState || (playerState = {}));
var playerDirection;
(function (playerDirection) {
    playerDirection[playerDirection["Left"] = 0] = "Left";
    playerDirection[playerDirection["Right"] = 1] = "Right";
})(playerDirection || (playerDirection = {}));
var playerMoving;
(function (playerMoving) {
    playerMoving[playerMoving["None"] = 0] = "None";
    playerMoving[playerMoving["Left"] = 1] = "Left";
    playerMoving[playerMoving["Right"] = 2] = "Right";
})(playerMoving || (playerMoving = {}));
class Player {
    constructor(anim) {
        this.pos = createVector(width / 2, height * 2 / 3);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0.5);
        this.size = createVector(tileWidth * 2 - 5, tileHeight * 2);
        this.moving = playerMoving.None;
        this.direction = playerDirection.Right;
        this.animState = playerState.Falling;
        this.type = 'PLAYER';
        this.animManager = anim;
        this.walkSpeed = 6;
        this.jumpVelocity = 15;
        this.doubleJump = true;
    }
    update(map) {
        this.moving_routine(map);
    }
    draw() {
        if (this.vel.x > 0) {
            this.animManager.is_flipped = false;
        }
        if (this.vel.x < 0) {
            this.animManager.is_flipped = true;
        }
        if (this.animState == playerState.Jumping) {
            if (this.vel.y < 0) {
                this.animManager.show('jump', this.pos, this.size, 0);
            }
            else {
                this.animManager.show('jump', this.pos, this.size, 1);
            }
        }
        else if (this.vel.x > 0) {
            this.animManager.is_flipped = false;
            this.animManager.show('run', this.pos, this.size);
        }
        else if (this.vel.x == 0)
            this.animManager.show('idle', this.pos, this.size);
        else {
            this.animManager.is_flipped = true;
            this.animManager.show('run', this.pos, this.size);
        }
    }
    moving_routine(map) {
        this.vel.add(this.acc);
        this.pos.x += this.vel.x;
        this.collision_detection(map, 'x');
        this.pos.y += this.vel.y;
        this.collision_detection(map, 'y');
        if (this.moving == playerMoving.Right) {
            this.vel.x = +this.walkSpeed;
        }
        else if (this.moving == playerMoving.Left) {
            this.vel.x = -this.walkSpeed;
        }
        else if (this.moving == playerMoving.None) {
            this.vel.x = 0;
        }
        this.vel.y = constrain(this.vel.y, -10, 10);
    }
    collision_detection(map, axis) {
        let leftTile = floor(this.pos.x / tileWidth);
        let rightTile = floor((this.pos.x + this.size.x) / tileWidth);
        let topTile = floor(this.pos.y / tileHeight);
        let bottomTile = floor((this.pos.y + this.size.y) / tileHeight);
        for (let tileY = topTile; tileY <= bottomTile; tileY++) {
            for (let tileX = leftTile; tileX <= rightTile; tileX++) {
                if (map[tileY] != undefined && this.isBlockStopable(map[tileY][tileX])) {
                    if (axis == 'y') {
                        if (this.vel.y >= 0) {
                            this.pos.y = tileY * tileHeight - this.size.y - 1;
                            this.animState = playerState.Walking;
                            this.vel.y = 0;
                            this.doubleJump = true;
                        }
                        else {
                            this.pos.y = (tileY + 1) * tileHeight + 1;
                            this.vel.y = -0.1;
                        }
                    }
                    else if (axis == 'x') {
                        if (this.vel.x > 0) {
                            this.pos.x = tileX * tileWidth - this.size.x - 1;
                            this.vel.x = 0;
                        }
                        else if (this.vel.x < 0) {
                            this.pos.x = (tileX + 1) * tileWidth + 1;
                            this.vel.x = 0;
                        }
                    }
                }
            }
        }
    }
    isBlockStopable(num) {
        let stopBlockNums = [196, 474, 475, 200, 709, 710, 709, 710, 711, 713, 714, 709, 710, 711, 717, 709, 710, 711, 729, 730, 731,
            468, 469, 470, 526, 527, 528,
            119, 120, 121, 122, 123, 124, 125];
        return stopBlockNums.find((e) => e == num) != undefined;
    }
    keyPressed(e) {
        if (keyCode == LEFT_ARROW) {
            this.moving = playerMoving.Left;
        }
        else if (keyCode == RIGHT_ARROW) {
            this.moving = playerMoving.Right;
        }
        if (keyCode == UP_ARROW && (this.animState == playerState.Walking || this.doubleJump)) {
            if (this.animState == playerState.Jumping)
                this.doubleJump = false;
            this.vel.y = -this.jumpVelocity;
            this.animState = playerState.Jumping;
        }
    }
    keyReleased(e) {
        if (keyCode == LEFT_ARROW && this.moving == playerMoving.Left) {
            this.moving = playerMoving.None;
        }
        else if (keyCode == RIGHT_ARROW && this.moving == playerMoving.Right) {
            this.moving = playerMoving.None;
        }
    }
}
const spritesheetPath = "./assets/tileset.png";
const mapPath = "./assets/map.txt";
const cloudPath = "./assets/clouds.png";
const farGroundsPath = "./assets/far-grounds.png";
const skyPath = "./assets/sky.png";
const seaPath = "./assets/sea.png";
let spritesheetImage;
let mapArray;
let cloudImage;
let farGroundsImage;
let skyImage;
let seaImage;
let mapRows;
let mapCols;
let spritesheetTileWidth = 64;
let spritesheetTileHeight = 64;
let spritesheetRows = 20;
let spritesheetCols = 58;
let mapStrings;
let tileWidth = 40;
let tileHeight = 40;
function preload() {
    spritesheetImage = loadImage(spritesheetPath);
    mapStrings = loadStrings(mapPath);
    cloudImage = loadImage(cloudPath);
    farGroundsImage = loadImage(farGroundsPath);
    skyImage = loadImage(skyPath);
    seaImage = loadImage(seaPath);
}
let animManager;
let player;
let cameraPos;
function setup() {
    createCanvas(800, 600);
    mapArray = loadMap(mapStrings);
    animManager = new AnimationManager();
    animManager.load('run', './sprites/engineer/run.png', 8, 1, 8, createVector(0, 0), createVector(64, 112));
    animManager.load('idle', './sprites/engineer/idle.png', 9, 1, 9, createVector(0, 0), createVector(64, 112));
    animManager.load('jump', './sprites/engineer/jump.png', 2, 1, 2, createVector(0, 0), createVector(64, 112));
    player = new Player(animManager);
    cameraPos = createVector(width / 2 - player.pos.x, height / 2 - player.pos.y);
}
function draw() {
    background(220);
    drawBackground();
    cameraPos.lerp(createVector(-player.pos.x + width / 2 - (width / 10 * (player.animManager.is_flipped ? -1 : 1.5)), height / 8 - player.pos.y + height / 2), 0.05);
    translate(cameraPos);
    player.update(mapArray);
    player.draw();
    drawMap();
}
function drawBackground() {
    for (let i = 0; i < ceil(width / skyImage.width); i++) {
        image(skyImage, i * skyImage.width, 0, skyImage.width, skyImage.height * 1.5);
    }
    let seaHeight = height - seaImage.height * 1;
    for (let i = 0; i < ceil(width / seaImage.width); i++) {
        image(seaImage, i * seaImage.width, seaHeight, seaImage.width * 1, seaImage.height * 1);
    }
    for (let i = 0; i < ceil(width / cloudImage.width); i++) {
        let cloudHeight = seaHeight - cloudImage.height;
        image(cloudImage, i * cloudImage.width, cloudHeight);
    }
    let fargroundHeight = farGroundsImage.height * width / farGroundsImage.width;
    image(farGroundsImage, 0, height - fargroundHeight, width, fargroundHeight);
}
function drawMap() {
    for (let row = 0; row < mapRows; row++) {
        for (let col = 0; col < mapCols; col++) {
            let frameNumber = mapArray[row][col] - 1;
            drawPartOfImage(frameNumber, col * tileWidth, row * tileHeight, tileWidth, tileHeight);
        }
    }
}
function drawPartOfImage(frameNumber, x, y, w, h) {
    let r = floor(frameNumber / spritesheetCols);
    let c = frameNumber % spritesheetCols;
    image(spritesheetImage, x, y, w + 1, h + 1, spritesheetTileWidth * c, spritesheetTileHeight * r, spritesheetTileWidth, spritesheetTileHeight);
}
function loadMap(mapStrings) {
    mapRows = mapStrings.length;
    let tileMap = [];
    for (let str of mapStrings) {
        let rowOfStrings = str.split('\t');
        let rowOfInts = rowOfStrings.map(Number);
        mapCols = rowOfInts.length;
        tileMap.push(rowOfInts);
    }
    return tileMap;
}
function keyPressed(e) {
    player.keyPressed(e);
}
function keyReleased(e) {
    player.keyReleased(e);
}
//# sourceMappingURL=build.js.map