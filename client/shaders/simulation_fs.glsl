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

    if( timer<0.97 ){
        pos = pos + (morphPos-pos) * timer;
    }
    
    vec3 velocity = curlNoise( pos * frequency ) * amplitude;
    pos = pos + velocity;

    //mat4 rotateY = rotationMatrix(vec3(0.0, 1.0, 0.0), random(vUv) * 0.01);
    //if (pos.y > 10.0) {
    //   pos = velocity;
    //}
    /*
    pos.z -= (random(vUv) * 10.0);
    if (pos.z < -1000.0) {
        pos.z = velocity.z;
    }*/
    // gl_FragColor = vec4( pos, 1.0 )*rotateY;
    
    gl_FragColor = vec4( pos, 1.0 );
}
