//float texture containing the positions of each particle
uniform sampler2D positions;
attribute vec2 reference;
varying vec3 vColor;

//size
uniform float pointSize;

void main() {

    vec3 newPosition = position; 
    newPosition = mat3( modelMatrix ) * newPosition;

    //the mesh is a nomrliazed square so the uvs = the xy positions of the vertices
    vec3 pos = texture2D( positions, reference).xyz;

    newPosition += pos;

    //pos now contains the position of a point in space taht can be transformed
    //gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    vColor = newPosition;
    gl_Position = projectionMatrix *  viewMatrix * vec4( newPosition, 1.0 );

    gl_PointSize = pointSize;

}
