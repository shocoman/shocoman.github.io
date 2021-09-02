enum Colors {
    white, red, green, blue
}

class Cell {
    pos: p5.Vector;
    r: number;
    active: boolean;
    color: Colors;

    constructor(x: number, y: number, r: number) {
        this.pos = createVector(x, y);
        this.r = r;
        this.active = false;
        this.color = Colors.white;
    }

    setColor(){
        if (this.color == Colors.white) {
            fill(240);
        } else if (this.color == Colors.red) {
            fill(200,0,0);
        } else if (this.color == Colors.green) {
            fill(0,200,0);
        } else if (this.color == Colors.blue) {
            fill(0,0,200);
        }
    }

    draw() {
        let numOfSides = 6;
        let angleFrom = PI / 6;
        let angleTo = 2 * PI + angleFrom;
        let angleStep = (angleTo - angleFrom) / numOfSides;

        push();
        if (this.active) {
            fill(0, 200, 0);
            this.active = false;
        } else {
            this.setColor();
        }
        beginShape();
        for (let angle = angleFrom; angle < angleTo; angle += angleStep) {
            let dx = this.r * cos(angle);
            let dy = this.r * sin(angle);
            vertex(this.pos.x + dx, this.pos.y + dy);
        }
        endShape(CLOSE);

        pop();
    }
}
