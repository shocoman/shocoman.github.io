let player;

let tiles = [];
let tileSize = 25;
let tilesRows;
let tilesCols;

let mouseXdelta = 0;

let wallTexture1;
let wallPixels;

function preload() {
	wallTexture1 = loadImage('image.bmp');
}

function setup() {
	wallTexture1.loadPixels();
	wallPixels = wallTexture1.pixels;

	createCanvas(600, 400);
	tilesRows = height / tileSize;
	tilesCols = width / tileSize;

	for (let i = 0; i < tilesRows; i++) {
		for (let j = 0; j < tilesCols; j++) {
			tiles.push(new Tile(tileSize * j, tileSize * i, tileSize, 'empty', color(random(255), random(255), random(255))));
		}
	}

	createRoom();

	//player = new Player(width / 2 + 15, height / 2 + 15);
	// player = new Player(316.3, 154.9);
	player = new Player(316.3, 208.2);

	lockPointer();
}

function lockPointer() {
	canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;

	window.addEventListener('click', () => {
		canvas.requestPointerLock();
	});
}

function mouseMoved(e) {
	mouseXdelta = e.movementX;
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

	fill(50, 100, 250);
	rect(0, 0, width, height / 2);
	drawFloor();


	tiles.forEach(tile => {
		tile.draw();
	});

	player.update();
	player.draw();

	mouseXdelta = 0;
}

function createRoom() {
	//#region tileSize = 25
	for (let i = 0; i < 10; i++) {
		tiles[tilesCols * 3 + i + 8].tileType = 'wall';
		tiles[tilesCols * 12 + i + 8].tileType = 'wall';
		tiles[tilesCols * (3 + i) + 7].tileType = 'wall';
		tiles[tilesCols * (3 + i) + 18].tileType = 'wall';

		tiles[tilesCols * 2 + i + 8].tileType = 'wall';
		tiles[tilesCols * 13 + i + 8].tileType = 'wall';
		tiles[tilesCols * (3 + i) + 6].tileType = 'wall';
		tiles[tilesCols * (3 + i) + 19].tileType = 'wall';
	}
	// endregion

	// for (let i = 0; i < 6; i++) {
	// 	tiles[tilesCols * 1 + i + 3].tileType = 'wall';
	// 	tiles[tilesCols * 6 + i + 3].tileType = 'wall';
	// 	tiles[tilesCols * (1 + i) + 2].tileType = 'wall';
	// 	tiles[tilesCols * (1 + i) + 9].tileType = 'wall';

	// 	// tiles[tilesCols * 2 + i + 8].tileType = 'wall';
	// 	// tiles[tilesCols * 13 + i + 8].tileType = 'wall';
	// 	// tiles[tilesCols * (3 + i) + 6].tileType = 'wall';
	// 	// tiles[tilesCols * (3 + i) + 19].tileType = 'wall';
	// }
}

function isBetween(num, b1, b2) {
	return min(b1, b2) <= num && num <= max(b1, b2);
}

function quadrant(angle) {
	if (isBetween(angle, 0, -PI / 2)) {
		return 1;
	} else if (isBetween(angle, -PI / 2, -PI)) {
		return 2;
	} else if (isBetween(angle, PI, PI / 2)) {
		return 3;
	} else {
		return 4;
	}
}

function wolfDda(x0, y0, directionVector) {
	let maxDist = 20;
	let directionAngle = directionVector.heading();

	hdx = 1;
	hdy = tan(directionAngle);

	vdx = tan(PI / 2 - directionAngle);
	vdy = 1;

	// calculating first X and Y axisintercepts
	let firstXInterceptX;
	let firstXInterceptY;
	let firstYInterceptX;
	let firstYInterceptY;
	switch (quadrant(directionAngle)) {
		case 1:
			vdx *= -1;
			vdy *= -1;

			firstXInterceptX = ceil(x0);
			firstXInterceptY = y0 + (firstXInterceptX - x0) * hdy;

			firstYInterceptY = floor(y0);
			firstYInterceptX = x0 + (firstYInterceptY - y0) * -vdx;
			break;

		case 2:
			hdx *= -1;
			hdy *= -1;

			vdx *= -1;
			vdy *= -1;

			firstXInterceptX = floor(x0);
			firstXInterceptY = y0 + (firstXInterceptX - x0) * -hdy;

			firstYInterceptY = floor(y0);
			firstYInterceptX = x0 + (firstYInterceptY - y0) * -vdx;
			break;
		case 3:
			hdx *= -1;
			hdy *= -1;

			firstXInterceptX = floor(x0);
			firstXInterceptY = y0 + (firstXInterceptX - x0) * -hdy;

			firstYInterceptY = ceil(y0);
			firstYInterceptX = x0 + (firstYInterceptY - y0) * vdx;
			break;
		case 4:
			firstXInterceptX = ceil(x0);
			firstXInterceptY = y0 + (firstXInterceptX - x0) * hdy;

			firstYInterceptY = ceil(y0);
			firstYInterceptX = x0 + (firstYInterceptY - y0) * vdx;
			break;
	}

	let firstIntersectSide = getIntersectionSide(x0, y0, directionVector);
	let vertical = firstIntersectSide == 'top' || firstIntersectSide == 'bottom';
	for (let i = 0, j = 0; i + j < maxDist; ) {
		fill(200, 0, 0);
		stroke(200, 0, 0);

		let currentX;
		let currentY;

		if (!vertical) {
			// x intercept
			let hx = firstXInterceptX + hdx * i;
			let hy = firstXInterceptY + hdy * i;

			//text(i + j, hx * tileSize + 10, hy * tileSize - 10);

			currentX = hx;
			currentY = hy;
			//circle(currentX * tileSize, currentY * tileSize, 5);

			if (floor(firstXInterceptY + hdy * i) != floor(firstXInterceptY + hdy * (i + 1))) {
				vertical = true;
			}
			i++;

			if (isBetween(directionAngle, PI / 2, -PI / 2)) {
				currentX = floor(currentX);
			} else {
				currentX = floor(currentX - 1);
			}

			let currentTile = tiles[floor(currentX) + floor(currentY) * tilesCols];
			if (currentTile && currentTile.tileType == 'wall') {
				//circle(hx * tileSize, hy * tileSize, 5);
				currentTile.active = true;

				return { x: hx, y: hy, tileLoc: { x: currentX, y: currentY }, dir: directionVector };
			}
		} else {
			// y intercept
			let vx = firstYInterceptX + vdx * j;
			let vy = firstYInterceptY + vdy * j;

			//text(i + j, vx * tileSize + 10, vy * tileSize - 10);

			currentX = vx;
			currentY = vy;
			//circle(currentX * tileSize, currentY * tileSize, 5);

			let currentTileX = floor(firstYInterceptX + vdx * j);
			let nextTileX = floor(firstYInterceptX + vdx * (j + 1));
			if (currentTileX != nextTileX) {
				vertical = false;
			}
			j++;

			if (directionAngle >= 0) {
				currentY = floor(currentY);
			} else {
				currentY = floor(currentY - 1);
			}

			let currentTile = tiles[floor(currentX) + floor(currentY) * tilesCols];
			if (currentTile && currentTile.tileType == 'wall') {
				//circle(vx * tileSize, vy * tileSize, 5);
				currentTile.active = true;

				return { x: vx, y: vy, tileLoc: { x: currentX, y: currentY }, dir: directionVector };
			}
		}

		//print(i, j);
	}
}

function getIntersectionSide(x0, y0, direction) {
	let vecCrossMult = function(v1, v2) {
		return v1.x * v2.y - v1.y * v2.x;
	};

	let curTile = tiles[floor(x0) + floor(y0) * tilesCols];

	let x = x0 * tileSize;
	let y = y0 * tileSize;
	let vecUpLeft = createVector(curTile.x - x, curTile.y - y);
	let vecBottomLeft = createVector(curTile.x - x, curTile.y + tileSize - y);
	let vecBottomRight = createVector(curTile.x + tileSize - x, curTile.y + tileSize - y);
	let vecUpRight = createVector(curTile.x + tileSize - x, curTile.y - y);

	if (vecUpLeft.angleBetween(direction) < vecUpLeft.angleBetween(vecUpRight) && vecCrossMult(vecUpLeft, direction) * vecCrossMult(vecUpLeft, vecUpRight) >= 0) {
		return 'top';
	} else if (vecBottomLeft.angleBetween(direction) < vecBottomLeft.angleBetween(vecBottomRight) && vecCrossMult(vecBottomLeft, direction) * vecCrossMult(vecBottomLeft, vecBottomRight) >= 0) {
		return 'bottom';
	} else if (vecUpRight.angleBetween(direction) < vecUpRight.angleBetween(vecBottomRight) && vecCrossMult(vecUpRight, direction) * vecCrossMult(vecUpRight, vecBottomRight) >= 0) {
		return 'right';
	} else {
		return 'left';
	}
}

class Player {
	constructor(x, y, dir) {
		this.pos = createVector(x, y);
		this.dir = createVector(0, -1);

		this.walkSpeed = 100;
		this.rotateSpeed = PI / 64;

		this.fov = PI / 3;
	}

	castRays() {
		strokeWeight(3);

		stroke(0, 255, 0);
		// let otherDir = p5.Vector.mult(this.dir.copy(), 40);
		// otherDir.rotate(-this.fov / 2);
		// line(this.pos.x, this.pos.y, this.pos.x + otherDir.x, this.pos.y + otherDir.y);
		// otherDir.rotate(this.fov);
		// line(this.pos.x, this.pos.y, this.pos.x + otherDir.x, this.pos.y + otherDir.y);

		for (let i = -this.fov / 2; i <= this.fov / 2; i += this.fov / 100) {
			let ray = this.dir.copy();
			ray.rotate(i);
			//line(this.pos.x, this.pos.y, this.pos.x + ray.x, this.pos.y + ray.y);

			let intersectCoords = wolfDda(this.pos.x / tileSize, this.pos.y / tileSize, ray);
			if (!intersectCoords) continue;
			//circle(intersectCoords.x, intersectCoords.y, 1);

			//d = dx * cos(𝛽) − dy * sin(𝛽)
			// let d = (intersectCoords.x - this.pos.x) * cos() - (intersectCoords.y - this.pos.y) * sin();
			let d = dist(intersectCoords.x * tileSize, intersectCoords.y * tileSize, this.pos.x, this.pos.y) * cos(this.dir.angleBetween(ray));
			let wallHeight = 5000 / d;

			//line(((i + this.fov / 2) * width) / this.fov, height / 2 - wallHeight, ((i + this.fov / 2) * width) / this.fov, height / 2 + wallHeight);

			let currentTile = tiles[floor(intersectCoords.tileLoc.x) + floor(intersectCoords.tileLoc.y) * tilesCols];
			let currentTileX = ((i + this.fov / 2) * width) / this.fov;
			currentTile.drawLine(currentTileX, wallHeight, intersectCoords, this.pos.x, this.pos.y);
		}

		// let ray = this.dir.copy().setMag(400);
		// line(this.pos.x, this.pos.y, this.pos.x + ray.x, this.pos.y + ray.y);
		// let pnt = wolfDda(this.pos.x / tileSize, this.pos.y / tileSize, ray);
		// if (!pnt) return;
		// circle(pnt.x * tileSize, pnt.y * tileSize, 3);
		// print(pnt.x * tileSize, pnt.y * tileSize);
	}

	update() {
		this.controls();
	}

	controls() {
		let perpenVector = function(vec) {
			return createVector(-vec.y, vec.x);
		};

		//#region FPS-like controls
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

		//#endregion

		//#region top-down shooter controls
		// if (keyIsDown(UP_ARROW) || keyIsDown(unchar('W'))) {
		// 	this.pos.y -= (this.walkSpeed * deltaTime) / 1000;
		// } else if (keyIsDown(DOWN_ARROW) || keyIsDown(unchar('S'))) {
		// 	this.pos.y += (this.walkSpeed * deltaTime) / 1000;
		// }

		// if (keyIsDown(LEFT_ARROW) || keyIsDown(unchar('A'))) {
		// 	this.pos.x -= (this.walkSpeed * deltaTime) / 1000;
		// } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(unchar('D'))) {
		// 	this.pos.x += (this.walkSpeed * deltaTime) / 1000;
		// }

		// this.dir.x = mouseX - this.pos.x;
		// this.dir.y = mouseY - this.pos.y;
		//#endregion
	}

	draw() {
		fill(0, 255, 0);
		strokeWeight(3);
		circle(this.pos.x, this.pos.y, 10);

		this.castRays();
	}
}

class Tile {
	constructor(x, y, size, type, c) {
		this.x = x;
		this.y = y;
		this.s = size;
		this.tileType = type;
		this.active = false;
		this.color = c;
	}

	draw() {
		if (this.tileType == 'empty') {
			strokeWeight(0);
		} else if (this.tileType == 'wall') {
			strokeWeight(2);
		}
		stroke(0);

		if (this.active) fill(0, 120, 120);
		else fill(255);
		//rect(this.x, this.y, this.s, this.s);

		this.active = false;
	}

	drawLine(x, wallHeight, touchCoords, px, py) {
		let getIntersectionSide = function(tileX, tileY, touchX, touchY) {
			let vecCrossMult = function(v1, v2) {
				return v1.x * v2.y - v1.y * v2.x;
			};

			let curTile = tiles[floor(tileX) + floor(tileY) * tilesCols];

			let x = floor(tileX) * tileSize + tileSize / 2;
			let y = floor(tileY) * tileSize + tileSize / 2;

			let vecUpLeft = createVector(curTile.x - x, curTile.y - y);
			let vecBottomLeft = createVector(curTile.x - x, curTile.y + tileSize - y);
			let vecBottomRight = createVector(curTile.x + tileSize - x, curTile.y + tileSize - y);
			let vecUpRight = createVector(curTile.x + tileSize - x, curTile.y - y);
			let direction = createVector(touchX * tileSize - x, touchY * tileSize - y);

			if (vecUpLeft.angleBetween(direction) < vecUpLeft.angleBetween(vecUpRight) && vecCrossMult(vecUpLeft, direction) * vecCrossMult(vecUpLeft, vecUpRight) >= 0) {
				return 'top';
			} else if (vecBottomLeft.angleBetween(direction) < vecBottomLeft.angleBetween(vecBottomRight) && vecCrossMult(vecBottomLeft, direction) * vecCrossMult(vecBottomLeft, vecBottomRight) >= 0) {
				return 'bottom';
			} else if (vecUpRight.angleBetween(direction) < vecUpRight.angleBetween(vecBottomRight) && vecCrossMult(vecUpRight, direction) * vecCrossMult(vecUpRight, vecBottomRight) >= 0) {
				return 'right';
			} else {
				return 'left';
			}
		};

		let side = getIntersectionSide(touchCoords.tileLoc.x, touchCoords.tileLoc.y, touchCoords.x, touchCoords.y);

		let alpha = 255;
		strokeCap(SQUARE);
		strokeWeight(10);
		if (side == 'bottom') {
			alpha = map(abs(touchCoords.x * this.s - this.x) / this.s, 0, 1, 0, 255);
		} else if (side == 'top') {
			alpha = map(abs(touchCoords.x * this.s - this.x) / this.s, 0, 1, 255, 0);
		} else if (side == 'left') {
			alpha = map(abs(touchCoords.y * this.s - this.y) / this.s, 0, 1, 0, 255);
		} else if (side == 'right') {
			alpha = map(abs(touchCoords.y * this.s - this.y) / this.s, 0, 1, 255, 0);
		}

		stroke(color(this.color.levels[0], this.color.levels[1], this.color.levels[2], alpha));
		line(x, height / 2 - wallHeight, x, height / 2 + wallHeight);

		if (mouseIsPressed) {
			print(side);
		}
	}
}

function drawColumn(img, ncolFrom, ncolTo, finalHeight) {
	let acc = 0;
	let i = 0;
	
	for (let p = 0; p < img.height; p++) {
		let ncol = floor(ncolFrom * img.width);
		ncol -= ncol % 4;
		let nrow = p * img.width * 4;
		stroke(img.pixels[4 * ncol + nrow], img.pixels[4 * ncol + 1 + nrow], img.pixels[4 * ncol + 2 + nrow], 255);

		acc += finalHeight / img.height;

		line(ncolTo, height / 2 - finalHeight / 2 + i, ncolTo, height / 2 - finalHeight / 2 + i + ceil(acc));
		i += ceil(acc);
		acc -= ceil(acc);
	}
}
