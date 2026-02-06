import { Engine } from './engine.js';
import { presets } from './presets.js';

const canvas = document.getElementById('canvas');
const engine = new Engine(canvas);

let currentPresetIndex = 0;
let frameTimes = [];
let lastFrameTime = performance.now();

// Initialize with first preset
engine.setPreset(presets[currentPresetIndex]);

// UI Controls
const presetNameBtn = document.getElementById('preset-name');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const fpsDisplay = document.getElementById('fps');

function updatePresetUI() {
  presetNameBtn.textContent = presets[currentPresetIndex].name.toUpperCase();
}

prevBtn.addEventListener('click', () => {
  currentPresetIndex = (currentPresetIndex - 1 + presets.length) % presets.length;
  engine.setPreset(presets[currentPresetIndex]);
  updatePresetUI();
});

nextBtn.addEventListener('click', () => {
  currentPresetIndex = (currentPresetIndex + 1) % presets.length;
  engine.setPreset(presets[currentPresetIndex]);
  updatePresetUI();
});

// Pointer interaction
let pointer = { x: 0, y: 0, down: false };

canvas.addEventListener('pointermove', (e) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = (e.clientX - rect.left) / rect.width;
  pointer.y = (e.clientY - rect.top) / rect.height;
  engine.setPointer(pointer);
});

canvas.addEventListener('pointerdown', () => {
  pointer.down = true;
  engine.setPointer(pointer);
});

canvas.addEventListener('pointerup', () => {
  pointer.down = false;
  engine.setPointer(pointer);
});

// Main loop
function animate(currentTime) {
  requestAnimationFrame(animate);
  
  const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.1);
  lastFrameTime = currentTime;
  
  // FPS tracking
  frameTimes.push(deltaTime);
  if (frameTimes.length > 60) frameTimes.shift();
  const avgDelta = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
  const fps = Math.round(1 / avgDelta);
  fpsDisplay.textContent = `${fps} FPS`;
  
  engine.update(deltaTime);
  engine.render();
}

animate(0);