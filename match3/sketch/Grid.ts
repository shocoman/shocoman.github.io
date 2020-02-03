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

    isSwappingTime: boolean;

    startRotateAngle: number;
    rotateOffset: number;
    rotateSpeed: number;
    rotateAcc: number;
    rotateClockwise: boolean;
    moveReady: boolean = false;

    constructor(startX: number, startY: number, w: number, h: number) {
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
        this.startRotateAngle = PI / 12;
        this.rotateOffset = 0;
        this.rotateAcc = 0.0001;
        this.rotateSpeed = 0;
        this.rotateClockwise = false;
    }

    initGrid(startX: number, startY: number, w: number, h: number) {
        this.tileWidth = w / this.cols;
        this.tileHeight = h / this.rows;

        let tiles: Tile[][] = [];
        for (let row = 0; row < this.rows; row++) {

            let tilesRow: Tile[] = [];
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

    swapTwoTiles(row1: number, col1: number, row2: number, col2: number) {
        let dRow = abs(row1 - row2);
        let dCol = abs(col1 - col2);
        if (dRow + dCol != 1) return; // tiles are not adjacent

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

        // nothing moves
        if (!anyMoves) {
            let tilesToRemove = this.findThreeInRow();

            if (this.isSwappingTime && tilesToRemove.length == 0) {
                // swap tiles back
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
        } else {
            this.rotateSpeed -= this.rotateAcc;
        }
        this.rotateOffset -= this.rotateSpeed;
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

                        if (this.moveReady)
                            score += (Object.keys(tilesToRemove).length - 1) * (10 ** sameTilesCounter);
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
                        if (this.moveReady)
                            score += (Object.keys(tilesToRemove).length - 1) * (10 ** sameTilesCounter);
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

    removeTile(row: number, col: number) {
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
