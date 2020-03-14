var Colors;
(function (Colors) {
    Colors[Colors["white"] = 0] = "white";
    Colors[Colors["red"] = 1] = "red";
    Colors[Colors["green"] = 2] = "green";
    Colors[Colors["blue"] = 3] = "blue";
})(Colors || (Colors = {}));
class Cell {
    constructor(x, y, r) {
        this.pos = createVector(x, y);
        this.r = r;
        this.active = false;
        this.color = Colors.white;
    }
    setColor() {
        if (this.color == Colors.white) {
            fill(240);
        }
        else if (this.color == Colors.red) {
            fill(200, 0, 0);
        }
        else if (this.color == Colors.green) {
            fill(0, 200, 0);
        }
        else if (this.color == Colors.blue) {
            fill(0, 0, 200);
        }
    }
    draw() {
        let numOfSides = 6;
        let angleFrom = PI / 6;
        let angleTo = 2 * PI + angleFrom;
        let angleStep = (angleTo - angleFrom) / numOfSides;
        push();
        if (this.active) {
            fill(0, 200, 0);
            this.active = false;
        }
        else {
            this.setColor();
        }
        beginShape();
        for (let angle = angleFrom; angle < angleTo; angle += angleStep) {
            let dx = this.r * cos(angle);
            let dy = this.r * sin(angle);
            vertex(this.pos.x + dx, this.pos.y + dy);
        }
        endShape(CLOSE);
        pop();
    }
}
let mod = function (x, n) { return (x % n + n) % n; };
let walkerAngle = 0;
let cols = 18;
let rows = 22;
let r = 20;
let cells = [];
let activeRow = rows / 2 - 1;
let activeCol = cols / 2 - 1;
let activeColor;
function setup() {
    frameRate(60);
    createCanvas(900, 900);
}
function draw() {
    background(220);
    strokeWeight(0);
    translate(width * 1.5 / 3, 0);
    rotate(PI / 4);
    initGrid(r, r, r);
    goFordward();
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let cell = cells[row][col];
            if (row == mod(activeRow, rows) && col == mod(activeCol, cols)) {
                cell.active = true;
                if (cell.color == Colors.white) {
                    cell.color = Colors.green;
                }
                else if (cell.color == Colors.green) {
                    cell.color = Colors.red;
                }
                else if (cell.color == Colors.red) {
                    cell.color = Colors.blue;
                }
                else if (cell.color == Colors.blue) {
                    cell.color = Colors.white;
                }
                activeColor = cell.color;
            }
            cell.draw();
        }
    }
}
function initGrid(x, y, r) {
    let dx = r * sqrt(3);
    let dy = r * sqrt(1.8);
    for (let row = 0; row < rows; row++) {
        let newColumnArray = [];
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
        if (activeColor == Colors.white) {
            walkerAngle = mod(walkerAngle - 60, 360);
        }
        else {
            walkerAngle = mod(walkerAngle + 60, 360);
        }
        if (walkerAngle == 240) {
            if (activeRow % 2 != 0) {
                activeCol -= 1;
            }
            activeRow -= 1;
        }
        else if (walkerAngle == 180) {
            activeCol -= 1;
        }
        else if (walkerAngle == 120) {
            if (activeRow % 2 != 0) {
                activeCol -= 1;
            }
            activeRow += 1;
        }
        else if (walkerAngle == 0) {
            activeCol += 1;
        }
        else if (walkerAngle == 300) {
            if (activeRow % 2 == 0) {
                activeCol += 1;
            }
            activeRow -= 1;
        }
        else if (walkerAngle == 60) {
            if (activeRow % 2 == 0) {
                activeCol += 1;
            }
            activeRow += 1;
        }
    }
}
function keyPressed() {
    goFordward();
}
//# sourceMappingURL=build.js.map