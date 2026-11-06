import { CANVAS_W, CANVAS_H, GROUND_Y, STATES } from './constants.js';
import { Player } from './player.js';
import { ParticleSystem } from './particles.js';
import { getCharacter } from './characters.js';
import { getArena } from './arenas.js';

export class Game {
  constructor(canvas, input) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = input;
    this.particles = new ParticleSystem();

    this.p1 = null;
    this.p2 = null;
    this.arena = null;
    this.timer = 99;
    this.timerAcc = 0;
    this.running = false;
    this.over = false;
    this.winner = null;
    this.shake = 0;

    this.onRoundEnd = null; // callback
  }

  start(p1Id, p2Id, arenaId) {
    const c1 = getCharacter(p1Id);
    const c2 = getCharacter(p2Id);
    this.arena = getArena(arenaId);

    this.p1 = new Player(c1, 'left', 200);
    this.p2 = new Player(c2, 'right', 760);
    this.timer = 99;
    this.timerAcc = 0;
    this.running = true;
    this.over = false;
    this.winner = null;
    this.particles.clear();
    this.shake = 0;

    // Update HUD names
    document.getElementById('p1-name').textContent = c1.name;
    document.getElementById('p2-name').textContent = c2.name;
  }

  update(dt) {
    if (!this.running || this.over) return;

    const keys1 = this.input.getPlayerKeys(1);
    const keys2 = this.input.getPlayerKeys(2);

    this.p1.update(keys1, this.p2);
    this.p2.update(keys2, this.p1);

    this.checkCollisions();
    this.particles.update();

    // Timer
    this.timerAcc += dt;
    if (this.timerAcc >= 1000) {
      this.timerAcc = 0;
      this.timer = Math.max(0, this.timer - 1);
      if (this.timer === 0) this.endRound('time');
    }

    // KO check
    if (this.p1.dead || this.p2.dead) {
      this.endRound('ko');
    }

    if (this.shake > 0) this.shake *= 0.9;

    this.updateHUD();
  }

  checkCollisions() {
    this.resolveAttack(this.p1, this.p2);
    this.resolveAttack(this.p2, this.p1);

    // Push apart if overlapping
    const dx = this.p2.x - this.p1.x;
    if (Math.abs(dx) < 50) {
      const push = (50 - Math.abs(dx)) / 2;
      if (dx > 0) {
        this.p1.x -= push;
        this.p2.x += push;
      } else {
        this.p1.x += push;
        this.p2.x -= push;
      }
    }
  }

  resolveAttack(attacker, defender) {
    if (attacker.attackHit || attacker.invincible > 0) return;
    const box = attacker.getAttackBox();
    if (!box) return;

    // Active frames only
    const mid = attacker.attackDuration() / 2;
    if (attacker.stateTimer < mid - 4 || attacker.stateTimer > mid + 6) return;

    const def = defender.hitbox;
    if (this.rectsOverlap(box, def)) {
      attacker.attackHit = true;
      const dmg = defender.takeDamage(box.damage, attacker.facing);

      // Particles
      const hx = defender.x;
      const hy = defender.y - 50;
      if (defender.isBlocking) {
        this.particles.block(hx, hy);
      } else {
        this.particles.hit(hx, hy, attacker.char.accent);
        this.shake = 8;
      }

      if (attacker.state === STATES.SPECIAL) {
        this.particles.special(hx, hy, attacker.char.accent);
        this.shake = 14;
      }

      // Gain special on successful hit
      if (!defender.isBlocking) {
        attacker.special = Math.min(100, attacker.special + 15);
      }
    }
  }

  rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  endRound(reason) {
    if (this.over) return;
    this.over = true;
    this.running = false;

    if (reason === 'ko') {
      if (this.p1.dead && this.p2.dead) this.winner = 'draw';
      else if (this.p1.dead) this.winner = 'p2';
      else this.winner = 'p1';
    } else {
      // Time out - higher HP wins
      if (this.p1.hp > this.p2.hp) this.winner = 'p1';
      else if (this.p2.hp > this.p1.hp) this.winner = 'p2';
      else this.winner = 'draw';
    }

    if (this.onRoundEnd) {
      setTimeout(() => this.onRoundEnd(this.winner), 1200);
    }
  }

  updateHUD() {
    const p1h = document.getElementById('p1-health');
    const p2h = document.getElementById('p2-health');
    const p1s = document.getElementById('p1-special');
    const p2s = document.getElementById('p2-special');
    const timerEl = document.getElementById('timer');

    if (p1h) p1h.style.width = (this.p1.hp / this.p1.maxHp * 100) + '%';
    if (p2h) p2h.style.width = (this.p2.hp / this.p2.maxHp * 100) + '%';
    if (p1s) p1s.style.width = this.p1.special + '%';
    if (p2s) p2s.style.width = this.p2.special + '%';
    if (timerEl) timerEl.textContent = String(this.timer).padStart(2, '0');
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();

    // Screen shake
    if (this.shake > 0.5) {
      ctx.translate(
        (Math.random() - 0.5) * this.shake,
        (Math.random() - 0.5) * this.shake
      );
    }

    this.drawArena(ctx);
    this.particles.draw(ctx);

    if (this.p1) this.p1.draw(ctx);
    if (this.p2) this.p2.draw(ctx);

    // KO text
    if (this.over && this.winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.font = '48px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e63946';
      ctx.shadowColor = '#e63946';
      ctx.shadowBlur = 20;
      const text = this.winner === 'draw' ? 'DOUBLE KO' : 'KO !';
      ctx.fillText(text, CANVAS_W / 2, CANVAS_H / 2 - 20);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  drawArena(ctx) {
    const a = this.arena;
    if (!a) {
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      return;
    }

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    grad.addColorStop(0, a.skyTop);
    grad.addColorStop(1, a.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, GROUND_Y);

    // Stars
    if (a.stars) {
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 60; i++) {
        const sx = (i * 97) % CANVAS_W;
        const sy = (i * 53) % (GROUND_Y - 40);
        const size = (i % 3) + 1;
        ctx.globalAlpha = 0.3 + (i % 5) * 0.15;
        ctx.fillRect(sx, sy, size, size);
      }
      ctx.globalAlpha = 1;
    }

    // Buildings (Neon City)
    if (a.buildings) {
      const buildings = [
        { x: 20, w: 70, h: 160 }, { x: 100, w: 50, h: 220 },
        { x: 160, w: 90, h: 140 }, { x: 270, w: 60, h: 200 },
        { x: 650, w: 80, h: 180 }, { x: 740, w: 55, h: 240 },
        { x: 810, w: 100, h: 150 }, { x: 900, w: 50, h: 190 }
      ];
      buildings.forEach((b, i) => {
        ctx.fillStyle = i % 2 === 0 ? '#1a0533' : '#12022a';
        ctx.fillRect(b.x, GROUND_Y - b.h, b.w, b.h);
        // Windows
        ctx.fillStyle = '#ff006e';
        for (let wy = GROUND_Y - b.h + 15; wy < GROUND_Y - 20; wy += 25) {
          for (let wx = b.x + 8; wx < b.x + b.w - 10; wx += 18) {
            if (Math.random() > 0.3) {
              ctx.globalAlpha = 0.5 + Math.random() * 0.5;
              ctx.fillRect(wx, wy, 8, 10);
            }
          }
        }
        ctx.globalAlpha = 1;
      });
    }

    // Dojo
    if (a.dojo) {
      ctx.fillStyle = '#2d6a4f';
      ctx.fillRect(80, GROUND_Y - 180, 100, 180);
      ctx.fillRect(780, GROUND_Y - 180, 100, 180);
      ctx.fillStyle = '#95d5b2';
      ctx.fillRect(70, GROUND_Y - 190, 120, 15);
      ctx.fillRect(770, GROUND_Y - 190, 120, 15);
      // Torii-like
      ctx.fillStyle = '#d8f3dc';
      ctx.fillRect(300, GROUND_Y - 120, 360, 12);
      ctx.fillRect(320, GROUND_Y - 160, 20, 50);
      ctx.fillRect(620, GROUND_Y - 160, 20, 50);
    }

    // Colosseum
    if (a.colosseum) {
      ctx.fillStyle = '#6a040f';
      for (let i = 0; i < 8; i++) {
        const cx = 60 + i * 115;
        ctx.beginPath();
        ctx.arc(cx, GROUND_Y - 40, 40, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(cx - 40, GROUND_Y - 40, 80, 40);
      }
      ctx.fillStyle = '#9d0208';
      ctx.fillRect(0, GROUND_Y - 80, CANVAS_W, 15);
    }

    // Cyber grid
    if (a.grid) {
      ctx.strokeStyle = 'rgba(0, 180, 216, 0.25)';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, GROUND_Y);
        ctx.stroke();
      }
      for (let y = 0; y < GROUND_Y; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_W, y);
        ctx.stroke();
      }
      // Horizon glow
      const g2 = ctx.createLinearGradient(0, GROUND_Y - 80, 0, GROUND_Y);
      g2.addColorStop(0, 'rgba(0,180,216,0)');
      g2.addColorStop(1, 'rgba(0,180,216,0.3)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, GROUND_Y - 80, CANVAS_W, 80);
    }

    // Ground
    ctx.fillStyle = a.ground;
    ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);

    // Ground line / platform edge
    ctx.fillStyle = a.groundLine;
    ctx.fillRect(0, GROUND_Y, CANVAS_W, 6);
    ctx.fillStyle = a.accent;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(0, GROUND_Y + 6, CANVAS_W, 3);
    ctx.globalAlpha = 1;

    // Floor details
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    for (let i = 0; i < 20; i++) {
      ctx.fillRect(i * 50, GROUND_Y + 20, 30, 4);
    }
  }
}
