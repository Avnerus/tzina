//only reacts to point lights currently
varying vec3 vColor;
varying vec3 vViewPosition;
varying vec3 worldNormal;
varying vec3 eyeDirection;
varying vec3 vWorldPos;
uniform float minAlpha;
uniform float maxAlpha;
uniform float minLightAmt;

// it should be possible to extend support to spotlights, etc in a similar manner
/*
struct PointLight {
    vec3 position;
    vec3 color;
};
uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
*/
void main() {
    /*
    vec4 addedLights = vec4(0.0, 0.0, 0.0, 1.0);
    for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
      vec3 adjustedLight = pointLights[l].position + cameraPosition;
      vec3 lightDirection = normalize(vWorldPos - adjustedLight);
      addedLights.rgb += clamp(dot(lightDirection, worldNormal), minLightAmt, 1.0) * pointLights[l].color;
    }*/

    vec3 r = vec3(0.6, 0.7, 0.95); // water base color
    float alpha = clamp(dot(-eyeDirection, worldNormal), minAlpha, maxAlpha);
    vec4 c = vec4(r, alpha); // water's almost transparent when viewing perpendicularly, gets more opaque when angle changes
    gl_FragColor = c; //* addedLights;
}
