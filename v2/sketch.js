const mod = (x, n) => (x % n + n) % n;
let life;
let hamster;


let paused;
let pause_btn, stop_btn, clear_btn, launch_btn;
let launch_power_slider;
let frame_rate_slider;

function setup() {
  frameRate(60);
  createCanvas(1000, 600);

  life = new GameOfLife();
  life.init();


  hamster = new Hamster();

  createElement('br');
  launch_btn = createButton('Launch');
  launch_btn.mousePressed(function(e) {
    if (!hamster.is_jumper && !hamster.is_shooter && hamster.pos.y > height)
      hamster.shoot();
  });

  paused = false;
  pause_btn = createButton('Pause');
  pause_btn.mousePressed(life.pause);

  stop_btn = createButton('Stop and Restore');
  stop_btn.mousePressed(life.stop);
  life.stop();

  clear_btn = createButton('Clear');
  clear_btn.mousePressed(life.clear_field_state);

  createElement('br');
  launch_power_slider = createSlider(0, 100, 10);
  createElement('label', ' <= Spawning coefficient (0-100%)');

  createElement('br');
  frame_rate_slider = createSlider(1, 20, 5);
  createElement('label', ' <= Speed');
}



function draw() {
  background(130);

  life.draw();

  if (!(frameCount % ceil(1 / frame_rate_slider.value() * 20)) && !paused) {
    life.make_turn();
  }

  if (!paused && JSON.stringify(life.field) == JSON.stringify(life.next_field) &&
    !hamster.is_jumper &&
    !hamster.is_shooter && hamster.pos.y > height) {

    hamster.is_jumper = true;

  }



  hamster.update(life);
  hamster.draw();


}


class Hamster {
  constructor() {
    this.img = loadImage('https://shocoman.github.io/v2/chibi.png');

    this.pos = createVector(0, 500);
    this.vel = createVector(0, 0);
    this.gravity = createVector(0, 0.1);

    this.is_shooter = false;
    this.is_jumper = false;

    this.rotation_speed = 0.07;
  }

  update(life) {

    this.pos.add(this.vel);
    this.vel.add(this.gravity);

    if (this.vel.y > 1 && this.is_shooter) {
      let cells = life.spawn_cells();

      for (let i = 0; i < cells.length; i++) {
        stroke(random(0, 255), random(0, 255), random(0, 255));
        line(width + this.pos.x, height + this.pos.y,
          cells[i][0] * life.cell_width, cells[i][1] * life.cell_height);

      }

      this.is_shooter = false;
    }

    if (this.is_jumper) {
      this.shoot();
    }

  }

  draw() {
    imageMode(CENTER);
    translate(width + this.pos.x, height + this.pos.y);
    rotate(frameCount * this.rotation_speed);

    let size = map(this.vel.y, -13, 5, 0.2, 5);
    image(this.img, 0, 0, width / 4 / size * height / width, height / 4 / size);
  }

  shoot() {
    this.is_jumper = false;
    this.is_shooter = true;

    this.pos.set(random(-width, 0), height / 2);
    let launch_power = createVector(this.pos.x + width / 2, this.pos.y + height);
    launch_power.normalize();
    launch_power.mult(-13);
    this.vel = launch_power;

    this.rotation_speed = map(launch_power.x, -10, 10, -0.1, 0.1) * 5;
  }


}


class GameOfLife {

  constructor() {

    this.field = [];
    this.next_field = [];
    this.another_field = [];
    this.save_field = [];

    this.width = width;
    this.height = height;

    this.cell_width = 10;
    this.cell_height = 10;

    this.cells_x = this.width / this.cell_width;
    this.cells_y = this.height / this.cell_height;

    this.grid = true;
  }


  init() {
    for (let i = 0; i < this.cells_x; i++) {
      this.field[i] = [];
      this.next_field[i] = [];
      this.another_field[i] = [];
      this.save_field[i] = [];
      for (let j = 0; j < this.cells_y; j++) {
        this.field[i][j] = 0;
        this.next_field[i][j] = 0;
        this.another_field[i][j] = 0;
        this.save_field[i][j] = 0;
      }
    }
  }


  draw() {
    noStroke();
    for (let i = 0; i < this.cells_x; i++) {
      for (let j = 0; j < this.cells_y; j++) {
        if (this.field[i][j] == 1)
          rect(i * this.cell_width, j * this.cell_height, this.cell_width, this.cell_height);
      }
    }


    stroke(80);
    if (!this.grid) {
      for (let i = 0; i < this.cells_x; i++) {
        line(i * this.cell_width, 0, i * this.cell_width, height);
      }

      for (let j = 0; j < this.cells_y; j++) {
        line(0, j * this.cell_height, width, j * this.cell_height);
      }
    }
  }


  spawn_cells() {
    let number = this.cells_x * this.cells_y * launch_power_slider.value() / 100;

    let cells = []
    while (number > 0) {
      let x = int(random(this.cells_x));
      let y = int(random(this.cells_y));

      this.field[x][y] = 1;
      cells.push([x, y]);

      number -= 1;
    }

    return cells;
  }


  count_neighbours(x, y) {
    let n = 0;

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        n += this.field[mod(x + i, this.cells_x)][mod(y + j, this.cells_y)];
      }
    }
    n -= this.field[x][y];

    return n;
  }


  make_turn() {
    for (let x = 0; x < this.cells_x; x++) {
      for (let y = 0; y < this.cells_y; y++) {

        let neighbours = this.count_neighbours(x, y);

        if ((this.field[x][y] == 1) && (neighbours < 2))
          this.next_field[x][y] = 0;
        else if ((this.field[x][y] == 1) && (neighbours > 3))
          this.next_field[x][y] = 0;
        else if ((this.field[x][y] == 0) && (neighbours == 3))
          this.next_field[x][y] = 1;
        else
          this.next_field[x][y] = this.field[x][y];

      }
    }

    let temp = this.field;
    this.field = this.next_field;
    this.next_field = this.another_field;
    this.another_field = temp;

  }


  pause() {
    paused = !paused;
    pause_btn.html(paused ? 'Play' : 'Pause');
    stop_btn.html(paused ? 'Save and Play' : 'Stop and Restore');
    life.grid = !paused;
  }


  stop() {
    life.pause();
    stop_btn.html(paused ? 'Save and Play' : 'Stop and Restore');
    if (paused) {
      life.load_field_state();
    } else {
      life.save_field_state();
    }
  }

  clear_field_state() {
    for (let i = 0; i < life.cells_x; i++) {
      for (let j = 0; j < life.cells_y; j++) {
        life.field[i][j] = 0;
      }
    }
  }

  save_field_state() {
    for (let i = 0; i < this.cells_x; i++) {
      for (let j = 0; j < this.cells_y; j++) {
        this.save_field[i][j] = this.field[i][j];
      }
    }
  }

  load_field_state() {
    for (let i = 0; i < this.cells_x; i++) {
      for (let j = 0; j < this.cells_y; j++) {
        this.field[i][j] = this.save_field[i][j];
      }
    }
  }


}


function mouseDragged() {
  let x = int(map(mouseX, 0, width, 0, life.cells_x));
  let y = int(map(mouseY, 0, height, 0, life.cells_y));

  if (0 > mouseX || mouseX > width || 0 > mouseY || mouseY > height) return;

  print(x, y);

  if (life.field[x][y] == 0) {
    life.field[x][y] = 1;
  }
}

function doubleClicked() {
  let x = int(map(mouseX, 0, width, 0, life.cells_x));
  let y = int(map(mouseY, 0, height, 0, life.cells_y));

  if (0 > mouseX || mouseX > width || 0 > mouseY || mouseY > height) return;

  if (life.field[x][y] == 0) {
    life.field[x][y] = 1;
  } else {
    life.field[x][y] = 0;
  }
}


function keyPressed(e) {
  if (e.code == 'Space' && !hamster.is_jumper &&
    !hamster.is_shooter && hamster.pos.y > height) {
    hamster.shoot();
  }
}