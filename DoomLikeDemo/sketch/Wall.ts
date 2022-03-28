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
            strokeWeight(0);
            stroke(128, 128, 128);
            fill(255, 255, 255);
            line(wall_start, height / 2, wall_end, height / 2);
            let leftPointDist = (left_intersect_point ?? leftPoint).dist(player.pos);
            let rightPointDist = (right_intersect_point ?? rightPoint).dist(player.pos);
            let leftWallWidth = 10000 / leftPointDist;
            let rightWallWidth = 10000 / rightPointDist;

            const wallDist = wall_end - wall_start;

            let wallVisibleFrom = left_intersect_point ? left_intersect_point.dist(leftPoint) : 0;
            let wallVisibleTo = right_intersect_point ? right_intersect_point.dist(leftPoint) : this.p1.dist(this.p2);
            text(`[${wallVisibleFrom}; ${wallVisibleTo}]`, 10, 280);

            const chunkWidth = Math.floor(wallDist / 100);
            const slope = (rightWallWidth - leftWallWidth) / wallDist;
            const wallChunks = Math.floor(wallDist / chunkWidth);
            let i = 0;
            let offsetX = wall_start;
            for (; i < Math.min(wallChunks, 150); ++i) {
                fill(255, i * 250 / wallChunks, 255);
                const x0 = wall_start + chunkWidth * i;
                const x1 = wall_start + chunkWidth * (i+1)+1;
                const y0 = leftWallWidth + i * slope * chunkWidth;
                const y1 = leftWallWidth + (i+1) * slope * chunkWidth;    

                quad(
                    x0,
                    height / 2 - y0 / 2,
                    x0,
                    height / 2 + y0 / 2,
                    x1,
                    height / 2 + y1 / 2,
                    x1,
                    height / 2 - y1 / 2
                );
            }

            // last quad
            // let lastChunkWidth = wallDist % chunkWidth;
            // text(`wallDist: ${wallDist}\nSlope: ${slope}\nWallChunks: ${wallChunks}\nLast chunk width: ${lastChunkWidth}`, 0, 50);
            // if (lastChunkWidth != 0) {
            //     fill(255, i * 250 / wallChunks, 255);
            //     const x0 = wall_start + chunkWidth * i;
            //     const x1 = x0 + lastChunkWidth;
            //     const y0 = leftWallWidth + i * slope * chunkWidth;
            //     const y1 = rightWallWidth;    

            //     quad(
            //         x0,
            //         height / 2 - y0 / 2,
            //         x0,
            //         height / 2 + y0 / 2,
            //         x1,
            //         height / 2 + y1 / 2,
            //         x1,
            //         height / 2 - y1 / 2
            //     );
            // }


            strokeWeight(1);
            text(
                `LeftDist: ${leftPointDist}; RightDist: ${rightPointDist}; \nAngle: ${degrees(0)}`,
                0,
                10
            );
        }
    }
}
