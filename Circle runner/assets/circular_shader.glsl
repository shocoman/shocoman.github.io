#version 100
precision lowp float;

varying vec4 color;
varying vec2 uv;

uniform sampler2D Texture;

#define PI     3.14159265

void main()
{
    vec2 center = vec2(0.5,1.0);
    vec2 to_center = center - uv;
    float dst = distance(uv, center);

    float r = dst;
    float angle = 0.0;
    if (to_center.x != 0.0) {
        angle = atan(to_center.y / to_center.x);
    }

    // Output to screen
    float tx = mod(angle / PI, 1.0);
    float ty = r * 1.0 - 0.2;

    vec4 col = texture2D(Texture, vec2(tx, 1.0-ty));
    if (ty > 0.0) gl_FragColor = col;
    else gl_FragColor = vec4(0.969, 0.969, 0.969, 1.0);
}