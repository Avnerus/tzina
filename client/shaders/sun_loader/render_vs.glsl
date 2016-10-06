//float texture containing the positions of each particle
uniform sampler2D positions;
attribute vec2 reference;

//size
uniform float pointSize;

void main() {

    //the mesh is a nomrliazed square so the uvs = the xy positions of the vertices
    vec3 pos = texture2D( positions, reference).xyz;

    gl_Position = projectionMatrix *  modelViewMatrix * vec4( pos, 1.0 );

    gl_PointSize = pointSize;

}
