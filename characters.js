export const CHARACTERS = [
  {
    id: 'blaze',
    name: 'BLAZE',
    color: '#e63946',
    accent: '#ff9e00',
    skin: '#f4a261',
    hp: 100,
    speed: 4.5,
    power: 1.1,
    specialName: 'FIRE BURST',
    specialCost: 80,
    description: 'Aggressive striker'
  },
  {
    id: 'frost',
    name: 'FROST',
    color: '#4cc9f0',
    accent: '#90e0ef',
    skin: '#e0e0e0',
    hp: 110,
    speed: 3.8,
    power: 1.0,
    specialName: 'ICE SPIKE',
    specialCost: 75,
    description: 'Tanky defender'
  },
  {
    id: 'shadow',
    name: 'SHADOW',
    color: '#8338ec',
    accent: '#c77dff',
    skin: '#2d2d2d',
    hp: 90,
    speed: 5.2,
    power: 1.15,
    specialName: 'VOID SLASH',
    specialCost: 85,
    description: 'Fast assassin'
  },
  {
    id: 'volt',
    name: 'VOLT',
    color: '#ffd60a',
    accent: '#fff200',
    skin: '#fefae0',
    hp: 95,
    speed: 4.8,
    power: 1.05,
    specialName: 'THUNDER',
    specialCost: 70,
    description: 'Electric fighter'
  }
];

export function getCharacter(id) {
  return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}
