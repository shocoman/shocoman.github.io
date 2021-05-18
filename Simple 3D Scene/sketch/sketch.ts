
let points: Array<Point>;


let cube: Cube;
let pyramid: Pyramid;
let cylinder: Cylinder;

function setup() {
    createCanvas(1200, 800);

    points = new Array<Point>();




    cube = new Cube(-100, 0, 0);
    pyramid = new Pyramid(0, 0, 0);
    cylinder = new Cylinder(100, 0, 0);
}



function draw() {
    background(0);

    translate(width / 2, height / 2);
    scale(4)

    cube.draw();
    pyramid.draw();
    cylinder.draw();

}



function connectPoints(p1: p5.Vector, p2: p5.Vector) {
    line(p1.x, p1.y, p2.x, p2.y)
}

function gradientLine(x1: number, y1: number, x2: number, y2: number, a: p5.Color, b: p5.Color) {

    push();
    noStroke();

    let deltaX = x2 - x1;
    let deltaY = y2 - y1;
    let tStep = 1.0 / dist(x1, y1, x2, y2);
    for (let t = 0.0; t < 1.0; t += tStep) {
        fill(lerpColor(a, b, t));
        ellipse(x1 + t * deltaX, y1 + t * deltaY, 2, 2);
    }

    pop();
}

class Point {
    pos: p5.Vector;
    posMatrix: any;
    m: any;
    offset: p5.Vector;
    scaleFactor: p5.Vector;

    constructor(x: number, y: number, z: number, offsetX = 0, offsetY = 0, offsetZ = 0, scaleX = 1, scaleY = 1, scaleZ = 1) {
        this.pos = createVector(0, 0, 0);
        this.posMatrix = math.matrix([x, y, z, 1])
        this.m = math.identity([3, 3]);

        this.offset = createVector(offsetX, offsetY, offsetZ)
        this.scaleFactor = createVector(scaleX, scaleY, scaleZ)

        this.translate(x, y, z);

        // this.transform(offsetX, offsetY)
    }

    transform(x: number = 0, y: number = 0, z: number = 0) {
        this.posMatrix = math.multiply(this.posMatrix,
            [[1, 0, x, 0],
            [0, 1, y, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]]);
    }

    translate(x: number = 0, y: number = 0, z: number = 0) {
        this.posMatrix = math.multiply(this.posMatrix,
            [[1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [x, y, z, 1]]);
    }

    scale(x: number = 0, y: number = 0, z: number = 0) {
        this.posMatrix = math.multiply(this.posMatrix,
            [[x, 0, 0, 0],
            [0, y, 0, 0],
            [0, 0, z, 0],
            [0, 0, 0, 1]]);
    }

    rotate(x: number, y: number, z: number, angle: number) {


        let vec = createVector(x, y, z).normalize()

        let l = vec.x
        let m = vec.y
        let n = vec.z;
        let rotationMatrix = math.matrix([
            [l * l * (1 - cos(angle)) + cos(angle), m * l * (1 - cos(angle)) - n * sin(angle), n * l * (1 - cos(angle)) + m * sin(angle), 0],
            [l * m * (1 - cos(angle)) + n * sin(angle), m * m * (1 - cos(angle)) + cos(angle), n * m * (1 - cos(angle)) - l * sin(angle), 0],
            [l * n * (1 - cos(angle)) - m * sin(angle), m * n * (1 - cos(angle)) + l * sin(angle), n * n * (1 - cos(angle)) + cos(angle), 0],
            [0, 0, 0, 1]
        ])

        this.posMatrix = math.multiply(this.posMatrix, rotationMatrix);
    }

    draw() {


        // this.rotate(0.2, 1, 0, 0.02);

        // this.scale(this.scaleFactor.x, this.scaleFactor.y, this.scaleFactor.z)

        this.translate(this.offset.x, this.offset.y, this.offset.z)



        this.pos = createVector(this.posMatrix.get([0]), this.posMatrix.get([1]), this.posMatrix.get([2]));
        
        push()
        stroke(0,0,255);
        fill(0,0,255)
        circle(this.pos.x, this.pos.y, 1 + this.pos.z / 8 * 0);
        pop()

        this.translate(-this.offset.x, -this.offset.y, -this.offset.z)

        // this.scale(1 / this.scaleFactor.x, 1 / this.scaleFactor.y, 1 / this.scaleFactor.z)
    }
}



class Pyramid {

    points: Array<Point>;

    pos: p5.Vector;

    scaleFactor = createVector(16, 16, 16);

    constructor(x: number, y: number, z: number) {

        this.points = new Array<Point>();
        this.spawnPoints()

    }

    spawnPoints() {
        this.points.push(
            new Point(0, -1, 0),
            new Point(-1, 1, -1),
            new Point(-1, 1, 1),
            new Point(1, 1, -1),
            new Point(1, 1, 1),
        );
    }


    rotate(x: number, y: number, z: number, angle: number) {
        this.points.forEach(point => {
            point.rotate(x, y, z, angle);
        });
    }

    translate(x: number = 0, y: number = 0, z: number = 0) {
        this.points.forEach(point => {
            point.translate(x, y, z);
        });
    }

    scale(x: number = 0, y: number = 0, z: number = 0) {
        this.points.forEach(point => {
            point.scale(x, y, z);
        });
    }

    drawLines(){
        
        for (let i = 1; i < this.points.length; i++) {
            for (let j = 1; j < this.points.length; j++) {
                let p1 = this.points[i].pos;
                let p2 = this.points[j].pos;
                
                line(p1.x, p1.y, p2.x, p2.y);
            }
        }
        
        for (let j = 1; j < this.points.length; j++) {
            let p1 = this.points[0].pos;
            let p2 = this.points[j].pos;
    
            gradientLine(p1.x, p1.y, p2.x, p2.y, color(255,0,0), color(0,100,255));
            // line(p1.x, p1.y, p2.x, p2.y);
        }
    }
    

    draw() {



        this.points.forEach(point => {





            this.rotate(0, 1, 0, 0.005);



            this.scale(this.scaleFactor.x, this.scaleFactor.y, this.scaleFactor.z)

            // this.translate(this.offset.x, this.offset.y, this.offset.z)


            this.rotate(1, 0, 0, 0.5);

            point.draw();

            this.rotate(1, 0, 0, -0.5);


            // this.translate(-this.offset.x, -this.offset.y, -this.offset.z)

            this.scale(1 / this.scaleFactor.x, 1 / this.scaleFactor.y, 1 / this.scaleFactor.z)


        });



        this.drawLines()

    }
}



class Cylinder {

    points: Array<Point>;
    pos: p5.Vector;

    scaleFactor = createVector(16, 16, 16);

    constructor(x: number, y: number, z: number) {

        this.points = new Array<Point>();
        this.pos = createVector(x, y, z);

        this.spawnPoints()

    }

    spawnPoints() {


        let r = 1;

        for (let i = 0; i < 2 * PI; i += PI / 8) {

            let x = r * cos(i)
            let y = r * sin(i)

            this.points.push(new Point(x, -1, y));
            this.points.push(new Point(x, 1, y));
        }


    }


    rotate(x: number, y: number, z: number, angle: number) {
        this.points.forEach(point => {
            point.rotate(x, y, z, angle);
        });
    }

    translate(x: number = 0, y: number = 0, z: number = 0) {
        this.points.forEach(point => {
            point.translate(x, y, z);
        });
    }

    scale(x: number = 0, y: number = 0, z: number = 0) {
        this.points.forEach(point => {
            point.scale(x, y, z);
        });
    }


    drawLines() {
        for (let i = 0; i < this.points.length; i += 2) {
            let p1 = this.points[i].pos;
            let p2 = this.points[i + 1].pos;

            if (this.points[i].pos.z >= 0.9) continue;
            stroke(map(this.points[i].pos.z, 10, -10, 0, 255))
            line(p1.x, p1.y, p2.x, p2.y);

            // gradientLine(p1.x, p1.y, p2.x, p2.y, color(255,0,0), color(0,255,0));

        }

        // for (let i = 0; i < this.points.length; i++) {
        //     let p1 = this.points[i % this.points.length].pos;
        //     let p2 = this.points[(i + 2) % this.points.length].pos;


        //     line(p1.x, p1.y, p2.x, p2.y);
        // }
    }



    draw() {

        this.points.forEach(point => {

            this.rotate(0.1, 1, 0.1, 0.0005);

            this.scale(this.scaleFactor.x, this.scaleFactor.y, this.scaleFactor.z)

            // this.translate(this.offset.x, this.offset.y, this.offset.z)

            this.rotate(1, 0, 0, 0.5);

            this.translate(this.pos.x, this.pos.y, this.pos.z)
            point.draw();
            this.translate(-this.pos.x, -this.pos.y, -this.pos.z)

            this.rotate(1, 0, 0, -0.5);

            // this.translate(-this.offset.x, -this.offset.y, -this.offset.z)

            this.scale(1 / this.scaleFactor.x, 1 / this.scaleFactor.y, 1 / this.scaleFactor.z)
        });

        this.drawLines();
    }
}


class Cube {

    points: Array<Point>;
    pos: p5.Vector;

    scaleFactor = createVector(16, 16, 16);

    constructor(x: number, y: number, z: number) {

        this.points = new Array<Point>();
        this.pos = createVector(x, y, z);

        this.spawnPoints()

    }

    spawnPoints() {

        this.points.push(
            new Point(-1, -1, -1),
            new Point(1, -1, -1),
            new Point(1, 1, -1),
            new Point(-1, 1, -1),
            new Point(-1, -1, 1),
            new Point(1, -1, 1),
            new Point(1, 1, 1),
            new Point(-1, 1, 1),
        )
    }


    rotate(x: number, y: number, z: number, angle: number) {
        this.points.forEach(point => {
            point.rotate(x, y, z, angle);
        });
    }

    translate(x: number = 0, y: number = 0, z: number = 0) {
        this.points.forEach(point => {
            point.translate(x, y, z);
        });
    }

    scale(x: number = 0, y: number = 0, z: number = 0) {
        this.points.forEach(point => {
            point.scale(x, y, z);
        });
    }


    drawLines() {




        for (let i = 0; i < this.points.length/2; i++){
            let p1 = this.points[i].pos;
            let p2 = this.points[i+this.points.length/2].pos;

            stroke(100,0,50)
            line(p1.x, p1.y, p2.x, p2.y)
        }



        for (let i = 0; i < this.points.length-1; i++){
            if (i == 3) continue;

            let p1 = this.points[i].pos;
            let p2 = this.points[i+1].pos;


            stroke(100,0,50)
            line(p1.x, p1.y, p2.x, p2.y)
        }

        stroke(100,0,250)
        connectPoints(this.points[0].pos, this.points[2].pos)
        connectPoints(this.points[1].pos, this.points[3].pos)
        connectPoints(this.points[4].pos, this.points[6].pos)
        connectPoints(this.points[5].pos, this.points[7].pos)


        // stroke(1)
        // points.forEach(p => {
        //     p.draw();
        // });



        // strokeWeight(2)
        // stroke(40, 50, 20)
        // line(points[0].pos.x, points[0].pos.y, points[points.length-1].pos.x, points[points.length-1].pos.y)


        // for (let i = 0; i < this.points.length; i++) {
        //     let p1 = this.points[i % this.points.length].pos;
        //     let p2 = this.points[(i + 2) % this.points.length].pos;


        //     line(p1.x, p1.y, p2.x, p2.y);
        // }

        // for (let i = 0; i < this.points.length; i += 2) {
        //     let p1 = this.points[i].pos;
        //     let p2 = this.points[i + 1].pos;

        //     if (this.points[i].pos.z >= 0.9) continue;
        //     stroke(map(this.points[i].pos.z, 10, -10, 0, 255))
        //     line(p1.x, p1.y, p2.x, p2.y);

        //     // gradientLine(p1.x, p1.y, p2.x, p2.y, color(255,0,0), color(0,255,0));

        // }

        // for (let i = 0; i < this.points.length; i++) {
        //     let p1 = this.points[i % this.points.length].pos;
        //     let p2 = this.points[(i + 2) % this.points.length].pos;


        //     line(p1.x, p1.y, p2.x, p2.y);
        // }
    }



    draw() {

        this.points.forEach(point => {

            this.rotate(0.1, 1, 0.1, 0.0005);

            this.scale(this.scaleFactor.x, this.scaleFactor.y, this.scaleFactor.z)

            // this.translate(this.offset.x, this.offset.y, this.offset.z)

            this.rotate(1, 0, 0, 0.5);

            this.translate(this.pos.x, this.pos.y, this.pos.z)
            point.draw();
            this.translate(-this.pos.x, -this.pos.y, -this.pos.z)

            this.rotate(1, 0, 0, -0.5);

            // this.translate(-this.offset.x, -this.offset.y, -this.offset.z)

            this.scale(1 / this.scaleFactor.x, 1 / this.scaleFactor.y, 1 / this.scaleFactor.z)
        });

        this.drawLines();
    }
}