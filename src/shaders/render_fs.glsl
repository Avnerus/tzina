#pragma glslify: random = require(glsl-random)
varying vec3 vColor;
void main() {
  //gl_FragColor = vec4( vec3( 1., .5, .5 ), .85 );
  gl_FragColor = vec4( vColor, .85 );
}
