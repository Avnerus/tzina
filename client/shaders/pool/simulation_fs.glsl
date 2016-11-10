uniform sampler2D positions;
uniform sampler2D origin;
uniform float timer;
uniform float timeFactor;

varying vec2 vUv;

uniform float orderTimer;
uniform float splashTimer;
uniform float forceFactor;

const float PI = 3.1415926535897932384626433832795;

//this is exactly the same as in glsl-random
//not using node here so this CAN be fixed with glslify
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
      vec3 pos;
      vec3 originPos;
          
      pos = texture2D( positions, vUv ).rgb;
      originPos = texture2D( origin, vUv ).rgb;
      if(originPos.z < 0.0) originPos.z = -originPos.z;

      float t = (10.0 - (splashTimer)) * timeFactor;
      vec3 ground = vec3(originPos.x, originPos.y, 0.0);
      float theta = acos(dot(normalize(originPos), normalize(ground)));
      float v0 = 1.5 * length(originPos);
      float g = 1.0;

      pos.x = v0 * t * forceFactor * cos(theta) * originPos.x;
      pos.y = v0 * t * forceFactor * cos(theta) * originPos.y;
      pos.z = v0 * t * forceFactor * sin(theta) - 0.5 * g * t * t;
      
      gl_FragColor = vec4( pos, 1.0 );
}
