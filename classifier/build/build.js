let grid;
let class_name = 'Wait';
let ready = false;
let mymodel;
let labels = ['alarm clock', 'apple', 'cat', 'circle', 'donut', 'face', 'mushroom', 'panda', 'skull', 'smiley face'];
function setup() {
    createCanvas(600, 600);
    grid = new Grid(28, 28);
    let clearButton = createButton('Clear canvas');
    clearButton.mousePressed(_ => {
        class_name = '';
        grid.clear();
    });
    tf.loadLayersModel('./SketchClassifierJS/model.json').then(model => {
        ready = true;
        mymodel = model;
        class_name = '';
    });
}
function draw() {
    background(220);
    grid.draw();
    stroke(0);
    noFill();
    rect(0, 0, width, height);
    fill(255, 15, 100);
    textSize(64);
    text(class_name, 32, 64);
}
class Grid {
    constructor(w, h) {
        this.width = w;
        this.height = h;
        this.rectSize = {
            w: width / w,
            h: height / h
        };
        this.cells = [];
        for (let w = 0; w < this.width; w++) {
            let inner = [];
            for (let h = 0; h < this.height; h++) {
                inner.push(0);
            }
            this.cells.push(inner);
        }
    }
    draw() {
        for (let w = 0; w < this.width; w++) {
            for (let h = 0; h < this.height; h++) {
                fill((1 - this.cells[h][w]) * 255);
                stroke((1 - this.cells[h][w]) * 255);
                rect(w * this.rectSize.w, h * this.rectSize.h, this.rectSize.w, this.rectSize.h);
            }
        }
    }
    clear() {
        for (let w = 0; w < this.width; w++) {
            for (let h = 0; h < this.height; h++) {
                this.cells[h][w] = 0;
            }
        }
    }
    putCell(level) {
        let w = Math.floor(mouseX / this.rectSize.w);
        let h = Math.floor(mouseY / this.rectSize.h);
        if (w < 0 || w >= this.width || h < 0 || h >= this.height)
            return;
        for (let i = h - 1; i <= h + 1; i++) {
            for (let j = w - 1; j <= w + 1; j++) {
                if (typeof this.cells[i] === 'undefined' || typeof this.cells[i][j] === 'undefined') {
                    continue;
                }
                if (level == 0) {
                    this.cells[i][j] = 0;
                }
                else {
                    if (this.cells[i][j] > 1) {
                    }
                }
            }
        }
        this.cells[h][w] = level;
    }
}
function mousePressed() {
    if (mouseButton === LEFT) {
        grid.putCell(0.7);
    }
    else if (mouseButton === RIGHT) {
        grid.putCell(0);
    }
}
function mouseDragged() {
    if (mouseButton === LEFT) {
        grid.putCell(1);
    }
    else if (mouseButton === RIGHT) {
        grid.putCell(0);
    }
}
function mouseReleased() {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        tensorThing();
    }
}
function print_probs(probs) {
    let score = [];
    for (let i = 0; i < labels.length; i++) {
        score[labels[i]] = probs[i];
    }
    let items = Object.keys(score).map(key => [key, score[key]]);
    items.sort((a, b) => b[1] - a[1]);
    print(items);
}
function tensorThing() {
    if (ready) {
        tf.tidy(() => {
            const input = tf.tensor2d(grid.cells);
            const reshaped_input = input.reshape([1, 28, 28, 1]);
            const prediction = mymodel.predict(reshaped_input);
            const probs = prediction.dataSync();
            print_probs(probs);
            let num = +tf.argMax(probs).dataSync()[0];
            class_name = labels[num] + ' ' + String(probs[num].toFixed(2) * 100) + '%';
            console.log("Answer is " + class_name);
        });
        console.log('numTensors: ' + tf.memory().numTensors);
    }
}
//# sourceMappingURL=build.js.map