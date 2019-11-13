let ball;

// let lineSegment;

let dots = [];
let lineSegments = [];

function setup() {
	createCanvas(600, 600);
	frameRate(60);

	
	// lineSegment = new LineSegment(100,500,500,300);
	// lineSegments.push(new LineSegment(300,300,500,400));
	// lineSegments.push(new LineSegment(100,500,300,300));
	// lineSegments.push(new LineSegment(100,500,500,500));
	// lineSegments.push(new LineSegment(100,100,100,500));


	generateDots(dots);
	ellipse(dots[0].x, dots[0].y, 40);
	ellipse(dots[dots.length-1].x, dots[dots.length-1].y,20);

	// start point
	lineSegments.push(new LineSegment(0, dots[0].y, dots[0].x, dots[0].y));
	// end point
	lineSegments.push(new LineSegment(dots[dots.length-1].x, dots[dots.length-1].y, width, dots[dots.length-1].y));

	dotsToLineSegments(dots);

	ball = new Ball(dots[0].x/2, dots[0].y - 5);
}

function dotsToLineSegments(dots){
	for (let i = 0; i < dots.length-1; i++){
		lineSegments.push(new LineSegment(dots[i].x, dots[i].y, dots[i+1].x, dots[i+1].y));
	}
}

function generateDots(dots){
	let startPos = 50;
	let endPos = height - 50;
	let step = 5;

	for (let i = 0; i < (width - startPos - (height - endPos)) / step; i++){
		let noiseValue = noise(i/25);
		noiseValue = map(noiseValue, 0, 1, height, height/3);
		dots.push(new Dot(i * step + startPos, noiseValue));
	}

}

function draw() {
	background(220);

	ball.update(lineSegments);
	ball.draw();

	//lineSegment.draw();

	lineSegments.forEach(l => {
		l.draw();
	});


}

function vectorProject(vec1, vec2){
	let projection = vec1.copy();
	return projection.mult(vec1.dot(vec2) / (vec1.magSq()));
}

class Ball {
	constructor(x,y){
		this.pos = createVector(x,y);
		this.old_pos = this.pos;
		this.vel = createVector(0,0);
		this.acc = createVector(0,0.1);

		this.r = 5;
		this.friction_coeff = 0.99;
		this.jumpness_coeff = 0.8;
	}

	boundariesCheck(){
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

	update(lineSegments){
		this.old_pos = this.pos.copy();
		this.vel.add(this.acc);
		this.vel.x *= this.friction_coeff;

		this.pos.add(this.vel);

		this.boundariesCheck();

		//this.collisionCheck(lineSegment);

		lineSegments.forEach(l => {
			this.collisionCheck(l);
		});

	}

	collisionCheck(lineSegment){
		let vecToBall = p5.Vector.sub(this.pos, lineSegment.p1);
		let vecToEnd = p5.Vector.sub(lineSegment.p2, lineSegment.p1);

		let projectVector = vectorProject(vecToEnd, vecToBall);
		// ellipse(lineSegment.p1.x + projectVector.x, lineSegment.p1.y + projectVector.y, 20);

		let intersectPoint = createVector(lineSegment.p1.x + projectVector.x,
											lineSegment.p1.y + projectVector.y);

		let projectLength = projectVector.mag() * Math.sign(projectVector.x);
		if (projectLength >= vecToEnd.mag() + this.r || projectLength <= -this.r){

		} else if (projectLength >= vecToEnd.mag() || projectLength <= 0) {
			this.pointCollision(lineSegment.p1);
			this.pointCollision(lineSegment.p2);
		} else if (p5.Vector.dist(intersectPoint, this.pos) <= this.r){
			
			let perpVector = p5.Vector.sub(this.pos, intersectPoint);
			let angle = atan2(perpVector.y, perpVector.x) - atan2(this.vel.y, this.vel.x);

			perpVector.rotate(PI + angle);
			this.vel = perpVector.normalize().mult(this.vel.mag());

			this.pos = this.old_pos.copy();
			this.vel.y *= this.jumpness_coeff;
		}
	}

	pointCollision(point){
		if (point.dist(this.pos) < this.r){
			this.vel = p5.Vector.sub(this.pos, point).normalize().mult(this.vel.mag());
			this.pos = this.old_pos.copy();
			this.vel.y *= this.jumpness_coeff;
		}
		
	}

	draw(){
		ellipse(this.pos.x, this.pos.y, this.r*2);

		let velStartPos = createVector(100,100);
		let velMult = 20;
		line(velStartPos.x, velStartPos.y, velStartPos.x + this.vel.x * velMult,
											 velStartPos.y + this.vel.y * velMult);
		line(width - velStartPos.x, velStartPos.y, width - velStartPos.x + this.vel.x * velMult,
											 velStartPos.y + this.vel.y * velMult);
	}
}

class LineSegment{
	constructor(x1,y1,x2,y2){
		this.p1 = createVector(x1,y1);
		this.p2 = createVector(x2,y2);

		if (this.p1.x > this.p2.x){
			[this.p1, this.p2] = [this.p2, this.p1];
		}
	}

	draw(){
		line(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
	}

}

class Dot{
	constructor(x,y){
		this.x = x;
		this.y = y;
	}
}

function mousePressed(){
	if (keyIsDown(CONTROL)) {
		let force = createVector(mouseX - ball.pos.x, mouseY - ball.pos.y);
		force.setMag(force.mag()/100);

		if (ball.vel.mag() < 1) {
			ball.vel.add(force);
		}
	} else if (mouseButton === LEFT) {
		ball.pos.x = mouseX;
		ball.pos.y = mouseY;
		ball.vel.x = 0; ball.vel.y = 0;
	} 
}