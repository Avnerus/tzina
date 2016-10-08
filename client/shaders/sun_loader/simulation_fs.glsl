#pragma glslify: random = require(glsl-random)

uniform sampler2D positions;
uniform sampler2D origin;
uniform float timer;
uniform float radius;
uniform float tube;

varying vec2 vUv;

uniform float orderTimer;

const float PI = 3.1415926535897932384626433832795;

void main() {
    vec3 pos;
    vec3 originPos;
        
    pos = texture2D( positions, vUv ).rgb;
    originPos = texture2D( origin, vUv ).rgb;

    if (orderTimer <= 0.3) {
        if ( random(vUv + timer ) > 0.99 ) {
            pos = texture2D( origin, vUv ).xyz;
        } else {
            pos = texture2D( positions, vUv ).rgb;

            float x = pos.x;
            float y = pos.y;
            float z = pos.z;


            pos.x += sin( y * 12.0 ) * cos( z * 12.0 ) * 0.007 * (1.0 - (orderTimer / 0.3));
            pos.y += sin( x * 13.0 ) * cos( z * 13.0 ) * 0.007 * (1.0 - (orderTimer / 0.3));
            pos.z += sin( x * 14.0 ) * cos( y * 14.0 ) * 0.007 * (1.0 - (orderTimer / 0.3));
        } 
    } else {
        // Try to organize the circle by color
        float particleRadius = distance(originPos, vec3(0, 0, 0));
        float progressInCircle = (1.0 - vUv.x) * (1.1 - vUv.y) / 0.84;
        if (progressInCircle > 1.0) {
            progressInCircle -= 0.3;
        }
        pos.x = mix(originPos.x,cos(progressInCircle * 2.0 * PI) * particleRadius, (orderTimer-0.3)/0.7);
        pos.y = mix(originPos.y, sin(progressInCircle * 2.0 * PI) * particleRadius, (orderTimer-0.3)/0.7);
    }


    gl_FragColor = vec4( pos, 1.0 );
}

