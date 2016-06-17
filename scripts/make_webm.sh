#!/bin/bash
ffmpeg -i test_%06d.png -c:v libvpx -pix_fmt yuva420p -qmin 0 -qmax 50 -crf 5 -metadata:s:v:0 alpha_mode="1" output2.webm
