export const CANVAS_W = 960;
export const CANVAS_H = 540;
export const GROUND_Y = 460;
export const GRAVITY = 0.65;
export const JUMP_FORCE = -14;
export const MOVE_SPEED = 4.2;
export const FRICTION = 0.82;

export const STATES = {
  IDLE: 'idle',
  WALK: 'walk',
  JUMP: 'jump',
  PUNCH: 'punch',
  KICK: 'kick',
  SPECIAL: 'special',
  BLOCK: 'block',
  HIT: 'hit',
  KO: 'ko'
};

export const KEYS = {
  // Player 1
  P1_LEFT: 'KeyQ',
  P1_RIGHT: 'KeyD',
  P1_JUMP: 'KeyZ',
  P1_BLOCK: 'KeyS',
  P1_PUNCH: 'KeyF',
  P1_KICK: 'KeyG',
  P1_SPECIAL: 'KeyH',
  // Player 2
  P2_LEFT: 'ArrowLeft',
  P2_RIGHT: 'ArrowRight',
  P2_JUMP: 'ArrowUp',
  P2_BLOCK: 'ArrowDown',
  P2_PUNCH: 'Digit1',
  P2_KICK: 'Digit2',
  P2_SPECIAL: 'Digit3'
};
