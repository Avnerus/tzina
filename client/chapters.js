export default 
	 [
		{
			"name": "excitement / awakeness",
			"hour": 7,
			"timeLimitMinutes" : 10,
            "titlePosition": [-143, 48, 0],
            "insideTitlePosition": [-5, 1, -1],
			"characters": [
				"Meir",
				"Rami",
				"Yedida",
				"shirin1"
			],
			"introfile": [
				"Meir",
				"Rami",
				"Yedida"
			],
			"extraAssets": [
				{
					"fileName": "pigeonsfood",
					"position": [0,0,0]
				}
			],
			"effects" : [
				{
					"name": ""
				}
			]
		},
		{
		"name": "family / home",
			"hour": 9,
			"timeLimitMinutes" : 13,
            "titlePosition": [-90, 90, 0],
            "insideTitlePosition": [0, -1, 0],
			"characters": [
				"Miriam",
				"Itzik",
				"shirin2"
			],
			"introfile": [
				"Miryam",
				"Itzik"
			],
			"extraAssets": [
				{
					"fileName": "Jacob",
					"position": [0,0,0],
					"fileName": "Jacobcloths",
					"position": [0,0,0],
				},
				{
					name: "firstcouple",
					position: [10,19.8,10],
					rotation: [0,0,0],
					scale: 0.25,
				},
				{
					name: "guard",
					position: [-12,19.8,35.23],
					rotation:[0,156,0],
					scale: 0.7,
				}
			],
			"effects" : [
				{
					"name": ""
				}
			]
		}, 
		{
		"name": "emptiness / boredom",
			"hour": 12,
			"timeLimitMinutes" : 8,
            "titlePosition": [0, 110, 0],
            "insideTitlePosition": [0.5, -1.5, -0.3],
			"characters": [
				"Mark",
                "LupoDogs12PM",                
                "Lupo1",
				"Sasha",
				"shirin3"
			],
            "eventAfter" : 0,
            "eventCharacters" : [
                "Agam12PM"
            ],
			"introfile": [
				"Mark",
				"Lupo1"
			],
			"extraAssets": [
				{
					name: "guard",
					position: [-12,19.8,35.23],
					rotation:[0,156,0],
					scale: 0.7,
				},
				{
					name: "bikeHottie",
					position: [7.08,21.8,11.5],
					rotation:[0,315,0],
					scale: 0.25,
				},
				{
					name: "100_",
					position: [-5.24,22.1,8.84],
					rotation:[0,73,0],
					scale: 0.15,
				}
			],
			"effects" : [
				{
					"name": "lensflare"
				}
			]
		},
        {
		"name": "distrust / betrayal",
			"hour": 17,
            "titlePosition": [85, 100, 0],
            "insideTitlePosition": [0, -1, 0],
			"timeLimitMinutes" : 12,
			"characters": [
				"Hannah",
				"Lupo2",
				"LupoDogs5PM",
				"shirin4"
			],
			"introfile": [
				"Hanna",
				"Lupo2"
			],
			"extraAssets": [
				{
                    name: "bridegroom",
                    position: [3.56,22.4,9.77],
                    rotation: [0,307,0],
                    scale: 0.25
				},
					{
                    name: "yukalele",
                    position: [-14.91,22.4,-7],
                    rotation: [0,271,0],
                    scale: 0.26
				}
			],
			"effects" : [
				{
					"name": ""
				}
            ]
        },
        {
		"name": "despair / loneliness",
			"hour": 19,
			"timeLimitMinutes" : 12,
            "titlePosition": [120, 65, 0],
            "insideTitlePosition": [0, -1, 0],
			"characters": [
				"Haim",
				"Izchak",
				"Waterman",
				"Shimi2",
				"shirin5"
			],
			"introfile": [
				"Haim",
				"Izchak"
			],
            "eventAfter" : 1,
            "eventCharacters" : [
                "Agam7PM"
            ],
			"extraAssets": [
                {
                    name: "singleTree",
                    position: [-32.51, 19.7, -3.48],
                    rotation: [0, 0, 93],
                    scale: 0.7
                },
                	{
                    name: "blueLady",
                    position: [10.2,21.85,-12],
                    rotation: [0,0,0],
                    scale: 0.13
				},
				{
                    name: "manOnBench",
                    position: [15.2,21.85,-12],
                    rotation: [0,0,0],
                    scale: 0.13
				}
			],
			"effects" : [
				{
					"name": "buildinglights"
				},
		    ]
        },
        {
		"name": "night",
			"hour": 0,
			"timeLimitMinutes" : 4,
            "titlePosition": [0, -30, 0],
            "insideTitlePosition": [0, -1, 0],
			"characters": [
				//"Haim",
				"Izchak",
				"Waterman",
				"Shimi2",
				"shirin5"
			],
			"introfile": [
				"Haim",
				"Izchak"
			],
			"extraAssets": [
				{
					"fileName": "lightstreets",
					"position": [0,0,0]
				}
			],
			"effects" : [
				{
					"name": "buildinglights"
				}
			]
		}
	]
