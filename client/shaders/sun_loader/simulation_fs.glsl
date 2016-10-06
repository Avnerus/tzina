#pragma glslify: random = require(glsl-random)

uniform sampler2D positions;
uniform sampler2D origin;
uniform float timer;

varying vec2 vUv;

void main() {
    vec3 pos;
        
    if ( random(vUv + timer ) > 0.97 ) {
        pos = texture2D( origin, vUv ).xyz;
    } else {
        pos = texture2D( positions, vUv ).rgb;

        float x = pos.x;
        float y = pos.y;
        float z = pos.z;


        pos.x += sin( y * 7.0 ) * cos( z * 12.0 ) * 0.05;
        pos.y += sin( x * 8.0 ) * cos( z * 13.0 ) * 0.05;
        pos.z += sin( x * 9.0 ) * cos( y * 14.0 ) * 0.05;
    }


    gl_FragColor = vec4( pos, 1.0 );
}
