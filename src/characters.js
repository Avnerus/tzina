import HannahAnimation from './animations/hannah'
import LupoAnimation from './animations/lupo'

export default [
    {
        name: 'Hannah',
        basePath : 'assets/characters/hanna',
        mindepth : 2138.454101562,
        maxdepth : 3047.334472656,
        position : [-5.5, 22, 13.8],
        rotation: [-22, 50, 14],
        animation: new HannahAnimation(),
        uvdy: 0.4948,
        uvdx: -0.0245,
        scale: 0.002 * 0.25,
        animationPosition: [0,-1.5,-2.2],
        animationRotation: [20, 0, 0],
        space: 7,
        subtitles: null
    } /*,
    {
        name: 'Lupo',
        basePath : 'assets/characters/lupo',
        mindepth : 1500.681884766,
        maxdepth : 3376.051757813,
        position : [-51, 7.9, 126],//[51, 7.9, 77], // [-41, 7.9, 121], 
        rotation: [-8,20,6],//[6, 195, 6], // [6,215,6],
        uvd: 0.45,
        scale: 0.006,
        animation: new LupoAnimation(),
        animationPosition: [0, -1.8, -4],
        animationRotation: [5, 0, -3],
        space: 9 ,
        subtitles: "subtitles2"
    }*/

]
