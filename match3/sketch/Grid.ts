class Grid {
    startX: number;
    startY: number;
    width: number;
    height: number;
    tiles: Tile[][];

    rows: number;
    cols: number;
    tileWidth: number;
    tileHeight: number;

    swapTime: boolean;
    firstTile: {} = {};
    secondTile: {} = {};

    constructor(startX: number, startY: number, w: number, h: number) {
        this.startX = startX;
        this.startY = startY;
        this.width = w;
        this.height = h;
        this.rows = 8;
        this.cols = 8;
        this.swapTime = false;
        this.initGrid(startX, startY, w, h);
    }

    initGrid(startX: number, startY: number, w: number, h: number) {
        this.tileWidth = w / this.cols;
        this.tileHeight = h / this.rows;
        let tiles: Tile[][] = [];
        for (let row = 0; row < this.rows; row++) {
            let tilesRow: Tile[] = [];
            for (let col = 0; col < this.cols; col++) {
                let tile = new Tile(startX + col * this.tileWidth, startY + row * this.tileHeight - 10*height, this.tileWidth, this.tileHeight);
                let destination = createVector(startX + col * this.tileWidth, startY + row * this.tileHeight);
                tile.setDestination(destination);
                
                tilesRow.push(tile);
            }
            tiles.push(tilesRow);
        }
        this.tiles = tiles;
    }

    swapTiles(row1: number, col1: number, row2: number, col2: number) {
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
        // nothing moves
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
        let tilesToRemove: {
            [key: string]: number;
        }[] = [];

        // horizontal check
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

                        score += 10 ** (sameTilesCounter - 2);
                    }
                    sameTilesCounter = 1;
                    currentType = this.tiles[row][col].type;
                }
            }
        }

        // horizontal check
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

                        score += 10 ** (sameTilesCounter - 2);
                    }
                    sameTilesCounter = 1;
                    currentType = this.tiles[row][col].type;
                }
            }
        }
        // print(tilesToRemove);
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

    removeTile(row: number, col: number) {
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
