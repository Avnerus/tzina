#pragma glslify: random = require(glsl-random)
uniform sampler2D texture1;
varying vec3 vColor;
varying vec2 vUv;

void main() {
  //gl_FragColor = vec4( vec3( 1., .5, .5 ), .85 );
  gl_FragColor = vec4( 1., 1., 1., .9 );
}