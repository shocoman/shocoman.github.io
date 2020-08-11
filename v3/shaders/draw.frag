#version 300 es
 
precision highp float;
precision highp int;

uniform vec2 u_resolution;
uniform float u_time;
uniform bool u_use_marching_squares;

uniform vec2 u_texture_size;
uniform highp sampler2D u_texture; 

out vec4 outColor;


int get_pixel(vec2);
 
void main() {
	vec2 st = gl_FragCoord.xy / u_resolution.xy;

	vec2 texCoord = st * u_texture_size.xy;
	vec4 texel = texelFetch(u_texture, ivec2(texCoord), 0);
	// vec4 texel = texture(u_texture, st);

	int state = texel.r > 0.5 ? 1 : 0;

	if (u_use_marching_squares ) {
		state = get_pixel(texCoord);
	}


	// if (fract(texCoord.x) < 0.01 || fract(texCoord.y) < 0.01) {
	// 	outColor = vec4(1.0,.0,.0,1.0);
	// 	return;
	// }
	// state = texel.r > 0.5 ? 1 : 0;

	
	float c = state > 0 ? 1.0 : 0.0;

	outColor = vec4(vec3(c), 1.0);
}



int is_cell_alive(ivec2 coord) {
	vec2 texCoord = mod(vec2(coord), u_texture_size);
	vec4 texel = texelFetch(u_texture, ivec2(texCoord), 0);
	return int(step(0.5, texel.r));
}

int get_cell_state(ivec2 coord) {
	int tex00 = is_cell_alive(coord);
	int tex10 = is_cell_alive(coord + ivec2(1, 0));
	int tex01 = is_cell_alive(coord + ivec2(0, -1));
	int tex11 = is_cell_alive(coord + ivec2(1, -1));

	int result = (tex00 << 3) + (tex10 << 2) + (tex11 << 1) + tex01;
	return result;
}


int get_pixel(vec2 coord) {

	ivec2 texCoord = ivec2(coord);
	vec2 texOffset = fract(coord);
	int state = get_cell_state(texCoord);

	// if (state > 16) return 1;

	int result = 0;
	switch (state) {
		case 0: result = 0; break;
		case 15: result = 1; break;

		case 14: // 1110
			if (texOffset.x + texOffset.y > 0.5) result = 1;
			break;

		case 13: // 1101
			if (texOffset.x - texOffset.y < 0.5) result = 1;
			break;

		case 11: // 1011
			if (2.0 - texOffset.x - texOffset.y > 0.5) result = 1;
			break;

		case 7: // 0111
			if (-texOffset.x + texOffset.y < 0.5 ) result = 1;
			break;




		case 1: // 0001
			if (texOffset.x + texOffset.y < 0.5) result = 1;
			break;

		case 2: // 0010
			if (texOffset.x - texOffset.y > 0.5) result = 1; 
			break;

		case 4: // 0100
			if ( 2.0 - texOffset.x - texOffset.y < 0.5) result = 1; 
			break;

		case 8: // 1000
			if (-texOffset.x + texOffset.y > 0.5) result = 1; result = 0;
			break;




		case 12: // 1100
			if (texOffset.y > 0.5) result = 1;
			break;

		case 9: // 1001
			if (texOffset.x < 0.5) result = 1;
			break;

		case 3: // 0011
			if (texOffset.y < 0.5) result = 1;
			break;
		
		case 6: // 0110
			if (texOffset.x > 0.5) result = 1;
			break;
			


				
		case 10: // 1010
			if (-texOffset.x + texOffset.y > 0.5 || texOffset.x - texOffset.y > 0.5) result = 1;
			break;

		case 5: // 0101
			if (texOffset.x + texOffset.y < 0.5 || 2.0 - texOffset.x - texOffset.y < 0.5) result = 1;
			break;

	}


	return result;
}