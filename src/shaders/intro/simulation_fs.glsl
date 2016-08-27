#pragma glslify: random = require(glsl-random)
#pragma glslify: curlNoise = require(glsl-curl-noise)
#pragma glslify: rotationMatrix = require(./rotation)

uniform sampler2D positions;
uniform float timer;
uniform float maxDepth;
uniform float amplitude;
uniform float frequency;
uniform float gravity;
uniform float squareRadius;
uniform float squareCenterX;
uniform float squareCenterY;
uniform float squareCenterZ;
uniform float bounceFactor;
vec3 acce = vec3(0.0,0.0,0.0);
vec3 force;
vec3 squareCenter;
varying vec2 vUv;

void main() {
    vec3 pos = texture2D( positions, vUv ).rgb;
    vec3 velocity = curlNoise( pos * frequency ) * amplitude;

    // if hitting square
    squareCenter = vec3(squareCenterX, squareCenterY, squareCenterZ);
    if ( distance(pos, squareCenter)<squareRadius ) {
        force = normalize(pos - squareCenter);
        force *= bounceFactor;
        force.x *= 5.0;
    }

    if ( distance(force, vec3(0.0))>0.1 ){
        force /= 2.0;
    } else {
        force *= 0.0;
    }

    acce += force;
    
    // gravity
    acce.y -= ( random(vUv) * gravity );

    velocity = velocity + acce;
    pos = pos + velocity;

    // if hitting ground, reset
    if (pos.y < -1500.0) {
       pos.y += 3000.0;
       acce *= 0.0;
    }

    gl_FragColor = vec4( pos, 1.0 );
}