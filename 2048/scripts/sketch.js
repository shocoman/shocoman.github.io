let gameGrid;
let gridRows = 4;
let gridCols = 4;

let output;

let cells;

let canMove = true;

function preload() {
	fontBold = loadFont('ClearSans-Bold.ttf');
}

function setup() {
	createCanvas(600, 600);
	frameRate(60);

	output = createElement('text');

	initGrid(gridRows, gridCols);
}

function addCell(r, c, num) {
	gameGrid[r][c] = num;
	cells.push(new Cell(r, c, num, 0));
}

function draw() {
	background(255);

	drawGrid();

	cells.forEach(cell => {
		cell.move();
		cell.update();
		cell.draw();
	});
}

function initGrid(rows, cols) {
	gridRows = rows;
	gridCols = cols;

	gameGrid = Array(rows)
		.fill()
		.map(_ => Array(cols).fill(0));

	cells = [];

	placeRandomCell();
	placeRandomCell();

	// addCell(1, 1, 2);
	// addCell(1, 3, 2);
}

function drawGrid() {
	let gridBackground = '#bbada0';
	let emptyCellBackground = '#cdc1b4';

	fill(gridBackground);
	rect(0, 0, width, height, 10);

	for (let row = 0; row < gridRows; row++) {
		for (let col = 0; col < gridCols; col++) {
			let size = createVector(width / gridCols, height / gridRows);
			let pos = createVector(col * size.x + size.x * 0.1, row * size.y + size.y * 0.1);

			noStroke();
			fill(emptyCellBackground);
			rect(pos.x, pos.y, size.x * 0.8, size.y * 0.8, 3);
		}
	}
}

function showGrid() {
	let outStr = '<br>';
	for (let row = 0; row < gridRows; row++) {
		for (let col = 0; col < gridCols; col++) {
			outStr += gameGrid[row][col] + ' ';
		}
		outStr += '<br>';
	}

	output.html(outStr);
}

function moveCell(r, c, dir, checkMovability) {
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

	if (checkMovability) {
		return gameGrid[r][c] !== 0 ? steps : 0;
	}

	if (steps !== 0 && gameGrid[r][c] !== 0) {
		let newCell = new Cell(r, c, gameGrid[r][c], 1);

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

function moveCells(dir, checkMovability) {
	let stepsMade = 0;

	if (dir === 'right') {
		for (let col = gridCols - 1; col >= 0; col--) {
			for (let row = 0; row < gridRows; row++) {
				stepsMade += moveCell(row, col, dir, checkMovability);
			}
		}
	} else if (dir === 'left') {
		for (let col = 0; col < gridCols; col++) {
			for (let row = 0; row < gridRows; row++) {
				stepsMade += moveCell(row, col, dir, checkMovability);
			}
		}
	} else if (dir === 'up') {
		for (let row = 0; row < gridRows; row++) {
			for (let col = 0; col < gridCols; col++) {
				stepsMade += moveCell(row, col, dir, checkMovability);
			}
		}
	} else if (dir === 'down') {
		for (let row = gridRows - 1; row >= 0; row--) {
			for (let col = 0; col < gridCols; col++) {
				stepsMade += moveCell(row, col, dir, checkMovability);
			}
		}
	}

	return stepsMade == 0;
}

class Cell {
	constructor(r, c, num, lvl) {
		this.gridPos = createVector(r, c);
		this.size = createVector(width / gridCols, height / gridRows);
		this.originalSize = this.size.copy();

		this.pos = createVector(c * this.size.x, r * this.size.y);
		this.oldPos = this.pos.copy();

		this.num = num;

		// for moving animation
		this.newPos = this.pos.copy();
		this.newNum = this.num;
		this.lerpStep = 1;
		this.movingFinished = false;

		// for showing animation
		this.lvl = lvl;

		// for merge animation
		this.popAnim = false;
		this.sizeVel = 18;
		this.sizeAcc = 4;
	}

	setNewPos(r, c, newNum) {
		this.gridPos.x = r;
		this.gridPos.y = c;
		this.newPos.x = c * this.size.x;
		this.newPos.y = r * this.size.y;
		this.newNum = newNum;

		this.lerpStep = 0;
	}

	move() {
		if (this.lerpStep < 1) {
			this.pos = p5.Vector.lerp(this.oldPos, this.newPos, this.lerpStep);
			this.lerpStep += 0.1;
		} else {
			this.movingFinished = true;
		}

		if (this.movingFinished == true) {
			this.movingFinished = false;

			// start merge "pop" animation
			if (this.newNum === this.num * 2) {
				this.popAnim = true;
			}

			this.num = this.newNum;
			this.oldPos = this.pos.copy();
		}
	}

	update() {
		// update showing animation
		if (this.lvl < 1) {
			this.lvl += 0.15;
		} else {
			this.lvl = 1;
		}

		// update merge animation
		if (this.popAnim || this.size.x > this.originalSize.x) {
			this.sizeVel -= this.sizeAcc;
			this.size.add(this.sizeVel, this.sizeVel);
			this.popAnim = false;
		} else {
			this.size = this.originalSize.copy();
		}
	}

	draw() {
		let [backgroundColor, textColor] = this.getCellColor(this.num);

		let pos = createVector(this.pos.x + this.originalSize.x * 0.5, this.pos.y + this.originalSize.y * 0.5);

		fill(backgroundColor);
		rectMode(CENTER);
		rect(pos.x, pos.y, this.size.x * 0.8 * this.lvl, this.size.y * 0.8 * this.lvl, 3);
		rectMode(CORNER);

		fill(textColor);
		textSize(((this.originalSize.y * 0.8) / 2) * this.lvl - (1 / 1024) * this.num * 8);
		textAlign(CENTER, CENTER);
		textFont(fontBold);
		text(this.num, this.pos.x + this.originalSize.x / 2, this.pos.y + (this.originalSize.y * 0.8) / 2);
	}

	getCellColor(num) {
		switch (num) {
			case 2:
				return ['#eee4da', '#776e65'];
			case 4:
				return ['#ede0c8', '#776e65'];
			case 8:
				return ['#f2b179', '#f9f6f2'];
			case 16:
				return ['#ff9563', '#f9f6f2'];
			case 32:
				return ['#f67c5f', '#f9f6f2'];
			case 64:
				return ['#f65e3b', '#f9f6f2'];
			case 128:
				return ['#f63e3f', '#f9f6f2'];
			case 256:
				return ['#f60e3b', '#f9f6f2'];
			case 512:
				return ['#f59e3b', '#f9f6f2'];
			case 1024:
				return ['#fe6e00', '#f9f6f2'];
			case 2048:
			default:
				return ['#fe6fa0', '#f9f6f2'];
		}
	}
}

function checkGameOver() {
	let score = 0;

	if (moveCells('left', true) && moveCells('right', true) && moveCells('down', true) && moveCells('up', true)) {
		gameGrid.forEach(arr => arr.forEach(el => (score += el)));
		output.html('<br> Game Over! <br> Score: ' + score);

		return true;
	} else {
		return false;
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

	if (moveDir !== '' && canMove === true && !moveCells(moveDir, true)) {
		canMove = false;

		moveCells(moveDir, false);

		setTimeout(() => {
			placeRandomCell();
			checkGameOver();
			canMove = true;
		}, 200);
	}
}

function placeRandomCell() {
	while (true) {
		let r = floor(random() * gridRows);
		let c = floor(random() * gridCols);

		if (gameGrid[r][c] === 0) {
			addCell(r, c, random() < 0.8 ? 2 : 4);
			break;
		}
	}

	// showGrid();
}
