
import * as twgl from "./twgl/twgl-full.module.js"


const urlParams = new URLSearchParams(window.location.search);
let width = urlParams.get('w') || 600;
let height = urlParams.get('h') || 600;
let grid_width = urlParams.get('gw') || 100;
let grid_height = urlParams.get('gh') || 100;
let updateInterval = urlParams.get('u') || 100;
let fullscreen_scale = urlParams.get('f');

console.log(` 
	Param names: canvas width -> w; canvas height -> h; grid width -> gw; 
		grid height -> gh; update interval -> u; use full screen mode and apply scale factor -> f;
	SPACE - turn on/off marching squares
	S - pause evolving,
	N - next step (when paused)`);

let useMarchingSquares = true;
let evolve_pause = false;
let mouse_is_pressed = false;


if (fullscreen_scale) {
	width = window.innerWidth - 20;
	height = window.innerHeight - 20;
	let cell_size = fullscreen_scale;

	let aspect_ratio = width / height;
	let cell_rows = Math.floor(height / cell_size);
	let cell_cols = Math.floor(width / cell_size);

	if (aspect_ratio > 1.0) {

	}

	grid_height = cell_rows;
	grid_width = cell_cols;
}


async function main() {

	const draw_vert_shader = await fetch('./shaders/draw.vert').then(val => val.text());
	const draw_frag_shader = await fetch('./shaders/draw.frag').then(val => val.text());
	const gen_frag_shader = await fetch('./shaders/gen.frag').then(val => val.text());
	const update_grid_frag_shader = await fetch('./shaders/update_grid.frag').then(val => val.text());

	const canvas = document.querySelector("#mycanvas");
	canvas.width = width;
	canvas.height = height;


	/**@type {WebGL2RenderingContext} */
	let gl = canvas.getContext("webgl2");

	let grid_cells = [];
	for (let i = 0; i < grid_width * grid_height; i++) {
		grid_cells.push(Math.random() > 0.5 ? 255 : 0);
	}


	const grid = twgl.createTexture(gl, {
		mag: gl.LINEAR,
		min: gl.LINEAR,
		internalFormat: gl.R8,
		format: gl.RED,
		type: gl.UNSIGNED_BYTE,
		src: new Uint8Array(grid_cells),
		width: grid_width,
		height: grid_height,
	});

	const backup_grid = twgl.createTexture(gl, {
		mag: gl.LINEAR,
		min: gl.LINEAR,
		internalFormat: gl.R8,
		format: gl.RED,
		type: gl.UNSIGNED_BYTE,
		src: new Uint8Array(grid_cells),
		width: grid_width,
		height: grid_height,
	});


	const fb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, grid, 0);



	const drawProgramInfo = twgl.createProgramInfo(gl, [draw_vert_shader, draw_frag_shader]);
	const genProgramInfo = twgl.createProgramInfo(gl, [draw_vert_shader, gen_frag_shader]);
	const updateGridProgramInfo = twgl.createProgramInfo(gl, [draw_vert_shader, update_grid_frag_shader]);

	const arrays = {
		a_position: { numComponents: 2, data: [0, 0, width, 0, 0, height, width, height] },
		indices: [0, 1, 2, 1, 2, 3]
	};
	const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

	let textures = [grid, backup_grid];
	let curTexture = 0;


	function update_selected_cell(texture, backup_texture, cell_x, cell_y, value) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
		gl.framebufferTexture2D(gl.FRAMEBUFFER,
			gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D,
			texture,
			0);
		gl.viewport(0, 0, grid_width, grid_height);

		const gen_uniforms = {
			u_time: 0 * 0.001,
			u_resolution: [gl.canvas.width, gl.canvas.height],
			u_texture_size: [grid_width, grid_height],
			u_texture: backup_texture,
			u_update_coord: [cell_x, cell_y, value]
		};

		gl.useProgram(updateGridProgramInfo.program);
		twgl.setBuffersAndAttributes(gl, updateGridProgramInfo, bufferInfo);
		twgl.setUniforms(updateGridProgramInfo, gen_uniforms);
		twgl.drawBufferInfo(gl, bufferInfo);
	}

	function put_cell(event) {
		/** @type {MouseEvent} */
		let evn = event;

		let cell_x = Math.floor(grid_width * (evn.offsetX / width));
		let cell_y = (grid_height - 1) - Math.floor(grid_height * (evn.offsetY / height));

		let grid = textures[curTexture % textures.length];
		let backup_grid = textures[(curTexture+1) % textures.length];
		update_selected_cell(grid, backup_grid, cell_x, cell_y, evn.buttons == 1 ? 1 : 0);
		update_selected_cell(backup_grid, grid, cell_x, cell_y, evn.buttons == 1 ? 1 : 0);

		// console.log(evn.buttons);

		evn.preventDefault();
	}


	function generate_next_grid_of_cells() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
		gl.framebufferTexture2D(gl.FRAMEBUFFER,
			gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D,
			textures[(curTexture + 1) % textures.length],
			0);
		gl.viewport(0, 0, grid_width, grid_height);

		const gen_uniforms = {
			u_resolution: [gl.canvas.width, gl.canvas.height],
			u_texture_size: [grid_width, grid_height],
			u_texture: textures[curTexture % textures.length],
		};

		gl.useProgram(genProgramInfo.program);
		twgl.setBuffersAndAttributes(gl, genProgramInfo, bufferInfo);
		twgl.setUniforms(genProgramInfo, gen_uniforms);
		twgl.drawBufferInfo(gl, bufferInfo);

		curTexture += 1;
	}


	function draw_cells(time) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		const draw_uniforms = {
			u_time: time * 0.001,
			u_resolution: [gl.canvas.width, gl.canvas.height],
			u_texture_size: [grid_width, grid_height],
			u_texture: textures[(curTexture + 1) % textures.length],
			u_use_marching_squares: useMarchingSquares,
			u_paused: evolve_pause
		};

		gl.useProgram(drawProgramInfo.program);
		twgl.setBuffersAndAttributes(gl, drawProgramInfo, bufferInfo);
		twgl.setUniforms(drawProgramInfo, draw_uniforms);
		twgl.drawBufferInfo(gl, bufferInfo);

	}

	function add_event_listeners() {
		canvas.addEventListener('mousedown', event => { put_cell(event); mouse_is_pressed = true; });
		canvas.addEventListener('mouseup', event => { mouse_is_pressed = false; });
		canvas.addEventListener('mousemove', event => { if (mouse_is_pressed) put_cell(event); });
		document.addEventListener('keydown', event => {
			if (event.code === 'Space') {
				useMarchingSquares = !useMarchingSquares;
				event.preventDefault();
			} else if (event.key === 's') {
				evolve_pause = !evolve_pause;
				event.preventDefault();
			} else if (event.key === 'n') {
				generate_next_grid_of_cells();
				event.preventDefault();
			}
		});
	
	}
	
	function render(time) {
		twgl.resizeCanvasToDisplaySize(gl.canvas);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		if (!evolve_pause) generate_next_grid_of_cells();
		draw_cells(time);
	}


	add_event_listeners();
	render(0);
	setInterval(() => {
		render(0);
	}, updateInterval);
};
main();


