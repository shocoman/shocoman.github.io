let player;
let mouseXdelta = 0;

let tiles = [];
let tileSize = 25;
let tilesRows;
let tilesCols;

let texturesSheet;
let textures = [];

let things = [];
let starSprite;

function preload() {
	texturesSheet = loadImage('spritesheet.png');
	starSprite = loadImage('starSprite.png');
}

function initTextures(nRows, nCols) {
	for (let i = 0; i < 6; i++) {
		let newTexture = createImage(64, 64);
		newTexture.copy(texturesSheet, 0, 0 + 64 * i, 64, 64, 0, 0, 64, 64);
		newTexture.loadPixels();
		textures.push(newTexture);
	}

	for (let i = 0; i < nRows; i++) {
		for (let j = 0; j < nCols; j++) {
			tiles.push(new Tile(tileSize * j, tileSize * i, tileSize, 'empty', textures[floor(random(6))]));
		}
	}
}

function setup() {
	createCanvas(600, 400);
	tilesRows = height / tileSize;
	tilesCols = width / tileSize;
	frameRate(60);

	initTextures(tilesRows, tilesCols);
	createRoom();
	player = new Player(316.3, 208.2);
	lockPointer();
	// things.push(new Thing(width / 2 - 30, height / 2 - 50, starSprite));
	// things.push(new Thing(width / 2 + 30, height / 2 - 50, starSprite));

	strokeCap(SQUARE);
	strokeWeight(8);
}

function draw() {
	background(220);
	drawSkyAndFloor();
	player.update();
	mouseXdelta = 0;
	things.forEach(thing => {
		thing.update();
		thing.draw();
	});
}

class Thing {
	constructor(x, y, t, dir) {
		this.pos = createVector(x, y);
		this.dir = dir;
		this.texture = t;
		this.speed = 5
	}

	isVisible(vecToThing) {
		if (vecToThing.angleBetween(player.dir) < player.fov) {
			return true;
		} else {
			return false;
		}
	}

	update() {
		this.pos.add(p5.Vector.mult(this.dir, this.speed));
	}

	draw() {
		let vecToThing = p5.Vector.sub(this.pos, player.pos);
		let vecL = vecToThing.copy().rotate(-player.fov / 2);
		let vecR = vecToThing.copy().rotate(player.fov / 2);
		if (this.isVisible(vecToThing) && vecCrossMult(vecL, player.dir) * vecCrossMult(vecL, vecR) >= 0) {
			let col = map(vecL.angleBetween(player.dir), 0, player.fov, width, 0);
			let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);

			let size = 5000 / d;
			image(this.texture, floor(col), floor(height / 2 - size / 2), floor(size), floor(size));
		}
	}
}

function createRoom() {
	for (let i = 0; i < 10; i++) {
		tiles[tilesCols * 3 + i + 8].tileType = 'wall';
		tiles[tilesCols * 12 + i + 8].tileType = 'wall';
		tiles[tilesCols * (3 + i) + 7].tileType = 'wall';
		tiles[tilesCols * (3 + i) + 18].tileType = 'wall';

		tiles[tilesCols * 2 + i + 8].tileType = 'wall';
		tiles[tilesCols * 13 + i + 8].tileType = 'wall';
		tiles[tilesCols * (3 + i) + 6].tileType = 'wall';
		tiles[tilesCols * (3 + i) + 19].tileType = 'wall';

		tiles[tilesCols * 7 + i + 8].tileType = 'wall';
	}

	tiles[tilesCols * 7 + 4 + 8].tileType = 'empty';
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

function drawSkyAndFloor() {
	fill(50, 100, 250);
	rect(0, 0, width, height / 2);

	stroke(80, 70, 40);
	let color1 = color('#4d3319');
	let color2 = color('#bf8040');
	for (let i = height / 2; i < height; i++) {
		stroke(lerpColor(color1, color2, (i - height / 2) / (height / 2)));
		line(0, floor(i), width, floor(i));
	}
}

function mousePressed() {
	things.push(new Thing(player.pos.x, player.pos.y - 5, starSprite, player.dir));
}