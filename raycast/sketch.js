let tileManager;
let player;
let rays = [];


let drawingRays = [];

let startAngle = 3.14 / 2;

function setup() {
  createCanvas(800, 400);

  tileManager = new TileManager(0, 0, 10, 10);
  tileManager.init();

  player = new Player(width * 2 / 3, height / 2);


  raysInit(rays);
}


function raysInit(rays) {
  for (let i = 0; i < PI / 3; i += PI / 100) {
    rays.push(new Ray(player, tileManager, i + startAngle - PI / 3 / 2));
  }
}

function draw() {
  background(220);

  tileManager.draw();

  player.update();
  player.draw();

  rays.forEach((ray) => ray.draw());
  rays.forEach((ray) => ray.intersects());

  if (rays.every((ray) => ray.stop == true)) {
    drawingRays = rays;
    rays = [];
    raysInit(rays);
  }

  
      for (let i = 0; i < drawingRays.length; i++) {

        push();
        stroke(120, 0, 100);
        strokeWeight(10);
        line(width / 2 + i * 12, height / 2 + 20000 / drawingRays[i].dist,
          width / 2 + i * 12, height / 2 - 20000 / drawingRays[i].dist);
        pop();

      }
    

    if (keyIsDown(LEFT_ARROW)) {
      startAngle -= PI / 256;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      startAngle += PI / 256;
    }

  }


  class Ray {

    constructor(player, tm, rot) {

      this.player = player;
      this.dir = createVector(0, 1);
      this.dir.rotate(rot);

      this.nextPos = this.player.pos;
      this.tileManager = tm;
      this.stop = false;

      this.state = 0;
      this.dist = -1;
    }

    getDistance() {
      return dist(this.nextPos.x, this.nextPos.y, this.player.pos.x, this.player.pos.y);
    }

    intersects() {

      if (this.stop) return;
      if (this.nextPos.x > width || this.nextPos.x < 0 ||
        this.nextPos.y < 0 || this.nextPos.y > height) {
        this.stop = true;
        this.dist = this.getDistance();
        return;
      }

      let pntRow = floor(this.nextPos.y / tileManager.tileSize);
      let pntCol = floor(this.nextPos.x / tileManager.tileSize);


      if (typeof tileManager.tiles[pntRow] === 'undefined') return;
      if (typeof tileManager.tiles[pntRow][pntCol] === 'undefined') return;
      for (let row = 0; row < tileManager.rows; row++) {
        for (let col = 0; col < tileManager.cols; col++) {
          if (tileManager.tiles[pntRow][pntCol] == 2) {

            this.stop = true;
            this.dist = this.getDistance();
            return;

          }
        }
      }

    }

    draw() {
      if (this.stop) {
        push();
        fill(0, 255, 100);
        circle(this.nextPos.x, this.nextPos.y, 5);
        pop();
        return;
      }

      if (this.state < 50 && !this.stop) {
        this.state += 1;
      } 
      if (this.state >= 50) {
        this.stop = true;
        this.dist = this.getDistance();
      }

      this.nextPos = p5.Vector.add(this.player.pos, p5.Vector.mult(this.dir, 10 * this.state));

    }
  }





  class Player {
    constructor(x, y) {
      this.pos = createVector(x, y);
      this.r = 10
    }

    update() {

      if (keyIsDown(unchar('W'))) {
        this.pos.y -= 5;
        
        this.pos = this.pos.setMag(this.pos.mag() + 1);
      }
      if (keyIsDown(unchar('S'))) {
        this.pos.y += 5;
      }
      if (keyIsDown(unchar('A'))) {
        this.pos.x -= 5;
      }
      if (keyIsDown(unchar('D'))) {
        this.pos.x += 5;
      }
    }

    draw() {
      fill(0);
      stroke(255);
      circle(this.pos.x, this.pos.y, this.r);

    }

  }


  class TileManager {

    constructor(x, y, rows, cols) {

      this.startX = x;
      this.startY = y;
      this.rows = rows;
      this.cols = cols;
      this.tileSize = height / rows;

      this.tiles = [];
    }

    init() {
      this.tiles = Array.from(Array(this.rows),
        () => Array.from(Array(this.cols), () => round(random(0, 2))));

    }



    draw() {

      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          if (this.tiles[row][col] == 2) {
            rect(this.startX + col * this.tileSize,
              this.startY + row * this.tileSize,
              this.tileSize, this.tileSize);
          }
        }
      }
    }

  }