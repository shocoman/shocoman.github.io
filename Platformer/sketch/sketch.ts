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

let braidIdleImage: p5.Image;
let braidIdleInfo: any;
let braidRunImage: p5.Image;
let braidRunInfo: any;
let braidJumpImage: p5.Image;
let braidJumpInfo: any;
let braidFallImage: p5.Image;
let braidFallInfo: any;

let monsterWalkImage: p5.Image;
let monsterWalkInfo: any;
let monsterFallImage: p5.Image;
let monsterFallInfo: any;
let monsterRiseImage: p5.Image;
let monsterRiseInfo: any;
let monsterTransitionImage: p5.Image;
let monsterTransitionInfo: any;
let monsterDieImage: p5.Image;
let monsterDieInfo: any;

let spritesheetImage: p5.Image;
let cloudImage: p5.Image;
let farGroundsImage: p5.Image;
let skyImage: p5.Image;
let seaImage: p5.Image;

let mapRows: number;
let mapCols: number;

let spritesheetTileWidth: number;
let spritesheetTileHeight: number;
let spritesheetCols: number;

let mapJson: any;

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

let newAnimationManager: AnimationManager;
let player: Player;

let monsterAnimationManager: AnimationManager;
let monster: Enemy;

let cameraPos: p5.Vector;

let gameStates: any = [];
let isRewinding = false;

let mapLayers: { [key: string]: number[][] };
let mainLayer: number[][];
let foregroundLayer: number[][];
let backgroundLayer: number[][];

let state: any = null;
let shiftKeyPressed: boolean = false;

function setup() {
    createCanvas(1000, 700);
    // createCanvas(windowWidth, windowHeight);
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

    // move "camera"
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
    let checkCollision = (player: Player, monster: Enemy) => {

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
        } else if (player.vel.x != 0 && monster.animState != enemyState.Rising && shiftKeyPressed) {

            let playerCenter = p5.Vector.add(player.pos, p5.Vector.mult(player.size, 0.5));
            let monsterCenter = p5.Vector.add(monster.pos, p5.Vector.mult(monster.size, 0.5));

            let vecFromMtoP = p5.Vector.sub(monsterCenter, playerCenter).normalize();
            let pushVel = map(abs(player.vel.x), 0, player.runSpeed, 1, 30);

            if (abs(vecFromMtoP.y) < 0.1) {
                monster.vel.add(vecFromMtoP.add(createVector(0, -0.5)).mult(pushVel));
            } else {
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
        // draw triangles
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
    // sky
    for (let i = 0; i < ceil(width / skyImage.width); i++) {
        image(skyImage, i * skyImage.width, 0, skyImage.width, (height * 2) / 3);
    }

    // sea
    let seaHeight = height - seaImage.height;
    for (let i = 0; i < ceil(width / seaImage.width); i++) {
        image(seaImage, i * seaImage.width, seaHeight, seaImage.width, seaImage.height);
    }

    // cloud(s)
    for (let i = 0; i < ceil(width / cloudImage.width); i++) {
        let cloudHeight = seaHeight - cloudImage.height;
        image(cloudImage, i * cloudImage.width, cloudHeight);
    }

    // far ground
    let fargroundHeight = (farGroundsImage.height * width) / farGroundsImage.width;
    image(farGroundsImage, 0, height - fargroundHeight, width, fargroundHeight);
}




function keyPressed(e: KeyboardEvent) {
    player.keyPressed(e);

    if (key == 'q') {
        state = player.saveFrame();
        print(state.animManager);
    } else if (key == 'w') {
        player.loadFrame(state);
        print(state.animManager);
    }

    if (keyCode == SHIFT) {
        shiftKeyPressed = true;
    }
}

function keyReleased(e: KeyboardEvent) {
    player.keyReleased(e);

    if (keyCode == SHIFT) {
        shiftKeyPressed = false;
    }
}

function mousePressed() { }

function mod(x: number, n: number) {
    return (x % n + n) % n;
};