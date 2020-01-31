const spritesheetPath = "./assets/tileMap/tileset.png";
const mapPath = "./assets/tileMap/tileMap.json";

const cloudPath = "./assets/clouds.png";
const farGroundsPath = "./assets/far-grounds.png";
const skyPath = "./assets/sky.png";
const seaPath = "./assets/sea.png";


const braidIdleImagePath = "./assets/braidIdle/spritesheet.png";
const braidIdleInfoPath = "./assets/braidIdle/spritesheet.json";
const braidRunImagePath = "./assets/braidRun/spritesheet.png";
const braidRunInfoPath = "./assets/braidRun/spritesheet.json";
const braidJumpImagePath = "./assets/braidJump/spritesheet.png";
const braidJumpInfoPath = "./assets/braidJump/spritesheet.json";
const braidFallImagePath = "./assets/braidFall/spritesheet.png";
const braidFallInfoPath = "./assets/braidFall/spritesheet.json";


const monsterWalkImagePath = "./assets/braidFall/spritesheet.png";
const monsterWalkInfoPath = "./assets/braidFall/spritesheet.json";


let braidIdleImage: p5.Image;
let braidIdleInfo: any;
let braidRunImage: p5.Image;
let braidRunInfo: any;
let braidJumpImage: p5.Image;
let braidJumpInfo: any;
let braidFallImage: p5.Image;
let braidFallInfo: any;


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
}


let newAnimationManager: AnimationManager;
let player: Player;

let cameraPos: p5.Vector;

let gameStates: any = [];
let isRewinding = false;


let mapLayers: { [key: string]: number[][]};
let mainLayer: number[][];
let foregroundLayer: number[][];
let backgroundLayer: number[][];


function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(60);

    mapLayers = loadMap();
    mainLayer = mapLayers['mainLayer'];
    backgroundLayer = mapLayers['backgroundLayer'];
    foregroundLayer = mapLayers['foregroundLayer'];
    print(mainLayer);


    newAnimationManager = new AnimationManager();

    newAnimationManager.addAnimation('idle', braidIdleInfo, braidIdleImage);
    newAnimationManager.setHPadding('idle', 18);
    newAnimationManager.addAnimation('fall', braidFallInfo, braidFallImage);
    newAnimationManager.addAnimation('jump', braidJumpInfo, braidJumpImage);
    newAnimationManager.setAnimationType('jump', AnimationType.SINGULAR);
    newAnimationManager.animations['jump'].callback = () => {
        player.animState = playerState.Falling;
    }
    newAnimationManager.addAnimation('run', braidRunInfo, braidRunImage);
    newAnimationManager.setSpeed('run', 2);

    player = new Player(newAnimationManager);

    cameraPos = createVector(width / 2 - player.pos.x, height / 2 - player.pos.y);
}


function draw() {
    background(235);
    drawBackground();

    // move "camera"
    cameraPos.lerp(createVector(-player.pos.x + width / 2 - (width / 10 * (player.animManager.isFlipped ? -1 : 1.5)), height / 8 - player.pos.y + height / 2), 0.05);
    push();
    translate(cameraPos);

    drawMapLayer(backgroundLayer);
    drawMapLayer(mainLayer);

    player.update(mainLayer);
    player.draw();

    drawMapLayer(foregroundLayer);
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
        // draw triangles
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
    // sky
    for (let i = 0; i < ceil(width / skyImage.width); i++) {
        image(skyImage, i * skyImage.width, 0, skyImage.width, height*2/3);
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
    let fargroundHeight = farGroundsImage.height * width / farGroundsImage.width;
    image(farGroundsImage, 0, height - fargroundHeight, width, fargroundHeight);
}


function drawMapLayer(mapLayer: number[][]) {
    for (let row = 0; row < mapRows; row++) {
        for (let col = 0; col < mapCols; col++) {
            let frameNumber = mapLayer[row][col] - 1;
            drawPartOfImage(frameNumber, col * tileWidth, row * tileHeight, tileWidth, tileHeight);
        }
    }
}


function drawPartOfImage(frameNumber: number, x: number, y: number, w: number, h: number) {
    let row = floor(frameNumber / spritesheetCols);
    let col = frameNumber % spritesheetCols;
    image(spritesheetImage, x, y, w + 1, h + 1, spritesheetTileWidth * col, spritesheetTileHeight * row, spritesheetTileWidth, spritesheetTileHeight);
}


function loadMap(): { [key: string]: number[][]} {
    print(mapJson);

    let tilesetInfo = mapJson.tilesets[0];

    spritesheetTileWidth = tilesetInfo.tilewidth;
    spritesheetTileHeight = tilesetInfo.tileheight;
    spritesheetCols = tilesetInfo.columns;

    mapCols = mapJson.width;
    mapRows = mapJson.height;

    let layers: {[key: string]: number[][]} = {};
    for (let layer of mapJson.layers){

        let tileMap: number[][] = [];
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

function isTileCollidable(rowOnMap: number, colOnMap: number){
    if (rowOnMap < 0 || rowOnMap > mapRows-1 || colOnMap < 0 || colOnMap > mapCols-1)
        return false;
    let tileNumberOnSpritesheet = mainLayer[rowOnMap][colOnMap] - 1;
    let tileInfo = mapJson.tilesets[0].tiles[tileNumberOnSpritesheet];

    return tileInfo?.properties.find((elem: any) => elem.name == 'collideable').value;
}


let state: any = null;

function keyPressed(e: KeyboardEvent) {
    player.keyPressed(e);

    if (key == 'q') {
        state = player.saveFrame();
        print(state.animManager);
    } else if (key == 'w') {
        player.loadFrame(state);
        print(state.animManager);
    }
}

function keyReleased(e: KeyboardEvent) {
    player.keyReleased(e);
}


function mousePressed(){

}