enum PlayerState {
    Running,
    Jumping
}

class Player {
    pos: p5.Vector;
    vel: p5.Vector;
    acc: p5.Vector;
    size: p5.Vector;
    playerState: PlayerState;
    animManager: AnimationManager;

    constructor(position: p5.Vector, size: p5.Vector, animManager: AnimationManager) {
        this.pos = position;
        this.vel = createVector();
        this.acc = createVector(0, 1);
        this.size = size;

        this.animManager = animManager;

        this.playerState = PlayerState.Jumping;
    }

    jump() {
        this.playerState = PlayerState.Jumping;
        let jumpForce = createVector(0, -20);
        this.vel.add(jumpForce);
    }

    update(obstacles: Obstacle[]) {
        this.vel.add(this.acc);
        this.pos.add(this.vel);

        if (this.pos.y + this.size.y > height - floorLevel) {
            this.playerState = PlayerState.Running;
            this.pos.y = (height - floorLevel) - this.size.y;
            this.vel.y = 0;
        }

        if (this.obstacleCollision(obstacles)){
            console.log("Game Over!");
        }
    }

    obstacleCollision(obstacles: Obstacle[]): boolean {
        for (const b of obstacles) {
            if (AABBcollision(this.pos, this.size, b.pos, b.size)) {
                return true;
            }
        }

        return false;
    }

    draw() {
        if (this.playerState == PlayerState.Jumping) {
            if (this.vel.y < 0) {
                this.animManager.show('jump', this.pos, this.size, 0);
            } else {
                this.animManager.show('jump', this.pos, this.size, 1);
            }
        } else if (this.playerState == PlayerState.Running) {
            this.animManager.show('run', this.pos, this.size);
        }
    }
}
