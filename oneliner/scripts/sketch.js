let rows = 55;
let cols = 55;
let board, cellWidth, cellHeight;
let initialRow;

let countFunctionInput;
let countFunctionString;

let doDraw = false;

function setup() {
	createCanvas(600, 600);
	countFunctionInput = createElement('textarea', 
`if (sumOfNeighbours == 0) {
	ret = 0;
} else if (sumOfNeighbours == 1) {
	ret = 1;
} else if (sumOfNeighbours == 2) {
	ret = 2;
} else {
	ret = 0;
}`
	
	);
	countFunctionInput.size(500,300);
	countFunctionString = countFunctionInput.value();
	countFunctionInput.input(()=>{ countFunctionString = countFunctionInput.value() });

	initialRow = new Array(cols).fill(0);
}

function draw() {
	background(220);
	strokeWeight(0);

	drawInitialRow(10);

	if (doDraw) {
		drawBoard();
	}
}


function drawInitialRow(){
	cellWidth = width/cols;
	cellHeight = height/rows;
	for (let i = 0; i < cols; i++){

		if (initialRow[i] == 0) fill(200);
		if (initialRow[i] >= 1) fill(20 * initialRow[i]);

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


function makeChoice(sumOfNeighbours) {
	ret = 0;

	// if (sumOfNeighbours == 0) {
	// 	ret = 0;
	// } else if (sumOfNeighbours == 1) {
	// 	ret = 1;
	// } else if (sumOfNeighbours == 2) {
	// 	ret = 2;
	// } else {
	// 	ret = 0;
	// }

	eval(countFunctionString);

	return ret
}


function sumOfNeighbours(row, rowWidth, i) {
	let sum = 0;

	if (i > 0) sum += row[i - 1];
	sum += row[i];
	if (i < rowWidth - 1) sum += row[i + 1];

	return sum;
}


function generateBoard(initialRow) {

	let maxRows = Math.max(10, rows);

	let rowWidth = initialRow.length;
	let board = [initialRow];

	for (let row = 0; row < maxRows; row++) {

		let nextRow = new Array(rowWidth);
		let currentRow = board.slice(-1)[0];

		for (let i = 0; i < rowWidth; i++) {
			sum = sumOfNeighbours(currentRow, rowWidth, i);
			nextRow[i] = makeChoice(sum);
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

	if (cellRow == 0 && cellCol >= 0 && cellCol < cols) {

		initialRow[cellCol] = initialRow[cellCol] == 1 ? 0 : 1;
	}


	board = generateBoard(initialRow);
	cellWidth = width / cols;
	cellHeight = height / rows;


	doDraw = true;
}