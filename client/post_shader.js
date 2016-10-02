// Post processing shaader
// Current does nothing


const glslify = require('glslify');

export default {
    uniforms: {
        "tDiffuse": { type: "t", value: null },
    },
    vertexShader: glslify('./shaders/post_vs.glsl'),
    fragmentShader: glslify('./shaders/post_fs.glsl')
}
