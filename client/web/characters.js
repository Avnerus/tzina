export default [
    {
        name: 'Hannah',
        position : [11.4, 22.04, -10.1],
        rotation: [355, 302, 3],
        space: 1.3,
        spaceOffset: [-0.17,0,-0.39],
        endingPosition : [10.49, 22.4, -10.14],
        endingRotation: [360, 210, 3]
    },
    {
        name: 'Miriam',
        position : [-17.1, 22.1, 3.38],
        rotation: [0, 78, 0],
        scale: 0.003 * 0.661 * 1.071 * 0.9,
        space: 1.2,
        spaceOffset: [0.59,0,0.47],
        endingPosition : [11.77, 22.04, -18.52],
         adjustments : [
            {
                sec: 0,
                mindepth : 2200,
                maxdepth : 3119.456298828,
                position : [-17.6, 22.1, 3.38],
                scale: 0.003 * 0.5748 * 1.106
            }
        ]
    },
    {
        name: 'Itzik',
        position : [-6.58,  22.06, 11.01], //-6.08, 21.9, 10.8
        rotation: [9, 208, 3.6],
        space: 1.5, //anim:1.46
        spaceOffset: [0.62,0.59,-0.17], //0.28,0.73,1.73
        endingPosition : [7.29, 21.8, -12.91],
        gazeOffset: [0.14,0.25,0.47],
        adjustments : [
            {
                sec: 0,
                mindepth : 0,
                maxdepth : 3494.158935547,
                position : [-6.61,  22.09, 10.93],
                rotation: [9, 208, 3.6],
                scale: 0.0027 * 0.4686
            }
        ]
    },
    {
        name: 'Haim',
        position : [21.74, 21.8, 12.77],
        rotation: [0, 225, 0],
        space: 0.8,
        spaceOffset: [-0.11,0,0.43], //0.28,0.73,1.73
        gazeOffset: [-4.46,0.9,0.02],
        endingPosition : [-12.33, 19.7, -6.69]
    },
    {
        name: 'Rami',
        position : [-9.19, 22.2, 14.6],
        rotation: [0, 151, 0],
        space: 1.2,
        spaceOffset: [-0.06,0.2,0.25],
        gazeSpace: [-0.55,0,0],
        gazeOffset: [0.14,-0.05,-0.31]
    },
    {
        name: 'Meir',
        position : [-0.43, 22.39, 7.43],
        rotation: [7, 0, 0],
        space: 0.8,
        endingPosition : [-3.93, 22.04, -8.42],
        spaceOffset: [-0.17,0,0.62]
    },
    {
        name: 'Sasha',
        position : [-37.78, 19.74, 13.54],
        rotation: [8, 131, 343],
    },
    {
        name: 'Agam12PM',
        position : [-2.11, 22.08, 7.338],
        rotation: [0, 325, 5.8],
    },
    {
        name: 'LupoDogs12PM',
        position : [-21.34, 21.94, 3.78],
        rotation: [0, 80, 0],
    },
    {
        name: 'LupoDogs5PM',
        position : [21, 21.8, 0],
        rotation: [3, 213, 0],
        endingPosition : [-22.99, 22.04, -3.93],
    },
    {
        name: 'Mark',
        mindepth : 1499.999877929688,
        maxdepth : 4564.32861328125,
        space: 1.4,
        spaceOffset: [-0.56,0,-1.4],
        endingPosition : [-17.4, 22.04, -0.57],
        position : [8.28, 21.8, -16.86],
        rotation: [0, 286, 350],
              adjustments : [
            {
                sec: 0,
                mindepth : 1499.999877929688,
                maxdepth : 4564.32861328125,
               position : [6, 21.9, -15.96],
                scale: 0.003 * 0.458437 * 1.34174  * 0.865 * 1.246 * 0.85
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
    },
    {
        name: 'FatmanSleep',
        position : [-3.5, 22.25, -6.98],
        rotation: [0,197,0],
    },
    {
        name: 'Lupo9AM',
        position : [-27, 21.16, -37.04],
        rotation: [350, 300, 7.3],
    },
    {
        name: 'Lupo12PM',
        position : [-17.83, 22.1, 2.69],
        rotation: [0, 132, 0],
        space: 1.2, //2
        spaceOffset: [0.5,0,0.28],
        animationPosition: [0.49, -0.46, -0.78],
        animationRotation: [0,-50,0]
    },
    {
        name: 'Lupo5PM',
        position : [18.25, 22, -3.1],
        endingPosition : [22.99, 22.04, -3.93],
        rotation: [7, 225, 0], //120
        adjustments: [
            {
                sec: 100,
                mindepth: 1770.462036132813,
                maxdepth: 3428.071533203125,
                position : [18.2, 22.05, -3.3],
                scale: 0.003 * 0.75 * 1.028 * 1.09 * 0.85
            },
            {
                sec: 120,
                mindepth: 1523.277099609375,
                maxdepth: 3428.071533203125,
                position : [18.9, 21.9, -2.1],
                scale: 0.003 * 0.75 * 1.028 * 1.132 * 0.75
            }
        ],
        scale: 0.003 * 0.75 * 1.028 * 0.9,
        space: 1,
        spaceOffset: [0.28,0,-0.62]
    },
    {
        name: 'Itzhak',
        position : [-8.2, 21.87, 18.15],
        rotation: [360, 84, 0], // 
        space: 1.2,
        spaceOffset: [0.62,0,-0.17], //0.88,0,0.58
        gazeOffset: [0,0.47,-0.31],
        endingPosition : [-8.2, 22.04, 0.55]   
    },
    {
        name: 'Shirin7PM',
        position : [16.7, 27.3, -46.57],
        rotation: [0, 275, 0],
        space: 100,
        spaceOffset: [0,0,0],
    },
    {
        name: 'Waterman',
        position : [7.87, 22.36, -3.26],
        rotation: [0, 220, 0],
        space: 20
    },
    {
        name: 'FatmanShower',
        position : [-3.39, 22.8, -6.98],
        rotation: [197, 322, 185],
    },
    {
        name: 'Agam7PM',
        position : [4.69, 22.2, 6],
        rotation: [0, 48, 2.3],
    }
]
