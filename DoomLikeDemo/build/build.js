var Wall = (function () {
    function Wall(p1, p2) {
        this.p1 = p1.copy();
        this.p2 = p2.copy();
    }
    Wall.prototype.draw = function (player) {
        var _a;
        var _b = [this.p1, this.p2], leftPoint = _b[0], rightPoint = _b[1];
        var isClockwise = this.p1.copy().sub(player.pos).angleBetween(this.p2.copy().sub(player.pos)) > 0;
        if (!isClockwise)
            _a = [rightPoint, leftPoint], leftPoint = _a[0], rightPoint = _a[1];
        var left_intersect_point = segmentIntersection(player.pos, player.pos.copy().add(player.dir.copy().rotate(radians(-fovDegrees / 2))), this.p1, this.p2);
        if (left_intersect_point) {
            fill("pink");
            circle(left_intersect_point.x, left_intersect_point.y, 10);
        }
        var right_intersect_point = segmentIntersection(player.pos, player.pos.copy().add(player.dir.copy().rotate(radians(fovDegrees / 2))), this.p1, this.p2);
        if (right_intersect_point) {
            fill("yellow");
            circle(right_intersect_point.x, right_intersect_point.y, 10);
        }
        var _c = player.pointIsVisible(leftPoint), isLeftPointVisible = _c[0], leftPointAngle = _c[1];
        var _d = player.pointIsVisible(rightPoint), isRightPointVisible = _d[0], rightPointAngle = _d[1];
        var wall_start = fpsViewXOffset, wall_end = right_intersect_point ? width : fpsViewXOffset;
        var leftPointOffsetX = map(leftPointAngle, 0, radians(fovDegrees), fpsViewXOffset, width);
        var rightPointOffsetX = map(rightPointAngle, 0, radians(fovDegrees), fpsViewXOffset, width);
        if (isLeftPointVisible)
            wall_start = leftPointOffsetX;
        if (isRightPointVisible)
            wall_end = rightPointOffsetX;
        stroke("white");
        fill(0, 100, 0);
        line(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
        circle(this.p1.x, this.p1.y, isLeftPointVisible ? 10 : 5);
        circle(this.p2.x, this.p2.y, isRightPointVisible ? 10 : 5);
        if (wall_start < wall_end) {
            strokeWeight(0);
            stroke(128, 128, 128);
            fill(255, 255, 255);
            line(wall_start, height / 2, wall_end, height / 2);
            var leftPointDist = (left_intersect_point !== null && left_intersect_point !== void 0 ? left_intersect_point : leftPoint).dist(player.pos);
            var rightPointDist = (right_intersect_point !== null && right_intersect_point !== void 0 ? right_intersect_point : rightPoint).dist(player.pos);
            var leftWallWidth = 10000 / leftPointDist;
            var rightWallWidth = 10000 / rightPointDist;
            var wallDist = wall_end - wall_start;
            var wallVisibleFrom = left_intersect_point ? left_intersect_point.dist(leftPoint) : 0;
            var wallVisibleTo = right_intersect_point ? right_intersect_point.dist(leftPoint) : this.p1.dist(this.p2);
            var wallActualDist = this.p1.dist(this.p2);
            var wallVisibleFromPercent = wallVisibleFrom / wallActualDist;
            var wallVisibleToPercent = wallVisibleTo / wallActualDist;
            text("[".concat(Math.round(wallVisibleFromPercent * 100), "; ").concat(Math.round(wallVisibleToPercent * 100), "]"), 10, 280);
            var chunkWidth = Math.floor(wallDist / 100);
            var slope = (rightWallWidth - leftWallWidth) / wallDist;
            var wallChunks = Math.floor(wallDist / chunkWidth);
            var i = 0;
            drawImage(wallTexture, wallVisibleFromPercent, wallVisibleToPercent, wall_start, height / 2, wall_end - wall_start, leftWallWidth, rightWallWidth);
            strokeWeight(1);
            text("LeftDist: ".concat(leftPointDist, "; RightDist: ").concat(rightPointDist, "; \nAngle: ").concat(degrees(0)), 0, 10);
        }
    };
    return Wall;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Point = (function (_super) {
    __extends(Point, _super);
    function Point() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Point;
}(p5.Vector));
var Player = (function () {
    function Player(x, y) {
        this.pos = createVector(x, y);
        this.dir = createVector(0, 1).rotate(radians(-fovDegrees));
        this.rotation = 0;
        this.movement = 0;
    }
    Player.prototype.update = function () {
        var rotateSpeed = 0.03, moveSpeed = 2;
        if (this.rotation > 0) {
            this.dir.rotate(rotateSpeed);
        }
        else if (this.rotation < 0) {
            this.dir.rotate(-rotateSpeed);
        }
        if (this.movement > 0) {
            this.pos.add(this.dir.copy().mult(moveSpeed));
        }
        else if (this.movement < 0) {
            this.pos.sub(this.dir.copy().mult(moveSpeed));
        }
    };
    Player.prototype.keyPressed = function (e, isPressed) {
        if (e.key === "ArrowUp") {
            this.movement = isPressed ? 1 : 0;
        }
        else if (e.key === "ArrowDown") {
            this.movement = isPressed ? -1 : 0;
        }
        if (e.key === "ArrowLeft") {
            this.rotation = isPressed ? -1 : 0;
        }
        else if (e.key === "ArrowRight") {
            this.rotation = isPressed ? 1 : 0;
        }
    };
    Player.prototype.draw = function () {
        stroke(255, 0, 0);
        var distVec = this.dir.copy().mult(30);
        var start = this.pos, endLeft = p5.Vector.add(this.pos, distVec.copy().rotate(radians(fovDegrees / 2)).mult(10)), endRight = p5.Vector.add(this.pos, distVec.copy().rotate(radians(-fovDegrees / 2)).mult(10));
        line(start.x, start.y, endLeft.x, endLeft.y);
        line(start.x, start.y, endRight.x, endRight.y);
        fill(255, 255, 255);
        circle(this.pos.x, this.pos.y, 10);
    };
    Player.prototype.pointIsVisible = function (point) {
        var leftEdge = this.dir.copy().rotate(radians(-fovDegrees / 2)), rightEdge = this.dir.copy().rotate(radians(fovDegrees / 2));
        var playerToPoint = point.copy().sub(this.pos);
        var x1 = leftEdge.cross(playerToPoint), x2 = rightEdge.cross(playerToPoint);
        var isVisible = x1.z > 0 && x2.z < 0;
        var angle = leftEdge.angleBetween(playerToPoint);
        return [isVisible, angle];
    };
    return Player;
}());
var fpsViewXOffset = 400;
var fovDegrees = 60;
var p;
var w;
var wallTexture;
function preload() {
    wallTexture = loadImage("assets/Японский мотив.bmp");
}
function setup() {
    createCanvas(800, 400);
    p = new Player(50, 50);
    w = new Array();
    w.push(new Wall(createVector(100, 150), createVector(300, 150)));
}
function draw() {
    background(0);
    p.update();
    p.draw();
    w.sort(function (a, b) {
        var aDist = Math.min(a.p1.dist(p.pos), a.p2.dist(p.pos));
        var bDist = Math.min(b.p1.dist(p.pos), b.p2.dist(p.pos));
        if (aDist !== bDist)
            return +(aDist < bDist);
        else {
            var aDist_1 = a.p1.copy().add(a.p2).div(2).dist(p.pos);
            var bDist_1 = b.p1.copy().add(b.p2).div(2).dist(p.pos);
            return +(aDist_1 < bDist_1);
        }
    });
    w.forEach(function (w) { return w.draw(p); });
    stroke(128, 128, 128);
    line(fpsViewXOffset - 1, 0, fpsViewXOffset - 1, height);
    fill(255, 255, 255);
}
function keyPressed(e) {
    p.keyPressed(e, true);
}
function keyReleased(e) {
    p.keyPressed(e, false);
}
function drawImageSegment(img, x, y, w, h, from, to) {
    var sx0 = from * img.width;
    var sx1 = to * img.width;
    image(img, x, y, w, h, sx0, 0, sx1 - sx0, img.height);
}
function drawImage(img, from, to, imgX, imgY, width, startHeight, endHeight) {
    if (img === void 0) { img = wallTexture; }
    if (from === void 0) { from = 0; }
    if (to === void 0) { to = 1; }
    if (imgX === void 0) { imgX = 50; }
    if (imgY === void 0) { imgY = 200; }
    if (width === void 0) { width = 400; }
    if (startHeight === void 0) { startHeight = 100; }
    if (endHeight === void 0) { endHeight = 200; }
    text("img: ".concat(img, ",\n    from: ").concat(from, ",\n    to: ").concat(to, ",\n    imgX: ").concat(imgX, ",\n    imgY: ").concat(imgY, ",\n    width: ").concat(width, ",\n    startHeight: ").concat(startHeight, ",\n    endHeight: ").concat(endHeight, ","), 0, 150);
    var segments = 80;
    var segmentWidth = width / segments;
    for (var i = 0; i < segments; i++) {
        var x = imgX + i * segmentWidth;
        var segmentHeight = startHeight + (endHeight - startHeight) * (i / segments);
        var y = imgY - segmentHeight / 2;
        drawImageSegment(img, x, y, segmentWidth, segmentHeight, from + (i / segments) * (to - from), from + ((i + 1) / segments) * (to - from));
    }
}
function segmentIntersection(a0, a1, b0, b1) {
    var l = ((b1.y - a1.y) * (a0.x - a1.x) - (b1.x - a1.x) * (a0.y - a1.y)) /
        ((b0.x - b1.x) * (a0.y - a1.y) - (b0.y - b1.y) * (a0.x - a1.x));
    var t = ((b0.x - b1.x) * l + b1.x - a1.x) / (a0.x - a1.x);
    if (t <= 0 && l >= 0 && l <= 1) {
        var intersect_point = a0
            .copy()
            .mult(t)
            .add(a1.copy().mult(1 - t));
        return intersect_point;
    }
    else {
        return null;
    }
}
//# sourceMappingURL=build.js.map