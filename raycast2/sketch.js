let rays = [];
let lines = [];
let intersectPoints = [];
let player;

let TURN_SPEED = Math.PI / 64;
let WALK_SPEED = 1;

function setup() {
	createCanvas(600, 400);

	let startAngle = 0;
	player = new Player((width * 1) / 3 - 70, height / 2 - 70, startAngle);

	let fov = PI / 3;
	for (let angle = -fov / 2; angle <= fov / 2; angle += fov / 50) {
		ray = new Ray(player, startAngle + angle);
		rays.push(ray);
	}

	drawBorders();
}

function drawFloor() {
	stroke(80, 70, 40);
	//rect(0, height / 2, width, height / 2);

	let color1 = color('#4d3319');
	let color2 = color('#bf8040');

	for (let i = height/2; i < height; i++){
		stroke(lerpColor(color1, color2, (i-height/2)/(height/2)))
		line(0, i, width, i);
	}
}

function draw() {
	background(220);
	push();
	fill(50, 100, 250);
	rect(0, 0, width, height / 2);
	drawFloor();
	pop();

	intersectPoints = [];

	player.update();

	rays.forEach(ray => {
		ray.update();

		ray.draw();
		let rayInters = [];

		lines.forEach(ln => {
			ln.draw();
			let intersectPos = ray.doesIntersects(ln);
			if (intersectPos != false) {
				
				let myDist = function(rx, ry, ix, iy) {
					let cs = cos(player.dir.angleBetween(ray.dir));
					return dist(rx, ry, ix, iy) * cs;
				};

				rayInters.push(myDist(ray.startPoint.x, ray.startPoint.y, intersectPos.x, intersectPos.y));
				//line(ray.startPoint.x, ray.startPoint.y, intersectPos.x, intersectPos.y);
			}
		});

		intersectPoints.push(min(rayInters));
	});

	// draw columns
	for (let i = 0; i < intersectPoints.length; i++) {
		let scaleFactor = 1500;
		let wallHeight = (1 / intersectPoints[i]) * scaleFactor;

		wallHeight = constrain(wallHeight, 1, height / 2 - 1);
		push();

		strokeCap(SQUARE);
		strokeWeight(15);
		stroke(map(wallHeight, 1, height / 2 - 1, 30, 220));

		if (wallHeight < height / 2) {
			line((width / intersectPoints.length) * i, height / 2 - wallHeight, (width / intersectPoints.length) * i, height / 2 + wallHeight);
		}
		pop();
	}
}

class Player {
	constructor(x, y, angle) {
		this.pos = createVector(x, y);
		this.dir = createVector(0, 1);
		this.dir.rotate(angle);
	}

	update() {
		let nextPos = this.dir;
		nextPos.setMag(WALK_SPEED);

		if (keyIsDown(UP_ARROW)) {
			this.pos.add(nextPos);
		}

		if (keyIsDown(DOWN_ARROW)) {
			this.pos.sub(nextPos);
		}

		if (keyIsDown(LEFT_ARROW)) {
			this.dir.rotate(-TURN_SPEED);
		}

		if (keyIsDown(RIGHT_ARROW)) {
			this.dir.rotate(TURN_SPEED);
		}
	}
}

function vecMult(v1, v2) {
	return v1.x * v2.y - v1.y * v2.x;
}

class Ray {
	constructor(player, rot) {
		this.startPoint = createVector(player.pos.x, player.pos.y);
		this.dir = createVector(0, 1);
		this.dir.rotate(rot);

		this.endPoint = p5.Vector.add(this.startPoint, p5.Vector.mult(this.dir, 50));
	}

	update() {
		this.startPoint = createVector(player.pos.x, player.pos.y);

		if (keyIsDown(LEFT_ARROW)) {
			this.dir.rotate(-TURN_SPEED);
		}

		if (keyIsDown(RIGHT_ARROW)) {
			this.dir.rotate(TURN_SPEED);
		}
		this.endPoint = p5.Vector.add(this.startPoint, p5.Vector.mult(this.dir, 50));
	}

	doesIntersects(line) {
		let ray = this;

		let k = (line.startPoint.y - line.endPoint.y) / (line.startPoint.x - line.endPoint.x);
		let m = line.startPoint.y - line.startPoint.x * k;

		let t = (k * ray.startPoint.x - ray.startPoint.y + m) / (ray.endPoint.y - ray.startPoint.y + k * (ray.startPoint.x - ray.endPoint.x));

		let x = (1 - t) * ray.startPoint.x + t * ray.endPoint.x;

		let y;
		if (!isFinite(k)) {
			x = line.startPoint.x;
			t = (x - ray.startPoint.x) / (ray.endPoint.x - ray.startPoint.x);
			y = (1 - t) * ray.startPoint.y + t * ray.endPoint.y;
		} else {
			y = k * x + m;
		}

		let rayToStartLine = createVector(line.startPoint.x - ray.startPoint.x, line.startPoint.y - ray.startPoint.y);
		let rayToEndLine = createVector(line.endPoint.x - ray.startPoint.x, line.endPoint.y - ray.startPoint.y);
		let rayToIntersectPoint = createVector(x - ray.startPoint.x, y - ray.startPoint.y);
		if (vecMult(rayToIntersectPoint, rayToStartLine) * vecMult(rayToIntersectPoint, rayToEndLine) > 0) return false;

		if (t > 0) {
			//circle(x, y, 10);
			return { x: x, y: y };
		}

		return false;
	}

	draw() {
		push();
		stroke(100, 100, 100);

		line(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
		//ellipse(this.endPoint.x, this.endPoint.y, 2);
		pop();
	}
}

class Line {
	constructor(x1, y1, x2, y2) {
		this.startPoint = createVector(x1, y1);
		this.endPoint = createVector(x2, y2);
	}

	draw() {
		push();
		stroke(200, 100, 100);
		line(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
		pop();
	}
}

function drawBorders() {
	let o = 5; // offstep

	let left = new Line(o, o, o, height - o);
	let right = new Line(width - o, o, width - o, height - o);
	let top = new Line(o, o, width - o, o);
	let bottom = new Line(o, height - o, width - o, height - o);

	lines.push(left, right, top, bottom);
	lines.push(new Line(100, 100, 100, height - 100), new Line(300, 100, 300, 300), new Line(100, 100, 300, 100), new Line(100, height - 100, 300, height - 100));
}

function mousePressed() {
	if (mouseButton == LEFT) {
	}
}

function mouseDragged() {
	if (mouseButton == LEFT) {
	}
}
