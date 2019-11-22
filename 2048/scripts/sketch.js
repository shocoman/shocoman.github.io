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
}

function drawGrid() {
	fill(187, 173, 160);
	rect(0, 0, width, height, 10);

	for (let row = 0; row < gridRows; row++) {
		for (let col = 0; col < gridCols; col++) {
			let size = createVector(width / gridCols, height / gridRows);
			let pos = createVector(col * size.x + size.x * 0.1, row * size.y + size.y * 0.1);

			noStroke();
			fill(205, 193, 180);
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
	constructor(r, c, num, lvl) {
		this.gridPos = createVector(r, c);
		this.size = createVector(width / gridCols, height / gridRows);
		this.pos = createVector(c * this.size.x, r * this.size.y);

		this.oldPos = this.pos.copy();

		this.number = num;

		this.newPos = this.pos.copy();
		this.newNum = this.number;
		this.lerpStep = 1;
		this.moving = false;

		this.lvl = lvl;
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
		if (this.lvl < 1){
			this.lvl += 0.15;
		} else {
			this.lvl = 1;
		}

		let [backgroundColor, textColor] = this.getCellColor(this.number);

		fill(backgroundColor);
		let size = createVector(width / gridCols, height / gridRows);
		let pos = createVector(this.pos.x + size.x * 0.5, this.pos.y + size.y * 0.5);

		rectMode(CENTER);
		rect(pos.x, pos.y, size.x * 0.8 * this.lvl, size.y * 0.8 * this.lvl, 3);
		rectMode(CORNER);

		fill(textColor);
		textSize(size.y * 0.8 / 2 * this.lvl);
		textAlign(CENTER, CENTER);
		textFont(fontBold);
		text(this.number, this.pos.x + this.size.x / 2, this.pos.y + size.y * 0.8 / 2);
	}

	getCellColor(num){
		switch (num) {
			case 2: return ["#eee4da", "#776e65"];
			case 4: return ["#ede0c8", "#776e65"];
			case 8: return ["#f2b179", "#f9f6f2"];
			case 16: return ["#f59563", "#f9f6f2"];
			case 32: return ["#f67c5f", "#f9f6f2"];
			case 64: return ["#f65e3b", "#f9f6f2"];
			case 128:
				default: return ["#edcf72", "#f9f6f2"];
		}
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

	if (moveDir !== '' && canMove === true) {
		canMove = false;

		moveCells(moveDir);

		setTimeout(() => {
			placeRandomCell();
			canMove = true;
		}, 300);
	}
}

function placeRandomCell() {
	let score = 0;
	let end = true;

	for (let row = 0; row < gridRows; row++) {
		for (let col = 0; col < gridCols; col++) {
			if (gameGrid[row][col] === 0) {
				end = false;
			} else {
				score += gameGrid[row][col];
			}
		}
	}
	if (end == true) {
		noCanvas();
		output.html('Game Over! Score: ' + score);
		return;
	}

	while (true) {
		let r = floor(random() * gridRows);
		let c = floor(random() * gridCols);

		if (gameGrid[r][c] === 0) {
			addCell(r, c, random() < 0.8 ? 2 : 4);
			break;
		}
	}

	//showGrid();
}
