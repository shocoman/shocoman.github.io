let mod = function (x: number, n: number) { return (x % n + n) % n; };

let activeRow = 3;
let activeCol = 3;
let activeColor: Colors;

let walkerAngle = 0;
let cols = 22;
let rows = 22;
let r = 20;
let cells: Array<Array<Cell>> = [];


function setup() {
    frameRate(60);
    createCanvas(800, 800);
}

function draw() {
    background(220);


    initGrid(r, r, r);

    goFordward();


    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {

            let cell = cells[row][col];

            if (row == mod(activeRow, rows) && col == mod(activeCol, cols)) {
                cell.active = true;
                if (cell.color == Colors.white) {
                    cell.color = Colors.green;
                } else if (cell.color == Colors.green) {
                    cell.color = Colors.red;
                } else if (cell.color == Colors.red) {
                    cell.color = Colors.blue;
                } else if (cell.color == Colors.blue) {
                    cell.color = Colors.white;
                }

                activeColor = cell.color;
            }
            cell.draw();

        }
    }

}



function initGrid(x: number, y: number, r: number) {
    let dx = r * sqrt(3);
    let dy = r * sqrt(2.3);

    for (let row = 0; row < rows; row++) {

        let newColumnArray: Array<Cell> = [];
        for (let col = 0; col < cols; col++) {

            let newCol = x + col * dx;
            let newRow = y + row * dy;
            if (row % 2 == 0) {
                newCol += dx / 2;
            }

            let newCell = new Cell(newCol, newRow, r);

            newColumnArray.push(newCell);
        }

        cells.push(newColumnArray);
    }
}


function goFordward() {

    if (keyCode != DOWN_ARROW) {
        if (activeColor == Colors.blue) {
            walkerAngle = mod(walkerAngle - 60, 360);
        } else if (activeColor == Colors.red) {
            walkerAngle = mod(walkerAngle + 60, 360);
        }

        if (walkerAngle == 240) {
            if (activeRow % 2 != 0) {
                activeCol -= 1;
            }
            activeRow -= 1;
        } else if (walkerAngle == 180) {
            activeCol -= 1;
        } else if (walkerAngle == 120) {
            if (activeRow % 2 != 0) {
                activeCol -= 1;
            }
            activeRow += 1;
        } else if (walkerAngle == 0) {
            activeCol += 1;
        } else if (walkerAngle == 300) {
            if (activeRow % 2 == 0) {
                activeCol += 1;
            }
            activeRow -= 1;
        } else if (walkerAngle == 60) {
            if (activeRow % 2 == 0) {
                activeCol += 1;
            }
            activeRow += 1;
        }

    }

    // redraw();
}


function keyPressed() {
    goFordward();
}

