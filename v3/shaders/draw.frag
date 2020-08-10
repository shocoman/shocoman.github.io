#version 300 es
 
precision highp float;
precision highp int;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec2 u_texture_size;
uniform highp sampler2D u_texture; 

out vec4 outColor;
 
void main() {
	vec2 st = gl_FragCoord.xy / u_resolution.xy;

	// ivec2 texCoord = ivec2(round( st * u_texture_size.xy));
	// vec4 texel = texelFetch(u_texture, texCoord, 0);
	vec4 texel = texture(u_texture, st);

	outColor = vec4(vec3(step(0.5, texel.r)), 1.0);
}