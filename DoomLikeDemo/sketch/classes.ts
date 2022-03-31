class Point extends p5.Vector {}

class Player {
    pos: p5.Vector;
    dir: p5.Vector;
    rotation: number;
    movement: number;

    constructor(x: number, y: number) {
        this.pos = createVector(x, y);
        this.dir = createVector(0, 1).rotate(radians(-fovDegrees));
        this.rotation = 0;
        this.movement = 0;
    }

    update() {
        let rotateSpeed = 0.03,
            moveSpeed = 2;
        if (this.rotation > 0) {
            this.dir.rotate(rotateSpeed);
        } else if (this.rotation < 0) {
            this.dir.rotate(-rotateSpeed);
        }
        if (this.movement > 0) {
            this.pos.add(this.dir.copy().mult(moveSpeed));
        } else if (this.movement < 0) {
            this.pos.sub(this.dir.copy().mult(moveSpeed));
        }
    }

    keyPressed(e: KeyboardEvent, isPressed: boolean) {
        if (e.key === "ArrowUp") {
            this.movement = isPressed ? 1 : 0;
        } else if (e.key === "ArrowDown") {
            this.movement = isPressed ? -1 : 0;
        }

        if (e.key === "ArrowLeft") {
            this.rotation = isPressed ? -1 : 0;
        } else if (e.key === "ArrowRight") {
            this.rotation = isPressed ? 1 : 0;
        }
    }

    draw() {
        // draw field of view
        stroke(255, 0, 0);
        let distVec = this.dir.copy().mult(30);
        let start = this.pos,
            endLeft = p5.Vector.add(this.pos, distVec.copy().rotate(radians(fovDegrees/2)).mult(10)),
            endRight = p5.Vector.add(this.pos, distVec.copy().rotate(radians(-fovDegrees/2)).mult(10));
        line(start.x, start.y, endLeft.x, endLeft.y);
        line(start.x, start.y, endRight.x, endRight.y);

        fill(255, 255, 255);
        circle(this.pos.x, this.pos.y, 10);
    }

    pointIsVisible(point: Point): [boolean, number] {
        // fov
        let leftEdge = this.dir.copy().rotate(radians(-fovDegrees / 2)),
            rightEdge = this.dir.copy().rotate(radians(fovDegrees / 2));
        let playerToPoint = point.copy().sub(this.pos);

        let x1 = leftEdge.cross(playerToPoint),
            x2 = rightEdge.cross(playerToPoint);

        const isVisible = x1.z > 0 && x2.z < 0;
        let angle = leftEdge.angleBetween(playerToPoint);

        // console.log(x1, x2, isVisible, angle);

        return [isVisible, angle];
    }
}
