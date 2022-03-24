const fpsViewXOffset = 400;
const fovDegrees = 60;
let p: Player;
let w: Wall[];

let pg;

function setup() {
    createCanvas(800, 400, WEBGL);

    p = new Player(50, 50);
    w = new Array();
    // w.push(new Wall(createVector(100, 250), createVector(300, 150)));
    w.push(new Wall(createVector(100, 150), createVector(300, 150)));
    w.push(new Wall(createVector(100, 150), createVector(200, 250)));
    w.push(new Wall(createVector(300, 150), createVector(200, 250)));

    pg = createGraphics(200, 200);
    pg.textSize(75);
    pg.resizeCanvas(100, 100);

}

function draw() {
    translate(-width / 2, -height / 2);
    background(0);

    p.update();
    p.draw();

    w.sort((a: Wall, b: Wall): number => {
        let aDist = Math.min(a.p1.dist(p.pos), a.p2.dist(p.pos));
        let bDist = Math.min(b.p1.dist(p.pos), b.p2.dist(p.pos));
        if (aDist !== bDist) return +(aDist < bDist);
        else {
            let aDist = a.p1.copy().add(a.p2).div(2).dist(p.pos);
            let bDist = b.p1.copy().add(b.p2).div(2).dist(p.pos);
            return +(aDist < bDist);
        }
    });
    w.forEach((w) => w.draw(p));

    stroke(128, 128, 128);
    line(fpsViewXOffset - 1, 0, fpsViewXOffset - 1, height);

    fill(255, 255, 255);

 
    // rotateX(0.5);
    // noStroke();
    // plane(50);
}

function keyPressed(e: KeyboardEvent) {
    p.keyPressed(e, true);
    // console.log(e);
}

function keyReleased(e: KeyboardEvent) {
    p.keyPressed(e, false);
}
