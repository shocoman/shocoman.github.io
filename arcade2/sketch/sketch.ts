const spritesheetPath = "./assets/tileset.png";
const mapPath = "./assets/map.txt";
const cloudPath = "./assets/clouds.png";
const farGroundsPath = "./assets/far-grounds.png";
const skyPath = "./assets/sky.png";
const seaPath = "./assets/sea.png";

let spritesheetImage: p5.Image;
let mapArray: number[][];
let cloudImage: p5.Image;
let farGroundsImage: p5.Image;
let skyImage: p5.Image;
let seaImage: p5.Image;

let mapRows: number;
let mapCols: number;

let spritesheetTileWidth = 64;
let spritesheetTileHeight = 64;
let spritesheetRows = 20;
let spritesheetCols = 58;

let mapStrings: string[];
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

let animManager: AnimationManager;

let player: Player;

// let cameraAcc: p5.Vector;
// let cameraVel: p5.Vector;
let cameraPos: p5.Vector;

function setup() {
    createCanvas(800, 600);
    // frameRate(15);

    mapArray = loadMap(mapStrings);

    animManager = new AnimationManager();
    animManager.load('run', './sprites/engineer/run.png', 8, 1, 8, createVector(0, 0), createVector(64, 112));
    animManager.load('idle', './sprites/engineer/idle.png', 9, 1, 9, createVector(0, 0), createVector(64, 112));
    animManager.load('jump', './sprites/engineer/jump.png', 2, 1, 2, createVector(0, 0), createVector(64, 112));

    player = new Player(animManager);



    // cameraAcc = createVector(width / 2 - player.pos.x, height / 2 - player.pos.y);
    // cameraAcc.mult(0.0001);
    // cameraVel = createVector(0, 0);
    cameraPos = createVector(width / 2 - player.pos.x, height / 2 - player.pos.y);
}


function draw() {
    background(220);

    drawBackground();


    // move "camera"
    cameraPos.lerp(createVector(-player.pos.x + width / 2 - (width / 10 * (player.animManager.is_flipped ? -1 : 1.5)), height / 8 - player.pos.y + height / 2), 0.05);
    translate(cameraPos);

    player.update(mapArray);
    player.draw();

    drawMap();

}

function drawBackground() {


    // sky
    for (let i = 0; i < ceil(width / skyImage.width); i++) {
        image(skyImage, i * skyImage.width, 0, skyImage.width, skyImage.height*1.5);
    }

    // sea
    let seaHeight = height - seaImage.height*1;
    for (let i = 0; i < ceil(width / seaImage.width); i++) {
        image(seaImage, i * seaImage.width, seaHeight, seaImage.width*1, seaImage.height * 1);
    }

    // cloud(s)
    for (let i = 0; i < ceil(width / cloudImage.width); i++) {
        let cloudHeight = seaHeight - cloudImage.height;
        image(cloudImage, i * cloudImage.width, cloudHeight);
    }

    // far ground
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

function drawPartOfImage(frameNumber: number, x: number, y: number, w: number, h: number) {
    // let frameNumber = 213 - 1;
    let r = floor(frameNumber / spritesheetCols);
    let c = frameNumber % spritesheetCols;

    image(spritesheetImage, x, y, w + 1, h + 1, spritesheetTileWidth * c, spritesheetTileHeight * r, spritesheetTileWidth, spritesheetTileHeight);
}


function loadMap(mapStrings: string[]): number[][] {
    mapRows = mapStrings.length;
    let tileMap: number[][] = [];

    for (let str of mapStrings) {
        let rowOfStrings = str.split('\t');

        let rowOfInts = rowOfStrings.map(Number);

        mapCols = rowOfInts.length;

        tileMap.push(rowOfInts);
    }

    return tileMap;
}

function keyPressed(e: KeyboardEvent) {
    player.keyPressed(e);
}

function keyReleased(e: KeyboardEvent) {
    player.keyReleased(e);
}