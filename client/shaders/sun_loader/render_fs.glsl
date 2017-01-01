varying vec3 vColor;
uniform float orderTimer;
varying float progressInCircle;
uniform int organizing;

void main() {
  //gl_FragColor = vec4( vec3( 1., .5, .5 ), .85 );

    if (organizing == 1 && orderTimer <  progressInCircle) {
        discard;
    }
    
  gl_FragColor = vec4(vColor, 1.);
}
