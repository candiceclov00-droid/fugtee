export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, opts = {}) {
    const count = opts.count || 8;
    const color = opts.color || '#fff';
    const speed = opts.speed || 3;
    const life = opts.life || 40;
    const size = opts.size || 4;
    const gravity = opts.gravity !== undefined ? opts.gravity : 0.15;
    const type = opts.type || 'spark';

    for (let i = 0; i < count; i++) {
      const angle = opts.angle !== undefined
        ? opts.angle + (Math.random() - 0.5) * (opts.spread || Math.PI)
        : Math.random() * Math.PI * 2;
      const spd = speed * (0.5 + Math.random());
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life,
        maxLife: life,
        size: size * (0.6 + Math.random() * 0.8),
        color,
        gravity,
        type
      });
    }
  }

  hit(x, y, color) {
    this.emit(x, y, { count: 12, color, speed: 5, life: 30, size: 5 });
    this.emit(x, y, { count: 6, color: '#fff', speed: 3, life: 20, size: 3 });
  }

  special(x, y, color) {
    this.emit(x, y, { count: 20, color, speed: 7, life: 50, size: 6, spread: 0.05 });
    this.emit(x, y, { count: 10, color: '#fff', speed: 4, life: 35, size: 4 });
  }

  block(x, y) {
    this.emit(x, y, { count: 6, color: '#aaa', speed: 2.5, life: 25, size: 3 });
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      if (p.type === 'spark') {
        ctx.fillRect(Math.floor(p.x - p.size / 2), Math.floor(p.y - p.size / 2), p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.particles = [];
  }
}
