#pragma glslify: random = require(glsl-random)
#pragma glslify: curlNoise = require(glsl-curl-noise)
#pragma glslify: rotationMatrix = require(./rotation)

uniform sampler2D positions;
uniform float deltaTime;
uniform float maxDepth;
uniform float amplitude;
uniform float frequency;
uniform float gravity;
uniform float mouseRotation;
uniform float squareRadius;
uniform float squareCenterX;
uniform float squareCenterY;
uniform float squareCenterZ;
uniform float bounceFactor;
vec3 acce = vec3(0.0,0.0,0.0);
vec3 velocity = vec3(0.0,0.0,0.0);
vec3 wind = vec3(1.0,0.0,0.0);
vec3 force = vec3(0.0, 0.0, 0.0);
vec3 squareCenter;
varying vec2 vUv;

void main() {
    vec3 pos = texture2D( positions, vUv ).rgb;
    /*

    // if hitting square
    squareCenter = vec3(squareCenterX, squareCenterY, squareCenterZ);
    float disToSq = distance(pos, squareCenter);
    if ( disToSq < squareRadius ) {
        force = normalize(pos - squareCenter);
        force *= bounceFactor;
    }

    // decreasing the force gradually
    if ( distance(force, vec3(0.0))>0.1 ){
        force /= 2.0;
    } else {
        force *= 0.0;
    }
    acce += force;

    // wind from mouse
    wind *= (mouseRotation / disToSq * 20.0);
    // decreasing the wind gradually
    if ( distance(wind, vec3(0.0))>0.1 ){
        wind /= 2.0;
    } else {
        wind *= 0.0;
    }
    acce += wind;
    
    // gravity
    // acce.y -= ( random(pos.xz) * gravity );
    acce.y -= ( random(pos.xz) * gravity * deltaTime );

    velocity = velocity + acce;
    pos = pos + velocity;

    acce *= 0.0;
    wind = vec3(1.0,0.0,0.0);

    // if hitting ground, reset
    if (pos.y < -300.0) {  //
       pos.y += 450.0;     // top: ~150
       pos.x = -40.0 + random(pos.xz) * 70.0;
       pos.z = -20.0 + random(pos.xz) * 50.0;

       //acce *= 0.0;
       velocity *= 0.0;
    }*/

    gl_FragColor = vec4( pos, 1.0 );
}
