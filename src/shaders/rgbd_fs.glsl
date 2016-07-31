uniform sampler2D map;
uniform float opacity;

uniform float uvd;

varying float visibility;
varying vec2 vUv;

void main() {

    if ( visibility < 0.75 ) discard;

    //vec4 color = texture2D( map, vUv + vec2(0.0, 0.440277) );
    vec4 color = texture2D( map, vUv + vec2(0.0, uvd));
    color.w = opacity;

    gl_FragColor = color;
}
