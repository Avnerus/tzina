const glslify = require('glslify');

export default {
    uniforms: {
        "tDiffuse": { type: "t", value: null },
    },
    vertexShader: glslify('./shaders/rain_vs.glsl'),
    fragmentShader: glslify('./shaders/rain_fs.glsl')
}
