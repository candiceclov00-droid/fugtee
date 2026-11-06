import { GROUND_Y, GRAVITY, JUMP_FORCE, MOVE_SPEED, FRICTION, STATES } from './constants.js';

export class Player {
  constructor(charData, side, x) {
    this.char = charData;
    this.side = side; // 'left' or 'right'
    this.x = x;
    this.y = GROUND_Y;
    this.vx = 0;
    this.vy = 0;
    this.facing = side === 'left' ? 1 : -1;
    this.width = 48;
    this.height = 80;

    this.maxHp = charData.hp;
    this.hp = this.maxHp;
    this.special = 0;
    this.maxSpecial = 100;

    this.state = STATES.IDLE;
    this.stateTimer = 0;
    this.animFrame = 0;
    this.animTimer = 0;

    this.onGround = true;
    this.isBlocking = false;
    this.hitStun = 0;
    this.attackHit = false; // prevent multi-hit
    this.comboCount = 0;
    this.comboTimer = 0;
    this.lastAttack = null;

    this.invincible = 0;
    this.dead = false;
  }

  get hitbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height,
      w: this.width,
      h: this.height
    };
  }

  getAttackBox() {
    if (this.state !== STATES.PUNCH && this.state !== STATES.KICK && this.state !== STATES.SPECIAL) {
      return null;
    }
    const reach = this.state === STATES.SPECIAL ? 70 : this.state === STATES.KICK ? 55 : 42;
    const height = this.state === STATES.KICK ? 30 : 25;
    const yOff = this.state === STATES.KICK ? -25 : -50;
    return {
      x: this.facing === 1 ? this.x + 10 : this.x - 10 - reach,
      y: this.y + yOff,
      w: reach,
      h: height,
      damage: this.getDamage(),
      type: this.state
    };
  }

  getDamage() {
    let base = this.state === STATES.PUNCH ? 8 : this.state === STATES.KICK ? 12 : 22;
    base *= this.char.power;
    if (this.comboCount > 1) base *= (1 + this.comboCount * 0.08);
    return Math.round(base);
  }

  setState(newState) {
    if (this.dead && newState !== STATES.KO) return;
    this.state = newState;
    this.stateTimer = 0;
    this.animFrame = 0;
    this.animTimer = 0;
    this.attackHit = false;

    if (newState === STATES.PUNCH || newState === STATES.KICK || newState === STATES.SPECIAL) {
      this.comboTimer = 40;
      if (this.lastAttack === newState) this.comboCount++;
      else this.comboCount = 1;
      this.lastAttack = newState;
    }
  }

  update(keys, opponent) {
    if (this.dead) {
      this.state = STATES.KO;
      return;
    }

    // Hit stun
    if (this.hitStun > 0) {
      this.hitStun--;
      this.state = STATES.HIT;
      this.vx *= 0.9;
      this.applyPhysics();
      return;
    }

    // Invincibility frames after hit
    if (this.invincible > 0) this.invincible--;

    // Face opponent
    if (opponent && !this.isAttacking()) {
      this.facing = opponent.x > this.x ? 1 : -1;
    }

    // Combo timer
    if (this.comboTimer > 0) this.comboTimer--;
    else {
      this.comboCount = 0;
      this.lastAttack = null;
    }

    // Input handling (only if not in attack animation that locks)
    const canMove = !this.isAttacking() || this.stateTimer > this.attackDuration();

    if (canMove && this.state !== STATES.HIT) {
      this.handleInput(keys);
    }

    this.updateState();
    this.applyPhysics();
  }

  isAttacking() {
    return this.state === STATES.PUNCH || this.state === STATES.KICK || this.state === STATES.SPECIAL;
  }

  attackDuration() {
    if (this.state === STATES.PUNCH) return 18;
    if (this.state === STATES.KICK) return 24;
    if (this.state === STATES.SPECIAL) return 40;
    return 0;
  }

  handleInput(keys) {
    const left = keys.left;
    const right = keys.right;
    const jump = keys.jump;
    const block = keys.block;
    const punch = keys.punch;
    const kick = keys.kick;
    const special = keys.special;

    this.isBlocking = false;

    if (block && this.onGround) {
      this.setState(STATES.BLOCK);
      this.isBlocking = true;
      this.vx = 0;
      return;
    }

    // Attacks
    if (special && this.special >= this.char.specialCost && this.onGround) {
      this.special -= this.char.specialCost;
      this.setState(STATES.SPECIAL);
      return;
    }
    if (punch && this.onGround) {
      this.setState(STATES.PUNCH);
      return;
    }
    if (kick && this.onGround) {
      this.setState(STATES.KICK);
      return;
    }

    // Movement
    if (left) {
      this.vx = -this.char.speed;
      if (this.onGround) this.setState(STATES.WALK);
    } else if (right) {
      this.vx = this.char.speed;
      if (this.onGround) this.setState(STATES.WALK);
    } else {
      this.vx *= FRICTION;
      if (Math.abs(this.vx) < 0.3) this.vx = 0;
      if (this.onGround && this.state === STATES.WALK) this.setState(STATES.IDLE);
    }

    if (jump && this.onGround) {
      this.vy = JUMP_FORCE;
      this.onGround = false;
      this.setState(STATES.JUMP);
    }
  }

  updateState() {
    this.stateTimer++;
    this.animTimer++;

    if (this.animTimer > 6) {
      this.animTimer = 0;
      this.animFrame++;
    }

    const dur = this.attackDuration();
    if (this.isAttacking() && this.stateTimer >= dur) {
      this.setState(this.onGround ? STATES.IDLE : STATES.JUMP);
    }

    if (this.state === STATES.JUMP && this.onGround) {
      this.setState(STATES.IDLE);
    }

    if (this.state === STATES.BLOCK && !this.isBlocking) {
      this.setState(STATES.IDLE);
    }
  }

  applyPhysics() {
    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    // Ground
    if (this.y >= GROUND_Y) {
      this.y = GROUND_Y;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // Walls
    this.x = Math.max(40, Math.min(920, this.x));
  }

  takeDamage(amount, attackerFacing) {
    if (this.invincible > 0 || this.dead) return 0;

    let dmg = amount;
    if (this.isBlocking) {
      dmg = Math.round(amount * 0.25);
      this.special = Math.min(this.maxSpecial, this.special + 8);
    } else {
      this.hitStun = 12;
      this.invincible = 18;
      this.vx = attackerFacing * 6;
      this.special = Math.min(this.maxSpecial, this.special + 12);
    }

    this.hp = Math.max(0, this.hp - dmg);
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      this.setState(STATES.KO);
    }
    return dmg;
  }

  // Simple pixel-art style drawing
  draw(ctx) {
    ctx.save();
    ctx.translate(Math.floor(this.x), Math.floor(this.y));

    if (this.facing === -1) {
      ctx.scale(-1, 1);
    }

    const bob = this.state === STATES.WALK ? Math.sin(this.animFrame * 0.8) * 2 : 0;
    const crouch = this.state === STATES.BLOCK ? 8 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = this.char.color;
    const legSpread = this.state === STATES.WALK ? Math.sin(this.animFrame * 0.8) * 8 : 0;
    const kickLeg = this.state === STATES.KICK && this.stateTimer < 16 ? 35 : 0;

    // Back leg
    ctx.fillRect(-12, -30 + bob + crouch, 10, 30 - crouch);
    // Front leg
    ctx.fillRect(2 + legSpread + kickLeg * 0.3, -30 + bob + crouch, 10, 30 - crouch);

    // Body
    ctx.fillStyle = this.char.color;
    ctx.fillRect(-16, -70 + bob + crouch, 32, 42 - crouch);

    // Accent stripe
    ctx.fillStyle = this.char.accent;
    ctx.fillRect(-16, -55 + bob + crouch, 32, 6);

    // Head
    ctx.fillStyle = this.char.skin;
    ctx.fillRect(-12, -90 + bob + crouch, 24, 22);

    // Eyes
    ctx.fillStyle = '#111';
    const eyeX = this.state === STATES.HIT ? -2 : 2;
    ctx.fillRect(eyeX, -82 + bob + crouch, 5, 5);
    ctx.fillRect(eyeX + 8, -82 + bob + crouch, 5, 5);

    // Hair / helmet accent
    ctx.fillStyle = this.char.accent;
    ctx.fillRect(-14, -94 + bob + crouch, 28, 8);

    // Arms
    ctx.fillStyle = this.char.skin;
    let armY = -60 + bob + crouch;
    let armExtend = 0;

    if (this.state === STATES.PUNCH && this.stateTimer < 12) {
      armExtend = 28;
    } else if (this.state === STATES.SPECIAL && this.stateTimer < 25) {
      armExtend = 40;
    } else if (this.state === STATES.BLOCK) {
      armY = -55;
      armExtend = 5;
    }

    // Back arm
    ctx.fillRect(-20, armY, 10, 22);
    // Front arm (attack)
    ctx.fillRect(8 + armExtend, armY + (this.state === STATES.KICK ? 10 : 0), 10, 22);

    // Special glow
    if (this.state === STATES.SPECIAL) {
      ctx.globalAlpha = 0.5 + Math.sin(this.stateTimer * 0.4) * 0.3;
      ctx.fillStyle = this.char.accent;
      ctx.beginPath();
      ctx.arc(armExtend + 15, armY + 10, 18 + Math.sin(this.stateTimer * 0.3) * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Block shield effect
    if (this.isBlocking) {
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -45, 35, -0.8, 0.8);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // KO
    if (this.dead) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(-20, -95, 40, 100);
    }

    ctx.restore();
  }
}
