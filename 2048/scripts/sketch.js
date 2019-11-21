let gameGrid;
let gridRows = 4;
let gridCols = 4;

let output;

let cells;

let removeFirst = 0;

function setup() {
	createCanvas(400, 400);
	frameRate(60);

	initGrid(gridRows, gridCols);

	output = createElement('text', 'NONE');

	cells = [];
	
	placeRandomCell();
	placeRandomCell();
	placeRandomCell();
}

function addCell(r, c, num) {
	gameGrid[r][c] = num;
	cells.push(new Cell(r, c, num));
}

function draw() {
	background(220);

	
	cells.forEach(cell => {
		cell.move();
		cell.draw();
	});

	if (removeFirst !== 0) {
		cells.splice(0, removeFirst);
		removeFirst = 0;
	}
}

function initGrid(rows, cols) {
	gameGrid = Array(rows)
		.fill()
		.map(_ => Array(cols).fill(0));
}

function showGrid() {
	let outStr = '';
	for (let row = 0; row < gridRows; row++) {
		for (let col = 0; col < gridCols; col++) {
			outStr += gameGrid[row][col] + ' ';
		}
		outStr += '<br>';
	}

	output.html(outStr);
}

function moveCell(r, c, dir) {
	let currentNum = gameGrid[r][c];
	let steps = 0;
	if (dir === 'right') {
		while (c + steps < gridCols - 1) {
			if (gameGrid[r][c + (steps + 1)] === currentNum) {
				steps += 1;
				break;
			} else if (gameGrid[r][c + (steps + 1)] !== 0) {
				break;
			}
			steps += 1;
		}
	} else if (dir === 'left') {
		while (c + steps > 0) {
			if (gameGrid[r][c + (steps - 1)] === currentNum) {
				steps -= 1;
				break;
			} else if (gameGrid[r][c + (steps - 1)] !== 0) {
				break;
			}
			steps -= 1;
		}
	} else if (dir === 'up') {
		while (r + steps > 0) {
			if (gameGrid[r + (steps - 1)][c] === currentNum) {
				steps -= 1;
				break;
			} else if (gameGrid[r + (steps - 1)][c] !== 0) {
				break;
			}
			steps -= 1;
		}
	} else if (dir === 'down') {
		while (r + steps < gridRows - 1) {
			if (gameGrid[r + (steps + 1)][c] === currentNum) {
				steps += 1;
				break;
			} else if (gameGrid[r + (steps + 1)][c] !== 0) {
				break;
			}
			steps += 1;
		}
	}

	if (steps !== 0 && gameGrid[r][c] !== 0) {
		let newCell = new Cell(r, c, gameGrid[r][c]);

		if (dir === 'right' || dir === 'left') {
			gameGrid[r][c + steps] += gameGrid[r][c];
			newCell.setNewPos(r, c + steps, gameGrid[r][c + steps]);
		} else {
			gameGrid[r + steps][c] += gameGrid[r][c];
			newCell.setNewPos(r + steps, c, gameGrid[r + steps][c]);
		}

		cells.push(newCell);
		for (let i = cells.length - 1; i >= 0; i--) {
			if (cells[i].gridPos.x === r && cells[i].gridPos.y === c) {
				cells.splice(i, 1);
			}
		}

		gameGrid[r][c] = 0;
	}
}

function moveCells(dir) {
	if (dir === 'right') {
		for (let col = gridCols - 1; col >= 0; col--) {
			for (let row = 0; row < gridRows; row++) {
				moveCell(row, col, dir);
			}
		}
	} else if (dir === 'left') {
		for (let col = 0; col < gridCols; col++) {
			for (let row = 0; row < gridRows; row++) {
				moveCell(row, col, dir);
			}
		}
	} else if (dir === 'up') {
		for (let row = 0; row < gridRows; row++) {
			for (let col = 0; col < gridCols; col++) {
				moveCell(row, col, dir);
			}
		}
	} else if (dir === 'down') {
		for (let row = gridRows - 1; row >= 0; row--) {
			for (let col = 0; col < gridCols; col++) {
				moveCell(row, col, dir);
			}
		}
	}
}

class Cell {
	constructor(r, c, num) {
		this.gridPos = createVector(r, c);
		this.size = createVector(width / gridCols, height / gridRows);
		this.pos = createVector(c * this.size.x, r * this.size.y);

		this.oldPos = this.pos.copy();

		this.number = num;

		this.newPos = this.pos.copy();
		this.newNum = this.number;
		this.lerpStep = 1;
		this.moving = false;
	}

	setNewPos(r, c, newNum) {
		this.gridPos.x = r;
		this.gridPos.y = c;
		this.newPos.x = c * this.size.x;
		this.newPos.y = r * this.size.y;
		this.newNum = newNum;

		this.lerpStep = 0;
		//this.moving = true;
	}

	move() {
		if (this.lerpStep < 1) {
			this.pos = p5.Vector.lerp(this.oldPos, this.newPos, this.lerpStep);
			this.lerpStep += 0.1;
		} else {
			this.moving = true;
		}

		if (this.moving == true) {
			this.moving = false;
			this.number = this.newNum;
			this.oldPos = this.pos.copy();
		}
	}

	draw() {
		ellipse(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, this.size.x * 0.8);

		let size = this.size.y / 5;
		textSize(size);
		text(this.number, this.pos.x + this.size.x / 2 - 5 * this.number.toString().length, this.pos.y + this.size.y / 2);
	}
}

function keyPressed() {
	let moveDir = '';
	if (keyIsDown(RIGHT_ARROW)) {
		moveDir = 'right';
	} else if (keyIsDown(LEFT_ARROW)) {
		moveDir = 'left';
	} else if (keyIsDown(UP_ARROW)) {
		moveDir = 'up';
	} else if (keyIsDown(DOWN_ARROW)) {
		moveDir = 'down';
	}

	if (moveDir !== '') {
		moveCells(moveDir);
		placeRandomCell();
	}
}

function placeRandomCell() {
	let sum = 0;
	let end = true;
	for (let col = gridCols - 1; col >= 0; col--) {
		for (let row = 0; row < gridRows; row++) {
			if (gameGrid[row][col] === 0) {
				end = false;
			} else {
				sum += gameGrid[row][col];
			}
		}
	}
	if (end == true){
		noCanvas();
		output.html("Game Over! Score: " + sum);
		return;
	} else {
		showGrid();
	}

	while (true) {
		let r = floor(random() * gridRows);
		let c = floor(random() * gridCols);

		if (gameGrid[r][c] === 0) {
			addCell(r, c, 2);
			break;
		}
	}
}
