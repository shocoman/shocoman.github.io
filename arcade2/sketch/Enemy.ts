enum enemyState {
    Walking,
    Jumping,
    Falling
}

enum enemyDirection {
    Left,
    Right
}

enum enemyMoving {
    None,
    Left,
    Right
}

class Enemy {

    pos: p5.Vector;
    vel: p5.Vector;
    acc: p5.Vector;
    size: p5.Vector;

    animManager: AnimationManager;

    animState: playerState;
    moving: enemyMoving;
    direction: enemyDirection;

    runSpeed: number;

    collisionHPadding: number = 14;

    constructor(anim: AnimationManager) {
        this.pos = createVector(width * 6 / 5, height);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0.5);
        this.size = createVector(tileWidth * 2 - 5, tileHeight * 2);

        this.moving = enemyMoving.None;
        this.direction = enemyDirection.Right;
        this.animState = playerState.Falling;
        this.animManager = anim;

        this.runSpeed = 6;
    }

    update(map: number[][]) {
        this.moving_routine(map);
    }

    draw() {
        if (this.moving == enemyMoving.Left) {
            this.animManager.isFlipped = true;

        } else if (this.moving == enemyMoving.Right) {
            this.animManager.isFlipped = false;
        }

        if (this.animState == playerState.Jumping) {
            this.animManager.setCurrentAnimation('jump');
        } else if (this.animState == playerState.Falling) {
            this.animManager.setCurrentAnimation('fall');
        } else if (this.moving == enemyMoving.Right || this.vel.x > 0) {
            this.animManager.setCurrentAnimation('run');
        } else if (this.moving == enemyMoving.None && this.vel.x == 0)
            this.animManager.setCurrentAnimation('idle');
        else if (this.moving == enemyMoving.Left || this.vel.x < 0) {
            this.animManager.setCurrentAnimation('run');
        }

        this.animManager.playCurrentAnimation(this.pos.x, this.pos.y, this.size.x, this.size.y);

        this.animManager.setSpeed('run', 2 / abs(this.vel.x)); // running animation speed depends on character's speed
    }

    moving_routine(map: number[][]) {

        if (this.direction == enemyDirection.Right){
            this.vel.x = this.runSpeed;
        } else {
            this.vel.x = -this.runSpeed;
        }

        this.vel.add(this.acc);

        this.pos.x += this.vel.x;
        this.collision_detection(map, 'x');
        this.pos.y += this.vel.y;
        this.collision_detection(map, 'y');

        this.vel.x = constrain(this.vel.x, -this.runSpeed, this.runSpeed);
        this.vel.y = constrain(this.vel.y, -10, 10);
    }


    collision_detection(map: number[][], axis: string) {
        let leftTile = floor((this.pos.x + this.collisionHPadding) / tileWidth);
        let rightTile = floor((this.pos.x + this.size.x - this.collisionHPadding) / tileWidth);
        let topTile = floor(this.pos.y / tileHeight);
        let bottomTile = floor((this.pos.y + this.size.y) / tileHeight);

        let collisionHappened: boolean = false;

        for (let tileY = topTile; tileY <= bottomTile; tileY++) {
            for (let tileX = leftTile; tileX <= rightTile; tileX++) {
                if (isTileCollidable(tileY, tileX)) {
                    if (axis == 'y') {
                        if (this.vel.y >= 0) {
                            collisionHappened = true;

                            this.pos.y = tileY * tileHeight - this.size.y - 1;

                            this.animState = playerState.Walking;
                            this.vel.y = 0;


                        } else {
                            this.pos.y = (tileY + 1) * tileHeight + 1;
                            this.vel.y = -0.1;
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

        return collisionHappened;
    }
}