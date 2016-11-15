#pragma glslify: random = require(glsl-random)
#pragma glslify: curlNoise = require(glsl-curl-noise)
#pragma glslify: rotationMatrix = require(./rotation)

uniform sampler2D positions;
uniform sampler2D morphPositions;
uniform float timer;
uniform float maxDepth;
uniform float amplitude;
uniform float frequency;
varying vec2 vUv;

void main() {
    vec3 pos = texture2D( positions, vUv ).rgb;
    vec3 morphPos = texture2D( morphPositions, vUv ).rgb;

    if( timer<0.3 ){
        pos = pos + (morphPos-pos) * timer;
    }
    
    vec3 velocity = curlNoise( pos * frequency ) * amplitude;
    pos = pos + velocity;
    
    gl_FragColor = vec4( pos, 1.0 );
}
