enum Rotation {
    NONE,
    LEFT,
    RIGHT,
}

class Point {
    pos: p5.Vector;

    dir: p5.Vector;
    rotation: Rotation;

    radius: number = 4;
    rotationSpeed: number = 0.1;
    movingSpeed: number = 6;

    noiceScale: number = 5;
    noiceOffset: number = 0;

    controlledByAI = false;

    constructor(x: number, y: number) {
        this.pos = createVector(x, y);
        this.dir = createVector(this.movingSpeed, 0);
        this.noiceOffset = random(1000000);
    }

    draw() {
        fill(100);
        circle(this.pos.x, this.pos.y, this.radius * 2);
    }

    move() {
        switch (this.rotation) {
            case Rotation.LEFT:
                this.dir.rotate(-this.rotationSpeed);
                break;
            case Rotation.RIGHT:
                this.dir.rotate(this.rotationSpeed);
                break;
            default:
                break;
        }

        if (this.controlledByAI) {
            this.AIControl();
        }

        this.pos.add(this.dir);
    }

    AIControl() {
        let rotNoise = noise(frameCount * this.noiceScale + this.noiceOffset) * 2 - 1;
        this.dir.rotate(rotNoise);

        let angle = p5.Vector.sub(apple.pos, this.pos).angleBetween(this.dir);
        this.dir.rotate(angle / 10);
    }
}



class Snake {
    points: Point[];
    head: Point;
    distance = 10;
    numberOfPoints = 15;

    snakeColor: p5.Color = color(100, 255, 10);
    tongueColor: p5.Color = color(200, 0, 0);
    eyesColor: p5.Color = color(0, 0, 200);

    constructor(headX: number, headY: number, points: Point[] = undefined) {

        if (points != undefined) {
            this.numberOfPoints = points.length;
            this.points = points.slice();
            this.head = points[0];
            this.head.controlledByAI = true;
            this.snakeColor = color(200, 100, 0);
        } else {
            this.points = new Array<Point>();
            this.points.push(new Point(headX, headY));
            this.head = this.points[0];

            for (let i = 0; i < this.numberOfPoints; i++) {
                this.points.push(new Point(this.head.pos.x - this.distance * i, this.head.pos.y));
            }
        }
    }

    move() {
        if (keyIsDown(LEFT_ARROW)) {
            this.head.rotation = Rotation.LEFT;
        } else if (keyIsDown(RIGHT_ARROW)) {
            this.head.rotation = Rotation.RIGHT;
        } else {
            this.head.rotation = Rotation.NONE;
        }
    }


    draw() {
        // Update part
        this.head.move();

        for (let i = 1; i < this.points.length; i++) {
            let currentPoint = this.points[i];
            let previousPoint = this.points[i - 1];

            if (currentPoint.pos.dist(previousPoint.pos) > this.distance) {
                let newPosition = p5.Vector.sub(currentPoint.pos, previousPoint.pos).normalize().mult(this.distance).add(previousPoint.pos);
                currentPoint.pos = newPosition;
            }

            // Draw part
            stroke(this.snakeColor);
            strokeWeight(map(i, 1, this.points.length, 13, 1));
            line(currentPoint.pos.x, currentPoint.pos.y, previousPoint.pos.x, previousPoint.pos.y);
        }


        // Head drawing part
        // Draw tongue
        let tongueStart = this.head.pos;
        let tongueEnd = p5.Vector.add(this.head.pos, p5.Vector.mult(this.head.dir, 2));
        stroke(this.tongueColor);
        strokeWeight(8);
        line(tongueStart.x, tongueStart.y, tongueEnd.x, tongueEnd.y);

        // Draw head
        stroke(this.snakeColor)
        strokeWeight(13);
        this.head.draw();

        // Draw eyes
        fill(this.eyesColor);
        noStroke();

        let leftEye = this.head.pos.copy().add(this.head.dir.copy().rotate(-PI / 2));
        let rightEye = this.head.pos.copy().add(this.head.dir.copy().rotate(PI / 2));

        circle(leftEye.x, leftEye.y, 7);
        circle(rightEye.x, rightEye.y, 7);
    }

    transfer(newX: number, newY: number) {
        let shift: p5.Vector = createVector(newX, newY).sub(this.head.pos);
        this.points.forEach(point => {
            point.pos.add(shift);
        })
    }

    headIsOnScreen(): boolean {
        if (this.head.pos.x >= 0 && this.head.pos.x <= width &&
            this.head.pos.y >= 0 && this.head.pos.y <= height)
            return true;
        else
            return false;
    }

}


class GhostedSnake {

    snakes: Snake[];
    childSnakes: Snake[];

    constructor(x: number, y: number) {
        this.snakes = new Array<Snake>();
        this.childSnakes = new Array<Snake>();
        this.snakes.push(new Snake(x, y));

        for (let i = 0; i < 8; i++)
            this.snakes.push(new Snake(x, y));

        this.positionGhosts();
    }

    update() {

        this.updateChildren();

        this.eatingYourself();

        if (!this.snakes[0].headIsOnScreen()) {
            this.positionGhosts();
        }

        this.snakes.forEach(s => {
            s.move();
            s.draw();
        });
    }

    updateChildren() {
        this.childSnakes.forEach(snake => {

            if (snake.head.pos.dist(apple.pos) < snake.distance * 2.5) {
                apple.destroyed = true;

                snake.numberOfPoints += 5;
                for (let i = 0; i < 5; i++) {
                    let lastPoint = snake.points[snake.points.length - 1].pos;
                    snake.points.push(new Point(lastPoint.x, lastPoint.y));
                }

            }
            snake.draw();
        });
    }

    eatingYourself() {
        let mainSnake = this.snakes[0];
        if (mainSnake.points.length < 5) return;
        for (let i = 4; i < mainSnake.points.length; i++) {
            if (mainSnake.head.pos.dist(mainSnake.points[i].pos) < mainSnake.distance / 2) {
                this.shortenLength(i);
                break;
            }
        }
    }

    closestToCenterSnake(): Snake {
        let centerPos = createVector(width / 2, height / 2);
        let bestSnake: Snake = this.snakes[0];

        for (let i = 0; i < this.snakes.length; i++) {
            let headPos = this.snakes[i].head.pos;
            if (headPos.x >= 0 && headPos.x <= width && headPos.y >= 0 && headPos.y <= height)
                bestSnake = this.snakes[i];
        }

        return bestSnake;
    }


    positionGhosts() {
        let snake = this.closestToCenterSnake();
        let bestSnakePos = snake.head.pos.copy();
        this.snakes[0].transfer(bestSnakePos.x, bestSnakePos.y);
        this.snakes[1].transfer(bestSnakePos.x + width, bestSnakePos.y);
        this.snakes[2].transfer(bestSnakePos.x - width, bestSnakePos.y);
        this.snakes[3].transfer(bestSnakePos.x, bestSnakePos.y + height);
        this.snakes[4].transfer(bestSnakePos.x, bestSnakePos.y - height);
        this.snakes[5].transfer(bestSnakePos.x + width, bestSnakePos.y + height);
        this.snakes[6].transfer(bestSnakePos.x - width, bestSnakePos.y + height);
        this.snakes[7].transfer(bestSnakePos.x + width, bestSnakePos.y - height);
        this.snakes[8].transfer(bestSnakePos.x - width, bestSnakePos.y - height);
    }

    increaseLength(n: number) {
        for (const s of this.snakes) {
            s.numberOfPoints += n;
            for (let i = 0; i < n; i++) {
                let lastPoint = this.snakes[0].points[this.snakes[0].points.length - 1].pos;
                s.points.push(new Point(lastPoint.x, lastPoint.y));
            }
        }
    }

    shortenLength(untilPoint: number) {

        let newPoints = [];
        let childLength = this.snakes[0].numberOfPoints - untilPoint;
        if (childLength > 0) {
            for (let i = 0; i < this.snakes[0].numberOfPoints - untilPoint; i++) {
                let pointOfCollision = this.snakes[0].points[untilPoint];
                newPoints.push(new Point(pointOfCollision.pos.x, pointOfCollision.pos.y));
            }
            this.childSnakes.push(new Snake(0, 0, newPoints));
        }

        for (const s of this.snakes) {
            s.numberOfPoints -= s.numberOfPoints - untilPoint;
            s.points = s.points.slice(0, untilPoint + 1);
        }
    }

}


let snake: GhostedSnake;

class Apple {
    pos: p5.Vector;
    size: number;
    eatenAndMoving: boolean;
    progress = 1;
    swinging: boolean;
    destroyed = false;

    constructor(x: number, y: number) {
        this.pos = createVector(x, y);
        this.eatenAndMoving = false;
        this.swinging = true;
        this.size = 20;
    }

    draw() {

        if (this.pos.dist(snake.snakes[0].head.pos) < 20) {
            this.swinging = false;
            this.eatenAndMoving = true;
        }

        if (this.eatenAndMoving) {
            if (floor(this.progress) >= snake.snakes[0].points.length) {
                snake.increaseLength(5);
                this.destroyed = true;
                return;
            }

            let index = floor(this.progress);
            this.pos = snake.snakes[0].points[index].pos;
            this.progress += 0.7;
        }

        fill(200, 0, 0);
        noStroke();


        if (!this.eatenAndMoving) {
            // draw full apple with leafs
            let wavyCoef = (this.swinging ? sin(frameCount / 20) * 7 : 0);
            ellipse(this.pos.x - 4, this.pos.y + wavyCoef, 0.7 * this.size, 1.1 * this.size);
            ellipse(this.pos.x + 4, this.pos.y + wavyCoef, 0.7 * this.size, 1.1 * this.size);

            strokeWeight(5);
            stroke(0, 255, 0);
            line(this.pos.x, this.pos.y - 10 + wavyCoef, this.pos.x - 5, this.pos.y - 12 + wavyCoef);
            line(this.pos.x, this.pos.y - 10 + wavyCoef, this.pos.x + 5, this.pos.y - 12 + wavyCoef);
        } else {
            // simple circle apple
            let newSize = map(this.progress, 0, snake.snakes[0].points.length, this.size, 7)
            fill(100, 255, 0);
            circle(this.pos.x, this.pos.y, newSize);
        }
    }
}

let apple: Apple;

function setup() {
    createCanvas(windowWidth, windowHeight);

    snake = new GhostedSnake(width / 2 - 200, height / 2);
    apple = new Apple(random(30, width - 30), random(30, height - 30));
}

function draw() {
    background(0, 150);
    snake.update();

    if (!apple.destroyed) {
        apple.draw();
    } else {
        apple = new Apple(random(30, width - 30), random(30, height - 30));
    }
}
