let rows = 120;
let cols = 120;
let board, cellWidth, cellHeight;
let initialRow;

let doDraw = false;

function setup() {
	createCanvas(800, 800);
	frameRate(15);
	
	document.getElementById("genBtn").onclick = initBoard;
	document.getElementById("patForm").onclick = ()=> {board = generateBoard(initialRow);};

	initBoard();
}

function initBoard() {
	let rowsField = document.getElementsByName("rowsField")[0].value;
	let colsField = document.getElementsByName("colsField")[0].value;
	rows = parseInt(rowsField);
	cols = parseInt(colsField);

	cellWidth = width / cols;
	cellHeight = height / rows;

	initialRow = new Array(cols).fill(0);
	board = generateBoard(initialRow);
}

function draw() {
	background(220);
	strokeWeight(0);

	drawInitialRow(10);

	if (doDraw) {
		drawBoard();
	}
}


function drawInitialRow() {
	cellWidth = width / cols;
	cellHeight = height / rows;
	for (let i = 0; i < cols; i++) {

		if (initialRow[i] == 0) fill(200);
		if (initialRow[i] > 0) fill(20 * initialRow[i]);

		rect(cellWidth * i, 0, cellWidth, cellHeight);
	}
}

function drawBoard() {
	for (let row = 0; row < rows; row++) {
		if (board[row] != undefined)
			for (let col = 0; col < cols; col++) {

				if (board[row][col] == 0) fill(200);
				if (board[row][col] > 0) fill(20 * board[row][col]);

				rect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
			}
	}
}


function makeChoice(neighbours) {
	let patternCheckboxes = document.getElementsByName("pattern");

	return patternCheckboxes[neighbours].checked ? 1 : 0;
}


function checkNeighbours(row, rowWidth, i) {
	let leftN = 0, curr = 0, rightN = 0;

	if (i > 0) leftN = row[i - 1];
	curr = row[i];
	if (i < rowWidth - 1) rightN = row[i + 1];

	return leftN * 4 + curr * 2 + rightN;
}


function generateBoard(initialRow) {

	let maxRows = Math.max(10, rows);

	let rowWidth = initialRow.length;
	let board = [initialRow];

	for (let row = 0; row < maxRows; row++) {

		let nextRow = new Array(rowWidth);
		let currentRow = board.slice(-1)[0];

		for (let i = 0; i < rowWidth; i++) {
			neighbours = checkNeighbours(currentRow, rowWidth, i);
			nextRow[i] = makeChoice(neighbours);
		}

		board.push(nextRow);
	}

	return board;
}


function keyPressed() {

	if (key == " ") {


	}

}


function mousePressed() {
	let cellRow = floor(mouseY / cellHeight);
	let cellCol = floor(mouseX / cellWidth);

	if (cellRow >= 0 && cellCol >= 0 && cellCol < cols) {

		initialRow[cellCol] = initialRow[cellCol] == 1 ? 0 : 1;
	}


	board = generateBoard(initialRow);
	cellWidth = width / cols;
	cellHeight = height / rows;


	doDraw = true;
}