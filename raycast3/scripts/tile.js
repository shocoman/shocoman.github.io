class Tile {
	constructor(x, y, size, type, texture) {
		this.x = x;
		this.y = y;
		this.s = size;
		this.tileType = type;
		this.active = false;
		this.texture = texture;
	}

	draw() {

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

		strokeCap(SQUARE);
		strokeWeight(12);
		if (side == 'bottom') {
			this.drawColumn(this.texture, abs(touchCoords.x * this.s - this.x) / this.s, x, wallHeight);
		} else if (side == 'top') {
			this.drawColumn(this.texture, 1 - abs(touchCoords.x * this.s - this.x) / this.s, x, wallHeight);
		} else if (side == 'left') {
			this.drawColumn(this.texture, abs(touchCoords.y * this.s - this.y) / this.s, x, wallHeight);
		} else if (side == 'right') {
			this.drawColumn(this.texture, 1 - abs(touchCoords.y * this.s - this.y) / this.s, x, wallHeight);
		}
	}

	drawColumn(img, ncolFrom, ncolTo, finalHeight) {
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
}
