export class QualityController {
  constructor() {
    this.frameTimes = [];
    this.maxSamples = 60;
    this.targetFPS = 55;
    
    this.resolutionScale = 1.0;
    this.particleScale = 1.0;
    
    this.lastAdjustTime = 0;
    this.adjustInterval = 2000; // 2 seconds
  }
  
  update(deltaTime) {
    this.frameTimes.push(deltaTime);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
    
    // Only adjust quality periodically
    const now = performance.now();
    if (now - this.lastAdjustTime < this.adjustInterval) {
      return;
    }
    this.lastAdjustTime = now;
    
    if (this.frameTimes.length < this.maxSamples) {
      return;
    }
    
    const avgDelta = this.frameTimes.reduce((a, b) => a + b) / this.frameTimes.length;
    const fps = 1 / avgDelta;
    
    // Adjust quality based on FPS
    if (fps < this.targetFPS - 5) {
      // Too slow, reduce quality
      this.particleScale *= 0.9;
      this.particleScale = Math.max(0.3, this.particleScale);
    } else if (fps > this.targetFPS + 5 && this.particleScale < 1.0) {
      // Fast enough, increase quality
      this.particleScale *= 1.05;
      this.particleScale = Math.min(1.0, this.particleScale);
    }
  }
  
  getResolutionScale() {
    return this.resolutionScale;
  }
  
  getParticleScale() {
    return this.particleScale;
  }
}