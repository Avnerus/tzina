//float texture containing the positions of each particle
uniform sampler2D positions;
uniform sampler2D origin;

attribute vec2 reference;
varying vec3 vColor;

uniform float pointSize;
uniform float radius;
uniform float tube;

void main() {

    //the mesh is a nomrliazed square so the uvs = the xy positions of the vertices
    vec3 pos = texture2D( positions, reference).xyz;

    // Distance from center?
    /*
    float distToCenter = distance(pos, vec3(0, 0, 0)) / (radius + tube);
    vColor = vec3(distToCenter, 0.5, 0.5);
    */

    vColor = vec3(1.0, reference);

    gl_Position = projectionMatrix *  modelViewMatrix * vec4( pos, 1.0 );

    gl_PointSize = pointSize;

}
