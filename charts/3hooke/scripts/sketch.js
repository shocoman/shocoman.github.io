
let funcInput;
let func;

let answerText;
let iterNum;

function setup() {
	createInputFields();
	noCanvas();

	let min = hookeMethod(func);
	print(min, func(min));

	answerText = createElement('h3', 'Минимум ф-ии: ( x1 = ' + min[0] + '; x2 = ' + min[1] + '; f( x1, x2 ) = ' + func(min) + ');<br> Количество итераций: ' + iterNum);
}

function createInputFields() {
	createElement('label', 'f( x1, x2 ) = ');
	funcInput = createInput('4*(x1-5)**2 + (x2 - 6)**2');
	// funcInput = createInput('2*x1**2 + x1*x2 + x2**2');
	// funcInput = createInput('x2**2 + 6*x1**2 + (5*x1 + 2*x2)**2 + 1');
	funcInput.size(200);
	func = ([x1, x2]) => eval(funcInput.value());
	createElement('br');
}

function draw() {
	background(220);
}

function hookeMethod(func) {
	let error = 0.3;		// Число для остановки алгоритма
	let reductionCoeff = 2; // Коэффициент уменьшения шага
	let stepMultiplier = 1; // Ускоряющий множитель

	let xs = [8, 9]; 		// Начальная точка
	let dxs = [1, 2];		// Начальные величины шагов по всем направлениям
	let next_xs = Array.from(xs);

	createElement('h3', 'Начальная точка (x1, x2): [' + xs[0] + ', ' + xs[1] +
		']<br>Начальные величины шагов по направлениям: [' + dxs[0] + ', ' + dxs[1] +
		']<br>Число для остановки алгоритма: ' + error + 
		'<br>Коэффициент уменьшения шага: ' + reductionCoeff + 
		'<br>Ускоряющий множитель: ' + stepMultiplier);

	let k = 0;				// Счётчик итераций

	// Программа будет выполняться, 
	// пока все величины шагов "dx" не станут меньше "error"
	while (!dxs.every(dx => dx <= error)) {
		k++;

		// Ищем новый базис, перебирая все координатные направления (в обе стороны)
		let f = func(xs);
		for (let i = 0; i < xs.length; i++) {
			next_xs[i] += dxs[i];
			let next_f = func(next_xs);

			if (next_f < f) {
				f = next_f;
				continue;
			}

			next_xs[i] -= 2 * dxs[i];
			next_f = func(next_xs);
			if (next_f < f) {
				f = next_f;
				continue;
			}

			next_xs[i] += dxs[i];
		}

		// Если базис найден, прыгаем в его сторону, учитывая ускоряющий множитель
		if (func(next_xs) < func(xs)) {
			let temp = Array.from(xs);
			xs = Array.from(next_xs);

			for (let j = 0; j < next_xs.length; j++) {
				next_xs[j] = next_xs[j] + stepMultiplier * (next_xs[j] - temp[j]);
			}

		// Иначе уменьшаем величины шагов и начинаем поиск с начала
		} else {
			for (let k = 0; k < dxs.length; k++) {
				if (dxs[k] > error) dxs[k] /= reductionCoeff;
			}

			next_xs = Array.from(xs);
		}
	}

	iterNum = k;
	return xs;
}
