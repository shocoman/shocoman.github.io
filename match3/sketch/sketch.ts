const charactersImagePath = './assets/characters/spritesheet.png';
const charactersInfoPath = './assets/characters/spritesheet.json';

const backgroundImagePath = './assets/ui/bg.png';
const scoreTextFontPath = './assets/font/HVD_Comic_Serif_Pro.otf';

let charactersImage: p5.Image
let charactersJSON: any;
let backgroundImage: p5.Image;

let scoreTextFont: p5.Font;


function preload(){
    charactersImage = loadImage(charactersImagePath);
    charactersJSON = loadJSON(charactersInfoPath);
    backgroundImage = loadImage(backgroundImagePath);

    scoreTextFont = loadFont(scoreTextFontPath);
}



let score = 0;

let grid: Grid;
let showRect = false;
function setup() {
    let minDim = min(windowWidth, windowHeight);
    createCanvas(minDim, minDim);
    
    grid = new Grid(20,0, width-40, height-60);

    textFont(scoreTextFont);
}


function draw() {
    background(backgroundImage);

    // scale(0.2);
    // translate(2*width, 2*height);



    grid.update();
    grid.draw();

    textSize(30);
    textAlign(LEFT, BOTTOM);


    
    drawScore()

    if (showRect) {
        fill(200);
        rect(100,100,400,400);
    }
}

function drawScore(){
    stroke(0);
    line(0, height - 50, width,height - 50);
    let formattedScore = new Intl.NumberFormat().format(score);
    text(`Score: ${formattedScore}`, 5, height);
}



let pressedTile: any;
let releasedTile: any;



function mousePressed() {
    pressedTile = grid.mouseToGrid();

    // if (mouseButton === LEFT) {

    //     pressedTile = grid.mouseToGrid();

    //     // grid.checkMouseClick();
    // } else if (mouseButton === RIGHT) {
    //     grid.findThreeInRow();
    // }
}

function mouseReleased() {
    // showRect = false;    if (mouseButton === LEFT) {
        let coords = grid.mouseToGrid();
        releasedTile = coords;

        grid.swapTiles(pressedTile.row, pressedTile.col, releasedTile.row, releasedTile.col);
        // grid.checkMouseClick();
    }
}

function keyPressed() {
    if (key == ' ')
        grid.findThreeInRow();
}



