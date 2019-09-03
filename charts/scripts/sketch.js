let points = [];

let input;
let btn;

let func;

let x1 = -10;
let x2 = -x1;
let yMin = -10;
let yMax = -yMin;
let step = 0.1;

let steps = [];

let answerText;
let iterNum;

let aInput;
let bInput;
let lInput;
let eInput;

function setup() {
	createCanvas(640, 480);

	createElement('label', 'f(x) = ');
	input = createInput('(x + 1) ** 2 + 2 * x + 1');
	input.size(200);
	func = x => eval(input.value());
	createElement('br');

	createElement('label', 'Начало интервала: ');
	aInput = createInput('-6');
	createElement('br');

	createElement('label', 'Конец интервала: ');
	bInput = createInput('6');
	createElement('br');
	createElement('label', 'Допустимая длина конечного интервала: ');
	lInput = createInput('0.01');
	createElement('br');

	createElement('label', 'Константа различимости: ');
	eInput = createInput('0.0001');
	createElement('br');

	let resultX = fibMethod(func);
	let resultY = func(resultX);
	answerText = createElement('h3', 'Минимум ф-ии: ( x = ' + resultX + ' , f(x) = ' + resultY + '); Кол-во итераций: ' + iterNum);

	btn = createButton('OK');
	btn.mousePressed(() => {
		func = x => eval(input.value());

		resultX = fibMethod(func);
		resultY = func(resultX);
		answerText.html('Минимум ф-ии: ( x = ' + resultX + ' , f(x) = ' + resultY + '); Кол-во итераций: ' + iterNum);

		background(220);
		drawChart();
		redraw();
	});
}

function drawVertLine(x0) {
	let x = map(x0, x1, x2, 0, width);
	line(x, 0, x, height);
}

function draw() {
	background(220);
	drawChart();

	strokeWeight(1);

	let i = floor(frameCount / 50) % steps.length;
	strokeWeight(3);
	drawVertLine(steps[i].a);
	drawVertLine(steps[i].b);
	strokeWeight(2);
	stroke(0, 0, 255);
	drawVertLine(steps[i].y);
	drawVertLine(steps[i].z);
	//print(steps[i]);
}

function drawAxis() {
	stroke(0, 0, 0);
	strokeWeight(1);
	let y = map(0, yMin, yMax, height, 0);
	line(0, y, width, y);

	for (let yy = yMin; yy <= yMax; yy += 1) {
		y = map(yy, yMin, yMax, height, 0);
		line(width / 2 - 10, y, width / 2 + 10, y);

		text(yy, width / 2 + 10, y, width / 2 + 30, y);
	}

	let x = map(0, x1, x2, 0, width);
	line(x, 0, x, height);

	for (let xx = x1; xx <= x2; xx += 1) {
		x = map(xx, x1, x2, 0, width);
		line(x, height / 2 - 10, x, height / 2 + 10);

		text(xx, x, height / 2 - 20, x, height / 2 + 10);
	}
}

function drawChart() {
	drawAxis(x1, x2, yMin, yMax);

	stroke(255, 0, 0);
	strokeWeight(5);
	points = [];

	for (let x = x1; x <= x2; x += step) {
		let y = func(x);

		let xMapped = map(x, x1, x2, 0, width);
		let yMapped = map(y, yMin, yMax, height, 0);

		points.push({ x: xMapped, y: yMapped });
	}

	for (let i = 0; i < points.length - 1; i++) {
		line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
	}

	strokeWeight(15);
	stroke(0, 255, 0);
	let minX = map(fibMethod(func), x1, x2, 0, width);
	let minY = map(func(fibMethod(func)), x1, x2, height, 0);
	point(minX, minY);
}

function fib(n) {
	let n0 = 0;
	let n1 = 1;
	for (let i = 0; i < n; i++) {
		let temp = n1;
		n1 = n1 + n0;
		n0 = temp;
	}

	return n1;
}

// OX: ------ a ------ y ------ . ------ z ------ b ------
function fibMethod(myFunc) {
	steps = [];
	let a = parseFloat(aInput.value()); // Начало интервала
	let b = parseFloat(bInput.value()); // Конец интервала
	let l = parseFloat(lInput.value());
	let e = parseFloat(eInput.value());

	print(a,b,l,e);

	let N = 0;
	while (fib(N) < (b - a) / l) {
		N += 1;
	}

	let k = 0;
	let y = a + (fib(N - 2) / fib(N)) * (b - a);
	let z = a + (fib(N - 1) / fib(N)) * (b - a);

	while (true) {
		let f_y = myFunc(y);
		let f_z = myFunc(z);

		steps.push({ a: a, y: y, z: z, b: b, res: f_y <= f_z });

		if (f_y <= f_z) {
			a = a;
			b = z;
			z = y;
			y = a + (fib(N - k - 3) / fib(N - k - 1)) * (b - a);
		} else {
			a = y;
			b = b;
			y = z;
			z = a + (fib(N - k - 2) / fib(N - k - 1)) * (b - a);
		}

		let prev_a = a;
		let prev_b = b;
		let prev_y = y;
		let prev_z = z;

		if (k == N - 3) {
			y = prev_y = prev_z;

			z = y + e;
			f_y = myFunc(y);
			f_z = myFunc(z);

			steps.push({ a: a, y: y, z: z, b: b, res: f_y <= f_z });

			if (f_y <= f_z) {
				a = prev_a;
				b = z;
			} else {
				a = y;
				b = prev_b;
			}

			iterNum = k;
			steps.push({ a: (a + b) / 2, y: (a + b) / 2, z: (a + b) / 2, b: (a + b) / 2, res: f_y <= f_z });
			return (a + b) / 2;
		} else {
			k += 1;
		}
		
	}
}
