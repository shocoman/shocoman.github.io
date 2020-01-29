var img;
var textGraphics;
function preload() {
    img = loadImage("./chibi.png");
}
var mod = function (x, n) { return (x % n + n) % n; };
var table;
var next_table;
var pixelDens = 16;
var textGraphicsWidth = 40;
var textGraphicsHeight = 10;
var tiles = [];
var table_rows = 80;
var table_cols = Math.floor(table_rows * textGraphicsWidth / textGraphicsHeight);
var showText = false;
var cellsInside = true;
var floodThem = false;
var cellColor;
var textField;
function setup() {
    createCanvas(windowWidth, windowHeight);
    cellColor = color(0);
    textGraphics = createGraphics(textGraphicsWidth, textGraphicsHeight);
    textGraphics.pixelDensity(pixelDens);
    textGraphics.textSize(textGraphicsHeight - 2);
    textGraphics.textAlign(LEFT, TOP);
    textGraphics.textFont("Comic Sans MS");
    img.loadPixels();
    textGraphics.background(255);
    textGraphics.image(img, 0, 0, textGraphicsHeight, textGraphicsHeight);
    textGraphics.text("Привет", textGraphicsHeight, 0);
    textGraphics.loadPixels();
    table = create_table(table_rows, table_cols);
    next_table = create_table(table_rows, table_cols);
    random_cells();
    textField = createInput("LOL");
    textField.input(function (e) {
        changeText(textField.value());
    });
}
function draw() {
    background(255);
    if (showText)
        image(textGraphics, 0, 0, width, height);
    if (frameCount % 1 == 0) {
        next_turn();
    }
    draw_table(table);
}
function mousePressed(e) {
    if (mouseButton === LEFT) {
        var row = floor(map(mouseY, 0, height, 0, table_rows));
        var col = floor(map(mouseX, 0, width, 0, table_cols));
        next_table[row][col] = 1;
        next_table[row][col + 1] = 1;
        next_table[row][col + 2] = 1;
        next_table[row + 1][col] = 1;
        next_table[row - 1][col] = 1;

        table[row][col] = 1;
        table[row][col + 1] = 1;
        table[row][col + 2] = 1;
        table[row + 1][col] = 1;
        table[row - 1][col] = 1;
    }
    else if (mouseButton === CENTER) {
        cellsInside = !cellsInside;
        table = create_table(table_rows, table_cols);
        next_table = create_table(table_rows, table_cols);
        random_cells();
        e.preventDefault();
    }
    else if (mouseButton === RIGHT) {
        showText = !showText;
    }
}
function isCellPlaceable(row, col) {
    row = floor(map(row, 0, table_rows, 0, textGraphics.height * pixelDens));
    col = floor(map(col, 0, table_cols, 0, textGraphics.width * pixelDens));
    var pixelNumber = textGraphics.width * pixelDens * row + col;
    var r = textGraphics.pixels[4 * pixelNumber];
    var g = textGraphics.pixels[4 * pixelNumber + 1];
    var b = textGraphics.pixels[4 * pixelNumber + 2];
    var a = textGraphics.pixels[4 * pixelNumber + 3];
    var ret = r + g + b < 250 * 3;
    if (ret) {
        cellColor = color(r, g, b, a);
    }
    return cellsInside ? !ret : ret;
}
function create_table(rows, cols) {
    return Array(rows).fill().map(function () { return new Array(cols).fill(0); });
}
function draw_table(table) {
    var cell_width = width / table_cols;
    var cell_height = height / table_rows;
    for (var row = 0; row < table_rows; row++) {
        for (var col = 0; col < table_cols; col++) {
            isCellPlaceable(row, col);
            stroke(cellColor);
            fill(cellColor);
            if (table[row][col] == 0) {
            }
            else if (table[row][col] == 1) {
                rect(col * cell_width, row * cell_height, cell_width, cell_height);
            }
        }
    }
}
function count_neighbours(table, cellRow, cellCol) {
    var sumOfN = 0;
    for (var row = -1; row <= 1; row++) {
        for (var col = -1; col <= 1; col++) {
            sumOfN += table[mod(cellRow + row, table_rows)][mod(cellCol + col, table_cols)];
        }
    }
    sumOfN -= table[cellRow][cellCol];
    return sumOfN;
}
function random_cells() {
    var cells = table_rows * table_cols * 0.1;
    while (cells > 0) {
        var row = floor(random(table_rows));
        var col = floor(random(table_cols));
        if (isCellPlaceable(row, col))
            continue;
        if (table[row][col] != 1) {
            table[row][col] = 1;
        }
        cells -= 1;
    }
}
function next_turn() {
    for (var row = 0; row < table_rows; row++) {
        for (var col = 0; col < table_cols; col++) {
            var neighbours = count_neighbours(table, row, col);
            if (isCellPlaceable(row, col)) {
                continue;
            }
            if (neighbours < 2)
                next_table[row][col] = 0;
            else if (neighbours > 3)
                next_table[row][col] = floodThem ? 1 : 0;
            else if (neighbours == 3)
                next_table[row][col] = 1;
            else if (table[row][col] == 1 && neighbours == 2)
                next_table[row][col] = 1;
            else
                next_table[row][col] = 1;
        }
    }
    var tmp = table;
    table = next_table;
    next_table = tmp;
}
function keyPressed(e) {
    if (key === ' ') {
        floodThem = !floodThem;
    }
    else if (key == 'r') {
        changeText(key);
    }
}
function changeText(text) {
    textGraphics.background(255);
    textGraphics.image(img, 0, 0, textGraphicsHeight, textGraphicsHeight);
    textGraphics.text(text, textGraphicsHeight, 0);
    textGraphics.loadPixels();
    table = create_table(table_rows, table_cols);
    next_table = create_table(table_rows, table_cols);
    random_cells();
}
//# sourceMappingURL=build.js.map