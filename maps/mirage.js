window.MAPS = window.MAPS || {};
window.MAPS.mirage = {
    name: 'Mirage',
    width: 2000,
    height: 1500,
    spawnPoints: {
        attackers: [
            { x: 150, y: 750 }, { x: 200, y: 750 }, { x: 250, y: 750 },
            { x: 300, y: 750 }, { x: 350, y: 750 }
        ],
        defenders: [
            { x: 1800, y: 750 }, { x: 1750, y: 750 }, { x: 1700, y: 750 },
            { x: 1650, y: 750 }, { x: 1600, y: 750 }
        ]
    },
    walls: [
        { x: 0, y: 0, width: 2000, height: 20 },
        { x: 0, y: 1480, width: 2000, height: 20 },
        { x: 0, y: 0, width: 20, height: 1500 },
        { x: 1980, y: 0, width: 20, height: 1500 },

        { x: 300, y: 200, width: 20, height: 400 },
        { x: 500, y: 600, width: 400, height: 20 },
        { x: 900, y: 200, width: 20, height: 400 },
        { x: 1200, y: 600, width: 400, height: 20 },
        { x: 1500, y: 200, width: 20, height: 400 },
        { x: 800, y: 1000, width: 20, height: 300 },
        { x: 500, y: 1200, width: 1000, height: 20 }
    ],
    bombSites: [
        { name: 'A', x: 1600, y: 200, width: 200, height: 150 },
        { name: 'B', x: 300, y: 1200, width: 200, height: 150 }
    ]
};
