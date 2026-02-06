import { ParticleSystem } from './particles.js';
import { QualityController } from './quality.js';
import { createShaderProgram, particleVS, particleFS, lineVS, lineFS, bloomVS, bloomFS } from './shaders.js';

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      preserveDrawingBuffer: false
    });
    
    if (!this.gl) {
      throw new Error('WebGL not supported');
    }
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    this.quality = new QualityController();
    this.particles = new ParticleSystem(this.gl, this.quality);
    this.pointer = { x: 0.5, y: 0.5, down: false };
    
    this.setupShaders();
    this.setupBuffers();
    
    this.time = 0;
    this.preset = null;
  }
  
  resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const scale = this.quality.getResolutionScale();
    
    this.canvas.width = window.innerWidth * dpr * scale;
    this.canvas.height = window.innerHeight * dpr * scale;
    
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.aspect = this.width / this.height;
    
    this.gl.viewport(0, 0, this.width, this.height);
  }
  
  setupShaders() {
    const gl = this.gl;
    
    this.particleProgram = createShaderProgram(gl, particleVS, particleFS);
    this.lineProgram = createShaderProgram(gl, lineVS, lineFS);
    this.bloomProgram = createShaderProgram(gl, bloomVS, bloomFS);
  }
  
  setupBuffers() {
    const gl = this.gl;
    
    // Fullscreen quad for bloom
    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);
  }
  
  setPreset(preset) {
    this.preset = preset;
    this.particles.initialize(preset);
  }
  
  setPointer(pointer) {
    this.pointer = pointer;
  }
  
  update(deltaTime) {
    this.time += deltaTime;
    
    if (!this.preset) return;
    
    // Update quality based on performance
    this.quality.update(deltaTime);
    
    // Update particles
    this.particles.update(deltaTime, this.time, this.pointer, this.aspect);
  }
  
  render() {
    const gl = this.gl;
    
    if (!this.preset) return;
    
    // Clear
    gl.clearColor(
      this.preset.background[0],
      this.preset.background[1],
      this.preset.background[2],
      1.0
    );
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Enable blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    
    // Render particles
    this.particles.render(this.particleProgram, this.lineProgram, this.time, this.aspect);
    
    gl.disable(gl.BLEND);
  }
}