enum enemyState {
	Walking,
	Rising,
	Falling,
	Death
}

enum enemyDirection {
	Left,
	Right,
}

enum enemyMoving {
	None,
	Left,
	Right,
}

class Enemy {
	pos: p5.Vector;
	vel: p5.Vector;
	acc: p5.Vector;
	size: p5.Vector;

	animManager: AnimationManager;

	animState: enemyState;
	moving: enemyMoving;

	runSpeed: number;

	collisionHPadding: number = 14;

	isBouncing = true;
	bouncedTimes = 3;

	constructor(anim: AnimationManager) {
		this.pos = createVector((width * 3) / 5, height);
		this.vel = createVector(0, 0);
		this.acc = createVector(0, 0.5);
		this.size = createVector(tileWidth * 2 - 5, tileHeight * 2);

		this.moving = enemyMoving.Left;
		this.animState = enemyState.Falling;
		this.animManager = anim;

		this.runSpeed = 1.5; //1.5;
		this.vel.x = -this.runSpeed;
		anim.setCurrentAnimation('fall');
	}

	update(map: number[][]) {
		this.moving_routine(map);
		this.isGapAhead();
	}

	draw() {
		if (this.moving == enemyMoving.Left) {
			this.animManager.isFlipped = true;
		} else if (this.moving == enemyMoving.Right) {
			this.animManager.isFlipped = false;
		}

		if (this.animState == enemyState.Death){
			this.animManager.setCurrentAnimation('death');
		} else if (this.animManager.currentAnimation == 'walk' && this.animState == enemyState.Rising) {
			this.animManager.setCurrentAnimation('rise');
		} else if (this.animState == enemyState.Falling) {
			// this.animManager.setCurrentAnimation('fall');
		} else if (this.animState == enemyState.Walking) {
			this.animManager.setCurrentAnimation('walk');
			this.vel.x = this.runSpeed * (this.moving == enemyMoving.Left ? -1 : 1);
		}

		this.animManager.playCurrentAnimation(this.pos.x, this.pos.y, this.size.x, this.size.y);
	}

	moving_routine(map: number[][]) {


		// if (this.vel.y < 0) {
		// 	this.animState = enemyState.Rising;
		// }
		// else if (this.vel.y > 0) {
		// 	this.animState = enemyState.Falling;
		// }

		this.vel.add(this.acc);

		this.pos.x += this.vel.x;
		this.collision_detection(map, 'x');
		this.pos.y += this.vel.y;
		this.collision_detection(map, 'y');

		this.vel.x = constrain(this.vel.x, -100 * this.runSpeed, 100 * this.runSpeed);
		this.vel.y = constrain(this.vel.y, -15, 15);
	}

	collision_detection(map: number[][], axis: string) {
		let leftTile = floor((this.pos.x + this.collisionHPadding) / tileWidth);
		let rightTile = floor((this.pos.x + this.size.x - this.collisionHPadding) / tileWidth);
		let topTile = floor(this.pos.y / tileHeight);
		let bottomTile = floor((this.pos.y + this.size.y) / tileHeight);

		let collisionHappened: boolean = false;
		let velOnCollision: p5.Vector = null;

		for (let tileY = topTile; tileY <= bottomTile; tileY++) {
			for (let tileX = leftTile; tileX <= rightTile; tileX++) {
				if (isTileCollidable(tileY, tileX) && this.animState != enemyState.Death) {
					if (axis == 'y') {
						if (this.vel.y >= 0) {
							collisionHappened = true;

							this.pos.y = tileY * tileHeight - this.size.y - 1;
							this.animState = enemyState.Walking;

							velOnCollision = velOnCollision ?? this.vel.copy();
							this.vel.y = 0;
						} else {
							this.pos.y = (tileY + 1) * tileHeight + 1;
							this.vel.y = 0;
						}
					} else if (axis == 'x') {
						if (this.vel.x > 0) {
							this.pos.x = tileX * tileWidth - (this.size.x - this.collisionHPadding) - 1;
							this.vel.x = 0;
						} else if (this.vel.x < 0) {
							this.pos.x = (tileX + 1) * tileWidth + 1 - this.collisionHPadding;
							this.vel.x = 0;
						}
					}
				}
			}
		}


		this.letsBounce(collisionHappened, velOnCollision);

		return collisionHappened;
	}


	letsBounce(collisionHappened: boolean, velOnCollision: p5.Vector) {
		if (this.isBouncing && collisionHappened) {

			if (this.bouncedTimes == 0) {
				this.bouncedTimes = 3;
				this.isBouncing = false;

				this.animState = enemyState.Walking;
				this.vel.y = 0;
			} else {
				this.vel.y = -velOnCollision.y * 0.8;
				this.animState = enemyState.Falling;
				this.bouncedTimes -= 1;
			}

		}
	}


	isGapAhead() {
		if (this.animState != enemyState.Walking) return;

		let leftTile = floor((this.pos.x + this.collisionHPadding) / tileWidth);
		let rightTile = floor((this.pos.x + this.size.x - this.collisionHPadding) / tileWidth);
		let topTile = floor(this.pos.y / tileHeight);
		let bottomTile = floor((this.pos.y + this.size.y) / tileHeight);

		if (this.moving == enemyMoving.Right && !isTileCollidable(bottomTile + 1, rightTile + 1)) {
			this.moving = enemyMoving.Left;

			this.vel.x = -this.runSpeed;
		} else if (this.moving == enemyMoving.Left && !isTileCollidable(bottomTile + 1, rightTile - 1)) {
			this.moving = enemyMoving.Right;
			this.vel.x = this.runSpeed;
		}
	}




	saveFrame() {
		return {
			position: this.pos.copy(),
			velocity: this.vel.copy(),
			acc: this.acc.copy(),
			size: this.size.copy(),

			animManager: this.animManager.save(),

			animState: this.animState,
			moving: this.moving
		};
	}

	loadFrame(frame: any) {
		this.pos = frame.position.copy();
		this.vel = frame.velocity.copy();
		this.acc = frame.acc.copy();
		this.size = frame.size.copy();

		this.animManager.load(frame.animManager);

		this.animState = frame.animState;
		this.moving = frame.moving;
	}
}
