let ball;

let dots;
let lineSegments;
let finishMark;

let noiseOffset = 0;

let landSlideSpeed = 5;

function setup() {
	createCanvas(600, 600);
	frameRate(60);

	dots = [];
	lineSegments = [];

	initLevel();
}

function draw() {
	background(225, 111);

	ball.update(lineSegments);
	finishCheck(ball);

	ball.draw();

	for (let i = lineSegments.length - 1; i >= 0; i--) {
		if (lineSegments[i].p2.x < 0) {
			lineSegments.splice(i, 1);
		}

		lineSegments[i].draw();
	}
}

function initLevel() {
	dots = [];

	lineSegments.splice(lineSegments.length-1-4,5);
	lineSegments.forEach(l => {
		l.move_away = true;
	});

	generateDots(dots);

	ball = new Ball(dots[0].x / 2, dots[0].y - 20);
	initStartPoint(ball, lineSegments, dots);

	dotsToLineSegments(dots);

	initEndPoint(ball, lineSegments, dots);
}

function dotsToLineSegments(dots) {
	for (let i = 0; i < dots.length - 1; i++) {
		lineSegments.push(new LineSegment(dots[i].x, dots[i].y, dots[i + 1].x, dots[i + 1].y));
	}
}

function generateDots(dots) {
	let startPos = 50;
	let endPos = height - 50;
	let step = 5;
	let numOfParts = (width - startPos - (height - endPos)) / step;
	for (let i = 0; i < numOfParts; i++) {
		let noiseValue = noise(i / 25 + noiseOffset);
		noiseValue = map(noiseValue, 0, 1, height, height / 3);
		dots.push(new Dot(i * step + startPos, noiseValue));
	}

	noiseOffset += numOfParts / 25;
}

function finishCheck(ball) {
	if (finishMark.dist(ball.pos) <= ball.r*2 && ball.vel.mag() < 0.8) {
		initLevel();
	}
}

function vectorProject(vec1, vec2) {
	let projection = vec1.copy();
	return projection.mult(vec1.dot(vec2) / vec1.magSq());
}

class Ball {
	constructor(x, y) {
		this.start_offset = width - 55;
		this.move_away = true;

		this.pos = createVector(x + this.start_offset, y);
		this.old_pos = this.pos;
		this.vel = createVector(0, 0);
		this.acc = createVector(0, 0.1);

		this.r = 6;
		this.friction_coeff = 0.99;
		this.jumpness_coeff = 0.8;
	}

	boundariesCheck() {
		if (this.move_away == true) return;

		if (this.pos.y + this.r > height) {
			this.pos.y = height - this.r;
			this.vel.y *= -1;
			this.vel.y *= this.jumpness_coeff;
		}
		if (this.pos.y < 0) {
			this.vel.y *= -1;
			this.vel.y *= this.jumpness_coeff;
		}
		if (this.pos.x + this.r > width) {
			this.pos.x = width - this.r;
			this.vel.x *= -1;
			this.vel.x *= this.jumpness_coeff;
		}
		if (this.pos.x - this.r < 0) {
			this.pos.x = this.r;
			this.vel.x *= -1;
			this.vel.x *= this.jumpness_coeff;
		}
	}

	update(lineSegments) {
		this.old_pos = this.pos.copy();
		this.vel.add(this.acc);
		this.vel.x *= this.friction_coeff;

		this.pos.add(this.vel);

		this.boundariesCheck();

		lineSegments.forEach(l => {
			this.collisionCheck(l);
		});

		if (this.move_away && this.start_offset > 0) {
			this.pos.x -= landSlideSpeed;
			this.start_offset -= landSlideSpeed;
		} else {
			this.move_away = false;
		}
	}

	collisionCheck(lineSegment) {
		let vecToBall = p5.Vector.sub(this.pos, lineSegment.p1);
		let vecToEnd = p5.Vector.sub(lineSegment.p2, lineSegment.p1);

		let projectVector = vectorProject(vecToEnd, vecToBall);
		let intersectPoint = createVector(lineSegment.p1.x + projectVector.x, lineSegment.p1.y + projectVector.y);

		let projectLength = projectVector.mag() * Math.sign(projectVector.x);
		if (projectLength >= vecToEnd.mag() + this.r || projectLength <= -this.r) {
		} else if (projectLength >= vecToEnd.mag() || projectLength <= 0) {
			this.pointCollision(lineSegment.p1);
			this.pointCollision(lineSegment.p2);
		} else if (p5.Vector.dist(intersectPoint, this.pos) <= this.r) {
			let perpVector = p5.Vector.sub(this.pos, intersectPoint);
			let angle = atan2(perpVector.y, perpVector.x) - atan2(this.vel.y, this.vel.x);

			perpVector.rotate(PI + angle);
			this.vel = perpVector.normalize().mult(this.vel.mag());

			this.pos = this.old_pos.copy();
			this.vel.y *= this.jumpness_coeff;
		}
	}

	pointCollision(point) {
		if (point.dist(this.pos) < this.r) {
			this.vel = p5.Vector.sub(this.pos, point)
				.normalize()
				.mult(this.vel.mag());
			this.pos = this.old_pos.copy();
			this.vel.y *= this.jumpness_coeff;
		}
	}

	draw() {
		strokeWeight(1);
		ellipse(this.pos.x, this.pos.y, this.r * 2);
	}
}

class LineSegment {
	constructor(x1, y1, x2, y2) {
		this.start_offset = width - 53;

		this.p1 = createVector(x1 + this.start_offset, y1);
		this.p2 = createVector(x2 + this.start_offset, y2);

		if (this.p1.x > this.p2.x) {
			[this.p1, this.p2] = [this.p2, this.p1];
		}

		this.move_away = false;
	}

	draw() {
		if (this.move_away) {
			this.p1.x -= landSlideSpeed;
			this.p2.x -= landSlideSpeed;
		}
		if (this.start_offset > 0) {
			this.p1.x -= landSlideSpeed;
			this.p2.x -= landSlideSpeed;

			this.start_offset -= landSlideSpeed;
		}

		strokeWeight(3);
		line(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
	}
}

class Dot {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

function initStartPoint(ball, lineSegments, dots) {
	//    _o_
	// __/   \__

	let leftBorder = 0;
	let rightBorder = dots[0].x;
	let y = dots[0].y;

	let gapSize = ball.r * 6;
	let depthSize = ball.r * 1.2;
	let groundSize = (rightBorder - leftBorder - gapSize) / 2;

	lineSegments.push(new LineSegment(leftBorder, y, leftBorder + groundSize, y));
	lineSegments.push(new LineSegment(leftBorder + groundSize, y, leftBorder + groundSize + gapSize / 10, y - depthSize));
	lineSegments.push(new LineSegment(leftBorder + groundSize + gapSize / 10, y - depthSize, leftBorder + groundSize + gapSize - gapSize / 10, y - depthSize));
	lineSegments.push(new LineSegment(leftBorder + groundSize + gapSize - gapSize / 10, y - depthSize, leftBorder + groundSize + gapSize, y));
	lineSegments.push(new LineSegment(rightBorder - groundSize, y, rightBorder, y));
}

function initEndPoint(ball, lineSegments, dots) {
	// __     __
	//   \_o_/

	let leftBorder = dots[dots.length - 1].x;
	let rightBorder = width;
	let y = dots[dots.length - 1].y;

	let gapSize = ball.r * 4;
	let depthSize = ball.r * 4;
	let groundSize = (rightBorder - leftBorder - gapSize) / 2;

	lineSegments.push(new LineSegment(leftBorder, y, leftBorder + groundSize, y));
	lineSegments.push(new LineSegment(leftBorder + groundSize, y, leftBorder + groundSize + gapSize / 10, y + depthSize));
	lineSegments.push(new LineSegment(leftBorder + groundSize + gapSize / 10, y + depthSize, leftBorder + groundSize + gapSize - gapSize / 10, y + depthSize));
	lineSegments.push(new LineSegment(leftBorder + groundSize + gapSize - gapSize / 10, y + depthSize, leftBorder + groundSize + gapSize, y));
	lineSegments.push(new LineSegment(rightBorder - groundSize, y, rightBorder, y));

	finishMark = createVector(leftBorder + groundSize + gapSize / 2, y + depthSize - ball.r / 2);
}

function mousePressed() {
	if (keyIsDown(CONTROL)) {
		ball.pos.x = mouseX;
		ball.pos.y = mouseY;
		ball.vel.x = 0;
		ball.vel.y = 0;
	} else if (mouseButton === LEFT) {
		let force = createVector(mouseX - ball.pos.x, mouseY - ball.pos.y);
		force.setMag(force.mag() / 80);

		if (ball.vel.mag() < 1) {
			ball.vel.add(force);
		}
	}
}

function keyPressed() {
	if (keyCode === ENTER) {
		initLevel();
	}
}
