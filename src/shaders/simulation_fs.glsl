#pragma glslify: random = require(glsl-random)
#pragma glslify: curlNoise = require(glsl-curl-noise)
#pragma glslify: rotationMatrix = require(./rotation)

uniform sampler2D positions;
uniform sampler2D morphPositions;
uniform float timer;
uniform float maxDepth;
varying vec2 vUv;

void main() {
    vec3 pos = texture2D( positions, vUv ).rgb;
    vec3 morphPos = texture2D( morphPositions, vUv ).rgb;
    pos = pos + (morphPos-pos) * timer;
    
    vec3 velocity = curlNoise(pos) * 1.0;
    pos = pos + velocity;

    /*
    if (pos.y > 20.0) {
        pos = velocity;
    }
    pos.z -= (random(vUv) * 10.0);
    if (pos.z < -1000.0) {
        pos.z = velocity.z;
    }*/

    gl_FragColor = vec4( pos, 1.0 );
}