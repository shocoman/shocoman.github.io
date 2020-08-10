
import * as twgl from "./twgl/twgl-full.module.js"


const urlParams = new URLSearchParams(window.location.search);
const width = urlParams.get('w') || 600;
const height = urlParams.get('h') || 600;
const grid_width = urlParams.get('gw') || 100; 
const grid_height = urlParams.get('gh') || 100;
const updateInterval = urlParams.get('u') || 100;
console.log("Param names: canvas width -> w; canvas height -> h; grid width -> gw; grid height -> gh; update interval -> u");


window.onload = main;
async function main() {

	const draw_vert_shader = await fetch('./shaders/draw.vert').then(val => val.text());
	const draw_frag_shader = await fetch('./shaders/draw.frag').then(val => val.text());
	const gen_frag_shader = await fetch('./shaders/gen.frag').then(val => val.text());

	const canvas = document.querySelector("#mycanvas");
	canvas.width = width;
	canvas.height = height;

	/**@type {WebGL2RenderingContext} */
	let gl = canvas.getContext("webgl2");


	
	let grid_cells = [];
	for (let i = 0; i < grid_width * grid_height; i++) {
		grid_cells.push( Math.random() > 0.5 ? 255 : 0 );
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

	const arrays = {
		a_position: { numComponents: 2, data: [0, 0, width, 0, 0, height, width, height] },
		indices: [0, 1, 2, 1, 2, 3]
	};
	const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);


	let textures = [grid, backup_grid];
	let curTexture = 0;
	function render(time) {

		twgl.resizeCanvasToDisplaySize(gl.canvas);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


		gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
		gl.framebufferTexture2D(gl.FRAMEBUFFER,
			gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D,
			textures[(curTexture + 1) % textures.length],
			0);
		gl.viewport(0, 0, grid_width, grid_height);
	

		const gen_uniforms = {
			u_time: time * 0.001,
			u_resolution: [gl.canvas.width, gl.canvas.height],
			u_texture_size: [grid_width, grid_height],
			u_texture: textures[(curTexture) % textures.length],
		};

		gl.useProgram(genProgramInfo.program);
		twgl.setBuffersAndAttributes(gl, genProgramInfo, bufferInfo);
		twgl.setUniforms(genProgramInfo, gen_uniforms);
		twgl.drawBufferInfo(gl, bufferInfo);



		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		const draw_uniforms = {
			u_time: time * 0.001,
			u_resolution: [gl.canvas.width, gl.canvas.height],
			u_texture_size: [grid_width, grid_height],
			u_texture: textures[(curTexture + 1) % textures.length],
		};

		gl.useProgram(drawProgramInfo.program);
		twgl.setBuffersAndAttributes(gl, drawProgramInfo, bufferInfo);
		twgl.setUniforms(drawProgramInfo, draw_uniforms);
		twgl.drawBufferInfo(gl, bufferInfo);

		curTexture += 1;
	}

	render(0);
	setInterval(() => {
		render(0);
	}, updateInterval);
};


