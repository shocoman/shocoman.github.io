var Rotation;
(function (Rotation) {
    Rotation[Rotation["NONE"] = 0] = "NONE";
    Rotation[Rotation["LEFT"] = 1] = "LEFT";
    Rotation[Rotation["RIGHT"] = 2] = "RIGHT";
})(Rotation || (Rotation = {}));
var Point = (function () {
    function Point(x, y) {
        this.radius = 4;
        this.rotationSpeed = 0.1;
        this.movingSpeed = 6;
        this.noiceScale = 5;
        this.noiceOffset = 0;
        this.controlledByAI = false;
        this.pos = createVector(x, y);
        this.dir = createVector(this.movingSpeed, 0);
        this.noiceOffset = random(1000000);
    }
    Point.prototype.draw = function () {
        fill(100);
        circle(this.pos.x, this.pos.y, this.radius * 2);
    };
    Point.prototype.move = function () {
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
    };
    Point.prototype.AIControl = function () {
        var rotNoise = noise(frameCount * this.noiceScale + this.noiceOffset) * 2 - 1;
        this.dir.rotate(rotNoise);
        var angle = p5.Vector.sub(apple.pos, this.pos).angleBetween(this.dir);
        this.dir.rotate(angle / 10);
    };
    return Point;
}());
var Snake = (function () {
    function Snake(headX, headY, points) {
        if (points === void 0) { points = undefined; }
        this.distance = 10;
        this.numberOfPoints = 15;
        this.snakeColor = color(100, 255, 10);
        this.tongueColor = color(200, 0, 0);
        this.eyesColor = color(0, 0, 200);
        if (points != undefined) {
            this.numberOfPoints = points.length;
            this.points = points.slice();
            this.head = points[0];
            this.head.controlledByAI = true;
            // this.snakeColor = color(random(255), random(255), random(255));
            // colorMode(HSL, 255);
            this.snakeColor = color(`hsl(${floor(random(360))}, 100%, 50%)`);
        }
        else {
            this.points = new Array();
            this.points.push(new Point(headX, headY));
            this.head = this.points[0];
            for (var i = 0; i < this.numberOfPoints; i++) {
                this.points.push(new Point(this.head.pos.x - this.distance * i, this.head.pos.y));
            }
        }
    }
    Snake.prototype.move = function () {
        if (keyIsDown(LEFT_ARROW) || mouseIsPressed && mouseX < width/2) {
            this.head.rotation = Rotation.LEFT;
        }
        else if (keyIsDown(RIGHT_ARROW) || mouseIsPressed && mouseX >= width/2) {
            this.head.rotation = Rotation.RIGHT;
        }
        else {
            this.head.rotation = Rotation.NONE;
        }
    };
    Snake.prototype.draw = function () {
        this.head.move();
        for (var i = 1; i < this.points.length; i++) {
            var currentPoint = this.points[i];
            var previousPoint = this.points[i - 1];
            if (currentPoint.pos.dist(previousPoint.pos) > this.distance) {
                var newPosition = p5.Vector.sub(currentPoint.pos, previousPoint.pos).normalize().mult(this.distance).add(previousPoint.pos);
                currentPoint.pos = newPosition;
            }
            stroke(this.snakeColor);
            strokeWeight(map(i, 1, this.points.length, 13, 1));
            line(currentPoint.pos.x, currentPoint.pos.y, previousPoint.pos.x, previousPoint.pos.y);
        }
        var tongueStart = this.head.pos;
        var tongueEnd = p5.Vector.add(this.head.pos, p5.Vector.mult(this.head.dir, 2));
        stroke(this.tongueColor);
        strokeWeight(8);
        line(tongueStart.x, tongueStart.y, tongueEnd.x, tongueEnd.y);
        stroke(this.snakeColor);
        strokeWeight(13);
        this.head.draw();
        fill(this.eyesColor);
        noStroke();
        var leftEye = this.head.pos.copy().add(this.head.dir.copy().rotate(-PI / 2));
        var rightEye = this.head.pos.copy().add(this.head.dir.copy().rotate(PI / 2));
        circle(leftEye.x, leftEye.y, 7);
        circle(rightEye.x, rightEye.y, 7);
    };
    Snake.prototype.transfer = function (newX, newY) {
        var shift = createVector(newX, newY).sub(this.head.pos);
        this.points.forEach(function (point) {
            point.pos.add(shift);
        });
    };
    Snake.prototype.headIsOnScreen = function () {
        if (this.head.pos.x >= 0 && this.head.pos.x <= width &&
            this.head.pos.y >= 0 && this.head.pos.y <= height)
            return true;
        else
            return false;
    };
    return Snake;
}());
var GhostedSnake = (function () {
    function GhostedSnake(x, y) {
        this.snakes = new Array();
        this.childSnakes = new Array();
        this.snakes.push(new Snake(x, y));
        for (var i = 0; i < 8; i++)
            this.snakes.push(new Snake(x, y));
        this.positionGhosts();
    }
    GhostedSnake.prototype.update = function () {
        this.updateChildren();
        this.eatingYourself();
        if (!this.snakes[0].headIsOnScreen()) {
            this.positionGhosts();
        }
        this.snakes.forEach(function (s) {
            s.move();
            s.draw();
        });
    };
    GhostedSnake.prototype.updateChildren = function () {
        this.childSnakes.forEach(function (snake) {
            if (snake.head.pos.dist(apple.pos) < snake.distance * 2.5) {
                apple.destroyed = true;
                snake.numberOfPoints += 5;
                for (var i = 0; i < 5; i++) {
                    var lastPoint = snake.points[snake.points.length - 1].pos;
                    snake.points.push(new Point(lastPoint.x, lastPoint.y));
                }
            }
            snake.draw();
        });
    };
    GhostedSnake.prototype.eatingYourself = function () {
        var mainSnake = this.snakes[0];
        if (mainSnake.points.length < 5)
            return;
        for (var i = 4; i < mainSnake.points.length; i++) {
            if (mainSnake.head.pos.dist(mainSnake.points[i].pos) < mainSnake.distance / 2) {
                this.shortenLength(i);
                break;
            }
        }
    };
    GhostedSnake.prototype.closestToCenterSnake = function () {
        var centerPos = createVector(width / 2, height / 2);
        var bestSnake = this.snakes[0];
        for (var i = 0; i < this.snakes.length; i++) {
            var headPos = this.snakes[i].head.pos;
            if (headPos.x >= 0 && headPos.x <= width && headPos.y >= 0 && headPos.y <= height)
                bestSnake = this.snakes[i];
        }
        return bestSnake;
    };
    GhostedSnake.prototype.positionGhosts = function () {
        var snake = this.closestToCenterSnake();
        var bestSnakePos = snake.head.pos.copy();
        this.snakes[0].transfer(bestSnakePos.x, bestSnakePos.y);
        this.snakes[1].transfer(bestSnakePos.x + width, bestSnakePos.y);
        this.snakes[2].transfer(bestSnakePos.x - width, bestSnakePos.y);
        this.snakes[3].transfer(bestSnakePos.x, bestSnakePos.y + height);
        this.snakes[4].transfer(bestSnakePos.x, bestSnakePos.y - height);
        this.snakes[5].transfer(bestSnakePos.x + width, bestSnakePos.y + height);
        this.snakes[6].transfer(bestSnakePos.x - width, bestSnakePos.y + height);
        this.snakes[7].transfer(bestSnakePos.x + width, bestSnakePos.y - height);
        this.snakes[8].transfer(bestSnakePos.x - width, bestSnakePos.y - height);
    };
    GhostedSnake.prototype.increaseLength = function (n) {
        for (var _i = 0, _a = this.snakes; _i < _a.length; _i++) {
            var s = _a[_i];
            s.numberOfPoints += n;
            for (var i = 0; i < n; i++) {
                var lastPoint = this.snakes[0].points[this.snakes[0].points.length - 1].pos;
                s.points.push(new Point(lastPoint.x, lastPoint.y));
            }
        }
    };
    GhostedSnake.prototype.shortenLength = function (untilPoint) {
        var newPoints = [];
        var childLength = this.snakes[0].numberOfPoints - untilPoint;
        if (childLength > 0) {
            for (var i = 0; i < this.snakes[0].numberOfPoints - untilPoint; i++) {
                var pointOfCollision = this.snakes[0].points[untilPoint];
                newPoints.push(new Point(pointOfCollision.pos.x, pointOfCollision.pos.y));
            }
            this.childSnakes.push(new Snake(0, 0, newPoints));
        }
        for (var _i = 0, _a = this.snakes; _i < _a.length; _i++) {
            var s = _a[_i];
            s.numberOfPoints -= s.numberOfPoints - untilPoint;
            s.points = s.points.slice(0, untilPoint + 1);
        }
    };
    return GhostedSnake;
}());
var Apple = (function () {
    function Apple(x, y) {
        this.progress = 1;
        this.destroyed = false;
        this.pos = createVector(x, y);
        this.eatenAndMoving = false;
        this.swinging = true;
        this.size = 20;
    }
    Apple.prototype.draw = function () {
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
            var index = floor(this.progress);
            this.pos = snake.snakes[0].points[index].pos;
            this.progress += 0.7;
        }
        fill(200, 0, 0);
        noStroke();
        if (!this.eatenAndMoving) {
            var wavyCoef = (this.swinging ? sin(frameCount / 20) * 7 : 0);
            ellipse(this.pos.x - 4, this.pos.y + wavyCoef, 0.7 * this.size, 1.1 * this.size);
            ellipse(this.pos.x + 4, this.pos.y + wavyCoef, 0.7 * this.size, 1.1 * this.size);
            strokeWeight(5);
            stroke(0, 255, 0);
            line(this.pos.x, this.pos.y - 10 + wavyCoef, this.pos.x - 5, this.pos.y - 12 + wavyCoef);
            line(this.pos.x, this.pos.y - 10 + wavyCoef, this.pos.x + 5, this.pos.y - 12 + wavyCoef);
        }
        else {
            var newSize = map(this.progress, 0, snake.snakes[0].points.length, this.size, 7);
            fill(100, 255, 0);
            circle(this.pos.x, this.pos.y, newSize);
        }
    };
    return Apple;
}());
var snake;
var apple;
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
    }
    else {
        apple = new Apple(random(30, width - 30), random(30, height - 30));
    }
}

function keyPressed() {
    if (key === " ") {
        ss = [];
        for (let i = 0;i<random(1, 15);i++) ss.push(new Point(random(30, width - 30), random(30, height - 30)))
        snake.childSnakes.push(new Snake(0, 0, ss));
    }
}

function mouseClicked(){

    if (mouseY > height/16) return;

    ss = [];
    for (let i = 0;i<random(1, 15);i++) ss.push(new Point(random(30, width - 30), random(30, height - 30)))
    snake.childSnakes.push(new Snake(0, 0, ss));
}

//# sourceMappingURL=build.js.map