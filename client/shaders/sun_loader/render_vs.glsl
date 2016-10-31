//float texture containing the positions of each particle
uniform sampler2D positions;
uniform sampler2D origin;

attribute vec2 reference;
varying vec3 vColor;

uniform float pointSize;
uniform float radius;
uniform float tube;

uniform int boom;

void main() {

    //the mesh is a nomrliazed square so the uvs = the xy positions of the vertices
    vec3 pos = texture2D( positions, reference).xyz;

    // Distance from center?
    /*
    vColor = vec3(distToCenter, 0.5, 0.5);
    */

    vColor = vec3(1.0, mix(0.6,1.0,reference.x), mix(0.2,0.8,reference.y));

    if (boom == 1) {
        float distToCenter = distance(pos, vec3(0, 0, 0)) / (radius + tube);
        vColor.g += (25.0 - distToCenter) / 65.0;
        vColor.b += (25.0 - distToCenter) / 65.0;
    }

    gl_Position = projectionMatrix *  modelViewMatrix * vec4( pos, 1.0 );

    gl_PointSize = pointSize;

}
