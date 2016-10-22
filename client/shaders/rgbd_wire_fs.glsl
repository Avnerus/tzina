uniform sampler2D map;
uniform float opacity;

uniform float brightness;

uniform float uvdy;
uniform float uvdx;

varying float clipping;

varying float holes_y;
varying float holes_x;

varying vec2 vUv;

void main() {

    if ( clipping < 0.75 ) discard;

    if ( holes_y < 1.7 ) discard;

    if ( holes_x < 1.2 ) discard;

    vec3 bright = vec3(brightness,brightness,brightness);

    vec4 color = texture2D( map, vUv + vec2(uvdx, uvdy));
    color.w = opacity;

    color.rgb += bright;

    gl_FragColor = color;
}
