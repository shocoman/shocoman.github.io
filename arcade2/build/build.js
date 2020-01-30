class ObjectAnimation {
    constructor(sprite_sheet_path, cols_num, rows_num, frames_num, frame_pos, frame_size, col_offset = 0, row_offset = 0, speed = 4) {
        this.img = loadImage(sprite_sheet_path);
        this.colsNumber = cols_num;
        this.rowsNumber = rows_num;
        this.numberOfFrames = frames_num;
        this.currentFrame = 0;
        this.framePos = frame_pos;
        this.frameSize = frame_size;
        this.columnOffset = col_offset;
        this.rowOffset = row_offset;
        this.speed = speed;
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
    }
    load(name, sprite_sheet_path, cols_num, rows_num, frames_num, frame_pos, frame_size, speed = 4) {
        let new_animation = new ObjectAnimation(sprite_sheet_path, cols_num, rows_num, frames_num, frame_pos, frame_size, speed);
        this.anims[name] = new_animation;
    }
    show(name, pos, size, frame = undefined) {
        if (frame != undefined)
            this.anims[name].currentFrame = frame;
        this.anims[name].draw(pos, size, this.is_flipped);
        if (!this.paused && frameCount % this.anims[name].speed == 0)
            this.anims[name].next_frame();
    }
    play() {
        this.paused = !this.paused;
    }
    flip() {
        this.is_flipped = !this.is_flipped;
    }
    set_speed(name, speed) {
        this.anims[name].speed = speed;
    }
}
var AnimationType;
(function (AnimationType) {
    AnimationType[AnimationType["LOOPABLE"] = 0] = "LOOPABLE";
    AnimationType[AnimationType["SINGULAR"] = 1] = "SINGULAR";
})(AnimationType || (AnimationType = {}));
class NewAnimation {
    constructor(animationInfoJson, animationSpritesheetImage) {
        this.hPadding = 0;
        this.callback = null;
        this.initAnimation(animationInfoJson, animationSpritesheetImage);
    }
    initAnimation(animationInfoJson, animationSpritesheetImage) {
        this.spritesheet = animationSpritesheetImage;
        this.frames = animationInfoJson.frames;
        this.length = animationInfoJson.frames.length;
        this.frameCount = 0;
        this.speed = 4;
        this.type = AnimationType.LOOPABLE;
    }
    draw(x, y, w, h, isFlipped) {
        let source = this.frames[this.frameCount].frame;
        push();
        if (isFlipped) {
            scale(-1, 1);
            translate(-w, 0);
        }
        x *= isFlipped ? -1 : 1;
        image(this.spritesheet, x + this.hPadding, y, w - this.hPadding, h, source.x, source.y, source.w, source.h);
        pop();
    }
    nextFrame() {
        if (this.type == AnimationType.LOOPABLE) {
            this.frameCount += 1;
            this.frameCount %= this.length;
        }
        else if (this.type == AnimationType.SINGULAR) {
            if (this.frameCount < this.length - 1) {
                this.frameCount += 1;
            }
            else if (this.callback != null) {
                this.callback(this);
            }
        }
    }
}
class NewAnimationManager {
    constructor() {
        this.animations = {};
        this.isFlipped = false;
    }
    addAnimation(name, spritesheetInfo, spritesheetImage) {
        this.animations[name] = new NewAnimation(spritesheetInfo, spritesheetImage);
    }
    draw(name, x, y, w, h) {
        let animation = this.animations[name];
        animation.draw(x, y, w, h, this.isFlipped);
        if (frameCount % animation.speed == 0) {
            animation.nextFrame();
        }
    }
    playCurrentAnimation(x, y, w, h) {
        this.draw(this.currentAnimation, x, y, w, h);
    }
    setSpeed(name, speed) {
        this.animations[name].speed = ceil(speed);
    }
    setAnimationType(name, type) {
        this.animations[name].type = type;
    }
    resetAnimation(name) {
        this.animations[name].frameCount = 0;
    }
    setHPadding(name, hPadding) {
        this.animations[name].hPadding = hPadding;
    }
    setCurrentAnimation(name) {
        this.currentAnimation = name;
    }
    save() {
        return {
            animations: Object.assign({}, this.animations),
            isFlipped: this.isFlipped,
            currentAnimation: this.currentAnimation
        };
    }
    load(saveState) {
        this.animations = Object.assign({}, saveState.animations),
            this.isFlipped = saveState.isFlipped,
            this.currentAnimation = saveState.currentAnimation;
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
        this.collisionHPadding = 14;
        this.collisionHappenedLastTurn = false;
        this.collisionHappenedSecondFromLastTurn = false;
        this.pos = createVector(width * 3 / 5, height);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0.5);
        this.size = createVector(tileWidth * 2 - 5, tileHeight * 2);
        this.moving = playerMoving.None;
        this.direction = playerDirection.Right;
        this.animState = playerState.Falling;
        this.animManager = anim;
        this.runSpeed = 6;
        this.jumpVelocity = 15;
        this.doubleJump = true;
    }
    update(map) {
        this.moving_routine(map);
    }
    draw() {
        if (this.moving == playerMoving.Left) {
            this.animManager.isFlipped = true;
        }
        else if (this.moving == playerMoving.Right) {
            this.animManager.isFlipped = false;
        }
        if (this.animState == playerState.Jumping) {
            this.animManager.setCurrentAnimation('jump');
        }
        else if (this.animState == playerState.Falling) {
            this.animManager.setCurrentAnimation('fall');
        }
        else if (this.moving == playerMoving.Right || this.vel.x > 0) {
            this.animManager.setCurrentAnimation('run');
        }
        else if (this.moving == playerMoving.None && this.vel.x == 0)
            this.animManager.setCurrentAnimation('idle');
        else if (this.moving == playerMoving.Left || this.vel.x < 0) {
            this.animManager.setCurrentAnimation('run');
        }
        this.animManager.playCurrentAnimation(this.pos.x, this.pos.y, this.size.x, this.size.y);
        this.animManager.setSpeed('run', 2 / abs(this.vel.x));
    }
    moving_routine(map) {
        this.vel.add(this.acc);
        this.pos.x += this.vel.x;
        this.collision_detection(map, 'x');
        this.pos.y += this.vel.y;
        let collisionHappened = this.collision_detection(map, 'y');
        if (!isRewinding) {
            this.collisionHappenedSecondFromLastTurn = this.collisionHappenedLastTurn;
            this.collisionHappenedLastTurn = collisionHappened;
            if (!this.collisionHappenedLastTurn && !this.collisionHappenedSecondFromLastTurn) {
                if (this.animState == playerState.Walking)
                    this.animState = playerState.Falling;
            }
        }
        this.vel.x = constrain(this.vel.x, -this.runSpeed, this.runSpeed);
        this.vel.y = constrain(this.vel.y, -10, 10);
    }
    collision_detection(map, axis) {
        let leftTile = floor((this.pos.x + this.collisionHPadding) / tileWidth);
        let rightTile = floor((this.pos.x + this.size.x - this.collisionHPadding) / tileWidth);
        let topTile = floor(this.pos.y / tileHeight);
        let bottomTile = floor((this.pos.y + this.size.y) / tileHeight);
        let collisionHappened = false;
        for (let tileY = topTile; tileY <= bottomTile; tileY++) {
            for (let tileX = leftTile; tileX <= rightTile; tileX++) {
                if (map[tileY] != undefined && this.isBlockStopable(map[tileY][tileX])) {
                    if (axis == 'y') {
                        if (this.vel.y >= 0) {
                            collisionHappened = true;
                            this.pos.y = tileY * tileHeight - this.size.y - 1;
                            this.animState = playerState.Walking;
                            this.vel.y = 0;
                            this.doubleJump = true;
                            if (this.moving == playerMoving.None) {
                                if (abs(this.vel.x) < 0.01)
                                    this.vel.x = 0;
                                else
                                    this.vel.x /= 2;
                            }
                        }
                        else {
                            this.pos.y = (tileY + 1) * tileHeight + 1;
                            this.vel.y = -0.1;
                        }
                    }
                    else if (axis == 'x') {
                        if (this.vel.x > 0) {
                            this.pos.x = tileX * tileWidth - (this.size.x - this.collisionHPadding) - 1;
                            this.vel.x = 0;
                        }
                        else if (this.vel.x < 0) {
                            this.pos.x = (tileX + 1) * tileWidth + 1 - this.collisionHPadding;
                            this.vel.x = 0;
                        }
                    }
                }
            }
        }
        return collisionHappened;
    }
    isBlockStopable(num) {
        let stopBlockNums = [
            196, 474, 475, 200, 709, 710, 709, 710, 711, 713, 714, 709, 710, 711, 717, 709, 710, 711, 729, 730, 731,
            468, 469, 470, 526, 527, 528,
            119, 120, 121, 122, 123, 124, 125
        ];
        return stopBlockNums.find((e) => e == num) != undefined;
    }
    jump() {
        if (this.animState == playerState.Jumping || this.animState == playerState.Falling) {
            this.doubleJump = false;
        }
        this.vel.y = -this.jumpVelocity;
        this.animState = playerState.Jumping;
        this.animManager.resetAnimation('jump');
        this.animManager.setCurrentAnimation('jump');
    }
    keyPressed(e) {
        if (keyCode == LEFT_ARROW) {
            this.moving = playerMoving.Left;
            this.animManager.resetAnimation('run');
            this.acc.x = -0.2;
        }
        else if (keyCode == RIGHT_ARROW) {
            this.moving = playerMoving.Right;
            this.animManager.resetAnimation('run');
            this.acc.x = 0.2;
        }
        if (keyCode == UP_ARROW && (this.animState == playerState.Walking || this.doubleJump)) {
            this.jump();
        }
    }
    keyReleased(e) {
        if (keyCode == LEFT_ARROW && this.moving == playerMoving.Left) {
            this.moving = playerMoving.None;
            this.acc.x = 0;
        }
        else if (keyCode == RIGHT_ARROW && this.moving == playerMoving.Right) {
            this.moving = playerMoving.None;
            this.acc.x = 0;
        }
        else if (key == ' ') {
            this.moving = playerMoving.None;
            this.acc.x = 0;
        }
    }
    saveFrame() {
        return {
            position: this.pos.copy(),
            velocity: this.vel.copy(),
            acc: this.acc.copy(),
            size: this.size.copy(),
            animManager: this.animManager.save(),
            animState: this.animState,
            moving: this.moving,
            direction: this.direction,
        };
    }
    loadFrame(frame) {
        this.pos = frame.position.copy(),
            this.vel = frame.velocity.copy(),
            this.acc = frame.acc.copy(),
            this.size = frame.size.copy(),
            this.animManager.load(frame.animManager),
            this.animState = frame.animState,
            this.moving = frame.moving,
            this.direction = frame.direction;
    }
}
const spritesheetPath = "./assets/tileset.png";
const mapPath = "./assets/map.txt";
const cloudPath = "./assets/clouds.png";
const farGroundsPath = "./assets/far-grounds.png";
const skyPath = "./assets/sky.png";
const seaPath = "./assets/sea.png";
const braidPath = "./assets/braid.png";
const braidIdleImagePath = "./assets/braidIdle/spritesheet.png";
const braidIdleInfoPath = "./assets/braidIdle/spritesheet.json";
const braidRunImagePath = "./assets/braidRun/spritesheet.png";
const braidRunInfoPath = "./assets/braidRun/spritesheet.json";
const braidJumpImagePath = "./assets/braidJump/spritesheet.png";
const braidJumpInfoPath = "./assets/braidJump/spritesheet.json";
const braidFallImagePath = "./assets/braidFall/spritesheet.png";
const braidFallInfoPath = "./assets/braidFall/spritesheet.json";
let braidIdleImage;
let braidIdleInfo;
let braidRunImage;
let braidRunInfo;
let braidJumpImage;
let braidJumpInfo;
let braidFallImage;
let braidFallInfo;
let spritesheetImage;
let mapArray;
let cloudImage;
let farGroundsImage;
let skyImage;
let seaImage;
let braidImage;
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
    braidImage = loadImage(braidPath);
    braidIdleImage = loadImage(braidIdleImagePath);
    braidIdleInfo = loadJSON(braidIdleInfoPath);
    braidRunImage = loadImage(braidRunImagePath);
    braidRunInfo = loadJSON(braidRunInfoPath);
    braidJumpImage = loadImage(braidJumpImagePath);
    braidJumpInfo = loadJSON(braidJumpInfoPath);
    braidFallImage = loadImage(braidFallImagePath);
    braidFallInfo = loadJSON(braidFallInfoPath);
}
let newAnimationManager;
let player;
let cameraPos;
let gameStates = [];
let isRewinding = false;
function setup() {
    createCanvas(800, 600);
    mapArray = loadMap(mapStrings);
    newAnimationManager = new NewAnimationManager();
    newAnimationManager.addAnimation('idle', braidIdleInfo, braidIdleImage);
    newAnimationManager.setHPadding('idle', 18);
    newAnimationManager.addAnimation('fall', braidFallInfo, braidFallImage);
    newAnimationManager.addAnimation('jump', braidJumpInfo, braidJumpImage);
    newAnimationManager.setAnimationType('jump', AnimationType.SINGULAR);
    newAnimationManager.animations['jump'].callback = () => {
        player.animState = playerState.Falling;
    };
    newAnimationManager.addAnimation('run', braidRunInfo, braidRunImage);
    newAnimationManager.setSpeed('run', 2);
    player = new Player(newAnimationManager);
    cameraPos = createVector(width / 2 - player.pos.x, height / 2 - player.pos.y);
}
function draw() {
    background(220);
    drawBackground();
    cameraPos.lerp(createVector(-player.pos.x + width / 2 - (width / 10 * (player.animManager.isFlipped ? -1 : 1.5)), height / 8 - player.pos.y + height / 2), 0.05);
    push();
    translate(cameraPos);
    player.update(mapArray);
    player.draw();
    drawMap();
    pop();
    rewindingFacilities();
}
function rewindingFacilities() {
    isRewinding = false;
    if (frameCount % 1 == 0 && keyIsPressed && key == ' ') {
        let lastFrame = gameStates.pop();
        if (lastFrame != undefined) {
            isRewinding = true;
            player.loadFrame(lastFrame);
        }
    }
    if (frameCount % 2 == 0 && !isRewinding) {
        gameStates.push(player.saveFrame());
    }
    if (isRewinding) {
        background(0, 100);
        noStroke();
        fill(220, 100);
        let p1 = createVector(width / 6, height / 4);
        let p2 = createVector(width / 6, height - height / 4);
        let p3 = createVector(width / 2, height / 2);
        let p4 = createVector(width / 2, height / 4);
        let p5 = createVector(width / 2, height - height / 4);
        let p6 = createVector(width - width / 6, height / 2);
        triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        triangle(p4.x, p4.y, p5.x, p5.y, p6.x, p6.y);
    }
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