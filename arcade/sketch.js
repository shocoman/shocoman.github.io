let player;
let map;
let boxes = [];
let anim_manager;

function setup() {
    createCanvas(400, 400);

    anim_manager = new AnimationManager();
    anim_manager.load('run', './sprites/engineer/run.png', 8, 1, 8, createVector(0, 0), createVector(64, 112));
    anim_manager.load('idle', './sprites/engineer/idle.png', 9, 1, 9, createVector(0, 0), createVector(64, 112));
    anim_manager.load('jump', './sprites/engineer/jump.png', 2, 1, 2, createVector(0, 0), createVector(64, 112));

    player = new Player(anim_manager);
    map = new Map();

    for (let i = 0; i < 5; i++) {
        boxes.push(new Box(i * 50 + 200, height / 4));
    }

    //anim = new Animation('./sprites/engineer/run.png', 8, 1, 8, createVector(0, 0), createVector(64, 112));

}

function draw() {
    background(0);
    fill(0);
    stroke('fff');

    if (player.pos.x > width / 2)
        translate(-player.pos.x + width / 2, 0, 0);
    // if (player.pos.y < height / 2)
    //     translate(0, -player.pos.y + height / 2, 0);

    map.draw();

    for (let i = 0; i < boxes.length; i++) {
        boxes[i].update(map, boxes);
        boxes[i].draw();
    }
    player.update(map, boxes);
    player.draw();


    //anim_manager.show('run', createVector(100, 100), createVector(50, 80));
}

function keyPressed(e) {
    player.keyPressed(e);
}

function keyReleased(e) {
    player.keyReleased(e);
}

class Box extends Entity {
    constructor(start_x, start_y) {
        super();
        this.pos.x = start_x;
        this.pos.y = start_y;
    }
}

function collide(pos1, size1, pos2, size2) {
    return pos1.x < pos2.x + size2.x &&
        pos1.x + size1.x > pos2.x &&
        pos1.y < pos2.y + size2.y &&
        pos1.y + size1.y > pos2.y;
}

function mousePressed() {
    boxes[0].pos.x = mouseX - boxes[0].size.x / 2 + player.pos.x - width / 2;
    boxes[0].pos.y = mouseY - boxes[0].size.y / 2;
    boxes[0].vel.y = 0;

    anim_manager.flip();
}