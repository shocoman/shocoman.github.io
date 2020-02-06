class Grid {
    constructor(startX, startY, w, h) {
        this.moveReady = false;
        this.startX = startX;
        this.startY = startY;
        this.width = w;
        this.height = h;
        this.rows = 8;
        this.cols = 8;
        this.isSwappingTime = false;
        this.initRotation();
        this.initGrid(startX, startY, w, h);
    }
    initRotation() {
        this.startRotateAngle = PI;
        this.rotateOffset = 0;
        this.rotateAcc = 0.0000;
        this.rotateSpeed = 0;
        this.rotateClockwise = false;
    }
    initGrid(startX, startY, w, h) {
        this.tileWidth = w / this.cols;
        this.tileHeight = h / this.rows;
        let tiles = [];
        for (let row = 0; row < this.rows; row++) {
            let tilesRow = [];
            for (let col = 0; col < this.cols; col++) {
                let x = startX + col * this.tileWidth;
                let y = startY + row * this.tileHeight - 10 * height;
                let tile = new Tile(x, y, this.tileWidth, this.tileHeight);
                let destination = createVector(startX + col * this.tileWidth, startY + row * this.tileHeight);
                tile.moveTo(destination);
                tilesRow.push(tile);
            }
            tiles.push(tilesRow);
        }
        this.tiles = tiles;
    }
    swapTwoTiles(row1, col1, row2, col2) {
        let dRow = abs(row1 - row2);
        let dCol = abs(col1 - col2);
        if (dRow + dCol != 1)
            return;
        let tile1 = this.tiles[row1][col1];
        let tile2 = this.tiles[row2][col2];
        let oldPos = tile1.pos.copy();
        tile1.moveTo(tile2.pos.copy());
        tile2.moveTo(oldPos);
        let tmp = this.tiles[row1][col1];
        this.tiles[row1][col1] = this.tiles[row2][col2];
        this.tiles[row2][col2] = tmp;
        this.isSwappingTime = true;
    }
    update() {
        let anyMoves = false;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                anyMoves = anyMoves || this.tiles[row][col].moving;
            }
        }
        if (anyMoves) {
            this.moveReady = true;
        }
        if (!anyMoves) {
            let tilesToRemove = this.findThreeInRow();
            if (this.isSwappingTime && tilesToRemove.length == 0) {
                this.swapTwoTiles(pressedTile.row, pressedTile.col, releasedTile.row, releasedTile.col);
            }
            this.isSwappingTime = false;
            let offset = slowFalling ? this.rows - 1 : 0;
            for (let row = 0; row < this.rows; row += 1) {
                for (let col = 0; col < this.cols; col++) {
                    if (this.tiles[abs(offset - row)][col].isDead) {
                        this.removeTile(abs(offset - row), col);
                    }
                }
            }
        }
        this.updateTilesRotation();
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.tiles[row][col].update();
            }
        }
    }
    updateTilesRotation() {
        if (this.rotateOffset >= this.startRotateAngle) {
            this.rotateSpeed += this.rotateAcc;
        }
        else {
            this.rotateSpeed -= this.rotateAcc;
        }
        this.rotateOffset -= this.rotateSpeed;
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
                        if (this.moveReady)
                            score += (Object.keys(tilesToRemove).length - 1) * (Math.pow(10, sameTilesCounter));
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
                        if (this.moveReady)
                            score += (Object.keys(tilesToRemove).length - 1) * (Math.pow(10, sameTilesCounter));
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
        this.moveReady = false;
        return tilesToRemove;
    }
    draw() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let angle = this.startRotateAngle - this.rotateOffset;
                this.tiles[row][col].draw(angle);
            }
        }
    }
    mouseCoordsToGrid() {
        let r = floor((mouseY - this.startY) / this.tileHeight);
        let c = floor((mouseX - this.startX) / this.tileWidth);
        return { row: r, col: c };
    }
    removeTile(row, col) {
        if (this.tiles[row][col].moving) {
            return;
        }
        for (let i = row; i > 0; i--) {
            let currentTile = this.tiles[i][col];
            let upperTile = this.tiles[i - 1][col];
            if (currentTile.moving) {
                upperTile.moveTo(p5.Vector.add(currentTile.endPoint, createVector(0, -currentTile.size.y)));
            }
            else {
                upperTile.moveTo(currentTile.pos.copy());
            }
            this.tiles[i][col] = upperTile;
        }
        let aboveScreenPos = createVector(this.startX + col * this.tileWidth, this.startY - 3 * this.tileHeight);
        let nextPos = createVector(col * this.tileWidth + this.startX, 0 + this.startY);
        this.tiles[0][col] = new Tile(aboveScreenPos.x, aboveScreenPos.y, this.tileWidth, this.tileHeight);
        this.tiles[0][col].moveTo(nextPos);
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
        let paddingPercent = 0;
        this.padding = createVector(-0.2 * w, paddingPercent * h);
        this.init();
    }
    init() {
        this.type = floor(random(tileType.length));
        this.endPoint = this.pos;
        this.moving = false;
        this.shouldBeRemoved = false;
        this.isDying = false;
        this.isDead = false;
        this.minimizingSpeed = 3;
    }
    moveTo(endPoint) {
        this.moving = true;
        this.endPoint = endPoint;
    }
    update() {
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
    draw(rotationAngle) {
        let frame = charactersJSON.frames[tileType[this.type].toLowerCase()].frame;
        let x = this.pos.x + this.padding.x;
        let y = this.pos.y + this.padding.y;
        let w = this.size.x - 2 * this.padding.x;
        let h = this.size.y - 2 * this.padding.y;
        push();
        translate(x + w / 2, y + h / 2);
        if (this.isDying)
            rotationAngle += this.padding.x / 12;
        rotate(rotationAngle);
        translate(-(x + w / 2), -(y + h / 2));
        image(charactersImage, x, y, max(w, 1), max(h, 1), frame.x, frame.y, frame.w, frame.h);
        pop();
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
let slowFalling = false;
function setup() {
    let minDim = min(windowWidth, windowHeight);
    createCanvas(minDim, minDim);
    let padX = 160;
    let padY = 0;
    grid = new Grid(padX, 0, width - 2 * padX, height - 60);
    textFont(scoreTextFont);
}
function draw() {
    background(backgroundImage);
    grid.update();
    grid.draw();
    drawScore();
}
function drawScore() {
    textSize(30);
    textAlign(LEFT, BOTTOM);
    stroke(0);
    line(0, height - 50, width, height - 50);
    let formattedScore = new Intl.NumberFormat().format(score);
    text(`Score: ${formattedScore}`, 5, height);
}
let pressedTile;
let releasedTile;
function mousePressed() {
    pressedTile = grid.mouseCoordsToGrid();
}
function mouseReleased() {
    releasedTile = grid.mouseCoordsToGrid();
    ;
    if (pressedTile && releasedTile)
        grid.swapTwoTiles(pressedTile.row, pressedTile.col, releasedTile.row, releasedTile.col);
}
function keyPressed() {
    if (key === 'z')
        slowFalling = !slowFalling;
}
//# sourceMappingURL=build.js.map