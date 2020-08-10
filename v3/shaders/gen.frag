#version 300 es
 
precision highp float;
precision highp int;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec2 u_texture_size;
uniform highp sampler2D u_texture; 

out vec4 outColor;

bool is_cell_alive(ivec2);
bool get_cell_status(ivec2);
 
void main() {
	vec2 st = gl_FragCoord.xy / u_resolution.xy;

	// ivec2 texCoord = ivec2(st * u_texture_size.xy);
	ivec2 texCoord = ivec2(gl_FragCoord.xy);
	vec4 texel = texelFetch(u_texture, texCoord, 0);

	// outColor = vec4(1.0-texel.r, 0.0, 0.0, 1.0);

	if (get_cell_status(texCoord)) {
		outColor = vec4(1.0, 0.0, 0.0, 1.0);
	} else {
		outColor = vec4(0.0, 0.0, 0.0, 1.0);
	}
}


bool is_cell_alive(ivec2 coord) {
	vec4 cell = texelFetch(u_texture, coord, 0);
	return cell.r > 0.5;
}

int count_neighbours(ivec2 coord) {
	int neighs_count = 0;
	for (int i = -1; i <= 1; i++){	
		for (int j = -1; j <= 1; j++){
			if (i == 0 && j == 0) continue;
			ivec2 neigh_coord = ivec2(mod(vec2(coord + ivec2(i, j)), float(u_texture_size)));
			neighs_count += int(is_cell_alive(neigh_coord));
		}
	}

	return neighs_count;
}

bool get_cell_status(ivec2 coord) {
	int neighs = count_neighbours(coord);
	bool alive = is_cell_alive(coord);

	bool will_live = false;
	if (alive && (neighs < 2 || neighs > 3)) {
		will_live = false;
	} else if (!alive && neighs == 3) {
		will_live = true;
	} else {
		will_live = alive;
	}


	return will_live;
}