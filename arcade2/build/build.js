var AnimationType;
(function (AnimationType) {
    AnimationType[AnimationType["LOOPABLE"] = 0] = "LOOPABLE";
    AnimationType[AnimationType["SINGULAR"] = 1] = "SINGULAR";
})(AnimationType || (AnimationType = {}));
class CharacterAnimation {
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
            this.frameCount = mod(this.frameCount, this.length);
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
class AnimationManager {
    constructor() {
        this.animations = {};
        this.isFlipped = false;
    }
    addAnimation(name, spritesheetInfo, spritesheetImage) {
        this.animations[name] = new CharacterAnimation(spritesheetInfo, spritesheetImage);
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
            currentAnimation: this.currentAnimation,
        };
    }
    load(saveState) {
        this.animations = Object.assign({}, saveState.animations);
        this.isFlipped = saveState.isFlipped;
        this.currentAnimation = saveState.currentAnimation;
    }
}
var enemyState;
(function (enemyState) {
    enemyState[enemyState["Walking"] = 0] = "Walking";
    enemyState[enemyState["Rising"] = 1] = "Rising";
    enemyState[enemyState["Falling"] = 2] = "Falling";
    enemyState[enemyState["Death"] = 3] = "Death";
})(enemyState || (enemyState = {}));
var enemyDirection;
(function (enemyDirection) {
    enemyDirection[enemyDirection["Left"] = 0] = "Left";
    enemyDirection[enemyDirection["Right"] = 1] = "Right";
})(enemyDirection || (enemyDirection = {}));
var enemyMoving;
(function (enemyMoving) {
    enemyMoving[enemyMoving["None"] = 0] = "None";
    enemyMoving[enemyMoving["Left"] = 1] = "Left";
    enemyMoving[enemyMoving["Right"] = 2] = "Right";
})(enemyMoving || (enemyMoving = {}));
class Enemy {
    constructor(anim) {
        this.collisionHPadding = 14;
        this.isBouncing = true;
        this.bouncedTimes = 3;
        this.pos = createVector((width * 3) / 5, height);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0.5);
        this.size = createVector(tileWidth * 2 - 5, tileHeight * 2);
        this.moving = enemyMoving.Left;
        this.animState = enemyState.Falling;
        this.animManager = anim;
        this.runSpeed = 1.5;
        this.vel.x = -this.runSpeed;
        anim.setCurrentAnimation('fall');
    }
    update(map) {
        this.moving_routine(map);
        this.isGapAhead();
    }
    draw() {
        if (this.moving == enemyMoving.Left) {
            this.animManager.isFlipped = true;
        }
        else if (this.moving == enemyMoving.Right) {
            this.animManager.isFlipped = false;
        }
        if (this.animState == enemyState.Death) {
            this.animManager.setCurrentAnimation('death');
        }
        else if (this.animManager.currentAnimation == 'walk' && this.animState == enemyState.Rising) {
            this.animManager.setCurrentAnimation('rise');
        }
        else if (this.animState == enemyState.Falling) {
        }
        else if (this.animState == enemyState.Walking) {
            this.animManager.setCurrentAnimation('walk');
            this.vel.x = this.runSpeed * (this.moving == enemyMoving.Left ? -1 : 1);
        }
        this.animManager.playCurrentAnimation(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
    moving_routine(map) {
        this.vel.add(this.acc);
        this.pos.x += this.vel.x;
        this.collision_detection(map, 'x');
        this.pos.y += this.vel.y;
        this.collision_detection(map, 'y');
        this.vel.x = constrain(this.vel.x, -100 * this.runSpeed, 100 * this.runSpeed);
        this.vel.y = constrain(this.vel.y, -15, 15);
    }
    collision_detection(map, axis) {
        let leftTile = floor((this.pos.x + this.collisionHPadding) / tileWidth);
        let rightTile = floor((this.pos.x + this.size.x - this.collisionHPadding) / tileWidth);
        let topTile = floor(this.pos.y / tileHeight);
        let bottomTile = floor((this.pos.y + this.size.y) / tileHeight);
        let collisionHappened = false;
        let velOnCollision = null;
        for (let tileY = topTile; tileY <= bottomTile; tileY++) {
            for (let tileX = leftTile; tileX <= rightTile; tileX++) {
                if (isTileCollidable(tileY, tileX) && this.animState != enemyState.Death) {
                    if (axis == 'y') {
                        if (this.vel.y >= 0) {
                            collisionHappened = true;
                            this.pos.y = tileY * tileHeight - this.size.y - 1;
                            this.animState = enemyState.Walking;
                            velOnCollision = (velOnCollision !== null && velOnCollision !== void 0 ? velOnCollision : this.vel.copy());
                            this.vel.y = 0;
                        }
                        else {
                            this.pos.y = (tileY + 1) * tileHeight + 1;
                            this.vel.y = 0;
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
        this.letsBounce(collisionHappened, velOnCollision);
        return collisionHappened;
    }
    letsBounce(collisionHappened, velOnCollision) {
        if (this.isBouncing && collisionHappened) {
            if (this.bouncedTimes == 0) {
                this.bouncedTimes = 3;
                this.isBouncing = false;
                this.animState = enemyState.Walking;
                this.vel.y = 0;
            }
            else {
                this.vel.y = -velOnCollision.y * 0.8;
                this.animState = enemyState.Falling;
                this.bouncedTimes -= 1;
            }
        }
    }
    isGapAhead() {
        if (this.animState != enemyState.Walking)
            return;
        let leftTile = floor((this.pos.x + this.collisionHPadding) / tileWidth);
        let rightTile = floor((this.pos.x + this.size.x - this.collisionHPadding) / tileWidth);
        let topTile = floor(this.pos.y / tileHeight);
        let bottomTile = floor((this.pos.y + this.size.y) / tileHeight);
        if (this.moving == enemyMoving.Right && !isTileCollidable(bottomTile + 1, rightTile + 1)) {
            this.moving = enemyMoving.Left;
            this.vel.x = -this.runSpeed;
        }
        else if (this.moving == enemyMoving.Left && !isTileCollidable(bottomTile + 1, rightTile - 1)) {
            this.moving = enemyMoving.Right;
            this.vel.x = this.runSpeed;
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
            moving: this.moving
        };
    }
    loadFrame(frame) {
        this.pos = frame.position.copy();
        this.vel = frame.velocity.copy();
        this.acc = frame.acc.copy();
        this.size = frame.size.copy();
        this.animManager.load(frame.animManager);
        this.animState = frame.animState;
        this.moving = frame.moving;
    }
}
function drawMapLayer(mapLayer) {
    for (let row = 0; row < mapRows; row++) {
        for (let col = 0; col < mapCols; col++) {
            let frameNumber = mapLayer[row][col] - 1;
            drawPartOfImage(frameNumber, col * tileWidth, row * tileHeight, tileWidth, tileHeight);
        }
    }
}
function drawPartOfImage(frameNumber, x, y, w, h) {
    let row = floor(frameNumber / spritesheetCols);
    let col = frameNumber % spritesheetCols;
    image(spritesheetImage, x, y, w + 1, h + 1, spritesheetTileWidth * col, spritesheetTileHeight * row, spritesheetTileWidth, spritesheetTileHeight);
}
function loadMap() {
    let tilesetInfo = mapJson.tilesets[0];
    spritesheetTileWidth = tilesetInfo.tilewidth;
    spritesheetTileHeight = tilesetInfo.tileheight;
    spritesheetCols = tilesetInfo.columns;
    mapCols = mapJson.width;
    mapRows = mapJson.height;
    let layers = {};
    for (let layer of mapJson.layers) {
        let tileMap = [];
        for (let row = 0; row < mapRows; row++) {
            let newRow = [];
            for (let col = 0; col < mapCols; col++) {
                let index = mapCols * row + col;
                newRow.push(layer.data[index]);
            }
            tileMap.push(newRow);
        }
        layers[layer.name] = tileMap;
    }
    return layers;
}
function isTileCollidable(rowOnMap, colOnMap) {
    var _a;
    if (rowOnMap < 0 || rowOnMap > mapRows - 1 || colOnMap < 0 || colOnMap > mapCols - 1)
        return false;
    let tileNumberOnSpritesheet = mainLayer[rowOnMap][colOnMap] - 1;
    let tileInfo = mapJson.tilesets[0].tiles[tileNumberOnSpritesheet];
    return (_a = tileInfo) === null || _a === void 0 ? void 0 : _a.properties.find((elem) => elem.name == 'collideable').value;
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
        this.pos = createVector((width * 1) / 5, height);
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
        this.runSpeed = shiftKeyPressed ? 12 : 6;
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
                if (isTileCollidable(tileY, tileX)) {
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
                                    this.vel.x /= 4;
                            }
                        }
                        else {
                            this.pos.y = (tileY + 1) * tileHeight + 1;
                            this.vel.y = 0;
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
        this.pos = frame.position.copy();
        this.vel = frame.velocity.copy();
        this.acc = frame.acc.copy();
        this.size = frame.size.copy();
        this.animManager.load(frame.animManager);
        this.animState = frame.animState;
        this.moving = frame.moving;
        this.direction = frame.direction;
    }
}
const spritesheetPath = './assets/tileMap/tileset.png';
const mapPath = './assets/tileMap/tileMap.json';
const cloudPath = './assets/background/clouds.png';
const farGroundsPath = './assets/background/far-grounds.png';
const skyPath = './assets/background/sky.png';
const seaPath = './assets/background/sea.png';
const braidIdleImagePath = './assets/animations/braidIdle/spritesheet.png';
const braidIdleInfoPath = './assets/animations/braidIdle/spritesheet.json';
const braidRunImagePath = './assets/animations/braidRun/spritesheet.png';
const braidRunInfoPath = './assets/animations/braidRun/spritesheet.json';
const braidJumpImagePath = './assets/animations/braidJump/spritesheet.png';
const braidJumpInfoPath = './assets/animations/braidJump/spritesheet.json';
const braidFallImagePath = './assets/animations/braidFall/spritesheet.png';
const braidFallInfoPath = './assets/animations/braidFall/spritesheet.json';
const monsterWalkImagePath = './assets/animations/monsterWalk/spritesheet.png';
const monsterWalkInfoPath = './assets/animations/monsterWalk/spritesheet.json';
const monsterFallImagePath = './assets/animations/monsterFall/spritesheet.png';
const monsterFallInfoPath = './assets/animations/monsterFall/spritesheet.json';
const monsterRiseImagePath = './assets/animations/monsterRise/spritesheet.png';
const monsterRiseInfoPath = './assets/animations/monsterRise/spritesheet.json';
const monsterTransitionImagePath = './assets/animations/monsterTransition/spritesheet.png';
const monsterTransitionInfoPath = './assets/animations/monsterTransition/spritesheet.json';
const monsterDieImagePath = './assets/animations/monsterDie/spritesheet.png';
const monsterDieInfoPath = './assets/animations/monsterDie/spritesheet.json';
let braidIdleImage;
let braidIdleInfo;
let braidRunImage;
let braidRunInfo;
let braidJumpImage;
let braidJumpInfo;
let braidFallImage;
let braidFallInfo;
let monsterWalkImage;
let monsterWalkInfo;
let monsterFallImage;
let monsterFallInfo;
let monsterRiseImage;
let monsterRiseInfo;
let monsterTransitionImage;
let monsterTransitionInfo;
let monsterDieImage;
let monsterDieInfo;
let spritesheetImage;
let cloudImage;
let farGroundsImage;
let skyImage;
let seaImage;
let mapRows;
let mapCols;
let spritesheetTileWidth;
let spritesheetTileHeight;
let spritesheetCols;
let mapJson;
let tileWidth = 40;
let tileHeight = 40;
function preload() {
    spritesheetImage = loadImage(spritesheetPath);
    mapJson = loadJSON(mapPath);
    cloudImage = loadImage(cloudPath);
    farGroundsImage = loadImage(farGroundsPath);
    skyImage = loadImage(skyPath);
    seaImage = loadImage(seaPath);
    braidIdleImage = loadImage(braidIdleImagePath);
    braidIdleInfo = loadJSON(braidIdleInfoPath);
    braidRunImage = loadImage(braidRunImagePath);
    braidRunInfo = loadJSON(braidRunInfoPath);
    braidJumpImage = loadImage(braidJumpImagePath);
    braidJumpInfo = loadJSON(braidJumpInfoPath);
    braidFallImage = loadImage(braidFallImagePath);
    braidFallInfo = loadJSON(braidFallInfoPath);
    monsterWalkImage = loadImage(monsterWalkImagePath);
    monsterWalkInfo = loadJSON(monsterWalkInfoPath);
    monsterFallImage = loadImage(monsterFallImagePath);
    monsterFallInfo = loadJSON(monsterFallInfoPath);
    monsterRiseImage = loadImage(monsterRiseImagePath);
    monsterRiseInfo = loadJSON(monsterRiseInfoPath);
    monsterTransitionImage = loadImage(monsterTransitionImagePath);
    monsterTransitionInfo = loadJSON(monsterTransitionInfoPath);
    monsterDieImage = loadImage(monsterDieImagePath);
    monsterDieInfo = loadJSON(monsterDieInfoPath);
}
let newAnimationManager;
let player;
let monsterAnimationManager;
let monster;
let cameraPos;
let gameStates = [];
let isRewinding = false;
let mapLayers;
let mainLayer;
let foregroundLayer;
let backgroundLayer;
let state = null;
let shiftKeyPressed = false;
function setup() {
    createCanvas(1000, 700);
    frameRate(60);
    mapLayers = loadMap();
    mainLayer = mapLayers['mainLayer'];
    backgroundLayer = mapLayers['backgroundLayer'];
    foregroundLayer = mapLayers['foregroundLayer'];
    initAnimations();
    player = new Player(newAnimationManager);
    monster = new Enemy(monsterAnimationManager);
    cameraPos = createVector(width / 2 - player.pos.x, height / 2 - player.pos.y);
}
function draw() {
    background(235);
    drawBackground();
    cameraPos.lerp(createVector(-player.pos.x + width / 2 - (width / 10) * (player.animManager.isFlipped ? -1 : 1.5), height / 8 - player.pos.y + height / 2), 0.05);
    push();
    translate(cameraPos);
    drawMapLayer(backgroundLayer);
    drawMapLayer(mainLayer);
    player.update(mainLayer);
    player.draw();
    monster.update(mainLayer);
    monster.draw();
    checkCollisionBetweenCharacters();
    drawMapLayer(foregroundLayer);
    if (monster.animState == enemyState.Death)
        monster.draw();
    pop();
    rewindingFacilities();
}
function initAnimations() {
    newAnimationManager = new AnimationManager();
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
    monsterAnimationManager = new AnimationManager();
    monsterAnimationManager.addAnimation('walk', monsterWalkInfo, monsterWalkImage);
    monsterAnimationManager.addAnimation('fall', monsterFallInfo, monsterFallImage);
    monsterAnimationManager.addAnimation('rise', monsterRiseInfo, monsterRiseImage);
    monsterAnimationManager.addAnimation('transition', monsterTransitionInfo, monsterTransitionImage);
    monsterAnimationManager.addAnimation('death', monsterDieInfo, monsterDieImage);
    monsterAnimationManager.setAnimationType('rise', AnimationType.SINGULAR);
    monsterAnimationManager.setAnimationType('transition', AnimationType.SINGULAR);
    monsterAnimationManager.animations['rise'].callback = () => {
        monster.animManager.setCurrentAnimation('transition');
        monster.animManager.resetAnimation('transition');
        monster.animManager.resetAnimation('rise');
    };
    monsterAnimationManager.animations['transition'].callback = () => {
        monster.animManager.setCurrentAnimation('fall');
        monster.animManager.resetAnimation('fall');
        monster.animState = enemyState.Falling;
    };
}
function checkCollisionBetweenCharacters() {
    let checkCollision = (player, monster) => {
        let offsetX = 30;
        let offsetY = 10;
        let pX = player.pos.x + offsetX;
        let pY = player.pos.y - offsetY;
        let sX = player.size.x - 2 * offsetX;
        let sY = player.size.y - offsetY;
        return pX + sX > monster.pos.x &&
            pY + sY > monster.pos.y &&
            pX < monster.pos.x + monster.size.x &&
            pY < monster.pos.y + monster.size.y;
    };
    if (checkCollision(player, monster)) {
        if (player.vel.y > 0 && player.animState == playerState.Falling && monster.animState != enemyState.Death) {
            monster.animState = enemyState.Death;
            monster.vel.x = 5 * (player.vel.x > 0 ? 1 : -1);
            monster.vel.y = -10;
            player.jump();
        }
        else if (player.vel.x != 0 && monster.animState != enemyState.Rising && shiftKeyPressed) {
            let playerCenter = p5.Vector.add(player.pos, p5.Vector.mult(player.size, 0.5));
            let monsterCenter = p5.Vector.add(monster.pos, p5.Vector.mult(monster.size, 0.5));
            let vecFromMtoP = p5.Vector.sub(monsterCenter, playerCenter).normalize();
            let pushVel = map(abs(player.vel.x), 0, player.runSpeed, 1, 30);
            if (abs(vecFromMtoP.y) < 0.1) {
                monster.vel.add(vecFromMtoP.add(createVector(0, -0.5)).mult(pushVel));
            }
            else {
                monster.vel.add(vecFromMtoP.mult(pushVel));
            }
            monster.animState = enemyState.Rising;
            monster.isBouncing = true;
            monster.bouncedTimes = 3;
        }
    }
}
function rewindingFacilities() {
    isRewinding = false;
    if (frameCount % 1 == 0 && keyIsPressed && key == ' ') {
        let lastFrame = gameStates.pop();
        if (lastFrame != undefined) {
            isRewinding = true;
            player.loadFrame(lastFrame.player);
            monster.loadFrame(lastFrame.monster);
        }
    }
    if (frameCount % 2 == 0 && !isRewinding) {
        gameStates.push({ player: player.saveFrame(), monster: monster.saveFrame() });
    }
    if (isRewinding) {
        let transparencyLvl = min(map(gameStates.length, 0, 60, 0, 100), 100);
        background(0, transparencyLvl);
        noStroke();
        fill(220, transparencyLvl);
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
        image(skyImage, i * skyImage.width, 0, skyImage.width, (height * 2) / 3);
    }
    let seaHeight = height - seaImage.height;
    for (let i = 0; i < ceil(width / seaImage.width); i++) {
        image(seaImage, i * seaImage.width, seaHeight, seaImage.width, seaImage.height);
    }
    for (let i = 0; i < ceil(width / cloudImage.width); i++) {
        let cloudHeight = seaHeight - cloudImage.height;
        image(cloudImage, i * cloudImage.width, cloudHeight);
    }
    let fargroundHeight = (farGroundsImage.height * width) / farGroundsImage.width;
    image(farGroundsImage, 0, height - fargroundHeight, width, fargroundHeight);
}
function keyPressed(e) {
    player.keyPressed(e);
    if (key == 'q') {
        state = player.saveFrame();
        print(state.animManager);
    }
    else if (key == 'w') {
        player.loadFrame(state);
        print(state.animManager);
    }
    if (keyCode == SHIFT) {
        shiftKeyPressed = true;
    }
}
function keyReleased(e) {
    player.keyReleased(e);
    if (keyCode == SHIFT) {
        shiftKeyPressed = false;
    }
}
function mousePressed() { }
function mod(x, n) {
    return (x % n + n) % n;
}
;
//# sourceMappingURL=build.js.map