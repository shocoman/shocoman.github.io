let funcInput;
let func = ([x1, x2]) => eval('4*(x1-5)**2 + (x2 - 6)**2');
// let func = ([x1, x2]) => eval('2*x1**3 + x1**2 - 3*x2**2 - 2*x1 + 2');

let answerText;
let iterNum;

function setup() {
	createInputFields();
	noCanvas();

	let min = polygonMethod(func);
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


let add = function(xs1, xs2) {
	let newArray = Array.from(xs1);
	for (let i = 0; i < xs1.length; i++) {
		newArray[i] += xs2[i];
	}

	return newArray;
};

let sub = function(xs1, xs2) {
	let newArray = Array.from(xs1);
	for (let i = 0; i < xs1.length; i++) {
		newArray[i] -= xs2[i];
	}

	return newArray;
};

let mult = function(xs, scalar) {
	let newArray = Array.from(xs);
	for (let i = 0; i < xs.length; i++) {
		newArray[i] *= scalar;
	}

	return newArray;
};

let min = function(xs, arg = false) {
	let minElement = Infinity;
	let minArg = 0;

	for (let i = 0; i < xs.length; i++) {
		if (xs[i] < minElement) {
			minElement = xs[i];
			minArg = i;
		}
	}

	return arg ? minArg : minElement;
};

let max = function(xs, arg = false) {
	let maxElement = -Infinity;
	let maxArg = 0;

	for (let i = 0; i < xs.length; i++) {
		if (xs[i] > maxElement) {
			maxElement = xs[i];
			maxArg = i;
		}
	}

	return arg ? maxArg : maxElement;
};

let secondMax = function(xs, arg = false) {
	let maxElement = -Infinity;
	let secondMaxElement = -Infinity;
	let secondMaxArg = 0;

	for (let i = 0; i < xs.length; i++) {
		if (xs[i] > maxElement) {
			secondMaxElement = maxElement;
			secondMaxArg = i;
			maxElement = xs[i];
		} else if (xs[i] < maxElement && xs[i] > secondMaxElement) {
			secondMaxElement = xs[i];
			secondMaxArg = i;
		}
	}

	return arg ? secondMaxArg : secondMaxElement;
};

let myMap = function(xs, func) {
	let newArray = Array.from(xs);

	for (let i = 0; i < xs.length; i++) {
		newArray[i] = func(newArray[i]);
	}

	return newArray;
};

let calcWeightCenter = function(xs, func, maxXarg) {
	let sum = new Array(xs.length-1).fill(0);

	for (let i = 0; i < xs.length; i++) {
		if (i != maxXarg) {
			sum = add(sum, xs[i]);
		}
	}
	let center = mult(sum, 1/(xs.length - 1));

	return center;
};

let calcSigmaFunction = function(xs, weightCenter, func) {
	let sum = 0;
	for (let i = 0; i < xs.length; i++) {
		sum += (func(xs[i]) - func(weightCenter)) ** 2;
	}

	let sigma = sqrt(sum / xs.length);
	return sigma;
};

let calcNewPolygon = function(xs, xl) {
	let newArray = Array.from(xs);

	for (let i = 0; i < xs.length; i++) {
		newArray[i] = add(xl, mult(sub(newArray[i], xl), 0.5));
	}

	return newArray;
};


// Минимизация методом деформируемого многогранника
let polygonMethod = function(func) {
	let coords = [[8, 9], [10, 11], [8, 11]]; // Начальные точки многогранника
	let reflectCoeff = 1;	// Коэффициент отражения
	let shrinkCoeff = 0.5;	// Коэффициент сжатия
	let stretchCoeff = 2;	// Коэффициент растяжения
	let error = 0.2;		// Число для остановки алгоритма

	createElement('h3', 'Начальные точки многогранника: [ [' + coords[0] + '], [' + coords[1] + '], [' + coords[2] +
	'] ]<br>Коэффициент отражения: ' + reflectCoeff + 
	'<br>Коэффициент сжатия: ' + shrinkCoeff + 
	'<br>Коэффициент растяжения: ' + stretchCoeff + 
	'<br>Число для остановки алгоритма: ' + error);

	iterNum = 0;			// Счётчик итераций
	while (1) {
		let fs = myMap(coords, func);

		let xl = min(fs, (arg = true));	// Минимальная точка
		let xh = max(fs, (arg = true));	// Максимальная точка
		let xs = secondMax(fs, (arg = true)); // Вторая максимальная точка (меньше первой)

		let weightCenter = calcWeightCenter(coords, func, xh); // Центр тяжести

		// Если среднеквадратичное отклонение от центра тяжести не превышает "error"
		// программа завершается
		let sigma = calcSigmaFunction(coords, weightCenter, func);
		if (sigma <= error) {
			return coords[xl];
		}
		iterNum++;
		
		// Отражаем максимальную точку через центр тяжести
		let reflectedX = add(weightCenter, mult(sub(weightCenter, coords[xh]), reflectCoeff));

		// Если отраженная точка меньше минимальной
		if (func(reflectedX) <= func(coords[xl])) {

			// Растягиваем отражённую точку
			let stretchedX = add(weightCenter, mult(sub(reflectedX, weightCenter), stretchCoeff));

			// Если новая точка всё ещё меньше минимальной,
			// то заменяем ей максимальную точка
			// иначе просто берём отражённую точку
			if (func(stretchedX) < func(coords[xl])) {
				coords[xh] = stretchedX;
			} else {
				coords[xh] = reflectedX;
			}

		// Если отражённая точка между максимальными,
		// сжимаем и заменяем этой сжатой точкой максимальную
		} else if (func(coords[xs]) < func(reflectedX) && func(reflectedX) <= func(coords[xh])) {
			let compressionX = add(weightCenter, mult(sub(coords[xh], weightCenter), shrinkCoeff));
			coords[xh] = compressionX;

		// Если отражённая точка между минимальной и максимальной, заменяем её максимальную точку
		} else if (func(coords[xl]) < func(reflectedX) && func(reflectedX) <= func(coords[xs])) {
			coords[xh] = reflectedX;

		// Если отражённая точка больше максимальной, производим редукцию, 
		// т.е. уменьшаем все стороны многогранника в два раза,
		// прежняя минимальная точка остаётся на месте
		} else {
			coords = calcNewPolygon(coords, coords[xl]);
		}
	}
};
