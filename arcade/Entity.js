class Entity {

    constructor() {
        this.pos = createVector(100, 100);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0.6);
        this.size = createVector(40, 40);
        this.type = '';

    }

    update(map, boxes) {
        this.moving_routine(map);

        for (let i = 0; i < boxes.length; i++) {
            if (collide(this.pos, this.size, boxes[i].pos, boxes[i].size)) {
                boxes[i].vel.add(createVector(this.pos.x - boxes[i].pos.x, this.pos.y - boxes[i].pos.y).mult(-0.2));
                if (this.type != 'PLAYER') this.vel.add(createVector(this.pos.x - boxes[i].pos.x, this.pos.y - boxes[i].pos.y).mult(0.2));
            }
        }

    }

    moving_routine(map) {
        this.vel.add(this.acc);
        this.vel.x *= 0.8;
        this.state = states.JUMPING;

        this.pos.x += this.vel.x;
        this.collision_detection(map, 'x');
        this.pos.y += this.vel.y;
        this.collision_detection(map, 'y');

        this.vel.y = constrain(this.vel.y, -10, 10);
    }

    draw() {


        rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }

    collision_detection(map, axe) {
        let x = int(this.pos.x / this.size.x);
        let y = int(this.pos.y / this.size.y);

        for (let i = y; i <= y + 1; i++) {
            for (let j = x; j <= x + 1; j++) {
                if (map.tiles[i] != undefined && map.tiles[i][j] == 1) {
                    if (axe == 'y') {
                        if (this.vel.y >= 0) {
                            this.pos.y = y * this.size.y - 1;
                            this.state = states.WALKING;
                            this.vel.y = 0;
                        } else {
                            this.pos.y = (y + 1) * this.size.y + 1;
                            this.vel.y = -0.1;
                        }
                    } else if (axe == 'x') {
                        if (this.vel.x > 0) {
                            this.pos.x = x * this.size.x - 1;
                            this.vel.x = 0;
                        } else if (this.vel.x < 0) {
                            this.pos.x = (x + 1) * this.size.x + 1;
                            this.vel.x = 0;
                        }
                    }
                }
            }
        }
    }
}