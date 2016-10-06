//float texture containing the positions of each particle
uniform sampler2D positions;
uniform sampler2D origin;

attribute vec2 reference;
varying vec3 vColor;

//size
uniform float pointSize;

void main() {

    //the mesh is a nomrliazed square so the uvs = the xy positions of the vertices
    vec3 pos = texture2D( positions, reference).xyz;

    vColor = vec3(1.0, reference);

    gl_Position = projectionMatrix *  modelViewMatrix * vec4( pos, 1.0 );

    gl_PointSize = pointSize;

}
