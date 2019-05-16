new p5();
const mod = (x, n) => (x % n + n) % n;

function setup() {
  createCanvas(600, 600);
  


}

let tiles = [];
let table_cols = 150;
let table_rows = 150;


create_table = function(rows, cols) {
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

draw_table = function(table) {
  for (let j = 0; j < table_rows; j++) {
    for (let i = 0; i < table_cols; i++) {

      let cell_width = width / table_cols;
      let cell_height = height / table_rows;

      stroke(color(200, 50, 0));
      if (table[i][j] == ' ') {

      } else if (table[i][j] == '*') {
        fill(color(200, 50, 0));
        rect(i * cell_width, j * cell_height, cell_width, cell_width);
      }

    }
  }
}

let table = create_table(table_cols, table_rows);


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

    if (table[x][y] != '*')
      table[x][y] = '*';
    cells -= 1;
  }

}

random_cells();



function next_turn() {

  for (let j = 0; j < table_rows; j++) {
    for (let i = 0; i < table_cols; i++) {
      
      let neighbours = count_neighbours(table, j, i);


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

function draw() {
  background(255);

  draw_table(table);
  next_turn();
}


function mousePressed() {
  

  table = create_table(table_cols, table_rows);
  random_cells();
}