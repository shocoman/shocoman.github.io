let gameGrid;
let gridRows = 32;
let gridCols = 32;

let startNode;
let goalNode;

function setup() {
	createCanvas(600, 600);

	initLevel(gridRows, gridCols);

	startNode = gameGrid[0][0];
	goalNode = gameGrid[3][3];
}

function draw() {
	background(220);
	noStroke();

	drawLevel();
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
		if (k == 0)
			fill(0,0,255);
		else if (k == result.length-1)
			fill(255,0,0);
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

function keyPressed() {
	let selectedRow = floor((mouseY / height) * gridRows);
	let selectedCol = floor((mouseX / width) * gridCols);

	if (key == 'q') {
		startNode = gameGrid[selectedRow][selectedCol];
	} else if (key == 'w') {
		goalNode = gameGrid[selectedRow][selectedCol];
	}
}

function mouseDragged() {
	let selectedRow = floor((mouseY / height) * gridRows);
	let selectedCol = floor((mouseX / width) * gridCols);

	if (mouseButton === LEFT) gameGrid[selectedRow][selectedCol].traversible = false;
	else if (mouseButton === CENTER) gameGrid[selectedRow][selectedCol].traversible = true;
}
