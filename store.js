// ========================================
// STORE.JS - BOUTIQUE ET INVENTAIRE CORRIGÉS
// ========================================

const STORE_DEFAULT_AGENT_ICON = (typeof window !== 'undefined' && window.DEFAULT_AGENT_ICON)
    ? window.DEFAULT_AGENT_ICON
    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' ry='12' fill='%23242a3a'/%3E%3Ctext x='32' y='36' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='30' fill='%23ffffff'%3EA%3C/text%3E%3C/svg%3E";

// Système de rarités
const RARITIES = {
    consumer: {
        name: 'Consumer',
        color: '#b0c3d9',
        gradient: 'linear-gradient(135deg, #b0c3d9, #899eb5)',
        probability: 0.7992
    },
    industrial: {
        name: 'Industrial',
        color: '#5e98d9',
        gradient: 'linear-gradient(135deg, #5e98d9, #4a7db5)',
        probability: 0.1598
    },
    milspec: {
        name: 'Mil-Spec',
        color: '#4b69ff',
        gradient: 'linear-gradient(135deg, #4b69ff, #3a54cc)',
        probability: 0.0320
    },
    restricted: {
        name: 'Restricted',
        color: '#8847ff',
        gradient: 'linear-gradient(135deg, #8847ff, #6d39cc)',
        probability: 0.0064
    },
    classified: {
        name: 'Classified',
        color: '#d32ce6',
        gradient: 'linear-gradient(135deg, #d32ce6, #a923b8)',
        probability: 0.0013
    },
    covert: {
        name: 'Covert',
        color: '#eb4b4b',
        gradient: 'linear-gradient(135deg, #eb4b4b, #bc3c3c)',
        probability: 0.0003
    },
    knife: {
        name: 'Knife',
        color: '#ffd700',
        gradient: 'linear-gradient(135deg, #ffd700, #ccac00)',
        probability: 0.0001
    }
};

// Base de données des skins d'armes (REFONTE COMPLÈTE)
const WEAPON_SKINS = {
    rifles: [
        {
            id: 'ak47_redline',
            weapon: 'AK-47',
            name: 'Redline',
            rarity: 'classified',
            pattern: 'geometric',
            price: 2500,
            description: 'Lignes rouges élégantes sur fond noir.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_ak47_cu_ak47_cobra_light_png.png'
        },
        {
            id: 'ak47_vulcan',
            weapon: 'AK-47',
            name: 'Vulcan',
            rarity: 'covert',
            pattern: 'tech',
            price: 8000,
            description: 'Design futuriste high-tech.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_ak47_cu_ak47_winter_sport_light_png.png'
        },
        {
            id: 'ak47_case_hardened',
            weapon: 'AK-47',
            name: 'Case Hardened',
            rarity: 'milspec',
            pattern: 'metal',
            price: 800,
            description: 'Finition métallique bleue unique.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_ak47_aq_ak47_case_light_png.png'
        },
        {
            id: 'ak47_jungle_spray',
            weapon: 'AK-47',
            name: 'Jungle Spray',
            rarity: 'consumer',
            pattern: 'spray',
            price: 25,
            description: 'Camouflage jungle classique.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_ak47_sp_spray_light_png.png'
        },
        {
            id: 'm4a4_asiimov',
            weapon: 'M4A4',
            name: 'Asiimov',
            rarity: 'covert',
            pattern: 'asiimov',
            price: 9000,
            description: 'Design blanc et orange iconique.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_m4a1_cu_m4_asimov_light_png.png'
        },
        {
            id: 'm4a4_dragon_king',
            weapon: 'M4A4',
            name: 'Dragon King',
            rarity: 'classified',
            pattern: 'dragon',
            price: 3000,
            description: 'Dragon gravé avec détails dorés.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_m4a1_cu_m4a4_ancestral_light_png.png'
        },
        {
            id: 'm4a4_howl',
            weapon: 'M4A4',
            name: 'Howl',
            rarity: 'covert',
            pattern: 'creature',
            price: 15000,
            description: 'Loup hurlant rare et recherché.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_m4a1_cu_howling_light_png.png'
        },
        {
            id: 'm4a4_tornado',
            weapon: 'M4A4',
            name: 'Tornado',
            rarity: 'industrial',
            pattern: 'spray',
            price: 150,
            description: 'Motif tourbillon gris.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_m4a1_so_tornado_light_png.png'
        },
        {
            id: 'phantom_holocore',
            weapon: 'Phantom',
            name: 'HoloCore',
            rarity: 'classified',
            pattern: 'tech',
            price: 4500,
            description: 'Finition holographique alimentée par un noyau lumineux.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_m4a1_gs_m4a1_celestial_light_png.png'
        },
        {
            id: 'vandal_fulgurance',
            weapon: 'Vandal',
            name: 'Fulgurance',
            rarity: 'covert',
            pattern: 'energy',
            price: 5200,
            description: 'Vandal auréolé d\'énergie éclatante et de lignes futuristes.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_ak47_cu_ak47_fire_light_png.png'
        },
        {
            id: 'ak47_neon_rider',
            weapon: 'AK-47',
            name: 'Neon Rider',
            rarity: 'classified',
            pattern: 'neon',
            price: 3800,
            description: 'Design cyberpunk avec néons colorés.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_ak47_cu_ak47_neon_rider_light_png.png'
        },
        {
            id: 'ak47_aquamarine',
            weapon: 'AK-47',
            name: 'Aquamarine Revenge',
            rarity: 'covert',
            pattern: 'aqua',
            price: 6500,
            description: 'Motif marin avec vagues et pieuvre.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_ak47_cu_ak47_aq_oiled_light_png.png'
        },
        {
            id: 'm4a4_neo_noir',
            weapon: 'M4A4',
            name: 'Neo-Noir',
            rarity: 'covert',
            pattern: 'noir',
            price: 7200,
            description: 'Style noir et blanc avec éclaboussures rouges.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_m4a1_cu_m4a4_neo_noir_light_png.png'
        },
        {
            id: 'm4a4_desolate_space',
            weapon: 'M4A4',
            name: 'Desolate Space',
            rarity: 'classified',
            pattern: 'space',
            price: 3400,
            description: 'Thème spatial avec galaxies et étoiles.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_m4a1_cu_m4a4_desolate_space_light_png.png'
        },
        {
            id: 'phantom_oni',
            weapon: 'Phantom',
            name: 'Oni',
            rarity: 'covert',
            pattern: 'demon',
            price: 8900,
            description: 'Masque de démon japonais avec effets VFX.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_m4a1_cu_m4a1_demon_light_png.png'
        },
        {
            id: 'phantom_singularity',
            weapon: 'Phantom',
            name: 'Singularity',
            rarity: 'covert',
            pattern: 'quantum',
            price: 7600,
            description: 'Trou noir et distorsion spatiale.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_m4a1_cu_m4a1_hyper_beast_light_png.png'
        },
        {
            id: 'vandal_prime',
            weapon: 'Vandal',
            name: 'Prime',
            rarity: 'covert',
            pattern: 'luxury',
            price: 8400,
            description: 'Design premium or et blanc avec VFX.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_ak47_cu_ak47_gold_arabesque_light_png.png'
        },
        {
            id: 'vandal_reaver',
            weapon: 'Vandal',
            name: 'Reaver',
            rarity: 'covert',
            pattern: 'death',
            price: 7800,
            description: 'Style gothique sombre avec âmes.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_ak47_cu_ak47_nightwish_light_png.png'
        },
        {
            id: 'vandal_gaia',
            weapon: 'Vandal',
            name: 'Gaia\'s Vengeance',
            rarity: 'covert',
            pattern: 'nature',
            price: 8100,
            description: 'Thème nature avec plantes et terre.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_ak47_cu_ak47_planet_green_light_png.png'
        },
        {
            id: 'phantom_champion',
            weapon: 'Phantom',
            name: 'Champions 2021',
            rarity: 'covert',
            pattern: 'gold',
            price: 15000,
            description: 'Édition limitée Champions dorée.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_m4a1_cu_m4a1_champion_light_png.png'
        },
        {
            id: 'phantom_ruination',
            weapon: 'Phantom',
            name: 'Ruination',
            rarity: 'covert',
            pattern: 'dark',
            price: 7200,
            description: 'Corruption sombre et verte.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_m4a1_cu_m4a1_decimator_light_png.png'
        },
        {
            id: 'vandal_chronovoid',
            weapon: 'Vandal',
            name: 'ChronoVoid',
            rarity: 'covert',
            pattern: 'time',
            price: 8600,
            description: 'Distorsion temporelle violette.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_ak47_cu_ak47_uncharted_light_png.png'
        },
        {
            id: 'vandal_araxys',
            weapon: 'Vandal',
            name: 'Araxys',
            rarity: 'covert',
            pattern: 'alien',
            price: 9100,
            description: 'Technologie alien biomécanique.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_ak47_cu_ak47_xray_light_png.png'
        },
        {
            id: 'phantom_protocol',
            weapon: 'Phantom',
            name: 'Protocol 781-A',
            rarity: 'covert',
            pattern: 'tech',
            price: 8400,
            description: 'Hologrammes et technologie avancée.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_m4a1_cu_m4a1_flashback_light_png.png'
        },
        {
            id: 'vandal_neptune',
            weapon: 'Vandal',
            name: 'Neptune',
            rarity: 'classified',
            pattern: 'ocean',
            price: 4200,
            description: 'Thème océan profond bleu.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_ak47_cu_ak47_neon_revolution_light_png.png'
        },
        {
            id: 'phantom_spectrum',
            weapon: 'Phantom',
            name: 'Spectrum',
            rarity: 'covert',
            pattern: 'rainbow',
            price: 9800,
            description: 'Arc-en-ciel chromatique avec audio.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_m4a1_cu_m4a1_printstream_light_png.png'
        }
    ],
    pistols: [
        {
            id: 'deagle_blaze',
            weapon: 'Desert Eagle',
            name: 'Blaze',
            rarity: 'restricted',
            pattern: 'flame',
            price: 1200,
            description: 'Flammes orange vif.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_deagle_aa_flames_light_png.png'
        },
        {
            id: 'glock_fade',
            weapon: 'Glock-18',
            name: 'Fade',
            rarity: 'restricted',
            pattern: 'fade',
            price: 1100,
            description: 'Dégradé arc-en-ciel vibrant.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_glock_aa_fade_light_png.png'
        },
        {
            id: 'usp_orion',
            weapon: 'USP-S',
            name: 'Orion',
            rarity: 'milspec',
            pattern: 'geometric',
            price: 600,
            description: 'Motif géométrique bleu et blanc.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_usp_silencer_cu_usp_spitfire_light_png.png'
        },
        {
            id: 'p250_sand_dune',
            weapon: 'P250',
            name: 'Sand Dune',
            rarity: 'consumer',
            pattern: 'solid',
            price: 10,
            description: 'Finition sable basique.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_p250_so_sand_light_png.png'
        },
        {
            id: 'deagle_kumicho_dragon',
            weapon: 'Desert Eagle',
            name: 'Kumicho Dragon',
            rarity: 'covert',
            pattern: 'dragon',
            price: 9800,
            description: 'Dragon japonais doré gravé.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_deagle_cu_deagle_mecha_light_png.png'
        },
        {
            id: 'deagle_code_red',
            weapon: 'Desert Eagle',
            name: 'Code Red',
            rarity: 'classified',
            pattern: 'digital',
            price: 2200,
            description: 'Camouflage digital rouge et noir.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_deagle_cu_deagle_aureus_light_png.png'
        },
        {
            id: 'glock_water_elemental',
            weapon: 'Glock-18',
            name: 'Water Elemental',
            rarity: 'classified',
            pattern: 'water',
            price: 1800,
            description: 'Créature aquatique mystique.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_glock_cu_glock_water_elemental_light_png.png'
        },
        {
            id: 'glock_gamma_doppler',
            weapon: 'Glock-18',
            name: 'Gamma Doppler',
            rarity: 'restricted',
            pattern: 'doppler',
            price: 1400,
            description: 'Dégradé gamma vert et bleu.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_glock_am_gamma_doppler_phase3_light_png.png'
        },
        {
            id: 'usp_kill_confirmed',
            weapon: 'USP-S',
            name: 'Kill Confirmed',
            rarity: 'classified',
            pattern: 'skull',
            price: 2100,
            description: 'Crânes et marques de mort.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_usp_silencer_cu_usp_kill_confirmed_light_png.png'
        },
        {
            id: 'usp_neo_noir',
            weapon: 'USP-S',
            name: 'Neo-Noir',
            rarity: 'restricted',
            pattern: 'noir',
            price: 950,
            description: 'Style comic book noir et blanc.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_usp_silencer_cu_usp_noir_light_png.png'
        },
        {
            id: 'sheriff_ion',
            weapon: 'Sheriff',
            name: 'Ion',
            rarity: 'covert',
            pattern: 'energy',
            price: 5200,
            description: 'Énergie bleue électrique pulsante.',
            image: 'https://media.valorant-api.com/weaponskinlevels/2b555f97-46bb-5949-3531-979f5bc817f0/displayicon.png'
        },
        {
            id: 'sheriff_reaver',
            weapon: 'Sheriff',
            name: 'Reaver',
            rarity: 'covert',
            pattern: 'death',
            price: 4800,
            description: 'Âmes et énergie violette.',
            image: 'https://media.valorant-api.com/weaponskinlevels/4e4ebb8d-41d0-c326-595a-1f9b257e91fa/displayicon.png'
        },
        {
            id: 'classic_recon',
            weapon: 'Classic',
            name: 'Recon',
            rarity: 'restricted',
            pattern: 'military',
            price: 800,
            description: 'Camouflage militaire tactique.',
            image: 'https://media.valorant-api.com/weaponskinlevels/e02ee7ad-4298-28f6-c79c-d1bb60d0ab55/displayicon.png'
        },
        {
            id: 'sheriff_sentinels',
            weapon: 'Sheriff',
            name: 'Sentinels of Light',
            rarity: 'covert',
            pattern: 'light',
            price: 5600,
            description: 'Or et lumière divine.',
            image: 'https://media.valorant-api.com/weaponskinlevels/746a022b-48a9-c51b-f379-11a3e1e2bc8e/displayicon.png'
        },
        {
            id: 'ghost_sovereign',
            weapon: 'Ghost',
            name: 'Sovereign',
            rarity: 'covert',
            pattern: 'royal',
            price: 4200,
            description: 'Or royal avec ornements.',
            image: 'https://media.valorant-api.com/weaponskinlevels/ed8a1109-4e48-f077-636b-e98dd332bfcc/displayicon.png'
        },
        {
            id: 'sheriff_magepunk',
            weapon: 'Sheriff',
            name: 'Magepunk',
            rarity: 'classified',
            pattern: 'steampunk',
            price: 3400,
            description: 'Steampunk magique orange.',
            image: 'https://media.valorant-api.com/weaponskinlevels/59733cf9-490b-e25b-2c6f-eca947628079/displayicon.png'
        }
    ],
    smgs: [
        {
            id: 'p90_asiimov',
            weapon: 'P90',
            name: 'Asiimov',
            rarity: 'covert',
            pattern: 'asiimov',
            price: 7500,
            description: 'Version P90 du célèbre Asiimov.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_p90_cu_p90_asiimov_light_png.png'
        },
        {
            id: 'mp9_bulldozer',
            weapon: 'MP9',
            name: 'Bulldozer',
            rarity: 'milspec',
            pattern: 'industrial',
            price: 400,
            description: 'Style construction jaune et noir.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_mp9_cu_mp9_bulldozer_light_png.png'
        },
        {
            id: 'spectre_neon_pulse',
            weapon: 'Spectre',
            name: 'Néon Pulse',
            rarity: 'restricted',
            pattern: 'neon',
            price: 3200,
            description: 'Circuit lumineux pulsé aux teintes néon électriques.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_mp7_cu_mp7_neon_ply_light_png.png'
        },
        {
            id: 'p90_death_by_kitty',
            weapon: 'P90',
            name: 'Death by Kitty',
            rarity: 'classified',
            pattern: 'kawaii',
            price: 4200,
            description: 'Chats kawaï mignons et roses.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_p90_cu_p90_deatbyktty_light_png.png'
        },
        {
            id: 'p90_tigris',
            weapon: 'P90',
            name: 'Tigris',
            rarity: 'classified',
            pattern: 'tiger',
            price: 3900,
            description: 'Motif de tigre blanc et orange.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_p90_cu_p90_trigris_light_png.png'
        },
        {
            id: 'spectre_elderflame',
            weapon: 'Spectre',
            name: 'Elderflame',
            rarity: 'covert',
            pattern: 'dragon_fire',
            price: 9200,
            description: 'Dragon de feu ancestral animé.',
            image: 'https://media.valorant-api.com/weaponskinlevels/b3d3ff38-4202-20d8-2f41-c783477e5636/displayicon.png'
        },
        {
            id: 'spectre_protocol',
            weapon: 'Spectre',
            name: 'Protocol 781-A',
            rarity: 'restricted',
            pattern: 'tech',
            price: 2800,
            description: 'Technologie holographique futuriste.',
            image: 'https://media.valorant-api.com/weaponskinlevels/5eb7515f-40a1-2f15-de03-c9a024664737/displayicon.png'
        },
        {
            id: 'spectre_reaver',
            weapon: 'Spectre',
            name: 'Reaver',
            rarity: 'covert',
            pattern: 'death',
            price: 6200,
            description: 'Corruption violette et âmes.',
            image: 'https://media.valorant-api.com/weaponskinlevels/0a0237d3-4d57-0ed2-ab65-c898a7bc755b/displayicon.png'
        },
        {
            id: 'stinger_sovereign',
            weapon: 'Stinger',
            name: 'Sovereign',
            rarity: 'classified',
            pattern: 'royal',
            price: 3100,
            description: 'Design royal doré élégant.',
            image: 'https://media.valorant-api.com/weaponskinlevels/9bc535dd-4d91-3421-2cd0-7a8fdad3478b/displayicon.png'
        }
    ],
    snipers: [
        {
            id: 'awp_dragon_lore',
            weapon: 'AWP',
            name: 'Dragon Lore',
            rarity: 'covert',
            pattern: 'dragon',
            price: 20000,
            description: 'Le skin le plus rare et recherché.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_awp_cu_awp_dragon_lore_light_png.png'
        },
        {
            id: 'awp_asiimov',
            weapon: 'AWP',
            name: 'Asiimov',
            rarity: 'covert',
            pattern: 'asiimov',
            price: 12000,
            description: 'Design Asiimov emblématique.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_awp_cu_awp_asimov_light_png.png'
        },
        {
            id: 'ssg08_blood_in_water',
            weapon: 'Scout SSG 08',
            name: 'Blood in the Water',
            rarity: 'classified',
            pattern: 'animal',
            price: 2800,
            description: 'Requin sanglant stylisé.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_ssg08_aa_ssg08_blood_light_png.png'
        },
        {
            id: 'awp_safari_mesh',
            weapon: 'AWP',
            name: 'Safari Mesh',
            rarity: 'industrial',
            pattern: 'camo',
            price: 80,
            description: 'Camouflage maillé simple.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_awp_sp_mesh_tan_light_png.png'
        },
        {
            id: 'operator_nexus_mythique',
            weapon: 'Operator',
            name: 'Nexus (Mythique)',
            rarity: 'covert',
            pattern: 'mythic',
            price: 12500,
            description: 'Operator mythique aux reflets nexus et gravures arcaniques.',
            image: 'https://media.valorant-api.com/weaponskinlevels/1954ba1b-4e97-dcf4-890f-308b967d83b2/displayicon.png'
        },
        {
            id: 'awp_hyper_beast',
            weapon: 'AWP',
            name: 'Hyper Beast',
            rarity: 'covert',
            pattern: 'beast',
            price: 11000,
            description: 'Créature féroce multicolore.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_awp_cu_awp_hyper_beast_light_png.png'
        },
        {
            id: 'awp_wildfire',
            weapon: 'AWP',
            name: 'Wildfire',
            rarity: 'restricted',
            pattern: 'fire',
            price: 1600,
            description: 'Flammes sauvages orange et jaune.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_awp_cu_awp_wildfire_light_png.png'
        },
        {
            id: 'awp_medusa',
            weapon: 'AWP',
            name: 'Medusa',
            rarity: 'covert',
            pattern: 'mythic',
            price: 25000,
            description: 'Méduse mythologique extrêmement rare.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_awp_cu_medusa_awp_light_png.png'
        },
        {
            id: 'operator_ion',
            weapon: 'Operator',
            name: 'Ion',
            rarity: 'covert',
            pattern: 'energy',
            price: 10500,
            description: 'Énergie électrique bleue pulsante.',
            image: 'https://media.valorant-api.com/weaponskinlevels/24c73c29-443c-2440-d6db-838086f2451a/displayicon.png'
        },
        {
            id: 'operator_glitchpop',
            weapon: 'Operator',
            name: 'Glitchpop',
            rarity: 'covert',
            pattern: 'cyberpunk',
            price: 11200,
            description: 'Glitch cyberpunk coloré et animé.',
            image: 'https://media.valorant-api.com/weaponskinlevels/d92a6ee6-4073-8b7f-e944-f1a55606a28a/displayicon.png'
        }
    ],
    knives: [
        {
            id: 'karambit_fade',
            weapon: 'Karambit',
            name: 'Fade',
            rarity: 'knife',
            pattern: 'fade',
            price: 50000,
            description: 'Karambit avec un dégradé parfait.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_knife_karambit_aa_fade_light_png.png'
        },
        {
            id: 'butterfly_crimson_web',
            weapon: 'Butterfly Knife',
            name: 'Crimson Web',
            rarity: 'knife',
            pattern: 'spider_web',
            price: 45000,
            description: 'Toile d\'araignée rouge sur manche noir.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_knife_butterfly_hy_webs_light_png.png'
        },
        {
            id: 'knife_flux',
            weapon: 'Couteau Tactique',
            name: 'Flux',
            rarity: 'knife',
            pattern: 'energy',
            price: 52000,
            description: 'Lame tactique enveloppée d\'un flux énergétique lumineux.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_knife_cu_knife_acid_etched_light_png.png'
        },
        {
            id: 'karambit_tiger_tooth',
            weapon: 'Karambit',
            name: 'Tiger Tooth',
            rarity: 'knife',
            pattern: 'tiger',
            price: 48000,
            description: 'Finition dorée avec rayures de tigre.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_knife_karambit_an_tiger_orange_light_png.png'
        },
        {
            id: 'karambit_doppler',
            weapon: 'Karambit',
            name: 'Doppler Phase 2',
            rarity: 'knife',
            pattern: 'doppler',
            price: 55000,
            description: 'Dégradé rose et bleu hypnotique.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_knife_karambit_am_doppler_phase2_light_png.png'
        },
        {
            id: 'butterfly_fade',
            weapon: 'Butterfly Knife',
            name: 'Fade',
            rarity: 'knife',
            pattern: 'fade',
            price: 52000,
            description: 'Dégradé arc-en-ciel parfait.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_knife_butterfly_aa_fade_light_png.png'
        },
        {
            id: 'butterfly_slaughter',
            weapon: 'Butterfly Knife',
            name: 'Slaughter',
            rarity: 'knife',
            pattern: 'blood',
            price: 46000,
            description: 'Motifs sanglants abstraits.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_knife_butterfly_am_murder_light_png.png'
        },
        {
            id: 'bayonet_autotronic',
            weapon: 'Bayonet',
            name: 'Autotronic',
            rarity: 'knife',
            pattern: 'tech',
            price: 44000,
            description: 'Design robotique futuriste.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_bayonet_gs_bayonet_autotronic_light_png.png'
        },
        {
            id: 'talon_marble_fade',
            weapon: 'Talon Knife',
            name: 'Marble Fade',
            rarity: 'knife',
            pattern: 'marble',
            price: 60000,
            description: 'Marbre coloré rouge bleu jaune.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_knife_push_am_marble_fade_light_png.png'
        },
        {
            id: 'ursus_gamma_doppler',
            weapon: 'Ursus Knife',
            name: 'Gamma Doppler',
            rarity: 'knife',
            pattern: 'doppler',
            price: 51000,
            description: 'Dégradé vert émeraude radioactif.',
            image: 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_knife_ursus_am_gamma_doppler_phase2_light_png.png'
        }
    ]
};

// Définition des cases (REFONTE COMPLÈTE avec meilleurs drops)
const WEAPON_CASES = [
    {
        id: 'starter_case',
        name: 'Caisse Débutant',
        price: 100,
        description: 'Parfaite pour commencer votre collection - Skins Common à Rare',
        contents: [
            // Consumer (~78%)
            'ak47_jungle_spray',
            'm4a4_tornado',
            'p250_sand_dune',
            'awp_safari_mesh',
            // Industrial (~18%)
            'mp9_bulldozer',
            'ak47_case_hardened',
            // Mil-Spec (~3.5%)
            'usp_orion',
            'awp_wildfire',
            // Restricted (~0.5%)
            'glock_fade',
            'deagle_blaze'
        ],
        dropRates: {
            consumer: 0.78,
            industrial: 0.18,
            milspec: 0.035,
            restricted: 0.005
        }
    },
    {
        id: 'neon_case',
        name: 'Caisse Néon',
        price: 200,
        description: 'Collection futuriste avec éclairages néon - Rare à Epic',
        contents: [
            // Industrial (~48%)
            'mp9_bulldozer',
            'awp_safari_mesh',
            // Mil-Spec (~28%)
            'ak47_case_hardened',
            'spectre_protocol',
            // Restricted (~18%)
            'ak47_neon_rider',
            'spectre_neon_pulse',
            'glock_gamma_doppler',
            // Classified (~5%)
            'phantom_holocore',
            'm4a4_desolate_space',
            // Covert (~1%)
            'phantom_singularity',
            'operator_ion'
        ],
        dropRates: {
            industrial: 0.48,
            milspec: 0.28,
            restricted: 0.18,
            classified: 0.05,
            covert: 0.01
        }
    },
    {
        id: 'dragon_case',
        name: 'Caisse Dragon',
        price: 350,
        description: 'Thème asiatique avec dragons et créatures - Epic à Legendary',
        contents: [
            // Mil-Spec (~40%)
            'usp_orion',
            'awp_wildfire',
            // Restricted (~32%)
            'glock_fade',
            'deagle_blaze',
            'usp_neo_noir',
            // Classified (~20%)
            'm4a4_dragon_king',
            'ssg08_blood_in_water',
            'deagle_code_red',
            // Covert (~8%)
            'ak47_aquamarine',
            'deagle_kumicho_dragon',
            'm4a4_neo_noir',
            'awp_hyper_beast'
        ],
        dropRates: {
            milspec: 0.4,
            restricted: 0.32,
            classified: 0.2,
            covert: 0.08
        }
    },
    {
        id: 'asiimov_case',
        name: 'Caisse Asiimov',
        price: 400,
        description: 'Collection Asiimov et designs technologiques - Legendary',
        contents: [
            // Restricted (~48%)
            'deagle_blaze',
            'glock_fade',
            'spectre_neon_pulse',
            // Classified (~35%)
            'ak47_redline',
            'm4a4_desolate_space',
            'p90_tigris',
            'glock_water_elemental',
            // Covert (~17%)
            'm4a4_asiimov',
            'p90_asiimov',
            'awp_asiimov',
            'vandal_fulgurance',
            'phantom_holocore'
        ],
        dropRates: {
            restricted: 0.48,
            classified: 0.35,
            covert: 0.17
        }
    },
    {
        id: 'beast_case',
        name: 'Caisse Bête Sauvage',
        price: 500,
        description: 'Créatures mythiques et animaux féroces - Legendary à Mythic',
        contents: [
            // Classified (~56%)
            'ssg08_blood_in_water',
            'p90_tigris',
            'p90_death_by_kitty',
            'usp_kill_confirmed',
            // Covert (~40%)
            'ak47_aquamarine',
            'awp_hyper_beast',
            'deagle_kumicho_dragon',
            'm4a4_neo_noir',
            'awp_dragon_lore',
            // Knife (~4%)
            'karambit_tiger_tooth',
            'butterfly_slaughter'
        ],
        dropRates: {
            classified: 0.56,
            covert: 0.4,
            knife: 0.04
        }
    },
    {
        id: 'valorant_case',
        name: 'Caisse Valorant',
        price: 600,
        description: 'Skins exclusifs Valorant avec effets VFX - Mythic',
        contents: [
            // Classified (~47%)
            'phantom_holocore',
            'ak47_neon_rider',
            'spectre_protocol',
            // Covert (~50%)
            'phantom_oni',
            'phantom_singularity',
            'vandal_prime',
            'vandal_reaver',
            'spectre_elderflame',
            'operator_ion',
            'operator_glitchpop',
            // Knife (~3%)
            'knife_flux',
            'talon_marble_fade'
        ],
        dropRates: {
            classified: 0.47,
            covert: 0.5,
            knife: 0.03
        }
    },
    {
        id: 'ultimate_case',
        name: 'Caisse Ultime',
        price: 1000,
        description: 'Les skins les plus rares et recherchés - Mythic garantis, couteau très difficile',
        contents: [
            'usp_orion',
            'awp_wildfire',
            // Covert (~99%)
            'ak47_vulcan',
            'm4a4_howl',
            'awp_dragon_lore',
            'awp_medusa',
            'phantom_oni',
            'vandal_prime',
            'operator_glitchpop',
            'spectre_elderflame',
            'm4a4_neo_noir',
            'deagle_kumicho_dragon',
            // Knife (~1%)
            'karambit_fade',
            'karambit_doppler',
            'butterfly_fade',
            'butterfly_crimson_web',
            'talon_marble_fade',
            'ursus_gamma_doppler',
            'bayonet_autotronic',
            'knife_flux'
        ],
        dropRates: {
            milspec: 0.60,
            covert: 0.39,
            knife: 0.01
        }
    }
];

// Définition des agents
const AGENTS = {
    reyna: {
        id: 'reyna',
        name: 'Reyna',
        role: 'Duelliste',
        price: 1500,
        description: 'Reyna se nourrit des éliminations pour régénérer sa santé et devenir invincible.',
        icon: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/reyna_image.png',
        rarity: 'covert',
        abilities: {
            ability1: {
                name: 'Dévorer',
                description: 'Consomme une âme pour régénérer rapidement la santé',
                cooldown: 0,
                charges: 'per_kill',
                effect: 'heal'
            },
            ability2: {
                name: 'Rejeter',
                description: 'Devient invincible pendant 2 secondes',
                cooldown: 0,
                charges: 'per_kill',
                effect: 'invincible'
            },
            ultimate: {
                name: 'Impératrice',
                description: 'Augmente la cadence de tir et améliore la vision',
                points: 6,
                duration: 10,
                effect: 'fire_rate_boost'
            }
        }
    },
    jett: {
        id: 'jett',
        name: 'Jett',
        role: 'Duelliste',
        price: 1500,
        description: 'Agent agile capable de se déplacer rapidement et de planer dans les airs.',
        icon: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/jett_image.png',
        rarity: 'covert',
        abilities: {
            ability1: {
                name: 'Updraft',
                description: 'Propulse vers le haut',
                cooldown: 35,
                effect: 'dash_up'
            },
            ability2: {
                name: 'Tailwind',
                description: 'Dash rapide dans la direction du mouvement',
                cooldown: 30,
                effect: 'dash'
            },
            ultimate: {
                name: 'Lames Tourbillonnantes',
                description: 'Équipe des couteaux de lancer ultra-précis',
                points: 7,
                effect: 'knife_throw'
            }
        }
    },
    sage: {
        id: 'sage',
        name: 'Sage',
        role: 'Sentinelle',
        price: 1200,
        description: 'Guérisseuse et protectrice, capable de créer des barrières et de ressusciter.',
        icon: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/sage_image.png',
        rarity: 'classified',
        abilities: {
            ability1: {
                name: 'Orbe de Soin',
                description: 'Soigne soi-même ou un allié',
                cooldown: 45,
                effect: 'heal_orb'
            },
            ability2: {
                name: 'Orbe de Ralentissement',
                description: 'Crée une zone qui ralentit les ennemis',
                cooldown: 30,
                effect: 'slow_orb'
            },
            ultimate: {
                name: 'Résurrection',
                description: 'Ressuscite un allié mort',
                points: 8,
                effect: 'resurrect'
            }
        }
    },
    phoenix: {
        id: 'phoenix',
        name: 'Phoenix',
        role: 'Duelliste',
        price: 1200,
        description: 'Maître du feu capable de se soigner et de renaître de ses cendres.',
        icon: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/pheonix_image.png',
        rarity: 'classified',
        abilities: {
            ability1: {
                name: 'Mains Brûlantes',
                description: 'Lance une boule de feu qui soigne Phoenix',
                cooldown: 25,
                effect: 'fire_heal'
            },
            ability2: {
                name: 'Flammes Incendiaires',
                description: 'Crée un mur de feu',
                cooldown: 30,
                effect: 'fire_wall'
            },
            ultimate: {
                name: 'Renaissance',
                description: 'Place un marqueur. Si Phoenix meurt, il renaît au marqueur',
                points: 6,
                duration: 10,
                effect: 'respawn'
            }
        }
    },
    omen: {
        id: 'omen',
        name: 'Omen',
        role: 'Contrôleur',
        price: 1200,
        description: 'Manipulateur des ombres, capable de se téléporter et d\'aveugler.',
        icon: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/omen_image.png',
        rarity: 'classified',
        abilities: {
            ability1: {
                name: 'Linceul Ténébreux',
                description: 'Lance un projectile qui aveugle',
                cooldown: 25,
                effect: 'blind'
            },
            ability2: {
                name: 'Foulée Ténébreuse',
                description: 'Téléportation courte distance',
                cooldown: 35,
                effect: 'teleport_short'
            },
            ultimate: {
                name: 'Depuis l\'Ombre',
                description: 'Téléportation n\'importe où sur la map',
                points: 7,
                effect: 'teleport_map'
            }
        }
    },
    viper: {
        id: 'viper',
        name: 'Viper',
        role: 'Contrôleur',
        price: 1300,
        description: 'Experte en toxines, déploie des écrans de fumée empoisonnée.',
        icon: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/viper_image.png',
        rarity: 'classified',
        abilities: {
            ability1: {
                name: 'Nuage Toxique',
                description: 'Déploie un nuage de gaz empoisonné',
                cooldown: 30,
                effect: 'poison_cloud'
            },
            ability2: {
                name: 'Écran Toxique',
                description: 'Crée un mur de gaz toxique',
                cooldown: 35,
                effect: 'poison_wall'
            },
            ultimate: {
                name: 'Fosse à Vipères',
                description: 'Crée une énorme zone de gaz toxique',
                points: 7,
                duration: 15,
                effect: 'poison_zone'
            }
        }
    },
    cypher: {
        id: 'cypher',
        name: 'Cypher',
        role: 'Sentinelle',
        price: 1400,
        description: 'Espion marocain utilisant des gadgets pour surveiller et piéger.',
        icon: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/cypher_image.png',
        rarity: 'restricted',
        abilities: {
            ability1: {
                name: 'Fil Piège',
                description: 'Place un fil qui révèle et ralentit les ennemis',
                cooldown: 30,
                effect: 'tripwire'
            },
            ability2: {
                name: 'Cage Cyber',
                description: 'Place une cage qui bloque la vision',
                cooldown: 25,
                effect: 'cyber_cage'
            },
            ultimate: {
                name: 'Assaut Neuronal',
                description: 'Révèle la position de tous les ennemis vivants',
                points: 6,
                duration: 5,
                effect: 'reveal_all'
            }
        }
    },
    default: {
        id: 'default',
        name: 'Agent Standard',
        role: 'Polyvalent',
        price: 0,
        description: 'Agent de base sans capacités spéciales',
        icon: STORE_DEFAULT_AGENT_ICON,
        rarity: 'consumer',
        abilities: {
            ability1: null,
            ability2: null,
            ultimate: null
        }
    }
};

// État global de l'inventaire
let playerInventory = {
    skins: [],
    cases: [],
    agents: ['default'], // Agent par défaut débloqué
    equippedAgent: 'default',
    equippedSkins: {
        rifles: {},
        pistols: {},
        smgs: {},
        snipers: {},
        knives: {}
    },
    currency: {
        coins: 1000,
        vp: 0
    }
};

// Système de boutique
const StoreSystem = {
    currentRevealedSkin: null,
    currentOpeningAnimation: null,

    async init() {
        await this.loadPlayerData();
        this.setupEventListeners();
        this.switchStoreTab('cases');
        this.switchInventoryTab('weapons');
        this.loadInventory();
    },

    async loadPlayerData() {
        try {
            // Charger depuis Firebase si connecté
            if (window.currentUser && window.database) {
                const userRef = window.database.ref(`users/${window.currentUser.uid}/inventory`);
                const snapshot = await userRef.once('value');
                const firebaseData = snapshot.val();
                
                if (firebaseData) {
                    playerInventory = { ...playerInventory, ...firebaseData };
                    this.ensureInventoryStructure();
                    this.updateCurrencyDisplay();
                    return;
                }
            }
        } catch (error) {
        }
        
        // Fallback vers localStorage
        try {
            const savedData = localStorage.getItem('sio_shooter_inventory');
            if (savedData) {
                playerInventory = { ...playerInventory, ...JSON.parse(savedData) };
            } else {
                // Skins de départ
                playerInventory.skins = [
                    { id: 'ak47_jungle_spray', acquiredAt: Date.now(), equipped: false },
                    { id: 'p250_sand_dune', acquiredAt: Date.now(), equipped: false }
                ];
                this.savePlayerData();
            }
        } catch (error) {
        }

        this.ensureInventoryStructure();
        this.updateCurrencyDisplay();
    },

    savePlayerData() {
        try {
            this.ensureInventoryStructure();
            // Sauvegarder dans localStorage
            localStorage.setItem('sio_shooter_inventory', JSON.stringify(playerInventory));
            
            // Sauvegarder dans Firebase si connecté
            if (window.currentUser && window.database) {
                window.database.ref(`users/${window.currentUser.uid}/inventory`).set(playerInventory)
            }
        } catch (error) {
        }
    },

    updateCurrencyDisplay() {
        this.ensureInventoryStructure();

        const elementsToUpdate = [
            { id: 'user-coins', value: Math.floor(playerInventory.currency.coins) },
            { id: 'header-coins', value: Math.floor(playerInventory.currency.coins) },
            { id: 'user-vp', value: Math.floor(playerInventory.currency.vp) },
            { id: 'header-vp', value: Math.floor(playerInventory.currency.vp) }
        ];

        elementsToUpdate.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                // Animation de compteur
                const currentValue = parseInt(element.textContent) || 0;
                const targetValue = item.value;

                if (currentValue !== targetValue) {
                    this.animateCounter(element, currentValue, targetValue, 500);
                }
            }
        });
    },

    animateCounter(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16); // 60 FPS
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    },

    ensureInventoryStructure() {
        if (!Array.isArray(playerInventory.skins)) {
            playerInventory.skins = [];
        }

        if (!Array.isArray(playerInventory.cases)) {
            playerInventory.cases = [];
        }

        if (!Array.isArray(playerInventory.agents)) {
            playerInventory.agents = ['default'];
        }

        if (!playerInventory.equippedAgent) {
            playerInventory.equippedAgent = 'default';
        }

        if (!playerInventory.currency) {
            playerInventory.currency = { coins: 1000, vp: 0 };
        }

        playerInventory.currency.coins = Number.isFinite(playerInventory.currency.coins)
            ? playerInventory.currency.coins
            : 1000;
        playerInventory.currency.vp = Number.isFinite(playerInventory.currency.vp)
            ? playerInventory.currency.vp
            : 0;

        if (!playerInventory.equippedSkins) {
            playerInventory.equippedSkins = {};
        }

        const categories = ['rifles', 'pistols', 'smgs', 'snipers', 'knives'];
        categories.forEach(category => {
            if (!playerInventory.equippedSkins[category]) {
                playerInventory.equippedSkins[category] = {};
            }
        });
    },

    setupEventListeners() {
        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (window.showMenuSection) window.showMenuSection('store');
            }
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                if (window.showMenuSection) window.showMenuSection('inventory');
            }
        });
    },

    checkDailyReward() {
        const lastReward = localStorage.getItem('sio_shooter_last_daily_reward');
        const today = new Date().toDateString();

        if (lastReward !== today) {
            this.ensureInventoryStructure();
            const reward = 100 + Math.floor(Math.random() * 50);
            playerInventory.currency.coins += reward;
            
            localStorage.setItem('sio_shooter_last_daily_reward', today);
            this.savePlayerData();
            this.updateCurrencyDisplay();

            if (window.NotificationSystem) {
                window.NotificationSystem.show(
                    'Récompense quotidienne',
                    `Vous avez reçu ${reward} SIO Coins!`,
                    'success'
                );
            }
        }
    },

    // ========================================
    // GESTION DES CASES
    // ========================================

    loadCases() {
        const casesGrid = document.getElementById('cases-grid');
        if (!casesGrid) return;

        casesGrid.innerHTML = '';

        WEAPON_CASES.forEach(weaponCase => {
            const caseCard = document.createElement('div');
            caseCard.className = 'case-card';
            caseCard.innerHTML = `
                <div class="case-image">
                    <img src="assets/case.svg" alt="Case ${weaponCase.name}">
                </div>
                <div class="case-info">
                    <h3>${weaponCase.name}</h3>
                    <p>${weaponCase.description}</p>
                    <div class="case-price">
                        <i class="fas fa-coins"></i> ${weaponCase.price}
                    </div>
                </div>
                <div class="case-actions">
                    <button class="btn-primary" onclick="StoreSystem.purchaseCase('${weaponCase.id}')">
                        Acheter
                    </button>
                    <button class="btn-secondary" onclick="StoreSystem.previewCase('${weaponCase.id}')">
                        Aperçu
                    </button>
                </div>
            `;
            casesGrid.appendChild(caseCard);
        });
    },

    purchaseCase(caseId) {
        const weaponCase = WEAPON_CASES.find(c => c.id === caseId);
        if (!weaponCase) return;

        this.ensureInventoryStructure();

        if (playerInventory.currency.coins < weaponCase.price) {
            if (window.NotificationSystem) {
                window.NotificationSystem.show(
                    'Fonds insuffisants',
                    'Vous n\'avez pas assez de SIO Coins.',
                    'error'
                );
            }
            return;
        }

        // Déduire les pièces
        playerInventory.currency.coins = Math.floor(playerInventory.currency.coins - weaponCase.price);

        // Jouer le son d'achat
        this.playSound('purchase');

        // Ajouter la case à l'inventaire
        playerInventory.cases.push({
            id: caseId,
            acquiredAt: Date.now()
        });

        this.ensureInventoryStructure();
        this.savePlayerData();
        this.updateCurrencyDisplay();

        // Recharger immédiatement pour éviter les désynchronisations
        setTimeout(() => {
            this.loadInventoryCases();
            this.updateInventoryStats();
            this.updateCurrencyDisplay();
        }, 100);

        if (window.NotificationSystem) {
            window.NotificationSystem.show(
                'Case achetée',
                `${weaponCase.name} ajoutée à votre inventaire!`,
                'success',
                5000,
                [
                    {
                        text: 'Ouvrir',
                        primary: true,
                        callback: `StoreSystem.openCase('${caseId}')`
                    }
                ]
            );
        }
    },

    openCase(caseId) {
        const weaponCase = WEAPON_CASES.find(c => c.id === caseId);
        if (!weaponCase) {
            return;
        }

        // Vérifier que la case existe dans l'inventaire
        const caseIndex = playerInventory.cases.findIndex(c => c.id === caseId);
        if (caseIndex === -1) {
            if (window.NotificationSystem) {
                window.NotificationSystem.show(
                    'Erreur',
                    'Case non trouvée dans l\'inventaire.',
                    'error'
                );
            }
            return;
        }

        // Retirer la case de l'inventaire
        playerInventory.cases.splice(caseIndex, 1);
        this.ensureInventoryStructure();
        this.savePlayerData();
        this.loadInventoryCases();
        this.updateInventoryStats();

        // Afficher la modal d'ouverture
        this.showCaseOpeningModal(weaponCase);
    },

    showCaseOpeningModal(weaponCase) {
        const modal = document.getElementById('case-opening-modal');
        const title = document.getElementById('case-opening-title');
        const caseImage = document.getElementById('case-image');
        const skinReveal = document.getElementById('skin-reveal');
        const openingActions = document.getElementById('opening-actions');

        if (!modal || !title || !caseImage) {
            return;
        }

        // Réinitialiser
        title.textContent = `Ouverture: ${weaponCase.name}`;
        caseImage.innerHTML = '';
        if (skinReveal) skinReveal.classList.add('hidden');
        if (openingActions) openingActions.classList.add('hidden');

        modal.classList.remove('hidden');

        // Masquer la barre de défilement pour que l'animation prenne toute la place
        modal.style.overflow = 'hidden';

        // Créer l'animation de défilement style CS:GO
        this.createCSGOAnimation(weaponCase, caseImage);
    },

    playSound(soundType) {
        // Utiliser l'API Web Audio pour générer des sons simples
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            switch(soundType) {
                case 'spin':
                    oscillator.frequency.value = 200;
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    break;
                case 'reveal':
                    oscillator.frequency.value = 800;
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    break;
                case 'purchase':
                    oscillator.frequency.value = 600;
                    oscillator.type = 'square';
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    break;
            }

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
        }
    },

    createCSGOAnimation(weaponCase, container) {
        // Nettoyer l'ancienne animation
        if (this.currentOpeningAnimation) {
            clearInterval(this.currentOpeningAnimation);
        }

        // Pré-sélectionner le skin gagnant AVANT l'animation
        const wonSkin = this.selectRandomSkinFromCase(weaponCase);
        if (!wonSkin) {
            console.error('Aucun skin sélectionné pour cette case');
            this.closeCaseOpeningModal();
            return;
        }

        // Log pour débugger
        console.log(`🎁 Case ouverte: ${weaponCase.name}`);
        console.log(`✨ Skin gagné: ${wonSkin.weapon} | ${wonSkin.name} (${RARITIES[wonSkin.rarity].name})`);

        // Jouer le son de démarrage
        this.playSound('spin');

        // Créer la bande de défilement
        const rouletteContainer = document.createElement('div');
        rouletteContainer.className = 'case-roulette-container';
        rouletteContainer.style.cssText = `
            width: 100%;
            height: 200px;
            overflow: hidden;
            position: relative;
            background: linear-gradient(90deg,
                rgba(0,0,0,0.8) 0%,
                rgba(0,0,0,0) 45%,
                rgba(0,0,0,0) 55%,
                rgba(0,0,0,0.8) 100%);
        `;

        const roulette = document.createElement('div');
        roulette.className = 'case-roulette';
        roulette.style.cssText = `
            display: flex;
            gap: 15px;
            position: absolute;
            left: 0;
            transform: translateX(0);
            transition: transform 8s cubic-bezier(0.1, 0.7, 0.3, 0.98);
        `;

        // Créer les items de la roulette
        const caseSkins = weaponCase.contents.map(skinId =>
            Object.values(WEAPON_SKINS).flat().find(skin => skin.id === skinId)
        ).filter(Boolean);

        console.log('Animation - Case skins found:', caseSkins.length);

        if (caseSkins.length === 0) {
            console.error('Aucun skin pour l\'animation');
            this.closeCaseOpeningModal();
            return;
        }

        // Générer beaucoup d'items aléatoires + le skin gagnant loin dans la liste
        const items = [];
        const totalItems = 100; // Total d'items
        const winningPosition = 85; // Position du skin gagnant (proche de la fin)

        console.log(`🎯 Le skin gagnant sera placé à la position ${winningPosition}:`, wonSkin.weapon, '|', wonSkin.name);

        for (let i = 0; i < totalItems; i++) {
            if (i === winningPosition) {
                // Insérer le skin gagnant à cette position
                items.push(wonSkin);
                console.log(`✨ Position ${i}: SKIN GAGNANT -`, wonSkin.weapon, '|', wonSkin.name);
            } else {
                // Ajouter un skin aléatoire (mais éviter le skin gagnant pour plus de clarté visuelle)
                let randomSkin;
                do {
                    randomSkin = caseSkins[Math.floor(Math.random() * caseSkins.length)];
                } while (caseSkins.length > 1 && randomSkin.id === wonSkin.id && Math.random() > 0.3); // 70% de chance d'éviter le skin gagnant
                items.push(randomSkin);
            }
        }

        // Créer les cartes
        items.forEach(skin => {
            const card = document.createElement('div');
            card.className = 'roulette-item';
            card.style.cssText = `
                min-width: 150px;
                height: 180px;
                background: ${RARITIES[skin.rarity].gradient};
                border-radius: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 15px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                border: 2px solid ${RARITIES[skin.rarity].color};
            `;

            const skinImageHTML = skin.image
                ? `<img src="${skin.image}" alt="${skin.weapon}" style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 10px;">`
                : `<div style="font-size: 12px; margin-bottom: 10px; color: rgba(255,255,255,0.5);">${skin.weapon}</div>`;

            card.innerHTML = `
                ${skinImageHTML}
                <div style="font-size: 12px; color: white; text-align: center; font-weight: bold;">${skin.weapon}</div>
                <div style="font-size: 14px; color: white; text-align: center; margin-top: 5px;">${skin.name}</div>
                <div style="font-size: 10px; color: ${RARITIES[skin.rarity].color}; margin-top: 5px; font-weight: bold;">${RARITIES[skin.rarity].name}</div>
            `;

            roulette.appendChild(card);
        });

        rouletteContainer.appendChild(roulette);
        container.appendChild(rouletteContainer);

        // Ajouter l'indicateur central
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: absolute;
            top: 0;
            left: 50%;
            width: 4px;
            height: 200px;
            background: linear-gradient(180deg, #ff4655 0%, #ff6b7a 50%, #ff4655 100%);
            transform: translateX(-50%);
            z-index: 10;
            box-shadow: 0 0 20px rgba(255, 70, 85, 0.8);
        `;
        rouletteContainer.appendChild(indicator);

        // Ajouter une barre de progression
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            margin-top: 20px;
            border-radius: 2px;
            overflow: hidden;
        `;
        const progressFill = document.createElement('div');
        progressFill.style.cssText = `
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #00d4ff, #0084ff);
            transition: width 8s linear;
            box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        `;
        progressBar.appendChild(progressFill);
        container.appendChild(progressBar);

        // Démarrer la barre de progression
        setTimeout(() => {
            progressFill.style.width = '100%';
        }, 100);

        // Démarrer l'animation
        setTimeout(() => {
            // Calculer la position finale pour centrer exactement le skin gagnant
            const itemWidth = 165; // 150px min-width + 15px gap
            const containerWidth = rouletteContainer.offsetWidth;

            // Position du bord gauche du skin gagnant depuis le début de la roulette
            const winningItemLeftPosition = winningPosition * itemWidth;

            // Pour centrer : placer le milieu de l'item au milieu du container
            // Le centre de l'item gagnant = winningItemLeftPosition + (150 / 2)
            // On veut le mettre au centre du container = containerWidth / 2
            // Donc translateX = (containerWidth / 2) - (winningItemLeftPosition + 75)
            const targetPosition = (containerWidth / 2) - (winningItemLeftPosition + 75);

            console.log(`📏 Calcul de position:
                - Largeur d'un item: ${itemWidth}px (150px + 15px gap)
                - Largeur du conteneur: ${containerWidth}px
                - Position gagnante: ${winningPosition}
                - Position du bord gauche du skin gagnant: ${winningItemLeftPosition}px
                - Position cible (translateX): ${targetPosition}px`);

            roulette.style.transform = `translateX(${targetPosition}px)`;

            // Marquer visuellement la carte gagnante après l'animation
            setTimeout(() => {
                const cards = roulette.querySelectorAll('.roulette-item');
                if (cards[winningPosition]) {
                    cards[winningPosition].style.boxShadow = `0 0 30px 5px ${RARITIES[wonSkin.rarity].color}`;
                    cards[winningPosition].style.transform = 'scale(1.05)';
                    console.log('🎯 Carte gagnante mise en évidence à la position', winningPosition);
                }
            }, 7500);

            // Jouer des sons pendant l'animation
            const soundInterval = setInterval(() => {
                this.playSound('spin');
            }, 300);

            // Arrêter les sons et jouer le son de révélation à la fin
            setTimeout(() => {
                clearInterval(soundInterval);
                this.playSound('reveal');
            }, 7500);

            // Révéler après l'animation (durée augmentée à 8 secondes + 0.5s de délai)
            setTimeout(() => {
                this.revealSkinCSGO(wonSkin);
            }, 8500);
        }, 100);

        this.currentRevealedSkin = wonSkin;
    },

    revealSkinCSGO(wonSkin) {
        console.log('🎁 RÉVÉLATION DU SKIN:', wonSkin.weapon, '|', wonSkin.name, `(${wonSkin.rarity})`);
        console.log('📦 Ajout à l\'inventaire avec l\'ID:', wonSkin.id);

        // Ajouter le skin à l'inventaire
        playerInventory.skins.push({
            id: wonSkin.id,
            acquiredAt: Date.now(),
            equipped: false
        });

        this.ensureInventoryStructure();
        this.savePlayerData();
        this.loadInventorySkins();
        this.updateInventoryStats();
        this.loadStoreSkins();

        // Afficher le skin révélé
        const skinReveal = document.getElementById('skin-reveal');
        const skinImage = document.getElementById('revealed-skin-image');
        const skinName = document.getElementById('revealed-skin-name');
        const skinWeapon = document.getElementById('revealed-skin-weapon');
        const skinRarity = document.getElementById('revealed-skin-rarity');
        const openingActions = document.getElementById('opening-actions');
        const caseImage = document.getElementById('case-image');

        if (!skinReveal) return;

        // Masquer la roulette
        if (caseImage) {
            caseImage.style.opacity = '0';
            caseImage.style.transition = 'opacity 0.5s';
        }

        // Afficher le résultat avec une animation
        setTimeout(() => {
            const wonSkinImageHTML = wonSkin.image
                ? `<img src="${wonSkin.image}" alt="${wonSkin.weapon} | ${wonSkin.name}" style="max-width: 300px; max-height: 200px; object-fit: contain;">`
                : `<div style="font-size: 24px; color: rgba(255,255,255,0.5);">${wonSkin.weapon}</div>`;
            skinImage.innerHTML = wonSkinImageHTML;
            skinName.textContent = wonSkin.name;
            skinWeapon.textContent = wonSkin.weapon;
            skinRarity.textContent = RARITIES[wonSkin.rarity].name;
            skinRarity.style.color = RARITIES[wonSkin.rarity].color;

            // Appliquer le gradient de rareté avec animation améliorée
            const skinCard = skinReveal.querySelector('.skin-card');
            if (skinCard) {
                skinCard.style.background = RARITIES[wonSkin.rarity].gradient;
                skinCard.style.border = `3px solid ${RARITIES[wonSkin.rarity].color}`;
                skinCard.style.boxShadow = `0 0 30px ${RARITIES[wonSkin.rarity].color}`;
                skinCard.style.animation = 'revealPulse 1.5s ease-out';
                skinCard.style.transform = 'scale(0.8)';

                // Animation d'apparition progressive
                setTimeout(() => {
                    skinCard.style.transform = 'scale(1)';
                    skinCard.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                }, 50);
            }

            skinReveal.classList.remove('hidden');

            // Afficher les actions avec un petit délai
            setTimeout(() => {
                if (openingActions) openingActions.classList.remove('hidden');
            }, 500);

            // Créer des particules de célébration
            this.createCelebrationParticles(skinCard, RARITIES[wonSkin.rarity].color);

            if (window.NotificationSystem) {
                window.NotificationSystem.show(
                    'Nouveau skin!',
                    `${wonSkin.weapon} | ${wonSkin.name}`,
                    'achievement',
                    5000
                );
            }
        }, 500);
    },

    createCelebrationParticles(container, color) {
        if (!container) return;

        const particlesCount = 30;
        for (let i = 0; i < particlesCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 8 + 4}px;
                height: ${Math.random() * 8 + 4}px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                top: 50%;
                left: 50%;
                opacity: 1;
                box-shadow: 0 0 10px ${color};
            `;

            container.appendChild(particle);

            // Animation aléatoire pour chaque particule
            const angle = (Math.PI * 2 * i) / particlesCount;
            const velocity = Math.random() * 100 + 100;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            particle.animate([
                { transform: 'translate(0, 0)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px)`, opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 500,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
    },

    selectRandomSkinFromCase(weaponCase) {
        // Obtenir tous les skins de la case
        const caseSkins = weaponCase.contents.map(skinId =>
            Object.values(WEAPON_SKINS).flat().find(skin => skin.id === skinId)
        ).filter(Boolean);

        console.log('Case:', weaponCase.name, 'Contents:', weaponCase.contents.length, 'Found skins:', caseSkins.length);

        if (caseSkins.length === 0) {
            console.error('Aucun skin trouvé pour la caisse:', weaponCase.name);
            // Retourner le premier skin disponible comme fallback
            const allSkins = Object.values(WEAPON_SKINS).flat();
            if (allSkins.length > 0) {
                return allSkins[0];
            }
            return null;
        }

        // Créer un tableau pondéré basé sur les probabilités de rareté / configuration de caisse
        const rarityCounts = caseSkins.reduce((acc, skin) => {
            acc[skin.rarity] = (acc[skin.rarity] || 0) + 1;
            return acc;
        }, {});

        const weightedSkins = caseSkins
            .map(skin => {
                const caseRate = weaponCase.dropRates && weaponCase.dropRates[skin.rarity];
                const baseProbability = RARITIES[skin.rarity]?.probability ?? 0;
                const totalRate = caseRate ?? baseProbability;
                const rarityCount = totalRate > 0 ? (caseRate ? rarityCounts[skin.rarity] : rarityCounts[skin.rarity] || 1) : 1;
                const weight = rarityCount > 0 ? totalRate / rarityCount : totalRate;
                return { skin, weight };
            })
            .filter(entry => entry.weight > 0);

        if (weightedSkins.length === 0) {
            console.error('Aucun skin pondéré disponible');
            return caseSkins[0];
        }

        const totalWeight = weightedSkins.reduce((sum, entry) => sum + entry.weight, 0);
        if (totalWeight <= 0) {
            console.error('Poids total nul pour la caisse:', weaponCase.id);
            return weightedSkins[0].skin;
        }

        let roll = Math.random() * totalWeight;
        console.log('🎲 Roll:', roll.toFixed(4), '/ Total weight:', totalWeight.toFixed(4));
        console.log('📊 Skins disponibles:', weightedSkins.map(e => `${e.skin.weapon} | ${e.skin.name} (poids: ${e.weight.toFixed(4)})`).join('\n   '));

        for (const entry of weightedSkins) {
            roll -= entry.weight;
            if (roll <= 0) {
                console.log('✅ Skin sélectionné:', entry.skin.weapon, '|', entry.skin.name, '(', entry.skin.rarity, ')');
                return entry.skin;
            }
        }

        const fallback = weightedSkins[weightedSkins.length - 1].skin;
        console.warn('Retour au skin de secours après pondération:', fallback.id);
        return fallback;
    },

    closeCaseOpeningModal() {
        const modal = document.getElementById('case-opening-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        const caseImage = document.getElementById('case-image');
        if (caseImage) {
            caseImage.innerHTML = '';
            caseImage.style.opacity = '1';
        }

        // Nettoyer l'animation
        if (this.currentOpeningAnimation) {
            clearInterval(this.currentOpeningAnimation);
            this.currentOpeningAnimation = null;
        }

        this.currentRevealedSkin = null;

        // Mettre à jour les inventaires, la boutique et la currency
        this.ensureInventoryStructure();
        this.loadInventory();
        this.loadStoreSkins();
        this.updateCurrencyDisplay();
    },

    previewCase(caseId) {
        const weaponCase = WEAPON_CASES.find(c => c.id === caseId);
        if (!weaponCase) return;

        const caseContents = weaponCase.contents.map(skinId => 
            Object.values(WEAPON_SKINS).flat().find(skin => skin.id === skinId)
        ).filter(Boolean);

        let previewHTML = `
            <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="assets/case.svg" alt="Case ${weaponCase.name}" style="width: 90px; filter: drop-shadow(0 10px 18px rgba(0,0,0,0.4));">
                </div>
                <h3 style="margin-bottom: 20px; color: #00d4ff; text-align: center;">Contenu possible:</h3>
                <div style="display: grid; gap: 10px; max-height: 400px; overflow-y: auto;">
        `;

        const previewRarityCounts = caseContents.reduce((acc, skin) => {
            acc[skin.rarity] = (acc[skin.rarity] || 0) + 1;
            return acc;
        }, {});

        caseContents.forEach(skin => {
            const rarity = RARITIES[skin.rarity];
            const configuredRate = weaponCase.dropRates && weaponCase.dropRates[skin.rarity];
            const baseRate = rarity?.probability ?? 0;
            const totalRate = configuredRate !== undefined ? configuredRate : baseRate;
            const rarityCount = previewRarityCounts[skin.rarity] || 1;
            const dropRate = totalRate > 0 ? totalRate / rarityCount : 0;
            const skinImageHTML = skin.image
                ? `<img src="${skin.image}" alt="${skin.weapon}" style="width: 50px; height: 50px; object-fit: contain;">`
                : `<div style="font-size: 12px; color: rgba(255,255,255,0.5);">${skin.weapon}</div>`;

            previewHTML += `
                <div style="display: flex; align-items: center; gap: 15px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 4px solid ${rarity.color};">
                    ${skinImageHTML}
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: white;">${skin.weapon} | ${skin.name}</div>
                        <div style="font-size: 12px; color: ${rarity.color}; font-weight: bold;">${rarity.name}</div>
                    </div>
                    <div style="font-size: 12px; opacity: 0.7;">${dropRate > 0 ? (dropRate * 100).toFixed(2) + '%' : '—'}</div>
                </div>
            `;
        });

        previewHTML += `
                </div>
            </div>
        `;

        if (window.NotificationSystem) {
            // Créer une notification personnalisée avec le contenu
            const notification = document.createElement('div');
            notification.className = 'game-notification notification-info';
            notification.innerHTML = previewHTML;
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(15, 20, 25, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                z-index: 10000;
                max-width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            `;

            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 5px 10px;
            `;
            closeBtn.onclick = () => notification.remove();
            notification.appendChild(closeBtn);

            document.body.appendChild(notification);
        }
    },

    // ========================================
    // GESTION DES SKINS
    // ========================================

    loadStoreSkins() {
        const skinsGrid = document.getElementById('skins-grid');
        if (!skinsGrid) return;

        const allSkins = Object.values(WEAPON_SKINS).flat();
        const sortedSkins = allSkins.sort((a, b) => {
            return RARITIES[b.rarity].probability - RARITIES[a.rarity].probability;
        });

        skinsGrid.innerHTML = '';

        sortedSkins.forEach(skin => {
            const skinCard = this.createSkinCard(skin, 'store');
            skinsGrid.appendChild(skinCard);
        });
    },

    createSkinCard(skin, type = 'store') {
        const skinCard = document.createElement('div');
        skinCard.className = 'skin-card';
        skinCard.style.background = RARITIES[skin.rarity].gradient;

        const isOwned = playerInventory.skins.some(s => s.id === skin.id);
        const isEquipped = this.isSkinEquipped(skin);

        let actionButton = '';
        if (type === 'store') {
            if (isOwned) {
                actionButton = '<button class="btn-disabled" disabled>Possédé</button>';
            } else {
                actionButton = `<button class="btn-primary" onclick="StoreSystem.purchaseSkin('${skin.id}')">
                    <i class="fas fa-coins"></i> ${skin.price}
                </button>`;
            }
        } else if (type === 'inventory') {
            if (isEquipped) {
                actionButton = '<button class="btn-equipped" disabled>Équipé</button>';
            } else {
                actionButton = `<button class="btn-secondary" onclick="StoreSystem.equipSkin('${skin.id}')">Équiper</button>`;
            }
        }

        // Utiliser l'image du skin si disponible
        const skinImageHTML = skin.image
            ? `<img src="${skin.image}" alt="${skin.weapon} | ${skin.name}" style="width: 100%; height: 100%; object-fit: contain;">`
            : `<div class="weapon-icon" style="font-size: 14px; color: rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center;">${skin.weapon}</div>`;

        skinCard.innerHTML = `
            <div class="skin-image">
                ${skinImageHTML}
            </div>
            <div class="skin-info">
                <div class="skin-weapon">${skin.weapon}</div>
                <div class="skin-name">${skin.name}</div>
                <div class="skin-rarity" style="color: ${RARITIES[skin.rarity].color}">
                    ${RARITIES[skin.rarity].name}
                </div>
                <p class="skin-description">${skin.description}</p>
            </div>
            <div class="skin-actions">
                ${actionButton}
            </div>
        `;

        return skinCard;
    },

    purchaseSkin(skinId) {
        const skin = Object.values(WEAPON_SKINS).flat().find(s => s.id === skinId);
        if (!skin) return;

        this.ensureInventoryStructure();

        if (playerInventory.currency.coins < skin.price) {
            if (window.NotificationSystem) {
                window.NotificationSystem.show(
                    'Fonds insuffisants',
                    'Vous n\'avez pas assez de SIO Coins.',
                    'error'
                );
            }
            return;
        }

        // Déduire les pièces
        playerInventory.currency.coins = Math.floor(playerInventory.currency.coins - skin.price);

        // Jouer le son d'achat
        this.playSound('purchase');

        // Ajouter le skin à l'inventaire
        playerInventory.skins.push({
            id: skinId,
            acquiredAt: Date.now(),
            equipped: false
        });

        this.ensureInventoryStructure();
        this.savePlayerData();
        this.updateCurrencyDisplay();

        // Recharger avec un délai pour éviter les désynchronisations
        setTimeout(() => {
            this.loadStoreSkins();
            this.loadInventorySkins();
            this.updateInventoryStats();
            this.updateCurrencyDisplay();
        }, 100);

        if (window.NotificationSystem) {
            window.NotificationSystem.show(
                'Skin acheté',
                `${skin.weapon} | ${skin.name} ajouté à votre inventaire!`,
                'success'
            );
        }
    },

    equipSkin(skinId) {
        const skin = Object.values(WEAPON_SKINS).flat().find(s => s.id === skinId);
        if (!skin) {
            console.error('Skin non trouvé:', skinId);
            return;
        }

        const weaponCategory = this.getWeaponCategory(skin.weapon);
        this.ensureInventoryStructure();

        // Vérifier que le joueur possède ce skin
        const ownsSkin = playerInventory.skins.some(s => s.id === skinId);
        if (!ownsSkin) {
            if (window.NotificationSystem) {
                window.NotificationSystem.show(
                    'Erreur',
                    'Vous ne possédez pas ce skin.',
                    'error'
                );
            }
            return;
        }

        // Vérifier si ce skin est déjà équipé sur cette arme
        const currentlyEquipped = playerInventory.equippedSkins[weaponCategory]?.[skin.weapon];
        if (currentlyEquipped === skinId) {
            if (window.NotificationSystem) {
                window.NotificationSystem.show(
                    'Déjà équipé',
                    `${skin.weapon} | ${skin.name} est déjà équipé!`,
                    'warning',
                    2000
                );
            }
            return;
        }

        // Équiper le skin pour cette arme
        if (!playerInventory.equippedSkins[weaponCategory]) {
            playerInventory.equippedSkins[weaponCategory] = {};
        }
        playerInventory.equippedSkins[weaponCategory][skin.weapon] = skinId;

        this.savePlayerData();

        // Recharger l'inventaire et le store
        this.loadInventorySkins();
        this.loadStoreSkins();

        if (window.NotificationSystem) {
            window.NotificationSystem.show(
                'Skin équipé',
                `${skin.weapon} | ${skin.name} est maintenant équipé!`,
                'success'
            );
        }

        // Fermer la modal si ouverte
        if (this.currentRevealedSkin && this.currentRevealedSkin.id === skinId) {
            this.closeCaseOpeningModal();
        }
    },

    isSkinEquipped(skin) {
        const weaponCategory = this.getWeaponCategory(skin.weapon);
        return playerInventory.equippedSkins[weaponCategory]?.[skin.weapon] === skin.id;
    },

    getWeaponCategory(weaponName) {
        for (const [category, skins] of Object.entries(WEAPON_SKINS)) {
            if (skins.some(s => s.weapon === weaponName)) {
                return category;
            }
        }
        return 'rifles';
    },

    getWeaponIcon(weaponName) {
        // Retourner une icône SVG au lieu d'emoji
        return `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="8" fill="rgba(255,255,255,0.1)"/>
            <text x="24" y="32" font-family="Arial" font-size="24" fill="white" text-anchor="middle">?</text>
        </svg>`;
    },

    // ========================================
    // GESTION DE L'INVENTAIRE
    // ========================================

    loadInventory() {
        this.ensureInventoryStructure();
        this.loadInventorySkins();
        this.loadInventoryCases();
        this.loadInventoryAgents();
        this.updateInventoryStats();
    },

    loadInventorySkins() {
        const weaponsGrid = document.getElementById('inventory-weapons-grid');
        if (!weaponsGrid) return;

        const ownedSkins = playerInventory.skins.map(skinData => {
            const skin = Object.values(WEAPON_SKINS).flat().find(s => s.id === skinData.id);
            return skin ? { ...skin, acquiredAt: skinData.acquiredAt } : null;
        }).filter(Boolean);

        if (ownedSkins.length === 0) {
            weaponsGrid.innerHTML = `
                <div class="empty-inventory">
                    <i class="fas fa-inbox"></i>
                    <p>Aucun skin dans votre inventaire</p>
                    <button class="btn-primary" onclick="showMenuSection('store'); StoreSystem.switchStoreTab('skins')">Acheter des skins</button>
                </div>
            `;
            return;
        }

        // Déterminer la catégorie active actuelle
        const activeBtn = document.querySelector('#inventory-weapons .weapon-cat.active');
        const currentCategory = activeBtn ? activeBtn.getAttribute('onclick').match(/'([^']+)'/)[1] : 'rifles';

        // Recharger la catégorie active
        showInventoryCategory(currentCategory);
    },

    loadInventoryCases() {
        const casesGrid = document.getElementById('inventory-cases-grid');
        if (!casesGrid) return;

        casesGrid.innerHTML = '';

        if (playerInventory.cases.length === 0) {
            casesGrid.innerHTML = `
                <div class="empty-inventory">
                    <i class="fas fa-box"></i>
                    <p>Aucune case dans votre inventaire</p>
                    <button class="btn-primary" onclick="showMenuSection('store'); StoreSystem.switchStoreTab('cases')">Acheter des cases</button>
                </div>
            `;
            return;
        }

        playerInventory.cases.forEach(caseData => {
            const weaponCase = WEAPON_CASES.find(c => c.id === caseData.id);
            if (!weaponCase) return;

            const caseCard = document.createElement('div');
            caseCard.className = 'case-card inventory-case';
            caseCard.innerHTML = `
                <div class="case-image">
                    <img src="assets/case.svg" alt="Case ${weaponCase.name}">
                </div>
                <div class="case-info">
                    <h3>${weaponCase.name}</h3>
                    <p>Acquise le ${new Date(caseData.acquiredAt).toLocaleDateString()}</p>
                </div>
                <div class="case-actions">
                    <button class="btn-primary" onclick="StoreSystem.openCase('${weaponCase.id}')">
                        Ouvrir
                    </button>
                </div>
            `;
            casesGrid.appendChild(caseCard);
        });
    },

    loadInventoryAgents() {
        const agentsGrid = document.getElementById('inventory-agents-grid');
        if (!agentsGrid) {
            return;
        }

        agentsGrid.innerHTML = '';

        const ownedAgents = playerInventory.agents
            .map(agentId => AGENTS[agentId])
            .filter(Boolean);


        if (ownedAgents.length === 0) {
            agentsGrid.innerHTML = `
                <div class="empty-inventory">
                    <i class="fas fa-user-ninja"></i>
                    <p>Aucun agent dans votre collection</p>
                    <button class="btn-primary" onclick="showMenuSection('store'); StoreSystem.switchStoreTab('agents')">Acheter des agents</button>
                </div>
            `;
            return;
        }

        ownedAgents.forEach(agent => {
            const isEquipped = playerInventory.equippedAgent === agent.id;

            const agentCard = document.createElement('div');
            agentCard.className = 'agent-card';
            agentCard.style.cssText = `
                background: ${RARITIES[agent.rarity].gradient};
                border: 2px solid ${isEquipped ? '#ffd700' : RARITIES[agent.rarity].color};
                border-radius: 15px;
                padding: 20px;
                position: relative;
                cursor: pointer;
                transition: transform 0.2s;
                ${isEquipped ? 'box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);' : ''}
            `;

            agentCard.innerHTML = `
                ${isEquipped ? '<div style="position: absolute; top: 10px; right: 10px; background: #ffd700; color: black; padding: 5px 10px; border-radius: 5px; font-weight: bold; font-size: 12px;"><i class="fas fa-star"></i> ÉQUIPÉ</div>' : ''}
                <div style="display: flex; justify-content: center; margin-bottom: 10px;">
                    <img class="agent-icon-img" src="${agent.icon || STORE_DEFAULT_AGENT_ICON}" alt="${agent.name}" style="width: 64px; height: 64px;">
                </div>
                <h3 style="color: white; text-align: center; margin-bottom: 5px;">${agent.name}</h3>
                <p style="color: rgba(255,255,255,0.7); text-align: center; font-size: 12px; margin-bottom: 10px;">${agent.role}</p>

                <div style="margin-bottom: 15px;">
                    ${agent.abilities.ability1 ? `
                        <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 8px; margin-bottom: 5px;">
                            <strong style="color: #00d4ff;">${agent.abilities.ability1.name}</strong>
                        </div>
                    ` : ''}
                    ${agent.abilities.ability2 ? `
                        <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 8px; margin-bottom: 5px;">
                            <strong style="color: #00d4ff;">${agent.abilities.ability2.name}</strong>
                        </div>
                    ` : ''}
                    ${agent.abilities.ultimate ? `
                        <div style="background: rgba(255,215,0,0.2); padding: 8px; border-radius: 8px;">
                            <strong style="color: #ffd700;">ULT: ${agent.abilities.ultimate.name}</strong>
                        </div>
                    ` : ''}
                </div>

                ${isEquipped ? `
                    <button class="btn-secondary" style="width: 100%; opacity: 0.5;" disabled>
                        <i class="fas fa-star"></i> Agent actif
                    </button>
                ` : `
                    <button class="btn-primary" style="width: 100%;" onclick="StoreSystem.equipAgent('${agent.id}')">
                        <i class="fas fa-check"></i> Équiper cet agent
                    </button>
                `}
            `;

            agentCard.addEventListener('mouseenter', () => {
                agentCard.style.transform = 'scale(1.05)';
            });
            agentCard.addEventListener('mouseleave', () => {
                agentCard.style.transform = 'scale(1)';
            });

            agentsGrid.appendChild(agentCard);
        });
    },

    updateInventoryStats() {
        const totalSkinsElement = document.getElementById('total-skins');
        const totalValueElement = document.getElementById('total-value');

        if (totalSkinsElement) {
            totalSkinsElement.textContent = playerInventory.skins.length;
        }

        if (totalValueElement) {
            // Calculer la valeur des skins
            const skinsValue = playerInventory.skins.reduce((sum, skinData) => {
                const skin = Object.values(WEAPON_SKINS).flat().find(s => s.id === skinData.id);
                return sum + (skin ? skin.price : 0);
            }, 0);

            // Calculer la valeur des agents possédés
            const agentsValue = playerInventory.agents.reduce((sum, agentId) => {
                const agent = AGENTS[agentId];
                return sum + (agent ? agent.price : 0);
            }, 0);

            // Calculer la valeur des cases
            const casesValue = playerInventory.cases.reduce((sum, caseData) => {
                const caseItem = WEAPON_CASES.find(c => c.id === caseData.id);
                return sum + (caseItem ? caseItem.price : 0);
            }, 0);

            // Afficher la valeur totale avec formatage
            const totalValue = skinsValue + agentsValue + casesValue;
            totalValueElement.textContent = totalValue.toLocaleString('fr-FR');
        }
    },

    // ========================================
    // NAVIGATION BOUTIQUE
    // ========================================

    switchStoreTab(tab, triggerButton = null) {
        // Masquer tous les contenus
        document.querySelectorAll('.store-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Retirer la classe active de tous les onglets
        document.querySelectorAll('.store-tab').forEach(tabBtn => {
            tabBtn.classList.remove('active');
        });

        // Afficher le contenu sélectionné
        const selectedContent = document.getElementById(`store-${tab}`);
        if (selectedContent) {
            selectedContent.classList.remove('hidden');
        }

        // Activer l'onglet
        const selectedButton = triggerButton || document.querySelector(`.store-tab[data-store-tab="${tab}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }

        // Charger le contenu selon l'onglet
        switch(tab) {
            case 'cases':
                this.loadCases();
                break;
            case 'skins':
                this.loadStoreSkins();
                break;
            case 'agents':
                this.loadAgents();
                break;
        }
    },

    switchInventoryTab(tab, triggerButton = null) {
        this.ensureInventoryStructure();

        document.querySelectorAll('.inventory-content').forEach(content => {
            content.classList.add('hidden');
        });

        document.querySelectorAll('.inventory-tab').forEach(tabBtn => {
            tabBtn.classList.remove('active');
        });

        const selectedContent = document.getElementById(`inventory-${tab}`);
        if (selectedContent) {
            selectedContent.classList.remove('hidden');
        }

        const selectedButton = triggerButton || document.querySelector(`.inventory-tab[data-inventory-tab="${tab}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }

        // Forcer le rafraîchissement après un court délai
        setTimeout(() => {
            switch (tab) {
                case 'cases':
                    this.loadInventoryCases();
                    break;
                case 'agents':
                    this.loadInventoryAgents();
                    break;
                default:
                    this.loadInventorySkins();
                    break;
            }
            this.updateInventoryStats();
            this.updateCurrencyDisplay();
        }, 50);
    },

    loadAgents() {
        const agentsGrid = document.getElementById('agents-grid');
        if (!agentsGrid) return;

        agentsGrid.innerHTML = '';

        Object.values(AGENTS).forEach(agent => {
            const isOwned = playerInventory.agents.includes(agent.id);
            const isEquipped = playerInventory.equippedAgent === agent.id;

            const agentCard = document.createElement('div');
            agentCard.className = 'agent-card';
            agentCard.style.cssText = `
                background: ${RARITIES[agent.rarity].gradient};
                border: 2px solid ${RARITIES[agent.rarity].color};
                border-radius: 15px;
                padding: 20px;
                position: relative;
                cursor: pointer;
                transition: transform 0.2s;
            `;

            agentCard.innerHTML = `
                <div style="display: flex; justify-content: center; margin-bottom: 10px;">
                    <img class="agent-icon-img" src="${agent.icon || STORE_DEFAULT_AGENT_ICON}" alt="${agent.name}" style="width: 64px; height: 64px;">
                </div>
                <h3 style="color: white; text-align: center; margin-bottom: 5px;">${agent.name}</h3>
                <p style="color: rgba(255,255,255,0.7); text-align: center; font-size: 12px; margin-bottom: 10px;">${agent.role}</p>
                <p style="color: rgba(255,255,255,0.8); text-align: center; font-size: 14px; margin-bottom: 15px;">${agent.description}</p>

                <div style="margin-bottom: 15px;">
                    ${agent.abilities.ability1 ? `
                        <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 8px; margin-bottom: 5px;">
                            <strong style="color: #00d4ff;">${agent.abilities.ability1.name}</strong>
                            <p style="font-size: 12px; color: rgba(255,255,255,0.7);">${agent.abilities.ability1.description}</p>
                        </div>
                    ` : ''}
                    ${agent.abilities.ability2 ? `
                        <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 8px; margin-bottom: 5px;">
                            <strong style="color: #00d4ff;">${agent.abilities.ability2.name}</strong>
                            <p style="font-size: 12px; color: rgba(255,255,255,0.7);">${agent.abilities.ability2.description}</p>
                        </div>
                    ` : ''}
                    ${agent.abilities.ultimate ? `
                        <div style="background: rgba(255,215,0,0.2); padding: 8px; border-radius: 8px;">
                            <strong style="color: #ffd700;">ULT: ${agent.abilities.ultimate.name}</strong>
                            <p style="font-size: 12px; color: rgba(255,255,255,0.7);">${agent.abilities.ultimate.description}</p>
                        </div>
                    ` : ''}
                </div>

                ${isOwned ? `
                    <div style="text-align: center; color: #00ff00; font-weight: bold; margin-bottom: 10px;">
                        <i class="fas fa-check-circle"></i> Possédé
                    </div>
                ` : `
                    <div style="text-align: center; margin-bottom: 10px;">
                        <span style="color: #ffd700; font-size: 18px; font-weight: bold;">
                            <i class="fas fa-coins"></i> ${agent.price}
                        </span>
                    </div>
                `}

                ${isEquipped ? `
                    <button class="btn-secondary" style="width: 100%; opacity: 0.5;" disabled>
                        <i class="fas fa-star"></i> Équipé
                    </button>
                ` : isOwned ? `
                    <button class="btn-primary" style="width: 100%;" onclick="StoreSystem.equipAgent('${agent.id}')">
                        <i class="fas fa-check"></i> Équiper
                    </button>
                ` : `
                    <button class="btn-primary" style="width: 100%;" onclick="StoreSystem.buyAgent('${agent.id}')">
                        <i class="fas fa-shopping-cart"></i> Acheter
                    </button>
                `}
            `;

            agentCard.addEventListener('mouseenter', () => {
                agentCard.style.transform = 'scale(1.05)';
            });
            agentCard.addEventListener('mouseleave', () => {
                agentCard.style.transform = 'scale(1)';
            });

            agentsGrid.appendChild(agentCard);
        });
    },

    buyAgent(agentId) {
        const agent = AGENTS[agentId];
        if (!agent) return;

        if (playerInventory.agents.includes(agentId)) {
            if (window.NotificationSystem) {
                window.NotificationSystem.show('Agent déjà possédé', `Vous possédez déjà ${agent.name}`, 'info', 3000);
            }
            return;
        }

        if (playerInventory.currency.coins < agent.price) {
            if (window.NotificationSystem) {
                window.NotificationSystem.show('Crédits insuffisants', `Vous avez besoin de ${agent.price} SIO Coins`, 'error', 3000);
            }
            return;
        }

        // Acheter l'agent
        playerInventory.currency.coins -= agent.price;
        playerInventory.agents.push(agentId);

        this.ensureInventoryStructure();
        this.savePlayerData();
        this.updateCurrencyDisplay();
        this.loadAgents();
        this.loadInventoryAgents();

        if (window.NotificationSystem) {
            window.NotificationSystem.show('Agent acheté !', `${agent.name} a été ajouté à votre collection`, 'success', 3000);
        }
    },

    equipAgent(agentId) {
        if (!playerInventory.agents.includes(agentId)) return;

        playerInventory.equippedAgent = agentId;
        this.savePlayerData();
        this.loadAgents();
        this.loadInventoryAgents();

        // Synchroniser avec AgentSystem (agents.js)
        if (window.AgentSystem && typeof window.AgentSystem.selectAgent === 'function') {
            // Mettre à jour directement sans déclencher une double notification
            window.AgentSystem.state.selectedAgentId = agentId;
            window.AgentSystem.persistAgent(agentId);
            window.AgentSystem.applyAgentModifiers(true);
            window.AgentSystem.updateUISelection();
        }

        // Mettre à jour l'affichage dans le menu play
        if (typeof updateCurrentAgentDisplay === 'function') {
            updateCurrentAgentDisplay();
        }

        const agent = AGENTS[agentId];
        if (window.NotificationSystem) {
            window.NotificationSystem.show('Agent équipé', `${agent.name} est maintenant votre agent actif`, 'success', 2000);
        }
    }
};

// ========================================
// FONCTIONS GLOBALES POUR HTML
// ========================================

function closeCaseOpeningModal() {
    StoreSystem.closeCaseOpeningModal();
}

function equipSkin() {
    if (StoreSystem.currentRevealedSkin) {
        StoreSystem.equipSkin(StoreSystem.currentRevealedSkin.id);
    }
}

function switchStoreTab(tab, button) {
    StoreSystem.switchStoreTab(tab, button);
}

function switchInventoryTab(tab, button) {
    StoreSystem.switchInventoryTab(tab, button);
}

function showSkinCategory(category) {
    const skinsGrid = document.getElementById('skins-grid');
    if (!skinsGrid) return;

    // Filtrer les skins par catégorie
    const categorySkinsArray = WEAPON_SKINS[category] || [];

    skinsGrid.innerHTML = '';

    if (categorySkinsArray.length === 0) {
        skinsGrid.innerHTML = `
            <div class="empty-category">
                <p>Aucun skin dans cette catégorie</p>
            </div>
        `;
        return;
    }

    // Afficher les skins de la catégorie
    categorySkinsArray.forEach(skin => {
        const skinCard = StoreSystem.createSkinCard(skin, 'store');
        skinsGrid.appendChild(skinCard);
    });

    // Mettre à jour le bouton actif
    document.querySelectorAll('.skin-cat').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.skin-cat[onclick="showSkinCategory('${category}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

function showInventoryCategory(category) {
    StoreSystem.ensureInventoryStructure();

    const ownedSkins = playerInventory.skins.map(skinData => {
        const skin = Object.values(WEAPON_SKINS).flat().find(s => s.id === skinData.id);
        return skin ? { ...skin, acquiredAt: skinData.acquiredAt } : null;
    }).filter(Boolean).filter(skin => {
        return StoreSystem.getWeaponCategory(skin.weapon) === category;
    });

    const weaponsGrid = document.getElementById('inventory-weapons-grid');
    if (!weaponsGrid) return;

    weaponsGrid.innerHTML = '';

    if (ownedSkins.length === 0) {
        weaponsGrid.innerHTML = `
            <div class="empty-category">
                <p>Aucun skin de ${category} dans votre inventaire</p>
            </div>
        `;
        return;
    }

    // Grouper les skins identiques et compter les occurrences
    const skinCounts = {};
    ownedSkins.forEach(skin => {
        if (!skinCounts[skin.id]) {
            skinCounts[skin.id] = { skin: skin, count: 0 };
        }
        skinCounts[skin.id].count++;
    });

    // Afficher chaque skin unique avec son compteur
    Object.values(skinCounts).forEach(({ skin, count }) => {
        const skinCard = StoreSystem.createSkinCard(skin, 'inventory');

        // Ajouter le badge de compteur si count > 1
        if (count > 1) {
            const countBadge = document.createElement('div');
            countBadge.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 5px 10px;
                border-radius: 12px;
                font-weight: bold;
                font-size: 14px;
                border: 2px solid #00d4ff;
                box-shadow: 0 2px 8px rgba(0, 212, 255, 0.5);
                z-index: 10;
            `;
            countBadge.textContent = `x${count}`;
            skinCard.style.position = 'relative';
            skinCard.appendChild(countBadge);
        }

        weaponsGrid.appendChild(skinCard);
    });

    // Mettre à jour le bouton actif
    document.querySelectorAll('#inventory-weapons .weapon-cat').forEach(btn => {
        btn.classList.remove('active');
        // Vérifier si ce bouton correspond à la catégorie actuelle
        const btnOnclick = btn.getAttribute('onclick');
        if (btnOnclick && btnOnclick.includes(`'${category}'`)) {
            btn.classList.add('active');
        }
    });
}

// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        StoreSystem.init()
            .then(() => StoreSystem.checkDailyReward())
            .catch(error => {
            });
    }, 2000);
});

// Export global
window.StoreSystem = StoreSystem;
window.playerInventory = playerInventory;
window.WEAPON_SKINS = WEAPON_SKINS;
window.WEAPON_CASES = WEAPON_CASES;
window.RARITIES = RARITIES;
window.AGENTS = AGENTS;

// Fonction pour afficher l'agent actuel dans le menu
function updateCurrentAgentDisplay() {
    const displayElement = document.getElementById('current-agent-display');
    if (!displayElement) return;

    const currentAgentId = playerInventory?.equippedAgent || 'default';
    const agent = AGENTS[currentAgentId];

    if (!agent) {
        displayElement.innerHTML = '<p style="color: rgba(255,255,255,0.5);">Aucun agent sélectionné</p>';
        return;
    }

    displayElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
            <img class="agent-icon-img" src="${agent.icon || STORE_DEFAULT_AGENT_ICON}" alt="${agent.name}" style="width: 56px; height: 56px;">
            <div style="text-align: left;">
                <div style="font-size: 18px; font-weight: bold; color: white;">${agent.name}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.7);">${agent.role}</div>
            </div>
        </div>
    `;
}

// Appeler la fonction quand on change de section de menu
const originalShowMenuSection = window.showMenuSection;
if (originalShowMenuSection) {
    window.showMenuSection = function(section) {
        originalShowMenuSection(section);
        if (section === 'play') {
            setTimeout(updateCurrentAgentDisplay, 100);
        }
    };
}

// Mettre à jour au chargement
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateCurrentAgentDisplay, 3000);
});
