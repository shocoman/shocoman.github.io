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

function vecCrossMult(v1, v2) {
	return v1.x * v2.y - v1.y * v2.x;
}

function getIntersectionSide(x0, y0, direction) {
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
