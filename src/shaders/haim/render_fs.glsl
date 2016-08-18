#pragma glslify: random = require(glsl-random)
uniform sampler2D texture1;
varying vec3 vColor;
varying vec2 vUv;

void main() {
  //gl_FragColor = vec4( vec3( 1., .5, .5 ), .85 );
  gl_FragColor = vec4( vColor, .85 );
  
  //gl_FragColor = gl_FragColor * texture2D( texture1, vec2( gl_PointCoord.x+1.0, gl_PointCoord.y+1.0 ) );
  //gl_FragColor = texture2D( texture1, vUv );
  //gl_FragColor = gl_FragColor * vec4( vColor, 1.0 );
}