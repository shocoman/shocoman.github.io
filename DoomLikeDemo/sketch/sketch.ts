const fpsViewXOffset = 400;
const fovDegrees = 60;
let p: Player;
let w: Wall[];

let wallTexture: p5.Image;

function preload() {
    wallTexture = loadImage("assets/Японский мотив.bmp");
    // img.loadPixels();
}

function setup() {
    createCanvas(800, 400);

    p = new Player(50, 50);
    w = new Array();
    // w.push(new Wall(createVector(100, 250), createVector(300, 150)));
    w.push(new Wall(createVector(100, 150), createVector(300, 150)));
    // w.push(new Wall(createVector(100, 150), createVector(200, 250)));
    // w.push(new Wall(createVector(300, 150), createVector(200, 250)));
}

function draw() {
    background(0);
    // drawImage();
    // return;

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

function drawImageSegment(
    img: p5.Image,
    x: number,
    y: number,
    w: number,
    h: number,
    from: number,
    to: number
) {
    const sx0 = from * img.width;
    const sx1 = to * img.width;
    image(img, x, y, w, h, sx0, 0, sx1 - sx0, img.height);
}

function drawImage(
    img = wallTexture,
    from = 0,
    to = 1,
    imgX = 50,
    imgY = 200,
    width = 400,
    startHeight = 100,
    endHeight = 200
) {
    text(
        `img: ${img},
    from: ${from},
    to: ${to},
    imgX: ${imgX},
    imgY: ${imgY},
    width: ${width},
    startHeight: ${startHeight},
    endHeight: ${endHeight},`,
        0,
        150
    );

    const segments = 80;
    let segmentWidth = width / segments;
    for (let i = 0; i < segments; i++) {
        let x = imgX + i * segmentWidth;
        let segmentHeight = startHeight + (endHeight - startHeight) * (i / segments);
        let y = imgY - segmentHeight / 2;
        drawImageSegment(
            img,
            x,
            y,
            segmentWidth,
            segmentHeight,
            from + (i / segments) * (to - from),
            from + ((i + 1) / segments) * (to - from)
        );
        // rect(x, y, segmentWidth, segmentHeight);
    }
}
