//float texture containing the positions of each particle
uniform sampler2D positions;
attribute vec2 reference;
varying vec3 vColor;
varying vec2 vUv;

//size
uniform float pointSize;

void main() {
    vUv = uv;


    //the mesh is a nomrliazed square so the uvs = the xy positions of the vertices
    vec3 pos = texture2D( positions, reference).xyz;

    //pos now contains the position of a point in space that can be transformed
    //gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    gl_Position = projectionMatrix *  viewMatrix * vec4( pos, 1.0 );

    gl_PointSize = pointSize;

}
