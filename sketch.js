const mod = (x, n) => (x % n + n) % n;
let r0 = -20
let r = -30;

let tiles = [];
let table_cols = 100;
let table_rows = 100;

let table = create_table(table_cols, table_rows);
let next_table = create_table(table_cols, table_rows);

function isCellInsideCircle(j, i) {
	let thingy = Math.sqrt((j - table_cols / 2) ** 2 + (i - table_rows / 2) ** 2);
	let ret = Math.abs(r0) < thingy && thingy < Math.abs(r);
	return r > 0 ? ret : !ret;
}


function create_table(rows, cols) {
	let table = []

	for (let j = 0; j < rows; j++) {
		let row = []
		for (let i = 0; i < cols; i++) {
			row.push(' ');
		}
		table.push(row);
	}

	return table;
}

function draw_table(table) {
	for (let j = 0; j < table_rows; j++) {
		for (let i = 0; i < table_cols; i++) {
			let cell_width = width / table_cols;
			let cell_height = height / table_rows;

			stroke(color(200, 50, 0));
			if (table[i][j] == ' ') {
				// do nothing?
			} else if (table[i][j] == '*') {
				fill(color(200, 50, 0));
				rect(i * cell_width, j * cell_height, cell_width, cell_width);
			}
		}
	}
}



function count_neighbours(table, row, col) {
	let n = 0;

	if (table[mod(row + 1, table_rows)][col] == '*')
		n += 1;
	if (table[mod(row + 1, table_rows)][mod(col + 1, table_cols)] == '*')
		n += 1;
	if (table[row][mod(col + 1, table_cols)] == '*')
		n += 1;
	if (table[mod(row - 1, table_rows)][mod(col + 1, table_cols)] == '*')
		n += 1;
	if (table[mod(row - 1, table_rows)][col] == '*')
		n += 1;
	if (table[mod(row - 1, table_rows)][mod(col - 1, table_cols)] == '*')
		n += 1;
	if (table[row][mod(col - 1, table_cols)] == '*')
		n += 1;
	if (table[mod(row + 1, table_rows)][mod(col - 1, table_cols)] == '*')
		n += 1;

	return n;
}


function random_cells() {
	let cells = table_rows * table_cols * 0.1;

	while (cells > 0) {
		let x = int(random(table_cols));
		let y = int(random(table_rows));

		if (isCellInsideCircle(x, y)) continue;
		if (table[x][y] != '*') {
			table[x][y] = '*';
		}
		cells -= 1;
	}

}


function next_turn() {
	for (let j = 0; j < table_rows; j++) {
		for (let i = 0; i < table_cols; i++) {

			let neighbours = count_neighbours(table, j, i);

			if (isCellInsideCircle(j, i)) continue;

			if (neighbours < 2)
				table[j][i] = ' ';
			else if (neighbours > 3)
				table[j][i] = ' ';
			else if (neighbours == 3)
				table[j][i] = '*';
			else if (table[j][i] == '*' && neighbours == 2)
				table[j][i] = '*';
			else
				table[j][i] = ' ';
		}
	}
}


function setup() {
	createCanvas(windowWidth, windowHeight);

	random_cells();
}


function draw() {
	background(255);

	draw_table(table);

	if (frameCount % 2 == 0)
		next_turn();
}


function mousePressed() {
	table = create_table(table_cols, table_rows);
	random_cells();
}