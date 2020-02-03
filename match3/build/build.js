class Grid {
    constructor(startX, startY, w, h) {
        this.firstTile = {};
        this.secondTile = {};
        this.startX = startX;
        this.startY = startY;
        this.width = w;
        this.height = h;
        this.rows = 8;
        this.cols = 8;
        this.swapTime = false;
        this.initGrid(startX, startY, w, h);
    }
    initGrid(startX, startY, w, h) {
        this.tileWidth = w / this.cols;
        this.tileHeight = h / this.rows;
        let tiles = [];
        for (let row = 0; row < this.rows; row++) {
            let tilesRow = [];
            for (let col = 0; col < this.cols; col++) {
                let tile = new Tile(startX + col * this.tileWidth, startY + row * this.tileHeight - 10 * height, this.tileWidth, this.tileHeight);
                let destination = createVector(startX + col * this.tileWidth, startY + row * this.tileHeight);
                tile.setDestination(destination);
                tilesRow.push(tile);
            }
            tiles.push(tilesRow);
        }
        this.tiles = tiles;
    }
    swapTiles(row1, col1, row2, col2) {
        let dRow = abs(row1 - row2);
        let dCol = abs(col1 - col2);
        if (dRow != 1 && dCol != 1 || dRow == 1 && dCol == 1)
            return;
        let tile1 = this.tiles[row1][col1];
        let tile2 = this.tiles[row2][col2];
        let oldPos = tile1.pos.copy();
        tile1.setDestination(tile2.pos.copy());
        tile2.setDestination(oldPos);
        let tmp = this.tiles[row1][col1];
        this.tiles[row1][col1] = this.tiles[row2][col2];
        this.tiles[row2][col2] = tmp;
        this.swapTime = true;
        this.firstTile = { row: row1, col: col1 };
        this.secondTile = { row: row2, col: col2 };
    }
    update() {
        let anyMoves = false;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                anyMoves = anyMoves || this.tiles[row][col].moving;
            }
        }
        if (!anyMoves) {
            let tilesToRemove = this.findThreeInRow();
            if (tilesToRemove.length == 0 && this.swapTime) {
                this.swapTiles(pressedTile.row, pressedTile.col, releasedTile.row, releasedTile.col);
            }
            this.swapTime = false;
            for (let row = this.rows - 1; row >= 0; row--) {
                for (let col = this.cols - 1; col >= 0; col--) {
                    if (this.tiles[row][col].isDead) {
                        this.removeTile(row, col);
                    }
                }
            }
        }
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.tiles[row][col].move();
            }
        }
    }
    findThreeInRow() {
        let tilesToRemove = [];
        for (let row = 0; row < this.rows; row++) {
            let currentType = this.tiles[row][0].type;
            let sameTilesCounter = 0;
            for (let col = 0; col < this.cols; col++) {
                let isLastColumn = col == this.cols - 1;
                let hasSameType = this.tiles[row][col].type == currentType;
                if (hasSameType) {
                    sameTilesCounter += 1;
                }
                if (!hasSameType || isLastColumn) {
                    if (sameTilesCounter >= 3) {
                        for (let counter = 0; counter < sameTilesCounter; counter++) {
                            let colN = col - counter - (isLastColumn && hasSameType ? 0 : 1);
                            tilesToRemove.push({ row: row, col: colN });
                        }
                        score += Math.pow(10, (sameTilesCounter - 2));
                    }
                    sameTilesCounter = 1;
                    currentType = this.tiles[row][col].type;
                }
            }
        }
        for (let col = 0; col < this.cols; col++) {
            let currentType = this.tiles[0][col].type;
            let sameTilesCounter = 0;
            for (let row = 0; row < this.rows; row++) {
                let isLastRow = row == this.rows - 1;
                let hasSameType = this.tiles[row][col].type == currentType;
                if (hasSameType) {
                    sameTilesCounter += 1;
                }
                if (!hasSameType || isLastRow) {
                    if (sameTilesCounter >= 3) {
                        for (let counter = 0; counter < sameTilesCounter; counter++) {
                            let rowN = row - counter - (isLastRow && hasSameType ? 0 : 1);
                            tilesToRemove.push({ row: rowN, col: col });
                        }
                        score += Math.pow(10, (sameTilesCounter - 2));
                    }
                    sameTilesCounter = 1;
                    currentType = this.tiles[row][col].type;
                }
            }
        }
        for (let tile of tilesToRemove) {
            this.tiles[tile.row][tile.col].shouldBeRemoved = true;
            this.tiles[tile.row][tile.col].isDying = true;
        }
        return tilesToRemove;
    }
    draw() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.tiles[row][col].draw();
            }
        }
    }
    checkMouseClick() {
        let row = floor((mouseY - this.startY) / this.tileHeight);
        let col = floor((mouseX - this.startX) / this.tileWidth);
        if (row >= this.rows || col >= this.cols)
            return;
        let tile = this.tiles[row][col];
        this.removeTile(row, col);
    }
    mouseToGrid() {
        let r = floor((mouseY - this.startY) / this.tileHeight);
        let c = floor((mouseX - this.startX) / this.tileWidth);
        return { row: r, col: c };
    }
    removeTile(row, col) {
        if (this.tiles[row][col].moving) {
            return;
        }
        let oldPos = this.tiles[0][col].pos.copy();
        for (let i = row; i > 0; i--) {
            let aboveTile = this.tiles[i - 1][col];
            let currentTile = this.tiles[i][col];
            if (currentTile.moving) {
                aboveTile.setDestination(p5.Vector.add(currentTile.endPoint, createVector(0, -currentTile.size.y)));
            }
            else {
                aboveTile.setDestination(currentTile.pos.copy());
            }
            this.tiles[i][col] = aboveTile;
        }
        oldPos = createVector(col * this.tileWidth + this.startX, -this.tileHeight + this.startY);
        let newPos = createVector(col * this.tileWidth + this.startX, 0 + this.startY);
        this.tiles[0][col] = new Tile(oldPos.x, oldPos.y, this.tileWidth, this.tileHeight);
        this.tiles[0][col].setDestination(newPos);
    }
}
var tileType;
(function (tileType) {
    tileType[tileType["APPLE"] = 0] = "APPLE";
    tileType[tileType["BREAD"] = 1] = "BREAD";
    tileType[tileType["COCONUT"] = 2] = "COCONUT";
    tileType[tileType["LETTUCE"] = 3] = "LETTUCE";
    tileType[tileType["MILK"] = 4] = "MILK";
    tileType[tileType["ORANGE"] = 5] = "ORANGE";
    tileType[tileType["STAR"] = 6] = "STAR";
    tileType[tileType["length"] = 7] = "length";
})(tileType || (tileType = {}));
;
class Tile {
    constructor(x, y, w, h) {
        this.pos = createVector(x, y);
        this.size = createVector(w, h);
        let paddingPercent = 0.05;
        this.padding = createVector(paddingPercent * w, paddingPercent * h);
        this.init();
    }
    init() {
        this.type = floor(random(tileType.length));
        this.selected = false;
        this.endPoint = this.pos;
        this.moving = false;
        this.shouldBeRemoved = false;
        this.isDying = false;
        this.isDead = false;
        this.minimizingSpeed = 3;
    }
    setDestination(endPoint) {
        this.moving = true;
        this.endPoint = endPoint;
    }
    move() {
        if (this.moving) {
            if (this.pos.dist(this.endPoint) < 1) {
                this.pos = this.endPoint.copy();
                this.moving = false;
            }
            p5.Vector.lerp(this.pos, this.endPoint, 0.2, this.pos);
        }
        else if (this.isDying) {
            this.padding.add(this.minimizingSpeed, this.minimizingSpeed);
            if (this.padding.x * 2 >= this.size.x) {
                this.isDead = true;
            }
        }
    }
    draw() {
        let frame = charactersJSON.frames[tileType[this.type].toLowerCase()].frame;
        if (this.selected)
            stroke(255);
        else
            noStroke();
        let x = this.pos.x + this.padding.x;
        let y = this.pos.y + this.padding.y;
        let w = this.size.x - 2 * this.padding.x;
        let h = this.size.y - 2 * this.padding.y;
        image(charactersImage, x, y, w <= 0 ? 1 : w, h <= 0 ? 1 : h, frame.x, frame.y, frame.w, frame.h);
    }
}
const charactersImagePath = './assets/characters/spritesheet.png';
const charactersInfoPath = './assets/characters/spritesheet.json';
const backgroundImagePath = './assets/ui/bg.png';
const scoreTextFontPath = './assets/font/HVD_Comic_Serif_Pro.otf';
let charactersImage;
let charactersJSON;
let backgroundImage;
let scoreTextFont;
function preload() {
    charactersImage = loadImage(charactersImagePath);
    charactersJSON = loadJSON(charactersInfoPath);
    backgroundImage = loadImage(backgroundImagePath);
    scoreTextFont = loadFont(scoreTextFontPath);
}
let score = 0;
let grid;
let showRect = false;
function setup() {
    let minDim = min(windowWidth, windowHeight);
    createCanvas(minDim, minDim);
    grid = new Grid(20, 0, width - 40, height - 60);
    textFont(scoreTextFont);
}
function draw() {
    background(backgroundImage);
    grid.update();
    grid.draw();
    textSize(30);
    textAlign(LEFT, BOTTOM);
    drawScore();
    if (showRect) {
        fill(200);
        rect(100, 100, 400, 400);
    }
}
function drawScore() {
    stroke(0);
    line(0, height - 50, width, height - 50);
    let formattedScore = new Intl.NumberFormat().format(score);
    text(`Score: ${formattedScore}`, 5, height);
}
let pressedTile;
let releasedTile;
function mousePressed() {
    showRect = true;
    if (mouseButton === LEFT) {
        let coords = grid.mouseToGrid();
        pressedTile = coords;
    }
    else if (mouseButton === RIGHT) {
        grid.findThreeInRow();
    }
}
function mouseReleased() {
    if (mouseButton === LEFT) {
        let coords = grid.mouseToGrid();
        releasedTile = coords;
        grid.swapTiles(pressedTile.row, pressedTile.col, releasedTile.row, releasedTile.col);
    }
}
function keyPressed() {
    if (key == ' ')
        grid.findThreeInRow();
}
//# sourceMappingURL=build.js.map