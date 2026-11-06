import { KEYS } from './constants.js';

export class InputManager {
  constructor() {
    this.keys = {};
    this.justPressed = {};

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (!this.keys[e.code]) {
        this.justPressed[e.code] = true;
      }
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  isDown(code) {
    return !!this.keys[code];
  }

  wasPressed(code) {
    return !!this.justPressed[code];
  }

  clearJustPressed() {
    this.justPressed = {};
  }

  getPlayerKeys(playerNum) {
    if (playerNum === 1) {
      return {
        left: this.isDown(KEYS.P1_LEFT),
        right: this.isDown(KEYS.P1_RIGHT),
        jump: this.wasPressed(KEYS.P1_JUMP),
        block: this.isDown(KEYS.P1_BLOCK),
        punch: this.wasPressed(KEYS.P1_PUNCH),
        kick: this.wasPressed(KEYS.P1_KICK),
        special: this.wasPressed(KEYS.P1_SPECIAL)
      };
    }
    return {
      left: this.isDown(KEYS.P2_LEFT),
      right: this.isDown(KEYS.P2_RIGHT),
      jump: this.wasPressed(KEYS.P2_JUMP),
      block: this.isDown(KEYS.P2_BLOCK),
      punch: this.wasPressed(KEYS.P2_PUNCH),
      kick: this.wasPressed(KEYS.P2_KICK),
      special: this.wasPressed(KEYS.P2_SPECIAL)
    };
  }
}
