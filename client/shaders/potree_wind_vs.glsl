// frequencies for rustling animation
// can be tweaked to taste
#define SIDE_TO_SIDE_FREQ1 1.975
#define SIDE_TO_SIDE_FREQ2 0.793
#define UP_AND_DOWN_FREQ1 0.375
#define UP_AND_DOWN_FREQ2 0.193

varying vec3 vColor;

// uniforms
// common uniforms
uniform float time; // increase by delta time in render loop
uniform float speedFactor; // larger value -> faster bending and rustling
uniform float pointSize; // rendering point size

// bending uniforms
uniform float bendFactor; // amount of bending
uniform float bendHeightLimit; // the height above which the bending starts
uniform vec2 wind; // direction & speed of the wind on the xz plane - note: only affects bending

#define max_clip_boxes 30

attribute float intensity;
attribute float classification;
attribute float returnNumber;
attribute float numberOfReturns;
attribute float pointSourceID;
attribute vec4 indices;

uniform float screenWidth;
uniform float screenHeight;
uniform float fov;
uniform float spacing;
uniform float near;
uniform float far;

#if defined use_clip_box
uniform mat4 clipBoxes[max_clip_boxes];
#endif


uniform float heightMin;
uniform float heightMax;
uniform float intensityMin;
uniform float intensityMax;
uniform float size; // pixel size factor
uniform float minSize; // minimum pixel size
uniform float maxSize; // maximum pixel size
uniform float octreeSize;
uniform vec3 bbSize;
uniform vec3 uColor;
uniform float opacity;
uniform float clipBoxCount;


uniform sampler2D visibleNodes;
uniform sampler2D gradient;
uniform sampler2D classificationLUT;
uniform sampler2D depthMap;

varying float vOpacity;
varying vec3 vColor;
varying float vLinearDepth;
varying float vLogDepth;
varying vec3 vViewPosition;
varying float vRadius;
varying vec3 vWorldPosition;
varying vec3 vNormal;


// WIND SHADER
uniform float rustleHeightLimit; // the height above which the rustling starts
uniform bool rustleColorCheck; // use color checking for limiting rustling; currently not usable; see rustle()
uniform float rustleFactor; // amount of rustling
uniform float rustleFrequency; // frequency of rustles


// ---------------------
// OCTREE
// ---------------------

#if (defined(adaptive_point_size) || defined(color_type_tree_depth)) && defined(tree_type_octree)
/**
* number of 1-bits up to inclusive index position
* number is treated as if it were an integer in the range 0-255
*
*/
float numberOfOnes(float number, float index){
    float tmp = mod(number, pow(2.0, index + 1.0));
    float numOnes = 0.0;
    for(float i = 0.0; i < 8.0; i++){
    if(mod(tmp, 2.0) != 0.0){
    numOnes++;
    }
    tmp = floor(tmp / 2.0);
    }
    return numOnes;
}


/**
* checks whether the bit at index is 1
* number is treated as if it were an integer in the range 0-255
*
*/
bool isBitSet(float number, float index){
    return mod(floor(number / pow(2.0, index)), 2.0) != 0.0;
}


/**
* find the tree depth at the point position
*/
float getLocalTreeDepth(){
    vec3 offset = vec3(0.0, 0.0, 0.0);
    float iOffset = 0.0;
    float depth = 0.0;
    for(float i = 0.0; i <= 1000.0; i++){
        float nodeSizeAtLevel = octreeSize / pow(2.0, i);
        vec3 index3d = (position - offset) / nodeSizeAtLevel;
        index3d = floor(index3d + 0.5);
        float index = 4.0*index3d.x + 2.0*index3d.y + index3d.z;

        vec4 value = texture2D(visibleNodes, vec2(iOffset / 2048.0, 0.0));
        float mask = value.r * 255.0;
        if(isBitSet(mask, index)){
        // there are more visible child nodes at this position
        iOffset = iOffset + value.g * 255.0 + numberOfOnes(mask, index - 1.0);
        depth++;
        }else{
        // no more visible child nodes at this position
        return depth;
        }
        offset = offset + (vec3(1.0, 1.0, 1.0) * nodeSizeAtLevel * 0.5) * index3d;
    }
    return depth;
}

float getPointSizeAttenuation(){
    return pow(1.9, getLocalTreeDepth());
}


#endif


// ---------------------
// KD-TREE
// ---------------------

#if (defined(adaptive_point_size) || defined(color_type_tree_depth)) && defined(tree_type_kdtree)

float getLocalTreeDepth(){
    vec3 offset = vec3(0.0, 0.0, 0.0);
    float iOffset = 0.0;
    float depth = 0.0;


    vec3 size = bbSize;
    vec3 pos = position;

    for(float i = 0.0; i <= 1000.0; i++){

        vec4 value = texture2D(visibleNodes, vec2(iOffset / 2048.0, 0.0));

        int children = int(value.r * 255.0);
        float next = value.g * 255.0;
        int split = int(value.b * 255.0);

        if(next == 0.0){
        return depth;
        }

        vec3 splitv = vec3(0.0, 0.0, 0.0);
        if(split == 1){
        splitv.x = 1.0;
        }else if(split == 2){
        splitv.y = 1.0;
        }else if(split == 4){
        splitv.z = 1.0;
        }

        iOffset = iOffset + next;

        float factor = length(pos * splitv / size);
        if(factor < 0.5){
        // left
        if(children == 0 || children == 2){
        return depth;
        }
        }else{
        // right
        pos = pos - size * splitv * 0.5;
        if(children == 0 || children == 1){
        return depth;
        }
        if(children == 3){
        iOffset = iOffset + 1.0;
        }
        }
        size = size * ((1.0 - (splitv + 1.0) / 2.0) + 0.5);

        depth++;
    }


    return depth;
}

float getPointSizeAttenuation(){
    return pow(1.3, getLocalTreeDepth());
}

#endif


// WIND-SHADER
void bend(inout vec3 pos) {
    if(pos.x > bendHeightLimit) {
    float bend = (sin(time * speedFactor) + 1.0) * bendFactor;
    float clampedX = max(pos.x, bendHeightLimit); // coordinate system is rotated -> x is up
    float bf = (clampedX - bendHeightLimit) * bend;
        vec3 newPos = pos;
        newPos.yz += wind.xy * bf; // trees' supposed xz plane is yz b/c rotation; if the wind direction is off, flip the coordinates
        pos = newPos;
    }
}

void rustle(inout vec3 pos) {
    vec3 hsv = rgb2hsv(color);
    // values by trial and error, mostly
    if(pos.x > rustleHeightLimit) {
        if(!rustleColorCheck || (hsv.x > 0.16 && hsv.x < 0.5 && hsv.y > 0.18 && hsv.z > 0.08)) {
            // vColor.r = 1.0; // uncomment to debug height limit and HVS comparisons
            // vColor.g = 0.0;
            // vColor.b = 0.0;
            vec3 newPos = pos;
            float objPhase = length(modelMatrix[3].xyz); // assign unique phase to each object
            float vtxYPhase = pos.y + objPhase; // vary vertex phases according to location
            float vtxZPhase = pos.z + objPhase; // on the yz plane (ground plane b/c rotated models)
            vec2 wavesIn = vec2(vtxYPhase + time, vtxZPhase + time);
            vec4 waves = (fract(wavesIn.xxyy *
               vec4(SIDE_TO_SIDE_FREQ1, SIDE_TO_SIDE_FREQ2, UP_AND_DOWN_FREQ1, UP_AND_DOWN_FREQ2)) *
               2.0 - 1.0 ) * speedFactor * rustleFrequency; // lifted from crytek paper: http://http.developer.nvidia.com/GPUGems3/gpugems3_ch16.html
            waves = smoothTriangleWave(waves);
            vec2 wavesSum = waves.xz + waves.yw;
            newPos.y += wavesSum.y * (pos.x - rustleHeightLimit) * rustleFactor / 100.0;
            newPos.z += wavesSum.x * (pos.x - rustleHeightLimit) * rustleFactor / 100.0;
            pos = newPos;
        }
    }
}

// run-of-the-mill rgb-hsv-conversions
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// general math
float smoothCurve(float x) {
    return x * x * (3.0 - 2.0 * x);
}
float triangleWave(float x) {
    return abs(fract(x + 0.5) * 2.0 - 1.0);
}
float smoothTriangleWave(float x) {
    return smoothCurve(triangleWave(x));
}
vec4 smoothTriangleWave(vec4 v) {
    float x = smoothTriangleWave(v.x);
    float y = smoothTriangleWave(v.y);
    float z = smoothTriangleWave(v.z);
    float w = smoothTriangleWave(v.w);
    return vec4(x, y, z, w);
}

void main() {
    // WIND SHADER
    vec3 pos = position;
    bend(pos);
    rustle(pos);

    vec4 worldPosition = modelMatrix * vec4( pos, 1.0 );
    vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
    vViewPosition = -mvPosition.xyz;
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
    vOpacity = opacity;
    vLinearDepth = -mvPosition.z;
    vNormal = normalize(normalMatrix * normal);

#if defined(use_edl)
    vLogDepth = log2(gl_Position.w + 1.0) / log2(far + 1.0);
#endif

    //#if defined(use_logarithmic_depth_buffer)
    // float logarithmicZ = (2.0 * log2(gl_Position.w + 1.0) / log2(far + 1.0) - 1.0) * gl_Position.w;
    // gl_Position.z = logarithmicZ;
    //#endif

// ---------------------
// POINT COLOR
// ---------------------

#ifdef color_type_rgb
    vColor = color;
#elif defined color_type_height
    vec4 world = modelMatrix * vec4( position, 1.0 );
    float w = (world.y - heightMin) / (heightMax-heightMin);
    vColor = texture2D(gradient, vec2(w,1.0-w)).rgb;
#elif defined color_type_depth
    float linearDepth = -mvPosition.z ;
    float expDepth = (gl_Position.z / gl_Position.w) * 0.5 + 0.5;
    vColor = vec3(linearDepth, expDepth, 0.0);
#elif defined color_type_intensity
    float w = (intensity - intensityMin) / (intensityMax - intensityMin);
    vColor = vec3(w, w, w);
#elif defined color_type_intensity_gradient
    float w = (intensity - intensityMin) / intensityMax;
    vColor = texture2D(gradient, vec2(w,1.0-w)).rgb;
#elif defined color_type_color
    vColor = uColor;
#elif defined color_type_tree_depth
    float depth = getLocalTreeDepth();
    float w = depth / 30.0;
    vColor = texture2D(gradient, vec2(w,1.0-w)).rgb;
#elif defined color_type_point_index
    vColor = indices.rgb;
#elif defined color_type_classification
    float c = mod(classification, 16.0);
    vec2 uv = vec2(c / 255.0, 0.5);
    vColor = texture2D(classificationLUT, uv).rgb;

    // TODO only for testing - removing points with class 7
    if(classification == 7.0){
    gl_Position = vec4(100.0, 100.0, 100.0, 0.0);
    }
#elif defined color_type_return_number
    //float w = (returnNumber - 1.0) / 4.0 + 0.1;
    //vColor = texture2D(gradient, vec2(w, 1.0 - w)).rgb;

    if(numberOfReturns == 1.0){
    vColor = vec3(1.0, 1.0, 0.0);
    }else{
    if(returnNumber == 1.0){
    vColor = vec3(1.0, 0.0, 0.0);
    }else if(returnNumber == numberOfReturns){
    vColor = vec3(0.0, 0.0, 1.0);
    }else{
    vColor = vec3(0.0, 1.0, 0.0);
    }
    }

#elif defined color_type_source
    float w = mod(pointSourceID, 10.0) / 10.0;
    vColor = texture2D(gradient, vec2(w,1.0 - w)).rgb;
#elif defined color_type_normal
    vColor = (modelMatrix * vec4(normal, 0.0)).xyz;
#elif defined color_type_phong
    vColor = color;
#endif

    //if(vNormal.z < 0.0){
    // gl_Position = vec4(1000.0, 1000.0, 1000.0, 1.0);
    //}

    // ---------------------
    // POINT SIZE
    // ---------------------
    float pointSize = 1.0;

    float projFactor = 1.0 / tan(fov / 2.0);
    projFactor /= vViewPosition.z;
    projFactor *= screenHeight / 2.0;
    float r = spacing * 1.5;
    vRadius = r;
#if defined fixed_point_size
    pointSize = size;
#elif defined attenuated_point_size
    pointSize = size * projFactor;
#elif defined adaptive_point_size
    float worldSpaceSize = size * r / getPointSizeAttenuation();
    pointSize = worldSpaceSize * projFactor;
#endif

    pointSize = max(minSize, pointSize);
    pointSize = min(maxSize, pointSize);

    vRadius = pointSize / projFactor;

    gl_PointSize = pointSize;


    // ---------------------
    // CLIPPING
    // ---------------------

#if defined use_clip_box
    bool insideAny = false;
    for(int i = 0; i < max_clip_boxes; i++){
    if(i == int(clipBoxCount)){
    break;
    }

    vec4 clipPosition = clipBoxes[i] * modelMatrix * vec4( position, 1.0 );
    bool inside = -0.5 <= clipPosition.x && clipPosition.x <= 0.5;
    inside = inside && -0.5 <= clipPosition.y && clipPosition.y <= 0.5;
    inside = inside && -0.5 <= clipPosition.z && clipPosition.z <= 0.5;
    insideAny = insideAny || inside;
    }
    if(!insideAny){

#if defined clip_outside
    gl_Position = vec4(1000.0, 1000.0, 1000.0, 1.0);
#elif defined clip_highlight_inside && !defined(color_type_depth)
    float c = (vColor.r + vColor.g + vColor.b) / 6.0;
#endif
    }else{
#if defined clip_highlight_inside
    vColor.r += 0.5;
#endif
    }

#endif

}




// ------------------------------


/*
void main(void) {
	vColor = color;
	float length = length(position.xyz);
	vec3 pos = position;
	bend(pos);
	rustle(pos);
	gl_PointSize = pointSize;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(normalize(pos.xyz) * length, 1.0);
}*/

