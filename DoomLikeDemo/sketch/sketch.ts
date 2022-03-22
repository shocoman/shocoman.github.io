const fpsViewXOffset = 400;
let p: Player;
let w: Wall[];

function setup() {
  createCanvas(800, 400);

  p = new Player(50, 50);
  w = new Array();
  w.push(new Wall(createVector(200, 250), createVector(300, 150)));
  // w.push(new Wall(createVector(100, 250), createVector(250, 100)));
  // w.push(new Wall(createVector(250, 200), createVector(350, 100)));
}

function draw() {
  background(0);

  p.draw();
  w.forEach((w) => w.draw(p));

    stroke(128,128,128);
  line(fpsViewXOffset, 0, fpsViewXOffset, height);

  fill(255, 255, 255);
}

function keyPressed(e: KeyboardEvent) {
  p.keyPressed(e);
  w.forEach((w) => w.keyPressed(e));
  // console.log(e);
}

class Player {
  pos: p5.Vector;
  dir: p5.Vector;

  constructor(x: number, y: number) {
    this.pos = createVector(x, y);
    this.dir = createVector(0, 1);
  }

  keyPressed(e: KeyboardEvent) {
    if (e.key === "ArrowUp") {
      this.pos.add(this.dir.copy().mult(10));
      return;
    }

    let angle = 0;
    if (e.key === "ArrowLeft") {
      angle = -1;
    } else if (e.key === "ArrowRight") {
      angle = 1;
    }
    angle *= 30;
    this.dir.rotate(radians(angle));
  }

  draw() {
    fill(255, 255, 255);
    circle(this.pos.x, this.pos.y, 10);

    // draw field of view
    stroke(255, 0, 0);
    let distVec = this.dir.copy().mult(30);
    let start = this.pos,
      endLeft = p5.Vector.add(this.pos, distVec.copy().rotate(radians(30))),
      endRight = p5.Vector.add(this.pos, distVec.copy().rotate(radians(-30)));
    line(start.x, start.y, endLeft.x, endLeft.y);
    line(start.x, start.y, endRight.x, endRight.y);
  }

  pointIsVisible(pnt: p5.Vector): [boolean, number] {
    // fov
    let leftEdge = this.dir.copy().rotate(radians(-30)),
      rightEdge = this.dir.copy().rotate(radians(30));
    let playerToPoint = pnt.copy().sub(this.pos);

    let x1 = leftEdge.cross(playerToPoint);
    let x2 = rightEdge.cross(playerToPoint);

    const isVisible = x1.z > 0 && x2.z < 0;
    let angle = leftEdge.angleBetween(playerToPoint);

    // console.log(x1, x2, isVisible, angle);

    
    return [isVisible, angle];
  }
}

class Wall {
  p1: p5.Vector;
  p2: p5.Vector;

  constructor(p1: p5.Vector, p2: p5.Vector) {
    this.p1 = p1.copy();
    this.p2 = p2.copy();
  }

  keyPressed(e: KeyboardEvent) {
    if (e.key === " ") {
      p.pointIsVisible(this.p1);

      let angle1 = this.p1.angleBetween(p.dir);
      let angle2 = this.p1.angleBetween(p.dir);
      console.log(angle1, angle2);
      
    }
  }

  draw(player: Player) {
    // let [p1IsVisible, p1Angle] = player.pointIsVisible(this.p1);
    // if (p1IsVisible) 
    {
      // console.log(p1Angle);
      
      fill(0, 100, 0);
      circle(this.p1.x, this.p1.y, 20);
      let dist = this.p1.dist(player.pos);

      // let x = map(p1Angle, 0, PI/3, fpsViewXOffset, width);
      // circle(x, height/2, 10000/dist);
    }
    // let [p2IsVisible, p2Angle] = player.pointIsVisible(this.p2);
    // if (p2IsVisible) 
    {
      fill(0, 0, 200);
      circle(this.p2.x, this.p2.y, 20);
    }
  }
}
