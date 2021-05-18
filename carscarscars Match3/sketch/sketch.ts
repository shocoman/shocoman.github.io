const charactersImagePath = './assets/characters/spritesheet.png';
const charactersInfoPath =  './assets/characters/spritesheet.json';

const backgroundImagePath = './assets/ui/bg.png';
const scoreTextFontPath = './assets/font/HVD_Comic_Serif_Pro.otf';

let charactersImage: p5.Image
let charactersJSON: any;
let backgroundImage: p5.Image;

let scoreTextFont: p5.Font;


function preload() {
    charactersImage = loadImage(charactersImagePath);
    charactersJSON = loadJSON(charactersInfoPath);
    backgroundImage = loadImage(backgroundImagePath);

    scoreTextFont = loadFont(scoreTextFontPath);
}


let score = 0;
let grid: Grid;
let slowFalling = false;

function setup() {
    let minDim = min(windowWidth, windowHeight);
    createCanvas(minDim, minDim);

    let padX = 160;
    let padY = 0;
    grid = new Grid(padX, 0, width - 2*padX, height - 60);

    textFont(scoreTextFont);
}


function draw() {
    background(backgroundImage);


    // scale(0.9);
    // translate(0, height*0.2);

    grid.update();
    grid.draw();

    drawScore()
}


function drawScore() {
    textSize(30);
    textAlign(LEFT, BOTTOM);
    stroke(0);
    line(0, height - 50, width, height - 50);
    let formattedScore = new Intl.NumberFormat().format(score);
    text(`Score: ${formattedScore}`, 5, height);
}



let pressedTile: any;
let releasedTile: any;

function mousePressed() {
    pressedTile = grid.mouseCoordsToGrid();
}

function mouseReleased() {
    releasedTile = grid.mouseCoordsToGrid();;

    if (pressedTile && releasedTile)
        grid.swapTwoTiles(pressedTile.row, pressedTile.col, releasedTile.row, releasedTile.col);
}

function keyPressed() {
    if (key === 'z')
        slowFalling = !slowFalling;
}
