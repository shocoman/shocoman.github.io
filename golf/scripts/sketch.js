let ball;

let lineSegment;

function setup() {
	createCanvas(600, 600);

	ball = new Ball(width/2, height/4);
	lineSegment = new LineSegment(100,500,500,300);
}

function draw() {
	background(220);

	ball.update(lineSegment);
	ball.draw();

	lineSegment.draw();
}

function vectorProject(vec1, vec2){
	let projection = vec1.copy();
	return projection.mult(vec1.dot(vec2) / (vec1.magSq()));
}

class Ball {
	constructor(x,y){
		this.pos = createVector(x,y);
		this.vel = createVector(0,0);
		this.acc = createVector(0,0.1);

		this.r = 20;
	}

	update(lineSegment){
		let old_pos = this.pos.copy();

		this.vel.add(this.acc);
		this.pos.add(this.vel);

		if (this.pos.y + this.r > height) {
			this.pos.y = height - this.r;
			this.vel.y *= -1;
		}
		if (this.pos.x + this.r > width) {
			this.pos.x = width - this.r;
			this.vel.x *= -1;
		}
		if (this.pos.x - this.r < 0) {
			this.pos.x = this.r;
			this.vel.x *= -1;
		}


		let vecToBall = p5.Vector.sub(this.pos, lineSegment.p1);
		let vecToEnd = p5.Vector.sub(lineSegment.p2, lineSegment.p1);

		let projectVector = vectorProject(vecToEnd, vecToBall);
		ellipse(lineSegment.p1.x + projectVector.x, lineSegment.p1.y + projectVector.y, 20);
		//print(projectVector.mag());

		let intersectPoint = createVector(lineSegment.p1.x + projectVector.x,
											lineSegment.p1.y + projectVector.y);

		//print(p5.Vector.cross(vecToEnd, vecToBall));

		if (p5.Vector.dist(intersectPoint, this.pos) <= this.r){

			let angle = this.vel.angleBetween(p5.Vector.sub(this.pos, intersectPoint));

			
			this.vel.rotate(2*angle);
			this.pos = old_pos.copy();
		}

	}

	draw(){
		ellipse(this.pos.x, this.pos.y, this.r*2);
	}
}

class LineSegment{
	constructor(x1,y1,x2,y2){
		this.p1 = createVector(x1,y1);
		this.p2 = createVector(x2,y2);
	}

	draw(){
		line(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
	}

}