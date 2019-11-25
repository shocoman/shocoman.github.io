let gameGrid;
let gridRows = 32;
let gridCols = 32;

let startNode;
let goalNode;

let ghost;

function setup() {
	createCanvas(600, 600);

	initLevel(gridRows, gridCols);

	startNode = gameGrid[0][0];
	goalNode = gameGrid[3][3];

	ghost = new Ghost(gridToWorld(13, 6));
}

function draw() {
	background(220);
	noStroke();

	drawLevel();

	ghost.update();
	ghost.draw();
}

function gridToWorld(row, col) {
	return createVector((col * width) / gridCols, (row * height) / gridRows);
}

function worldToGrid(x, y) {
	// row / col
	return createVector(floor(y / (height / gridRows)), floor(x / (width / gridCols)));
}

function drawLevel() {
	let sizeX = width / gridCols;
	let sizeY = height / gridRows;

	for (let row = 0; row < gridRows; row++) {
		for (let col = 0; col < gridCols; col++) {
			fill(200);

			if (!gameGrid[row][col].traversible) {
				fill(0);
			}
			rect(col * sizeX, row * sizeY, sizeX, sizeY);
		}
	}

	let result = AStar(startNode, goalNode);

	for (let k in result) {
		fill(0, 200, 0);
		if (k == 0) fill(0, 0, 255);
		else if (k == result.length - 1) fill(255, 0, 0);
		rect(result[k].pos.y * sizeX, result[k].pos.x * sizeY, sizeX, sizeY);
	}
}

function initLevel(rows, cols) {
	gameGrid = Array(rows)
		.fill()
		.map(_ => Array(cols).fill(0));

	for (let row = 0; row < gridRows; row++) {
		for (let col = 0; col < gridCols; col++) {
			gameGrid[row][col] = new Node(row, col);
		}
	}

	for (let row = 0; row < gridRows; row++) {
		for (let col = 0; col < gridCols; col++) {
			if (row != 0) gameGrid[row][col].neighbours.push(gameGrid[row - 1][col]);

			if (row != gridRows - 1) gameGrid[row][col].neighbours.push(gameGrid[row + 1][col]);

			if (col != 0) gameGrid[row][col].neighbours.push(gameGrid[row][col - 1]);

			if (col != gridCols - 1) gameGrid[row][col].neighbours.push(gameGrid[row][col + 1]);
		}
	}
}

class Node {
	constructor(r, c) {
		this.pos = createVector(r, c);
		this.parent = null;
		this.neighbours = [];
		this.fScore = null;
		this.traversible = true;
	}
}

function AStar(start, goal) {
	function reconstructPath(cameFrom, current) {
		totalPath = [current];
		while (cameFrom.has(current)) {
			current = cameFrom.get(current);
			totalPath.unshift(current);
		}
		return totalPath;
	}

	function getMinFScoreNode(nodeArray, fmap) {
		return nodeArray.reduce((prev, cur) => (fmap.get(prev) < fmap.get(cur) ? prev : cur));
	}

	function hFunction(node) {
		return dist(node.pos.x, node.pos.y, goal.pos.x, goal.pos.y);
	}

	let openSet = [start];

	let cameFrom = new Map();

	let gScore = new Map();
	gameGrid.forEach(r => r.forEach(nd => gScore.set(nd, Infinity)));
	gScore.set(start, 0);

	let fScore = new Map();
	gameGrid.forEach(r => r.forEach(nd => fScore.set(nd, Infinity)));
	fScore.set(start, hFunction(start));

	while (openSet.length != 0) {
		let current = getMinFScoreNode(openSet, fScore);
		if (current === goal) {
			return reconstructPath(cameFrom, current);
		}

		openSet.splice(openSet.indexOf(current), 1);
		for (let nb of current.neighbours) {
			if (!nb.traversible) continue;

			let tentativeGScore = gScore.get(current) + p5.Vector.dist(current.pos, nb.pos);
			if (tentativeGScore < gScore.get(nb)) {
				cameFrom.set(nb, current);
				gScore.set(nb, tentativeGScore);
				fScore.set(nb, gScore.get(nb) + hFunction(nb));
				if (openSet.indexOf(nb) == -1) {
					openSet.push(nb);
				}
			}
		}
	}

	return false;
}

class Ghost {
	constructor(pos) {
		this.pos = pos.copy();
		this.oldPos = this.pos.copy();

		this.path = [];

		// path moving init
		this.movingAmount = 0;
		this.speed = 0.5;
	}

	setPath(newPath) {
		this.path = newPath;
	}

	update() {
		// path moving update
		if (this.path.length > 0) {
			this.movingAmount += this.speed;
			this.pos = p5.Vector.lerp(this.oldPos, this.path[0], this.movingAmount);
		}

		if (this.movingAmount >= 1) {
			this.movingAmount = 0;
			this.path.splice(0, 1);
			this.oldPos = this.pos.copy();
		}
	}

	draw() {
		fill(120, 60, 240);
		rect(this.pos.x, this.pos.y, width / gridCols, height / gridRows);
	}
}

function keyPressed() {
	let selectedRow = floor((mouseY / height) * gridRows);
	let selectedCol = floor((mouseX / width) * gridCols);

	if (key == 'q') {
		startNode = gameGrid[selectedRow][selectedCol];
	} else if (key == 'w') {
		goalNode = gameGrid[selectedRow][selectedCol];
	} else if (key == ' ') {
		let ghostLocation = worldToGrid(ghost.pos.x, ghost.pos.y);
		let ghostNode = gameGrid[ghostLocation.x][ghostLocation.y];
		let goalNode = gameGrid[selectedRow][selectedCol];
		let result = AStar(ghostNode, goalNode);
		
		let path = [];
		for (let k in result) {
			path.push(gridToWorld(result[k].pos.x, result[k].pos.y));
		}
		ghost.setPath(path);
	}
}

function mouseDragged() {
	let selectedRow = floor((mouseY / height) * gridRows);
	let selectedCol = floor((mouseX / width) * gridCols);

	if (mouseButton === LEFT) gameGrid[selectedRow][selectedCol].traversible = false;
	else if (mouseButton === CENTER) gameGrid[selectedRow][selectedCol].traversible = true;
}
