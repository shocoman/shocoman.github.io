let ray;
let ln;

function setup() {
	createCanvas(600, 400);

	ray = new Ray(width / 2, height / 2);
	ln = new Line(width / 3, height / 3, (width * 2) / 3, height / 3);
}

function draw() {
	background(220);

	ray.update();
	ray.draw();

	ln.draw();

	checkIntersectionBetweenRayAndLine(ray, ln);
}

function vecMult(v1, v2) {
	return v1.x * v2.y - v1.y * v2.x;
}

function checkIntersectionBetweenRayAndLine(ray, line) {
	let k = (line.startPoint.y - line.endPoint.y) / (line.startPoint.x - line.endPoint.x);
	let m = line.startPoint.y - line.startPoint.x * k;

	print("y = " + k + "x + " + m);

	let t =
		(k * ray.startPoint.x - ray.startPoint.y + m) /
		(ray.endPoint.y - ray.startPoint.y + k * (ray.startPoint.x - ray.endPoint.x));

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
	if (vecMult(rayToIntersectPoint, rayToStartLine) * vecMult(rayToIntersectPoint, rayToEndLine) > 0) return;

	if (t > 0) {
		circle(x, y, 10);
	}
}

class Ray {
	constructor(x1, y1) {
		this.startPoint = createVector(x1, y1);
		this.dir = createVector(0, 1);
		this.endPoint = p5.Vector.add(this.startPoint, p5.Vector.mult(this.dir, 50));
	}

	update() {
		if (keyIsDown(LEFT_ARROW)) {
			this.dir.rotate(-PI / 64);
		}

		if (keyIsDown(RIGHT_ARROW)) {
			this.dir.rotate(PI / 64);
		}

		this.endPoint = p5.Vector.add(this.startPoint, p5.Vector.mult(this.dir, 50));
	}

	draw() {
		line(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
		ellipse(this.endPoint.x, this.endPoint.y, 10);
	}
}

class Line {
	constructor(x1, y1, x2, y2) {
		this.startPoint = createVector(x1, y1);
		this.endPoint = createVector(x2, y2);
	}

	draw() {
		line(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
	}
}

function mousePressed() {
	if (mouseButton == LEFT) {
		ln.startPoint = createVector(mouseX, mouseY);
	}
}

function mouseDragged() {
	if (mouseButton == LEFT) {
		ln.endPoint = createVector(mouseX, mouseY);
	}
}
