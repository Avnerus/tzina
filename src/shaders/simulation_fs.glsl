#pragma glslify: random = require(glsl-random)
#pragma glslify: curlNoise = require(glsl-curl-noise)
#pragma glslify: rotationMatrix = require(./rotation)

uniform sampler2D positions;
uniform float timer;
uniform float maxDepth;
varying vec2 vUv;

void main() {
    vec3 pos = texture2D( positions, vUv ).rgb;
    mat4 rotateY = rotationMatrix(vec3(0.0, 1.0, 0.0), random(vUv) * 0.01);
    vec3 velocity = curlNoise(pos * 0.02) * 0.5;
    pos = pos + velocity; 
    if (pos.y > 10.0) {
        pos = velocity;
    }
    /*
    pos.z -= (random(vUv) * 10.0);
    if (pos.z < -1000.0) {
        pos.z = velocity.z;
    }*/
    
    gl_FragColor = vec4( pos, 1.0 ) * rotateY;
}
