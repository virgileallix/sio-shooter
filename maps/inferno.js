window.MAPS = window.MAPS || {};
window.MAPS.inferno = {
    name: 'Inferno',
    width: 2000,
    height: 1500,
    spawnPoints: {
        attackers: [
            { x: 200, y: 1400 }, { x: 250, y: 1400 }, { x: 300, y: 1400 },
            { x: 350, y: 1400 }, { x: 400, y: 1400 }
        ],
        defenders: [
            { x: 1800, y: 100 }, { x: 1750, y: 100 }, { x: 1700, y: 100 },
            { x: 1650, y: 100 }, { x: 1600, y: 100 }
        ]
    },
    walls: [
        { x: 0, y: 0, width: 2000, height: 20 },
        { x: 0, y: 1480, width: 2000, height: 20 },
        { x: 0, y: 0, width: 20, height: 1500 },
        { x: 1980, y: 0, width: 20, height: 1500 },

        { x: 600, y: 400, width: 20, height: 500 },
        { x: 600, y: 400, width: 600, height: 20 },
        { x: 1000, y: 600, width: 20, height: 400 },
        { x: 1200, y: 800, width: 400, height: 20 },
        { x: 400, y: 1000, width: 20, height: 300 },
        { x: 800, y: 1200, width: 600, height: 20 }
    ],
    bombSites: [
        { name: 'A', x: 1600, y: 1200, width: 200, height: 150 },
        { name: 'B', x: 300, y: 300, width: 200, height: 150 }
    ]
};
