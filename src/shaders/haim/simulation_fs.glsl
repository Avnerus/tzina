#pragma glslify: random = require(glsl-random)
#pragma glslify: curlNoise = require(glsl-curl-noise)
#pragma glslify: rotationMatrix = require(./rotation)

uniform sampler2D positions;
uniform float timer;
uniform float maxDepth;
uniform float amplitude;
uniform float frequency;
float acce = 0.0;
varying vec2 vUv;

void main() {
    vec3 pos = texture2D( positions, vUv ).rgb;
    
    vec3 velocity = curlNoise( pos * frequency ) * amplitude;
    acce += 0.02;
    velocity.y -= acce;
    pos = pos + velocity;

    //mat4 rotateY = rotationMatrix(vec3(0.0, 1.0, 0.0), random(vUv) * 0.01);
    mat4 rotateX = rotationMatrix(vec3(1.0, 0.0, 0.0), 1.0);
    if (pos.y < 5.0) {
       pos.y += 11.5;
       acce = 0.0;
    }
    //gl_FragColor = vec4( pos, 1.0 )*rotateX;
    
    gl_FragColor = vec4( pos, 1.0 );
}