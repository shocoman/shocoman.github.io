
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

    selected: boolean;

    moving: boolean;
    endPoint: p5.Vector;
    shouldBeRemoved: boolean;

    isDying: boolean;
    isDead: boolean;
    minimizingSpeed: number;

    constructor(x: number, y: number, w: number, h: number) {
        this.pos = createVector(x, y);
        this.size = createVector(w, h);
        let paddingPercent = 0.05;
        this.padding = createVector(paddingPercent * w, paddingPercent * h);
        this.init();
    }


    init() {
        this.type = floor(random(tileType.length));
        this.selected = false;
        this.endPoint = this.pos;

        this.moving = false;
        this.shouldBeRemoved = false;

        this.isDying = false;
        this.isDead = false;
        this.minimizingSpeed = 3;
    }


    setDestination(endPoint: p5.Vector) {
        this.moving = true;
        this.endPoint = endPoint;
    }


    move() {
        // something else
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

        if (this.selected)
            stroke(255);
        else
            noStroke();

        let x = this.pos.x + this.padding.x;
        let y = this.pos.y + this.padding.y;
        let w = this.size.x - 2 * this.padding.x;
        let h = this.size.y - 2 * this.padding.y;


        push();

        translate(x+w/2,y+h/2);
        rotate(rotationAngle);
        translate(-(x+w/2),-(y+h/2));
       

        image(charactersImage, x, y, w <= 0 ? 1 : w, h <= 0 ? 1 : h, frame.x, frame.y, frame.w, frame.h);

        pop();

    }
}
