enum playerState {
    Walking,
    Jumping,
    Falling
}

enum playerDirection {
    Left,
    Right
}

enum playerMoving {
    None,
    Left,
    Right
}

class Player {

    pos: p5.Vector;
    vel: p5.Vector;
    acc: p5.Vector;
    size: p5.Vector;

    animManager: NewAnimationManager;

    animState: playerState;
    moving: playerMoving;
    direction: playerDirection;

    runSpeed: number;
    jumpVelocity: number;

    doubleJump: boolean;

    collisionHPadding: number = 14;

    collisionHappenedLastTurn: boolean = false;
    collisionHappenedSecondFromLastTurn: boolean = false;

    constructor(anim: NewAnimationManager) {

        this.pos = createVector(width * 3 / 5, height);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0.5);
        this.size = createVector(tileWidth * 2 - 5, tileHeight * 2);

        this.moving = playerMoving.None;
        this.direction = playerDirection.Right;
        this.animState = playerState.Falling;
        this.animManager = anim;

        this.runSpeed = 6;
        this.jumpVelocity = 15;

        this.doubleJump = true;
    }

    update(map: number[][]) {

        this.moving_routine(map);
    }

    draw() {
        if (this.moving == playerMoving.Left) {
            this.animManager.isFlipped = true;

        } else if (this.moving == playerMoving.Right) {
            this.animManager.isFlipped = false;
        }

        if (this.animState == playerState.Jumping) {
            // this.animManager.draw('jump', this.pos.x, this.pos.y, this.size.x, this.size.y);
            this.animManager.setCurrentAnimation('jump');
        } else if (this.animState == playerState.Falling) {
            this.animManager.setCurrentAnimation('fall');
        } else if (this.moving == playerMoving.Right || this.vel.x > 0) {
            // this.animManager.draw('run', this.pos.x, this.pos.y, this.size.x, this.size.y);
            this.animManager.setCurrentAnimation('run');
        } else if (this.moving == playerMoving.None && this.vel.x == 0)
            // this.animManager.draw('idle', this.pos.x, this.pos.y, this.size.x, this.size.y);
            this.animManager.setCurrentAnimation('idle');
        else if (this.moving == playerMoving.Left || this.vel.x < 0) {
            // this.animManager.draw('run', this.pos.x, this.pos.y, this.size.x, this.size.y);

            this.animManager.setCurrentAnimation('run');
        }

        this.animManager.playCurrentAnimation(this.pos.x, this.pos.y, this.size.x, this.size.y);

        this.animManager.setSpeed('run', 2 / abs(this.vel.x)); // running animation speed depends on character's speed
    }

    moving_routine(map: number[][]) {
        this.vel.add(this.acc);

        this.pos.x += this.vel.x;
        this.collision_detection(map, 'x');
        this.pos.y += this.vel.y;
        let collisionHappened = this.collision_detection(map, 'y');

        if (!isRewinding) {
            this.collisionHappenedSecondFromLastTurn = this.collisionHappenedLastTurn;
            this.collisionHappenedLastTurn = collisionHappened;
            if (!this.collisionHappenedLastTurn && !this.collisionHappenedSecondFromLastTurn) {
                if (this.animState == playerState.Walking)
                    this.animState = playerState.Falling;
            }
        }

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
                if (map[tileY] != undefined && this.isBlockStopable(map[tileY][tileX])) {
                    if (axis == 'y') {
                        if (this.vel.y >= 0) {
                            collisionHappened = true;

                            this.pos.y = tileY * tileHeight - this.size.y - 1;
                            this.animState = playerState.Walking;
                            this.vel.y = 0;
                            this.doubleJump = true;

                            // friction effect
                            if (this.moving == playerMoving.None) {
                                if (abs(this.vel.x) < 0.01)
                                    this.vel.x = 0;
                                else
                                    this.vel.x /= 2;
                            }
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


    isBlockStopable(num: number): boolean {
        let stopBlockNums = [
            196, 474, 475, 200, 709, 710, 709, 710, 711, 713, 714, 709, 710, 711, 717, 709, 710, 711, 729, 730, 731,
            468, 469, 470, 526, 527, 528,
            119, 120, 121, 122, 123, 124, 125];

        return stopBlockNums.find((e: number) => e == num) != undefined;
    }

    jump() {
        if (this.animState == playerState.Jumping || this.animState == playerState.Falling) {
            this.doubleJump = false;
        }

        this.vel.y = -this.jumpVelocity;
        this.animState = playerState.Jumping;
        this.animManager.resetAnimation('jump');
        this.animManager.setCurrentAnimation('jump');
    }


    keyPressed(e: KeyboardEvent) {
        if (keyCode == LEFT_ARROW) {
            this.moving = playerMoving.Left;
            this.animManager.resetAnimation('run');

            this.acc.x = -0.2;
        } else if (keyCode == RIGHT_ARROW) {
            this.moving = playerMoving.Right;
            this.animManager.resetAnimation('run');

            this.acc.x = 0.2;
        }

        if (keyCode == UP_ARROW && (this.animState == playerState.Walking || this.doubleJump)) {
            this.jump();
        }
    }

    keyReleased(e: KeyboardEvent) {
        if (keyCode == LEFT_ARROW && this.moving == playerMoving.Left) {
            this.moving = playerMoving.None;
            this.acc.x = 0;
        } else if (keyCode == RIGHT_ARROW && this.moving == playerMoving.Right) {
            this.moving = playerMoving.None;
            this.acc.x = 0;
        } else if (key == ' ') {
            this.moving = playerMoving.None;
            this.acc.x = 0;
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
            moving: this.moving,
            direction: this.direction,
        }
    }

    loadFrame(frame: any) {
        this.pos = frame.position.copy(),
            this.vel = frame.velocity.copy(),
            this.acc = frame.acc.copy(),
            this.size = frame.size.copy(),

            this.animManager.load(frame.animManager),

            this.animState = frame.animState,
            this.moving = frame.moving,
            this.direction = frame.direction
    }
}