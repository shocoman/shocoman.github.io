enum ObstacleType {
    Pterodactyl,
    Other
}

class Obstacle {
    pos: p5.Vector;
    size: p5.Vector;

    type: ObstacleType;
    animManager: AnimationManager;

    constructor(x: number, y: number, w: number, h: number, obstacleAnimManager: AnimationManager) {
        this.pos = createVector(x, y);
        this.size = createVector(w, h);

        this.type = ObstacleType.Pterodactyl;
        this.animManager = obstacleAnimManager;
    }

    setType(newType: ObstacleType){
        this.type = newType;
    }

    update(xSpeed: number) {
        this.pos.x -= xSpeed;
    }

    draw() {
        if (this.type == ObstacleType.Pterodactyl) {
            this.animManager.show('pterodactyl', this.pos, this.size);
        } else {
            fill(120, 0, 10);
            // rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
            ellipse(this.pos.x, this.pos.y, this.size.x, this.size.y)
        }
    }
}