
enum tileType {
    APPLE,
    BREAD,
    COCONUT,
    LETTUCE,
    MILK,
    ORANGE,
    STAR,
    length
};


class Tile {
    pos: p5.Vector;
    size: p5.Vector;

    padding: p5.Vector;

    type: tileType;

    moving: boolean;
    endPoint: p5.Vector;
    shouldBeRemoved: boolean;

    isDying: boolean;
    isDead: boolean;
    minimizingSpeed: number;

    constructor(x: number, y: number, w: number, h: number) {
        this.pos = createVector(x, y);
        this.size = createVector(w, h);
        let paddingPercent = 0;
        this.padding = createVector(-0.2 * w, paddingPercent * h);
        
        this.init();
    }


    init() {
        this.type = floor(random(tileType.length));
        this.endPoint = this.pos;

        this.moving = false;
        this.shouldBeRemoved = false;

        this.isDying = false;
        this.isDead = false;
        this.minimizingSpeed = 3;
    }


    moveTo(endPoint: p5.Vector) {
        this.moving = true;
        this.endPoint = endPoint;
    }


    update() {
        if (this.moving) {
            if (this.pos.dist(this.endPoint) < 1) {
                this.pos = this.endPoint.copy();
                this.moving = false;
            }
            p5.Vector.lerp(this.pos, this.endPoint, 0.2, this.pos);
        } else if (this.isDying) {

            this.padding.add(this.minimizingSpeed, this.minimizingSpeed);
            if (this.padding.x * 2 >= this.size.x) {
                this.isDead = true;
            }

        }
    }


    draw(rotationAngle: number) {
        let frame = charactersJSON.frames[tileType[this.type].toLowerCase()].frame

        let x = this.pos.x + this.padding.x;
        let y = this.pos.y + this.padding.y;
        let w = this.size.x - 2 * this.padding.x;
        let h = this.size.y - 2 * this.padding.y;

        push();
        translate(x+w/2,y+h/2);
        if (this.isDying)
            rotationAngle += this.padding.x/12
        rotate(rotationAngle);
        translate(-(x+w/2),-(y+h/2));
       
        image(charactersImage, x, y, max(w,1), max(h,1), frame.x, frame.y, frame.w, frame.h);

        pop();
    }
}
