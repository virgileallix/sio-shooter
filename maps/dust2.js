window.MAPS = window.MAPS || {};
window.MAPS.dust2 = {
    name: 'Dust2',
    width: 2000,
    height: 1500,
    spawnPoints: {
        attackers: [
            { x: 150, y: 1350 }, { x: 200, y: 1350 }, { x: 250, y: 1350 },
            { x: 300, y: 1350 }, { x: 350, y: 1350 }
        ],
        defenders: [
            { x: 1850, y: 150 }, { x: 1800, y: 150 }, { x: 1750, y: 150 },
            { x: 1700, y: 150 }, { x: 1650, y: 150 }
        ]
    },
    walls: [
        // Murs extérieurs
        { x: 0, y: 0, width: 2000, height: 20 },
        { x: 0, y: 1480, width: 2000, height: 20 },
        { x: 0, y: 0, width: 20, height: 1500 },
        { x: 1980, y: 0, width: 20, height: 1500 },

        // Structures internes agrandies
        { x: 400, y: 300, width: 600, height: 20 },
        { x: 1000, y: 300, width: 20, height: 300 },
        { x: 1400, y: 500, width: 300, height: 20 },
        { x: 700, y: 700, width: 20, height: 400 },
        { x: 1200, y: 900, width: 400, height: 20 },
        { x: 1600, y: 300, width: 20, height: 300 },
        { x: 300, y: 900, width: 300, height: 20 }
    ],
    bombSites: [
        { name: 'A', x: 1700, y: 300, width: 200, height: 150 },
        { name: 'B', x: 300, y: 1100, width: 200, height: 150 }
    ]
};
