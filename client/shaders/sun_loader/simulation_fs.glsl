#pragma glslify: random = require(glsl-random)

uniform sampler2D positions;
uniform sampler2D origin;
uniform float timer;
uniform float radius;
uniform float tube;

varying vec2 vUv;

uniform float orderTimer;
uniform float explodeTimer;

const float PI = 3.1415926535897932384626433832795;

void main() {
    vec3 pos;
    vec3 originPos;
        
    pos = texture2D( positions, vUv ).rgb;
    originPos = texture2D( origin, vUv ).rgb;

    if (explodeTimer == 1.0) {
        pos = originPos;
    } 

    if (orderTimer == 0.0) {
        if ( random(vUv + timer ) > 0.99 ) {
            pos = texture2D( origin, vUv ).xyz;
        } else {
            pos = texture2D( positions, vUv ).rgb;

            float x = pos.x;
            float y = pos.y;
            float z = pos.z;


            pos.x += sin( y * 13.0 ) * cos( z * 13.0 ) * 0.02 * (1.0 - (orderTimer / 0.3));
            pos.y += sin( x * 13.0 ) * cos( z * 13.0 ) * 0.01 * (1.0 - (orderTimer / 0.3));
            pos.z += sin( x * 14.0 ) * cos( y * 14.0 ) * 0.01 * (1.0 - (orderTimer / 0.3));
        } 
    } else {
        // Try to organize the circle by color
        float particleRadius = distance(originPos, vec3(0, 0, 0));

        if (explodeTimer > 0.0 && explodeTimer < 1.0) {
            float variation = 0.2 + random(vUv + explodeTimer) * 0.8;
            particleRadius += (50.0 * explodeTimer * explodeTimer * variation);
        }

        float progressInCircle = (1.0 - vUv.x) * (1.1 - vUv.y) / 0.84;
        if (progressInCircle > 1.0) {
            progressInCircle -= 0.3;
        }
        pos.x = cos(progressInCircle * 2.0 * PI) * particleRadius;
        pos.y = sin(progressInCircle * 2.0 * PI) * particleRadius;
    }


    gl_FragColor = vec4( pos, 1.0 );
}

