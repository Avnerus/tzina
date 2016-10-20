uniform sampler2D map;
uniform float opacity;

uniform float brightness;

uniform float uvdy;
uniform float uvdx;

varying float visibility;
varying vec2 vUv;

void main() {

    if ( visibility < 0.75 ) discard;

    vec3 bright = vec3(brightness,brightness,brightness);

    vec4 color = texture2D( map, vUv + vec2(uvdx, uvdy));
    color.w = opacity;

    color.rgb += bright;

    gl_FragColor = color;
}
