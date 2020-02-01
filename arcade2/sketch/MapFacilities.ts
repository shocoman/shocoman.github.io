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

function loadMap(): { [key: string]: number[][] } {
    let tilesetInfo = mapJson.tilesets[0];
    spritesheetTileWidth = tilesetInfo.tilewidth;
    spritesheetTileHeight = tilesetInfo.tileheight;
    spritesheetCols = tilesetInfo.columns;

    mapCols = mapJson.width;
    mapRows = mapJson.height;

    let layers: { [key: string]: number[][] } = {};
    for (let layer of mapJson.layers) {
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

function isTileCollidable(rowOnMap: number, colOnMap: number) {
    if (rowOnMap < 0 || rowOnMap > mapRows - 1 || colOnMap < 0 || colOnMap > mapCols - 1) return false;
    let tileNumberOnSpritesheet = mainLayer[rowOnMap][colOnMap] - 1;
    let tileInfo = mapJson.tilesets[0].tiles[tileNumberOnSpritesheet];

    return tileInfo?.properties.find((elem: any) => elem.name == 'collideable').value;
}
