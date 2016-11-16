uniform sampler2D map;
uniform float opacity;

uniform float brightness;

uniform float contrast;

uniform float uvdy;
uniform float uvdx;

varying float faceY;

varying float visibility;
varying vec2 vUv;

void main() {

    if ( visibility < 0.75 ) discard;

    vec3 bright = vec3(brightness,brightness,brightness);

    vec4 color = texture2D( map, vUv + vec2(uvdx, uvdy));
    color.rgb = color.rgb - brightness;

    /*

    if( faceY < 230.0 ){

	   	color.rgb += brightness;

	    color.w = opacity + 0.1; 

    } else if ( faceY > 230.0 && faceY < 240.0 ){

	    color.rgb += brightness -0.1;

	    color.w = opacity + 0.05; 

    }
    */

    color.w = opacity;  

    gl_FragColor = color;
}
