
let realstep = 0.05;
let imagstep = 0.07;

let real0 = -2.3;
let real1 = real0+realstep*78;
let imag0 = -1.3;
let imag1 = imag0+imagstep*40;



function setup() {
    createCanvas(600, 600);
    // noLoop();
}

function draw() {
    background(220);
    noStroke();

    for (let row = imag0; row < imag1; row += imagstep) {
        for (let col = real0; col < real1; col += realstep) {
            let num = new ImaginaryNumber(col, row);

            let depth = num.doMandelUntil(real0, real1, imag0, imag1);

            fill(map(depth, 0, 40, 255, 0));
            // let d = map(realstep, 0, 1, 0, width );
            let d = 5;
            circle(map(col, real0, real1, 0, width), map(row, imag0, imag1, 0, height), d);
        }
    }
}


function keyPressed() {
    if (key == 'a') {
        real0 -= 0.1;
        real1 -= 0.1;
    } else if (key == 'd') {
        real0 += 0.1;
        real1 += 0.1;
    }

    if (key == 'w') {
        imag0 -= 0.1;
        imag1 -= 0.1;
    } else if (key == 's') {
        imag0 += 0.1;
        imag1 += 0.1;
    }

    if (key == '+') {
        real0 += 0.1;
        real1 -= 0.1;
        imag0 += 0.1;
        imag1 -= 0.1;
    } else if (key == '-') {
        imag0 -= 0.1;
        imag1 += 0.1;
        real0 -= 0.1;
        real1 += 0.1;
    }

    if (key == 'z') {
        realstep -= 0.01;
        imagstep -= 0.01;
    } else if (key == 'x') {
        realstep += 0.01;
        imagstep += 0.01;
    }
}

class ImaginaryNumber {
    first_real: number;
    first_imag: number;

    real: number;
    imag: number;

    constructor(real: number, imag: number) {
        this.real = real;
        this.imag = imag;
        this.first_real = real;
        this.first_imag = imag;
    }

    doMandel() {
        // z = z^2 + z
        // (a + b*i)^2 = (a^2 - b^2) + 2ab*i
        let old_real = this.real;
        let old_imag = this.imag;

        let new_real = (old_real * old_real - old_imag * old_imag) + this.first_real;
        let new_imag = (2 * old_real * old_imag) + this.first_imag;

        this.real = new_real;
        this.imag = new_imag;
    }

    isOutsideScreen(x0: number, x1: number, y0: number, y1: number) {
        if (this.real < x0 || this.real > x1 || this.imag < y0 || this.imag > y1) {
            return true;
        }

        return false;
    }

    doMandelUntil(real0: number, real1: number, imag0: number, imag1: number) {
        let i = 0;
        while (!this.isOutsideScreen(real0, real1, imag0, imag1)) {
            this.doMandel();
            i++;

            if (i > 255 || (this.real*this.real + this.imag*this.imag) > 4) break;
        }

        return i;
    }
}