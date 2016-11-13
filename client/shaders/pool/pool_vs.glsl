  uniform float time;
  uniform float scale;
  uniform float timeFactor;
  uniform float amplitudeFactor;
  uniform float amplitudeDisplacementFactor;
  uniform float amplitudeNormalFactor;
  uniform float circularAmplitudeFactor;
  uniform float circularAmplitudeDisplacementFactor;
  uniform float circularAmplitudeNormalFactor;
  
  uniform float wavelengths[6]; // hardcoded
  uniform float amplitudes[6];
  uniform float speeds[6];
  uniform vec2 directions[6];

  uniform float circularWavelength;
  uniform float circularSpeed;
  uniform float circularWaveStrengths[8];
  uniform vec2 circularWaveCenterPoints[8];
  uniform float circularMaxDist;
  
  varying vec3 vColor;
  varying vec3 worldNormal;
  varying vec3 vViewPosition;
  varying vec3 eyeDirection;
  varying vec3 vWorldPos;


  const float pi = 3.14159;

  // sine function is a bit too smooth to look realistic
  // --> move to nonnegative and raise to kth exponent
  float modSin(float x) {
    float k = 1.6;
    return 2.0 * pow(((sin(x)+1.0)/2.0), k);
  }
  
  float wave(int i, float x, float y) {
    float frequency = 2.0 * pi / wavelengths[i];
    float phase = speeds[i] * frequency;
    float theta = dot(directions[i], vec2(x, y));
    return scale * amplitudes[i] * amplitudeFactor * amplitudeDisplacementFactor * modSin(theta * frequency + time * timeFactor * phase);
  }

  float waveHeight(float x, float y) {
    float height = 0.0;
    // 6 is the number of directional waves
    for(int i = 0; i < 6; i++) {
      height += wave(i, x, y);
    }
    return height;
  }

  float dWavedx(int i, float x, float y) {
    float frequency = 2.0*pi/wavelengths[i];
    float phase = speeds[i] * frequency;
    float theta = dot(directions[i], vec2(x, y));
    float A = amplitudes[i] * amplitudeFactor * amplitudeNormalFactor * directions[i].x * frequency;
    return A * cos(theta * frequency + time * timeFactor * phase);
  }

  float dWavedy(int i, float x, float y) {
    float frequency = 2.0*pi/wavelengths[i];
    float phase = speeds[i] * frequency;
    float theta = dot(directions[i], vec2(x, y));
    float A = amplitudes[i] * amplitudeFactor * amplitudeNormalFactor * directions[i].y * frequency;
    return A * cos(theta * frequency + time * timeFactor * phase);
  }

  float circularDistanceFactor(vec2 v, vec2 u) {
    vec2 dv = v - u;
    float dist = distance(u, v);
    dist = sqrt(dot(dv, dv));
    float df = clamp(1.0 / (dist*dist + 0.1), 0.0, 1.0);
    if(dist > circularMaxDist) {
      df = 0.0;
    }
    return df;
  }

  float circularWave(int i, float x, float y) {
    vec2 vertex = vec2(x, y);
    vec2 center = circularWaveCenterPoints[i];
    float frequency = 2.0 * pi / circularWavelength;
    float phaseSpeed = circularSpeed * frequency;
    vec2 waveDir = normalize(2.0*vertex - center); // i don't even know anymore why multiplication by 2 is required, but wave directions break down otherwise
    float distanceFactor = circularDistanceFactor(vertex, center);
    float theta = dot(waveDir, vertex);

    float A = circularWaveStrengths[i] * scale * distanceFactor * circularAmplitudeFactor * circularAmplitudeDisplacementFactor;
    return A * cos(theta * sqrt(pow((vertex.x - center.x), 2.0) + pow((vertex.y - center.y), 2.0)) + (time * -timeFactor * phaseSpeed)
      );
  }

  float circularWaveHeight(float x, float y) {
    float height = 0.0;
    // 8 is the number of circular waves
    for(int i = 0; i < 8; i++) {
      height += circularWave(i, x, y);
    }
    return height;
  }

  float dCircularWavedx(int i, float x, float y) {
    vec2 vertex = vec2(x, y);
    vec2 center = circularWaveCenterPoints[i];
    float frequency = 2.0 * pi / circularWavelength;
    float phaseSpeed = circularSpeed * frequency;
    vec2 waveDir = normalize(2.0*vertex - center);
    float distanceFactor = circularDistanceFactor(vertex, center);
    float theta = dot(waveDir, vertex);

    float A = circularWaveStrengths[i] * scale * distanceFactor * circularAmplitudeFactor * circularAmplitudeNormalFactor * waveDir.x * frequency;
    return A * cos(theta * sqrt(pow((vertex.x - center.x), 2.0) + pow((vertex.y - center.y), 2.0)) + (time * -timeFactor * phaseSpeed)
      );
  }

  float dCircularWavedy(int i, float x, float y) {
    vec2 vertex = vec2(x, y);
    vec2 center = circularWaveCenterPoints[i];
    float frequency = 2.0 * pi / circularWavelength;
    float phaseSpeed = circularSpeed * frequency;
    vec2 waveDir = normalize(2.0*vertex - center);
    float distanceFactor = circularDistanceFactor(vertex, center);
    float theta = dot(waveDir, vertex);

    float A = circularWaveStrengths[i] * scale * distanceFactor * circularAmplitudeFactor * circularAmplitudeNormalFactor * waveDir.y * frequency;
    return A * cos(theta * sqrt(pow((vertex.x - center.x), 2.0) + pow((vertex.y - center.y), 2.0)) + (time * -timeFactor * phaseSpeed)
      );
  }

  // Returns non-normalized normal vector, see comment in function body
vec3 waveNormal(float x, float y) {
    float dx = 0.0;
    float dy = 0.0;
    for (int i = 0; i < 6; i++) {
        dx += dWavedx(i, x, y);
        dy += dWavedy(i, x, y);
    }
    vec3 n = vec3(-dx, -dy, 1.0);
    return n;
    //we return non-normalized normal vectors, because
    //we're calculating directional waves and circular waves separately
    //in effect, the normal's length corresponds to relative weights of
    //directional / circular components
    //normalization is the caller's responsibility
    //return normalize(n);
}

  // Returns non-normalized normal vector, see comment in function body
vec3 circularWaveNormal(float x, float y) {
    float dx = 0.0;
    float dy = 0.0;
    for (int i = 0; i < 8; i++) {
      dx += dCircularWavedx(i, x, y);
      dy += dCircularWavedy(i, x, y);
    }
    vec3 n = vec3(-dx, -dy, 1.0);
    return n;
    //we return non-normalized normal vectors, because
    //we're calculating directional waves and circular waves separately
    //in effect, the normal's length corresponds to relative weights of
    //directional / circular components
    //normalization is the caller's responsibility
    //return normalize(n);
}

void main(void) {
    vec4 viewModelPosition = modelViewMatrix * vec4( position, 1 );
    vViewPosition = viewModelPosition.xyz;
    eyeDirection = normalize(vViewPosition - position);

    vec3 posNew = position;
    vWorldPos = position;
    if(amplitudeDisplacementFactor != 0.0) {
      posNew.z += waveHeight(position.x, position.y);
    }
    if(circularAmplitudeDisplacementFactor != 0.0) {
      posNew.z += circularWaveHeight(position.x, position.y);
    }
    vec3 wn = waveNormal(position.x, position.y);
    vec3 cwn = circularWaveNormal(position.x, position.y);
    worldNormal = normalize(wn+cwn);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( posNew, 1.0 );
}
