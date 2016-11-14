export default [
    {
        name: 'Hannah',
        basePath : 'assets/characters/hanna',
        mindepth : 2138.454101562,
        maxdepth : 3047.334472656,
        position : [-4.85, 22.13, -11.6],
        rotation: [355, 0, 3],
        animation: 'Hannah',
        uvdy: 0.5,
        uvdy_idle: 0.48974609375,
        uvdx: 0,
        width: 1024,
        height: 2048,
        scale: 0.003 * 0.753,
        animationScale: 0.4,
        animationPosition: [0,-0.3,-0.85], //z: 0.55
        animationRotation: [15, 0, 2],
        space: 0.22,
        spaceOffset: [-0.35,0,0.29],
        subtitles: null
    },
    {
        name: 'Miriam',
        basePath : 'assets/characters/miriam',
        mindepth : 2200,
        maxdepth : 3119.456298828,
        position : [-2.17, 21.99, 11.89],
        rotation: [10, 215, 12],
        animation: 'Miriam',
        uvdy_idle: 0.47900390625,
        uvdy: 0.496,
        uvdx: -0.002,
        width: 768,
        height: 2048,
        scale: 0.003 * 0.5748,
        animationScale: 0.4, //.4
        animationPosition: [0.01, -0.4, 0.06],   // 0,-1.5,-2.2
        animationRotation: [6, 0, 0],      // 20, 0, 0
        space: 0.01,
        spaceOffset: [0.11,0,-0.07],
        subtitles: null,
        adjustments : [
            {
                sec: 0,
                mindepth : 2200,
                maxdepth : 3119.456298828,
                position : [-1.83,22.05, 12.182],
                scale: 0.003 * 0.5748 * 1.106
            }
        ]
    },
    {
        name: 'Itzik',
        basePath : 'assets/characters/itzik',
        mindepth : 0,
        maxdepth : 3494.158935547,
        position : [-6.92, 21.92, 10.39],
        rotation: [10, 216, 5],
        animation: 'Itzik',
        uvdy: 0.478,
        uvdx: 0.0,
        width: 512,
        height: 2048,
        scale: 0.0027 * 0.5308,
        animationScale: 0.248,
        animationPosition: [-0.77, 0.42, -1.51],
        animationRotation: [7.9, 7.5, 1],
        space: 0.33, //anim:1.46
        spaceOffset: [-0.25,0,0.15], //0.28,0.73,1.73
        subtitles: false,
        adjustments : [
            {
                sec: 0,
                mindepth : 0,
                maxdepth : 3494.158935547,
                position : [-6.95,  22.03, 10.41],
                scale: 0.0027 * 0.4686
            }
        ]
    },
    {
        name: 'Haim',
        basePath : 'assets/characters/haim',
        mindepth : 1029.795776367,
        maxdepth : 1600.0,
        position : [-15.45, 19.98, -11.2],
        rotation: [313, 70, 46],
        animation: 'Haim',
        uvdy: 0.507,
        uvdx: 0.0,
        width: 2048,
        height: 2048,
        scale: 0.003 * 1.243 * 1.455,
        animationScale: 0.4, // 0.25
        animationPosition: [1.17, -0.39, 1.7], //0.81, -0.17, 1.42
        animationRotation: [6, -50, -9], //6, -50, -9
        space: 0.07,
        subtitles: false,
        spaceOffset: [-1.05,0,0.69], //0.28,0.73,1.73
    },
    {
        name: 'Rami',
        basePath : 'assets/characters/rami',
        mindepth : 2225.287353516,
        maxdepth : 3252.206298828,
        position : [0, 22.12, 13.17],
        rotation: [356, 55, 10],
        animation: null,
        uvdy: 0.48,
        uvdy_idle: 0.477,
        uvdx: 0.0,
        width: 1024,
        height: 2048,
        scale: 0.003 * 0.661,
        animationScale: 0.25,
        animationPosition: [0.45, -0.3, 0.25],
        animationRotation: [-4, -23, -9],
        space: 0.49,
        spaceOffset: [1.27,0,0.25],
        subtitles: false
    },
    {
        name: 'Meir',
        basePath : 'assets/characters/meir',
        mindepth : 1482.958618164,
        maxdepth : 2514.773681641,
        position : [-0.43, 22.39, 7.43],
        rotation: [7, 0, 0],
        animation: 'Meir',
        uvdy: 0.4931640625,
        uvdy_idle: 0.483398438,
        uvdx: 0.0,
        width: 1024,
        height: 2048,
        scale: 0.00242802,
        animationScale: 0.228,
        animationPosition: [-0.3,-0.2,-0.03], // -0.45,0,-0.4
        animationRotation: [0,14,0], // 7,25,-8
        subtitles: null,
        space: 0.3,
        spaceOffset: [0,0,-0.38]
    },
    {
        name: 'Sasha',
        basePath : 'assets/characters/sasha',
        mindepth : 2131.298583984375,
        maxdepth : 3802.192626953125,
        position : [-37.78, 19.74, 13.54],
        rotation: [8, 131, 343],
        animation: null,
        uvdy: 0.571527778,
        uvdx: 0.0,
        width: 1024,
        height: 2048,
        scale: 0.003 * 0.5,
        subtitles: null,
        idleOnly: true
    },
    {
        name: 'Agam12PM',
        basePath : 'assets/characters/agam12pm',
        mindepth : 1656.909729004,
        maxdepth : 2789.562011719,
        position : [-2.11, 22.08, 7.338],
        rotation: [0, 320, 5.8],
        animation: 'Agam12PM',
        uvdy: 0.496,
        uvdx: 0.0,
        scale: 0.003 * 0.69,
        width: 1024,
        height: 2048,
        animationScale: 0.245,
        animationPosition: [-0.22, 0.07, 0.526],
        animationRotation: [0, 17, -6],
        subtitles: null,
        idleOnly: true,
        event: true
    },
    {
        name: 'LupoDogs12PM',
        basePath : 'assets/characters/lupo-dogs',
        mindepth : 1500.681884765625,
        maxdepth : 3376.0517578125,
        position : [-7.5, 21.94, 7.15],
        rotation: [20, 241, 17.7],
        animation: null,
        uvdy: 0.4794921875,
        uvdx: 0.0,
        width: 1024,
        height: 1024,
        scale: 0.003 * 0.406,
        subtitles: null,
        idleOnly: true
    },
    {
        name: 'LupoDogs5PM',
        basePath : 'assets/characters/lupo-dogs',
        mindepth : 1500.681884765625,
        maxdepth : 3376.0517578125,
        position : [-10.36, 21.94, -3.78],
        rotation: [12, 150, 352],
        animation: null,
        uvdy: 0.4794921875,
        uvdx: 0.0,
        width: 1024,
        height: 1024,
        scale: 0.003 * 0.406,
        subtitles: null,
        idleOnly: true
    },
    {
        name: 'Mark',
        basePath : 'assets/characters/mark',

        mindepth : 1499.999877929688,
        maxdepth : 4564.32861328125,

        adjustments : [
            {
                sec: 0,
                mindepth : 1499.999877929688,
                maxdepth : 4564.32861328125,
                position : [-11.35, 21.9, 1.95],
                scale: 0.003 * 0.458437 * 1.34174
            },
            {
                sec: 92,
                mindepth: 2689.701416015625,
                maxdepth: 4381.86181640625
            },
            {
                sec: 117,
                mindepth : 1499.999877929688,
                maxdepth : 4564.32861328125
            }
        ],
        position : [-12.9, 21.86, 1.56],
        //rotation: [0, 37, 0],
        rotation: [10, 76, 350],
        animation: 'Mark',
        uvdy: 0.458984375,
        uvdy_idle: 0.419,
        uvdx: 0.0,
        width: 1024,
        height: 2048,
        scale: 0.003 * 0.458437 * 1.8,
        animationScale: 0.24,
        animationPosition: [-0.03, 0.21, -0.86], // -.4, -.46, -.55
        animationRotation: [0, 214, 0], // 0,-25,0
        space: 0.38, //0.38
        spaceOffset: [-0.11,0,0],
        subtitles: null
    },
    {
        name: 'FatmanSleep',
        basePath : 'assets/characters/fatman-sleep',
        mindepth : 1370.90380859375,
        maxdepth : 3802.21240234375,
        position : [-15.55, 22.05, 2.869],
        rotation: [0,40,0],
        animation: null,
        uvdy: 0.35986328125,
        uvdx: 0,
        width: 2048,
        height: 2048,
        scale: 0.003 * 1.0952,
        subtitles: null,
        idleOnly: true
    },
    {
        name: 'Shirin7AM',
        basePath : 'assets/characters/shirin7am',
        mindepth : 1863.25811767,
        maxdepth : 3649.251464844,
        position : [2.85, 21.69, 14.92],
        rotation: [0, 190, 0],
        animation: 'Shirin',
        uvdy: 0.48681640625,
        uvdx: 0.0,
        width: 1024,
        height: 2048,
        scale: 0.003 * 0.4715,
        animationScale: 0.08,
        animationPosition: [1.88, 0.35, 0],
        animationRotation: [0, 0, 0],
        space: 0.54, //0.2
        spaceOffset: [-0.8,1.5,0.25], //-0.8,0,0.53
        subtitles: null,
        fullOnly: true
    },
    {
        name: 'Shirin9AM',
        basePath : 'assets/characters/shirin9am',
        mindepth : 633.749877930,
        maxdepth : 4120.305664062,
        position : [-4.21, 22.41, 13.51],
        rotation: [347, 235, 340],
        animation: 'Shirin',
        uvdy: 0.49755859375,
        uvdx: 0.0,
        width: 1024,
        height: 2048,
        scale: 0.003 * 0.4715,
        animationScale: 0.08,
        animationPosition: [-0.2, -0.1, 0],   // 0,-1.5,-2.2
        animationRotation: [13, 0, 0],      // 20, 0, 0
        space: 0.2,
        spaceOffset: [0.39,0,-0.08],
        subtitles: null,
        fullOnly: true
    },
    {
        name: 'Lupo9AM',
        basePath : 'assets/characters/lupo9am',
        mindepth : 2160,
        maxdepth : 6120.20654296875,
        position : [-27, 21.16, -37.04],
        rotation: [350, 300, 7.3],
        animation: null,
        uvdy: 0.42138671875,
        uvdx: 0.0,
        width: 2048,
        height: 2048,
        scale: 0.003 * 0.25,
        subtitles: null,
        idleOnly: true
    },
    {
        name: 'Lupo12PM',
        basePath : 'assets/characters/lupo12pm',
        mindepth : 1770.462036132813,
        maxdepth : 3428.071533203125,
        adjustments : [
            {
                sec: 107,
                mindepth: 1523.277099609375,
                maxdepth: 3428.071533203125
            },
            {
                sec: 134,
                mindepth: 1770.462036132813,
                maxdepth: 3428.071533203125
            },
            {
                sec: 141,
                mindepth: 2015.678588867188,
                maxdepth: 3681.246826171875,
                position: [-11, 22.13, 5.74],
                scale: 0.003 * 0.52198
            }
        ],
        position : [-10.77, 22.02, 6.62],
        rotation: [2, 216, 0],
        animation: 'Lupo12PM',
        uvdy: 0.4970703125,
        uvdx: 0.0,
        width: 1024,
        height: 2048,
        scale: 0.003 * 0.7411,
        animationScale: 0.25,
        animationPosition: [-0.66, -0.41, -0.96], // -0.53, -0.51, -1.76
        animationRotation: [0,0,0], // 0,-25,0
        subtitles: null,
        space: .2, //2
        spaceOffset: [0.36,0,0]
    },
    {
        name: 'Shirin12PM',
        basePath : 'assets/characters/shirin12pm',
        mindepth : 843.750000000,
        maxdepth : 4120.305664062,
        position : [-11.5, 22.41, 8.4],
        rotation: [347, 235, 340],
        animation: 'Shirin',
        uvdy: 0.5,
        uvdx: 0.0,
        width: 1024,
        height: 2048,
        scale: 0.003 * 0.4715,
        animationScale: 0.08,
        animationPosition: [-0.2, -0.1, 0],   // 0,-1.5,-2.2
        animationRotation: [13, 0, 0],      // 20, 0, 0
        space: 0.1,
        spaceOffset: [1.57,0,-0.31],
        subtitles: null,
        fullOnly: true
    },
    {
        name: 'Lupo5PM',
        basePath : 'assets/characters/lupo5pm',
        mindepth : 1582.586059570313,
        maxdepth : 4480.7158203125,
        adjustments : [
            {
                sec: 100,
                mindepth: 1770.462036132813,
                maxdepth: 3428.071533203125,
                position : [-12.97, 22.12, -5.77],
                scale: 0.003 * 0.75 * 1.028 * 1.09
            },
            {
                sec: 120,
                mindepth: 1523.277099609375,
                maxdepth: 3428.071533203125,
                position : [-12.97, 22.0, -5.77],
                scale: 0.003 * 0.75 * 1.028 * 1.132
            }
        ],
        position : [-12.2, 22.1, -5.91],
        rotation: [40, 100, 310], //120
        animation: 'Lupo12PM',
        uvdy: 0.49951171875,
        uvdx: 0.0,
        width: 1024,
        height: 2048,
        scale: 0.003 * 0.75 * 1.028,
        animationScale: 0.3,
        animationPosition: [1.13, -0.07, -2.27],
        animationRotation: [15,-25,7],
        subtitles: null,
        space: 0.001,
        spaceOffset: [4.66,0,1.1]
    },
    {
        name: 'Shirin5PM',
        basePath : 'assets/characters/shirin5pm',
        mindepth : 1083.749877930,
        maxdepth : 4120.305664062,
        position : [-11.55, 21.6, -9.78],
        rotation: [347, 70, 0],
        animation: null, // 'Shirin',
        uvdy: 0.5068359375,
        uvdx: 0.0,
        width: 1024,
        height: 2048,
        scale: 0.003 * 0.5327,
        animationScale: 0.08,
        animationPosition: [-0.2, -0.1, 0],   // 0,-1.5,-2.2
        animationRotation: [13, 0, 0],      // 20, 0, 0
        space: 0.4,
        spaceOffset: [1.57,0,0.3],
        subtitles: null,
        fullOnly: true
    },
    {
        name: 'Itzhak',
        basePath : 'assets/characters/itzhak',
        mindepth : 1762.584594726563,
        maxdepth : 3120.0,
        position : [-2.63, 21.87, -14.8],
        rotation: [340, 72, 22], // 
        animation: 'Itzhak',
        uvdy: 0.48388671875,
        uvdx: 0.0,
        width: 512,
        height: 2048,
        scale: 0.003 * 0.45,
        animationScale: 0.235,
        animationPosition: [-0.21, -0.01, 0.26],
        animationRotation: [5, 17, 0],
        space: 0.001, //1.34
        spaceOffset: [1.78,0,-0.80], //0.88,0,0.58
        subtitles: false
    },
    {
        name: 'Shirin7PM',
        basePath : 'assets/characters/shirin7pm',
        mindepth : 1214.999755859,
        maxdepth : 3681.950439453,
        position : [4.25, 22.65, -13.17],
        rotation: [0, 0, 0],
        animation: 'Shirin',
        uvdy: 0.47509765625,
        uvdx: 0.0,
        width: 1024,
        height: 2048,
        scale: 0.003 * 0.5327,
        animationScale: 0.08,
        animationPosition: [-0.2, -0.1, 0],   // 0,-1.5,-2.2
        animationRotation: [13, 0, 0],      // 20, 0, 0
        space: 0.2,
        spaceOffset: [0,0,0],
        subtitles: null,
        fullOnly: true
    },
    {
        name: 'Waterman',
        basePath : 'assets/characters/waterman',
        mindepth : 183.750000000,
        maxdepth : 6681.800292969,
        position : [7.87, 22.36, -3.26],
        rotation: [0, 220, 0],
        animation: null,
        uvdy: 0.498046875,
        uvdx: 0.0,
        width: 1024,
        height: 2048,
        scale: 0.003 * 0.96,
        subtitles: null,
        fullOnly: true,
        space: 0.3
    },
    {
        name: 'FatmanShower',
        basePath : 'assets/characters/fatman-shower',
        mindepth : 2534.99951171875,
        maxdepth : 5070.96044921875,
        position : [-5.74, 22.7, 2.85],
        rotation: [192, 231, 197],
        animation: null,
        uvdy: 0.49169921875,
        uvdx: 0,
        width: 1024,
        height: 2048,
        scale: 0.003 * 0.64725 * 1.308,
        subtitles: null,
        idleOnly: true
    },
    {
        name: 'Agam7PM',
        basePath : 'assets/characters/agam7pm',
        mindepth : 1656.909729004,
        maxdepth : 2789.562011719,
        position : [-1.75, 22.049, -7.4],
        rotation: [0, 190, 2.3],
        animation: 'Agam12PM',
        uvdy: 0.496,
        uvdx: 0.0,
        scale: 0.003 * 0.8,
        width: 1024,
        height: 2048,
        animationScale: 0.5,
        animationPosition: [-0.24, 0.13, 0.92],
        animationRotation: [0, -4, -3.5],
        subtitles: null,
        idleOnly: true,
        event: true
    }
/*,
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
