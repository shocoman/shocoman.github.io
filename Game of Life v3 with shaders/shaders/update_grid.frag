#version 300 es
 
precision highp float;
precision highp int;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec2 u_texture_size;
uniform highp sampler2D u_texture; 



uniform vec3 u_update_coord;

out vec4 outColor;
 
void main() {
	vec2 st = gl_FragCoord.xy / u_resolution.xy;

	// vec2 texCoord = st * u_texture_size.xy;
	ivec2 texCoord = ivec2(gl_FragCoord.xy);
	vec4 texel = texelFetch(u_texture, texCoord, 0);

	int state = texel.r > 0.5 ? 1 : 0;

    vec2 update_coord = u_update_coord.xy;
    float cell_value = u_update_coord.z;

    if (texCoord == ivec2(update_coord)) {
        state = int(cell_value);
    }
 



	// if (fract(texCoord.x) < 0.01 || fract(texCoord.y) < 0.01) {
	// 	outColor = vec4(1.0,.0,.0,1.0);
	// 	return;
	// }
	// state = texel.r > 0.5 ? 1 : 0;

	
	float c = state > 0 ? 1.0 : 0.0;

	// outColor = vec4(vec3(c), 1.0);
    // outColor = vec4(cell_value,0.,0.,1.0);
    outColor = vec4(vec3(c),1.0);
}

