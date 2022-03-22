var ColorHelper = (function () {
    function ColorHelper() {
    }
    ColorHelper.getColorVector = function (c) {
        return createVector(red(c), green(c), blue(c));
    };
    ColorHelper.rainbowColorBase = function () {
        return [
            color('red'),
            color('orange'),
            color('yellow'),
            color('green'),
            color(38, 58, 150),
            color('indigo'),
            color('violet')
        ];
    };
    ColorHelper.getColorsArray = function (total, baseColorArray) {
        var _this = this;
        if (baseColorArray === void 0) { baseColorArray = null; }
        if (baseColorArray == null) {
            baseColorArray = ColorHelper.rainbowColorBase();
        }
        var rainbowColors = baseColorArray.map(function (x) { return _this.getColorVector(x); });
        ;
        var colours = new Array();
        for (var i = 0; i < total; i++) {
            var colorPosition = i / total;
            var scaledColorPosition = colorPosition * (rainbowColors.length - 1);
            var colorIndex = Math.floor(scaledColorPosition);
            var colorPercentage = scaledColorPosition - colorIndex;
            var nameColor = this.getColorByPercentage(rainbowColors[colorIndex], rainbowColors[colorIndex + 1], colorPercentage);
            colours.push(color(nameColor.x, nameColor.y, nameColor.z));
        }
        return colours;
    };
    ColorHelper.getColorByPercentage = function (firstColor, secondColor, percentage) {
        var firstColorCopy = firstColor.copy();
        var secondColorCopy = secondColor.copy();
        var deltaColor = secondColorCopy.sub(firstColorCopy);
        var scaledDeltaColor = deltaColor.mult(percentage);
        return firstColorCopy.add(scaledDeltaColor);
    };
    return ColorHelper;
}());
var PolygonHelper = (function () {
    function PolygonHelper() {
    }
    PolygonHelper.draw = function (numberOfSides, width) {
        push();
        var angle = TWO_PI / numberOfSides;
        var radius = width / 2;
        beginShape();
        for (var a = 0; a < TWO_PI; a += angle) {
            var sx = cos(a) * radius;
            var sy = sin(a) * radius;
            vertex(sx, sy);
        }
        endShape(CLOSE);
        pop();
    };
    return PolygonHelper;
}());
var fpsViewXOffset = 400;
var p;
var w;
function setup() {
    createCanvas(800, 400);
    p = new Player(50, 50);
    w = new Array();
    w.push(new Wall(createVector(200, 250), createVector(300, 150)));
}
function draw() {
    background(0);
    p.draw();
    w.forEach(function (w) { return w.draw(p); });
    stroke(128, 128, 128);
    line(fpsViewXOffset, 0, fpsViewXOffset, height);
    fill(255, 255, 255);
}
function keyPressed(e) {
    p.keyPressed(e);
    w.forEach(function (w) { return w.keyPressed(e); });
}
var Player = (function () {
    function Player(x, y) {
        this.pos = createVector(x, y);
        this.dir = createVector(0, 1);
    }
    Player.prototype.keyPressed = function (e) {
        if (e.key === "ArrowUp") {
            this.pos.add(this.dir.copy().mult(10));
            return;
        }
        var angle = 0;
        if (e.key === "ArrowLeft") {
            angle = -1;
        }
        else if (e.key === "ArrowRight") {
            angle = 1;
        }
        angle *= 30;
        this.dir.rotate(radians(angle));
    };
    Player.prototype.draw = function () {
        fill(255, 255, 255);
        circle(this.pos.x, this.pos.y, 10);
        stroke(255, 0, 0);
        var distVec = this.dir.copy().mult(30);
        var start = this.pos, endLeft = p5.Vector.add(this.pos, distVec.copy().rotate(radians(30))), endRight = p5.Vector.add(this.pos, distVec.copy().rotate(radians(-30)));
        line(start.x, start.y, endLeft.x, endLeft.y);
        line(start.x, start.y, endRight.x, endRight.y);
    };
    Player.prototype.pointIsVisible = function (pnt) {
        var leftEdge = this.dir.copy().rotate(radians(-30)), rightEdge = this.dir.copy().rotate(radians(30));
        var playerToPoint = pnt.copy().sub(this.pos);
        var x1 = leftEdge.cross(playerToPoint);
        var x2 = rightEdge.cross(playerToPoint);
        var isVisible = x1.z > 0 && x2.z < 0;
        var angle = leftEdge.angleBetween(playerToPoint);
        return [isVisible, angle];
    };
    return Player;
}());
var Wall = (function () {
    function Wall(p1, p2) {
        this.p1 = p1.copy();
        this.p2 = p2.copy();
    }
    Wall.prototype.keyPressed = function (e) {
        if (e.key === " ") {
            p.pointIsVisible(this.p1);
            var angle1 = this.p1.angleBetween(p.dir);
            var angle2 = this.p1.angleBetween(p.dir);
            console.log(angle1, angle2);
        }
    };
    Wall.prototype.draw = function (player) {
        {
            fill(0, 100, 0);
            circle(this.p1.x, this.p1.y, 20);
            var dist_1 = this.p1.dist(player.pos);
        }
        {
            fill(0, 0, 200);
            circle(this.p2.x, this.p2.y, 20);
        }
    };
    return Wall;
}());
//# sourceMappingURL=build.js.map