let player;

let tiles = [];
let tileSize = 25;
let tilesRows;
let tilesCols;

let mouseXdelta = 0;


let texturesSheet;

let textures = [];

function preload() {
	texturesSheet = loadImage('spritesheet.png');
}

function setup() {
	for (let i = 0; i < 6; i++) {
		let newTexture = createImage(64, 64);
		newTexture.copy(texturesSheet, 0, 0 + 64 * i, 64, 64, 0, 0, 64, 64);
		newTexture.loadPixels();
		textures.push(newTexture);
	}


	createCanvas(600, 400);
	tilesRows = height / tileSize;
	tilesCols = width / tileSize;


	for (let i = 0; i < tilesRows; i++) {
		for (let j = 0; j < tilesCols; j++) {
			tiles.push(new Tile(tileSize * j, tileSize * i, tileSize, 'empty', textures[ floor(random(6)) ]));
		}
	}

	createRoom();

	player = new Player(316.3, 208.2);

	lockPointer();
}

function draw() {
	background(220);


	drawSkyAndFloor();

	tiles.forEach(tile => {
		tile.draw();
	});

	player.update();
	player.draw();

	mouseXdelta = 0;
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
		line(0, i, width, i);
	}
}
