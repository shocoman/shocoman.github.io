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

    animManager: AnimationManager;

    animState: playerState;
    moving: playerMoving;
    direction: playerDirection;
    type: string;

    walkSpeed: number;
    jumpVelocity: number;

    doubleJump: boolean;

    constructor(anim: AnimationManager) {
        // super();

        this.pos = createVector(width / 2, height * 2 / 3);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0.5);
        this.size = createVector(tileWidth * 2 - 5, tileHeight * 2);

        this.moving = playerMoving.None;
        this.direction = playerDirection.Right;
        this.animState = playerState.Falling;
        this.type = 'PLAYER';
        this.animManager = anim;

        this.walkSpeed = 6;
        this.jumpVelocity = 15;

        this.doubleJump = true;
    }

    update(map: number[][]) {

        this.moving_routine(map);
    }

    draw() {
        if (this.vel.x > 0) {
            this.animManager.is_flipped = false;
        }
        if (this.vel.x < 0) {
            this.animManager.is_flipped = true;
        }

        if (this.animState == playerState.Jumping) {
            if (this.vel.y < 0) {
                this.animManager.show('jump', this.pos, this.size, 0);
            } else {
                this.animManager.show('jump', this.pos, this.size, 1);
            }
        } else if (this.vel.x > 0) {
            this.animManager.is_flipped = false;
            this.animManager.show('run', this.pos, this.size);
        } else if (this.vel.x == 0)
            this.animManager.show('idle', this.pos, this.size);
        else {
            this.animManager.is_flipped = true;
            this.animManager.show('run', this.pos, this.size);
        }
    }

    moving_routine(map: number[][]) {
        this.vel.add(this.acc);

        this.pos.x += this.vel.x;
        this.collision_detection(map, 'x');
        this.pos.y += this.vel.y;
        this.collision_detection(map, 'y');

        if (this.moving == playerMoving.Right) {
            this.vel.x = +this.walkSpeed;
        } else if (this.moving == playerMoving.Left) {
            this.vel.x = -this.walkSpeed;
        } else if (this.moving == playerMoving.None) {
            this.vel.x = 0;
        }

        this.vel.y = constrain(this.vel.y, -10, 10);
    }


    collision_detection(map: number[][], axis: string) {
        let leftTile = floor(this.pos.x / tileWidth);
        let rightTile = floor((this.pos.x + this.size.x) / tileWidth);
        let topTile = floor(this.pos.y / tileHeight);
        let bottomTile = floor((this.pos.y + this.size.y) / tileHeight);

        for (let tileY = topTile; tileY <= bottomTile; tileY++) {
            for (let tileX = leftTile; tileX <= rightTile; tileX++) {
                if (map[tileY] != undefined && this.isBlockStopable(map[tileY][tileX])) {
                    if (axis == 'y') {
                        if (this.vel.y >= 0) {
                            this.pos.y = tileY * tileHeight - this.size.y - 1;
                            this.animState = playerState.Walking;
                            this.vel.y = 0;
                            this.doubleJump = true;
                        } else {
                            this.pos.y = (tileY + 1) * tileHeight + 1;
                            this.vel.y = -0.1;
                        }
                    } else if (axis == 'x') {
                        if (this.vel.x > 0) {
                            this.pos.x = tileX * tileWidth - this.size.x - 1;
                            this.vel.x = 0;
                        } else if (this.vel.x < 0) {
                            this.pos.x = (tileX + 1) * tileWidth + 1;
                            this.vel.x = 0;
                        }
                    }
                }
            }
        }
    }


    isBlockStopable(num: number): boolean {
        let stopBlockNums = [196, 474, 475, 200, 709, 710, 709, 710, 711, 713, 714, 709, 710, 711, 717, 709, 710, 711, 729, 730, 731,
            468, 469, 470, 526, 527, 528,
            119, 120, 121, 122, 123, 124, 125];

        return stopBlockNums.find((e: number) => e == num) != undefined;
    }


    keyPressed(e: KeyboardEvent) {
        if (keyCode == LEFT_ARROW) {
            this.moving = playerMoving.Left;
        } else if (keyCode == RIGHT_ARROW) {
            this.moving = playerMoving.Right;
        }

        if (keyCode == UP_ARROW && (this.animState == playerState.Walking || this.doubleJump)) {

            if (this.animState == playerState.Jumping)
                this.doubleJump = false;

            this.vel.y = -this.jumpVelocity;
            this.animState = playerState.Jumping;

        }
    }

    keyReleased(e: KeyboardEvent) {
        if (keyCode == LEFT_ARROW && this.moving == playerMoving.Left) {
            this.moving = playerMoving.None;
        } else if (keyCode == RIGHT_ARROW && this.moving == playerMoving.Right) {
            this.moving = playerMoving.None;
        }
    }

}