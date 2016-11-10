uniform sampler2D positions;
uniform sampler2D origin;

attribute vec2 reference;
varying vec3 vColor;

uniform float pointSize;

void main() {

      vec3 pos = texture2D(positions, reference).xyz;

      vColor = vec3(1.0, reference);

      gl_Position = projectionMatrix *  modelViewMatrix * vec4( pos, 1.0 );
      if(pos.z < 0.0) {
        gl_PointSize = 0.0;
      }
      else {
        gl_PointSize = pointSize;
      }
}
