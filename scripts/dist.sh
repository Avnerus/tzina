#!/bin/bash
browserify client/index.js -o bundle.js -t [ babelify --presets [ es2015   ]   ] -t [ glslify   ] -t [ browserify-shim   ]
