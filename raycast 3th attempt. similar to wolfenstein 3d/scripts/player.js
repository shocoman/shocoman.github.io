class Player {
	constructor(x, y, dir) {
		this.pos = createVector(x, y);
		this.dir = createVector(0, -1);

		this.walkSpeed = 100;
		this.rotateSpeed = PI / 64;

		this.fov = PI / 3;
	}

	castRays() {
		for (let i = -this.fov / 2; i <= this.fov / 2; i += this.fov / 75) {
			let ray = this.dir.copy();
			ray.rotate(i);

			let intersectCoords = wolfDda(this.pos.x / tileSize, this.pos.y / tileSize, ray);
			if (!intersectCoords) continue;

			let d = dist(intersectCoords.x * tileSize, intersectCoords.y * tileSize, this.pos.x, this.pos.y) * cos(this.dir.angleBetween(ray));
			let wallHeight = 10000 / d;

			let currentTile = tiles[floor(intersectCoords.tileLoc.x) + floor(intersectCoords.tileLoc.y) * tilesCols];
			let currentTileX = map(i, -this.fov / 2, this.fov / 2, 0, width);
			currentTile.drawLine(currentTileX, wallHeight, intersectCoords, this.pos.x, this.pos.y);
		}
	}

	update() {
		this.controls();
		this.castRays();
	}

	controls() {
		let perpenVector = function(vec) {
			return createVector(-vec.y, vec.x);
		};

		if (keyIsDown(UP_ARROW) || keyIsDown(unchar('W'))) {
			this.pos.add(p5.Vector.mult(this.dir, (this.walkSpeed * deltaTime) / 1000));
		} else if (keyIsDown(DOWN_ARROW) || keyIsDown(unchar('S'))) {
			this.pos.sub(p5.Vector.mult(this.dir, (this.walkSpeed * deltaTime) / 1000));
		}

		if (keyIsDown(unchar('A'))) {
			this.pos.sub(p5.Vector.mult(perpenVector(this.dir), (this.walkSpeed * deltaTime) / 1000));
		} else if (keyIsDown(unchar('D'))) {
			this.pos.add(p5.Vector.mult(perpenVector(this.dir), (this.walkSpeed * deltaTime) / 1000));
		}

		if (keyIsDown(LEFT_ARROW)) {
			this.dir.rotate(-this.rotateSpeed);
		} else if (keyIsDown(RIGHT_ARROW)) {
			this.dir.rotate(this.rotateSpeed);
		}

		this.dir.rotate(this.rotateSpeed * mouseXdelta * 0.1);
	}

}
