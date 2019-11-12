let points = [];

let funcInput;
let btn;

let func;

let x1 = -10;
let x2 = -x1;
let yMin = -300;
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

	createInputFields();

	print(powellMethod(func));

	// let resultX = fibMethod(func);
	// let resultY = func(resultX);
	// answerText = createElement('h3', 'Минимум ф-ии: ( x = ' + resultX + ' , f(x) = ' + resultY + ') <br> Кол-во итераций: ' + iterNum);

	// btn = createButton('OK');
	// btn.mousePressed(() => {
	// 	func = x => eval(funcInput.value());

	// 	resultX = fibMethod(func);
	// 	resultY = func(resultX);
	// 	answerText.html('Минимум ф-ии: ( x = ' + resultX + ' , f(x) = ' + resultY + ') <br> Кол-во итераций: ' + iterNum);

	// 	frameCount = 0;
	// });
}

function createInputFields() {
	createElement('label', 'f(x) = ');
	// funcInput = createInput('x**3 + x**2 - 3');
	// funcInput = createInput('2*(x**2) + 16/x');
	funcInput = createInput('127/4*(x**4) - 61/4*x + 2');
	funcInput.size(200);
	func = x => eval(funcInput.value());
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
}

function drawVertLine(x0) {
	let x = map(x0, x1, x2, 0, width);
	line(x, 0, x, height);
}

function draw() {
	background(220);
	drawChart();
	// showProcess();
}

function showProcess() {
	strokeWeight(1);
	let i = floor(frameCount / 50) % steps.length;
	strokeWeight(3);
	drawVertLine(steps[i].a);
	drawVertLine(steps[i].b);
	strokeWeight(2);
	stroke(0, 0, 255);
	drawVertLine(steps[i].y);
	drawVertLine(steps[i].z);
}

function drawAxis() {
	stroke(0, 0, 0);
	strokeWeight(1);
	let y = map(0, yMin, yMax, height, 0);
	line(0, y, width, y);

	for (let yy = yMin; yy <= yMax; yy += 20) {
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

	// let x0 = fibMethod(func);
	// let minX = map(x0, x1, x2, 0, width);
	// let minY = map(func(x0), yMin, yMax, height, 0);
	// point(minX, minY);
}

function powellMethod(myFunc) {
	// Шаг 1
	let x1 = 0; // Начальная точка
	let dx = 6; // Величина шага
	let e1 = 0.03,
		e2 = 0.3; // Параметры точности функции и аргумента

	let x2, f_x1, f_x2, x3, f_x3;

	let skipToStep6 = false;

	let k = 0;
	let iterMax = 50;
	while (k < iterMax) {
		k += 1;
		if (!skipToStep6) {
			// Шаг 2
			x2 = x1 + dx;

		

			// Шаг 3
			f_x1 = myFunc(x1);
			f_x2 = myFunc(x2);

			// Шаг 4
			if (f_x1 > f_x2) {
				x3 = x1 + 2 * dx;
				if (x3 > 6)
					x3 = 6;
			} else {
				x3 = x1 - dx;
				if (x3 < -6)
					x3 = -6;
			}



			// Шаг 5
			f_x3 = myFunc(x3);
		}
		skipToStep6 = false;

		// Шаг 6
		let f_min = f_x1;
		let x_min = x1;

		if (f_x2 < f_min) {
			f_min = f_x2;
			x_min = x2;
		}
		if (f_x3 < f_min) {
			f_min = f_x3;
			x_min = x3;
		}

		// Шаг 7
		let polynomNumerator = (x2 ** 2 - x3 ** 2) * f_x1 + (x3 ** 2 - x1 ** 2) * f_x2 + (x1 ** 2 - x2 ** 2) * f_x3;
		let polynomDenominator = (x2 - x3) * f_x1 + (x3 - x1) * f_x2 + (x1 - x2) * f_x3;

		let polynomMinimum;
		if (polynomDenominator == 0) {
			x1 = x_min;
		} else {
			polynomMinimum = polynomNumerator / polynomDenominator / 2;
			// if (!isBetween(polynomMinimum, -6, 6)) {
			// 	continue;
			// }

			//print(polynomMinimum);
			let f_polynom = myFunc(polynomMinimum);
			// Шаг 8
			if ((abs((f_min - f_polynom) / f_polynom) < e1 && abs((x_min - polynomMinimum) / polynomMinimum) < e2) || k == iterMax - 1) {
				return polynomMinimum;
			} else {
				if (isBetween(polynomMinimum, x1, x3)) {
					if (f_polynom < f_min) {
						x1 = closestPoint(-1, polynomMinimum, [x1, x2, x3, x_min, polynomMinimum]);
						x3 = closestPoint(1, polynomMinimum, [x1, x2, x3, x_min, polynomMinimum]);
						x2 = polynomMinimum;
					} else {
						x1 = closestPoint(-1, x_min, [x1, x2, x3, x_min, polynomMinimum]);
						x3 = closestPoint(1, x_min, [x1, x2, x3, x_min, polynomMinimum]);
						x2 = x_min;
					}

					f_x1 = myFunc(x1);
					f_x2 = myFunc(x2);
					f_x3 = myFunc(x3);

					skipToStep6 = true;
				} else {
					x1 = polynomMinimum;
				}
			}
		}
	}
}

function closestPoint(sign, point, xs) {
	let bestVar;
	if (sign < 0) {
		bestVar = min(xs);
		for (let x of xs) {
			if (x < point && x > bestVar) {
				bestVar = x;
			}
		}
	} else {
		bestVar = max(xs);
		for (let x of xs) {
			if (x > point && x < bestVar) {
				bestVar = x;
			}
		}
	}

	return bestVar;
}

function isBetween(num, a, b) {
	return num >= min(a, b) && num <= max(a, b);
}
