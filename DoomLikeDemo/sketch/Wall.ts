class Wall {
    p1: Point;
    p2: Point;

    constructor(p1: Point, p2: Point) {
        this.p1 = p1.copy();
        this.p2 = p2.copy();
    }

    draw(player: Player) {
        let [leftPoint, rightPoint] = [this.p1, this.p2];
        let isClockwise =
            this.p1.copy().sub(player.pos).angleBetween(this.p2.copy().sub(player.pos)) > 0;
        if (!isClockwise) [leftPoint, rightPoint] = [rightPoint, leftPoint];

        const left_intersect_point = segmentIntersection(
            player.pos,
            player.pos.copy().add(player.dir.copy().rotate(radians(-fovDegrees / 2))),
            this.p1,
            this.p2
        );
        if (left_intersect_point) {
            fill("pink");
            circle(left_intersect_point.x, left_intersect_point.y, 10);
        }

        const right_intersect_point = segmentIntersection(
            player.pos,
            player.pos.copy().add(player.dir.copy().rotate(radians(fovDegrees / 2))),
            this.p1,
            this.p2
        );
        if (right_intersect_point) {
            fill("yellow");
            circle(right_intersect_point.x, right_intersect_point.y, 10);
        }

        let [isLeftPointVisible, leftPointAngle] = player.pointIsVisible(leftPoint);
        let [isRightPointVisible, rightPointAngle] = player.pointIsVisible(rightPoint);

        let wall_start = fpsViewXOffset,
            wall_end = right_intersect_point ? width : fpsViewXOffset;

        let leftPointOffsetX = map(leftPointAngle, 0, radians(fovDegrees), fpsViewXOffset, width);
        let rightPointOffsetX = map(rightPointAngle, 0, radians(fovDegrees), fpsViewXOffset, width);
        if (isLeftPointVisible) wall_start = leftPointOffsetX;
        if (isRightPointVisible) wall_end = rightPointOffsetX;

        // draw 2d wall
        stroke("white");
        fill(0, 100, 0);
        line(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
        circle(this.p1.x, this.p1.y, isLeftPointVisible ? 10 : 5);
        circle(this.p2.x, this.p2.y, isRightPointVisible ? 10 : 5);

        // draw 3d wall
        if (wall_start < wall_end) {
            strokeWeight(4);
            stroke(128, 128, 128);
            fill(255, 255, 255);
            line(wall_start, height / 2, wall_end, height / 2);
            let leftPointDist = (left_intersect_point ?? leftPoint).dist(player.pos);
            let rightPointDist = (right_intersect_point ?? rightPoint).dist(player.pos);
            let leftWallWidth = 10000 / leftPointDist;
            let rightWallWidth = 10000 / rightPointDist;
            
            pg.background(255);
            pg.text("hello!", 0, 100);
            texture(pg);

            quad(
                wall_start,
                height / 2 - leftWallWidth / 2,
                wall_start,
                height / 2 + leftWallWidth / 2,
                wall_end,
                height / 2 + rightWallWidth / 2,
                wall_end,
                height / 2 - rightWallWidth / 2
            );
            strokeWeight(1);
            text(
                `LeftDist: ${leftPointDist}; RightDist: ${rightPointDist}; \nAngle: ${degrees(0)}`,
                0,
                10
            );
        }
    }
}
