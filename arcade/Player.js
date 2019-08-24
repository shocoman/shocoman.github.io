states = {
    'WALKING': 0,
    'JUMPING': 1,
    'FALLING': 2
};


class Player extends Entity {

    constructor(anim) {
        super();
        this.moving = [];
        this.state = states.WALKING;
        this.type = 'PLAYER';
        this.anim_manager = anim;
    }

    draw() {

        if (this.vel.x > 0) {
            this.anim_manager.is_flipped = false;
        }
        if (this.vel.x < 0) {
            this.anim_manager.is_flipped = true;
        }


        if (this.state == states.JUMPING) {

            if (this.vel.y < 0) {
                this.anim_manager.show('jump', this.pos, this.size, 0);
            } else {
                this.anim_manager.show('jump', this.pos, this.size, 1);
            }

        } else if (this.vel.x > 0) {
            this.anim_manager.is_flipped = false;
            this.anim_manager.show('run', this.pos, this.size);
        } else if (this.vel.x == 0)
            this.anim_manager.show('idle', this.pos, this.size);
        else {
            this.anim_manager.is_flipped = true;
            this.anim_manager.show('run', this.pos, this.size);
        }

    }

    moving_routine(map) {
        this.vel.add(this.acc);

        this.pos.x += this.vel.x;
        this.collision_detection(map, 'x');
        this.pos.y += this.vel.y;
        this.collision_detection(map, 'y');

        if (this.moving.right) {
            this.vel.x = +6;
        } else if (this.moving.left) {
            this.vel.x = -6;
        } else if (!this.moving.left && !this.moving.right) {
            this.vel.x = 0;
        }

        this.vel.y = constrain(this.vel.y, -10, 10);
    }

    keyPressed(e) {

        if (keyCode == LEFT_ARROW) {
            player.moving.left = true;
        } else if (keyCode == RIGHT_ARROW) {
            player.moving.right = true;
        }

        if (keyCode == UP_ARROW && this.state == states.WALKING) {
            player.vel.y = -50;
            this.state = states.JUMPING;
        }
    }

    keyReleased(e) {
        if (keyCode == LEFT_ARROW) {
            player.moving.left = false;
        } else if (keyCode == RIGHT_ARROW) {
            player.moving.right = false;
        }
    }

}