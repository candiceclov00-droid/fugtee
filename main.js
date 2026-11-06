import { InputManager } from './input.js';
import { Game } from './game.js';
import { CHARACTERS } from './characters.js';
import { ARENAS } from './arenas.js';

// DOM
const canvas = document.getElementById('gameCanvas');
const menuOverlay = document.getElementById('menu-overlay');
const hud = document.getElementById('hud');
const mainMenu = document.getElementById('main-menu');
const howTo = document.getElementById('how-to');
const credits = document.getElementById('credits');
const charSelect = document.getElementById('char-select');
const resultScreen = document.getElementById('result-screen');

const input = new InputManager();
const game = new Game(canvas, input);

let selectedP1 = null;
let selectedP2 = null;
let selectedArena = ARENAS[0].id;
let animId = null;
let lastTime = 0;

// ========== MENU LOGIC ==========
function showScreen(screen) {
  [mainMenu, howTo, credits, charSelect, resultScreen].forEach(s => s.classList.add('hidden'));
  screen.classList.remove('hidden');
  menuOverlay.classList.remove('hidden');
  hud.classList.add('hidden');
}

function hideMenus() {
  menuOverlay.classList.add('hidden');
  hud.classList.remove('hidden');
}

// Main menu buttons
document.getElementById('btn-start').addEventListener('click', () => {
  buildCharSelect();
  showScreen(charSelect);
});

document.getElementById('btn-how').addEventListener('click', () => showScreen(howTo));
document.getElementById('btn-credits').addEventListener('click', () => showScreen(credits));

document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => showScreen(mainMenu));
});

// Character select
function buildCharSelect() {
  selectedP1 = null;
  selectedP2 = null;
  selectedArena = ARENAS[0].id;
  document.getElementById('btn-fight').disabled = true;
  document.getElementById('p1-selected-name').textContent = '—';
  document.getElementById('p2-selected-name').textContent = '—';

  const p1Grid = document.getElementById('p1-chars');
  const p2Grid = document.getElementById('p2-chars');
  p1Grid.innerHTML = '';
  p2Grid.innerHTML = '';

  CHARACTERS.forEach(c => {
    p1Grid.appendChild(createCharCard(c, 1));
    p2Grid.appendChild(createCharCard(c, 2));
  });

  const arenaGrid = document.getElementById('arena-grid');
  arenaGrid.innerHTML = '';
  ARENAS.forEach((a, i) => {
    const card = document.createElement('div');
    card.className = 'arena-card' + (i === 0 ? ' selected' : '');
    card.style.background = `linear-gradient(180deg, ${a.skyTop}, ${a.skyBottom})`;
    card.innerHTML = `<span>${a.name}</span>`;
    card.addEventListener('click', () => {
      document.querySelectorAll('.arena-card').forEach(el => el.classList.remove('selected'));
      card.classList.add('selected');
      selectedArena = a.id;
    });
    arenaGrid.appendChild(card);
  });
}

function createCharCard(c, player) {
  const card = document.createElement('div');
  card.className = 'char-card';
  card.dataset.id = c.id;

  // Mini canvas preview
  const prev = document.createElement('canvas');
  prev.width = 40;
  prev.height = 50;
  prev.className = 'preview';
  const pctx = prev.getContext('2d');
  drawMiniFighter(pctx, c);
  card.appendChild(prev);

  const name = document.createElement('div');
  name.className = 'char-name';
  name.textContent = c.name;
  card.appendChild(name);

  card.addEventListener('click', () => {
    if (player === 1) {
      document.querySelectorAll('#p1-chars .char-card').forEach(el => el.classList.remove('selected'));
      card.classList.add('selected');
      selectedP1 = c.id;
      document.getElementById('p1-selected-name').textContent = c.name;
    } else {
      document.querySelectorAll('#p2-chars .char-card').forEach(el => el.classList.remove('selected'));
      card.classList.add('selected');
      selectedP2 = c.id;
      document.getElementById('p2-selected-name').textContent = c.name;
    }
    document.getElementById('btn-fight').disabled = !(selectedP1 && selectedP2);
  });

  return card;
}

function drawMiniFighter(ctx, c) {
  ctx.fillStyle = c.color;
  ctx.fillRect(8, 18, 24, 28);
  ctx.fillStyle = c.accent;
  ctx.fillRect(8, 28, 24, 4);
  ctx.fillStyle = c.skin;
  ctx.fillRect(10, 4, 20, 16);
  ctx.fillStyle = '#111';
  ctx.fillRect(14, 10, 4, 4);
  ctx.fillRect(22, 10, 4, 4);
  ctx.fillStyle = c.accent;
  ctx.fillRect(8, 2, 24, 5);
}

document.getElementById('btn-fight').addEventListener('click', () => {
  if (!selectedP1 || !selectedP2) return;
  startFight(selectedP1, selectedP2, selectedArena);
});

function startFight(p1Id, p2Id, arenaId) {
  hideMenus();
  game.start(p1Id, p2Id, arenaId);
  lastTime = performance.now();
  if (animId) cancelAnimationFrame(animId);
  loop(lastTime);
}

game.onRoundEnd = (winner) => {
  const title = document.getElementById('result-title');
  const text = document.getElementById('result-text');

  if (winner === 'draw') {
    title.textContent = 'DRAW';
    text.textContent = 'DOUBLE K.O.';
  } else if (winner === 'p1') {
    title.textContent = 'K.O. !';
    text.textContent = (game.p1?.char.name || 'PLAYER 1') + ' WINS';
  } else {
    title.textContent = 'K.O. !';
    text.textContent = (game.p2?.char.name || 'PLAYER 2') + ' WINS';
  }

  showScreen(resultScreen);
};

document.getElementById('btn-rematch').addEventListener('click', () => {
  if (selectedP1 && selectedP2) {
    startFight(selectedP1, selectedP2, selectedArena);
  }
});

document.getElementById('btn-menu').addEventListener('click', () => {
  showScreen(mainMenu);
});

// Keyboard shortcuts for menus
window.addEventListener('keydown', (e) => {
  if (e.code === 'Enter' && !menuOverlay.classList.contains('hidden')) {
    if (!mainMenu.classList.contains('hidden')) {
      document.getElementById('btn-start').click();
    } else if (!charSelect.classList.contains('hidden') && selectedP1 && selectedP2) {
      document.getElementById('btn-fight').click();
    }
  }
  if (e.code === 'Escape') {
    if (!resultScreen.classList.contains('hidden') || !charSelect.classList.contains('hidden') ||
        !howTo.classList.contains('hidden') || !credits.classList.contains('hidden')) {
      showScreen(mainMenu);
    }
  }
});

// ========== GAME LOOP ==========
function loop(now) {
  const dt = now - lastTime;
  lastTime = now;

  game.update(dt);
  game.draw();
  input.clearJustPressed();

  animId = requestAnimationFrame(loop);
}

// Background idle animation on menu
function drawMenuBg() {
  if (!menuOverlay.classList.contains('hidden')) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, 960, 540);

    // Subtle animated grid
    ctx.strokeStyle = 'rgba(58, 134, 255, 0.08)';
    ctx.lineWidth = 1;
    const offset = (Date.now() / 50) % 40;
    for (let x = -40 + offset; x < 960; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 540);
      ctx.stroke();
    }
    for (let y = -40 + offset; y < 540; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(960, y);
      ctx.stroke();
    }

    // Floating particles
    ctx.fillStyle = 'rgba(255, 0, 110, 0.3)';
    for (let i = 0; i < 15; i++) {
      const px = (Math.sin(Date.now() / 2000 + i) * 0.5 + 0.5) * 960;
      const py = (Math.cos(Date.now() / 1800 + i * 1.3) * 0.5 + 0.5) * 540;
      ctx.beginPath();
      ctx.arc(px, py, 2 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  requestAnimationFrame(drawMenuBg);
}

// Init
showScreen(mainMenu);
drawMenuBg();

console.log('%c PIXEL FIGHTERS ', 'background:#e63946;color:#fff;font-size:16px;padding:4px 12px;');
console.log('Controls loaded. Ready to fight!');
