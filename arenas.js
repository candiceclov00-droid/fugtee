export const ARENAS = [
  {
    id: 'neon-city',
    name: 'NEON CITY',
    skyTop: '#0d0221',
    skyBottom: '#1a0533',
    ground: '#1a1a2e',
    groundLine: '#3a0ca3',
    accent: '#7209b7',
    buildings: true,
    stars: true
  },
  {
    id: 'dojo',
    name: 'DOJO',
    skyTop: '#1b4332',
    skyBottom: '#2d6a4f',
    ground: '#40916c',
    groundLine: '#95d5b2',
    accent: '#d8f3dc',
    buildings: false,
    stars: false,
    dojo: true
  },
  {
    id: 'arena',
    name: 'COLOSSEUM',
    skyTop: '#3d0814',
    skyBottom: '#6a040f',
    ground: '#370617',
    groundLine: '#9d0208',
    accent: '#e85d04',
    buildings: false,
    stars: false,
    colosseum: true
  },
  {
    id: 'cyber',
    name: 'CYBER GRID',
    skyTop: '#000814',
    skyBottom: '#001d3d',
    ground: '#000814',
    groundLine: '#00b4d8',
    accent: '#90e0ef',
    buildings: false,
    stars: false,
    grid: true
  }
];

export function getArena(id) {
  return ARENAS.find(a => a.id === id) || ARENAS[0];
}
