export class ParticleSystem {
  constructor(gl, quality) {
    this.gl = gl;
    this.quality = quality;
    this.maxParticles = 10000;
    
    // Structure of Arrays
    this.x = new Float32Array(this.maxParticles);
    this.y = new Float32Array(this.maxParticles);
    this.z = new Float32Array(this.maxParticles);
    this.vx = new Float32Array(this.maxParticles);
    this.vy = new Float32Array(this.maxParticles);
    this.life = new Float32Array(this.maxParticles);
    this.maxLife = new Float32Array(this.maxParticles);
    this.size = new Float32Array(this.maxParticles);
    this.hue = new Float32Array(this.maxParticles);
    
    this.count = 0;
    this.preset = null;
    
    this.setupBuffers();
  }
  
  setupBuffers() {
    const gl = this.gl;
    
    this.posBuffer = gl.createBuffer();
    this.dataBuffer = gl.createBuffer();
  }
  
  initialize(preset) {
    this.preset = preset;
    this.count = 0;
    
    // Spawn initial particles
    const initialCount = Math.min(
      preset.particleCount,
      this.maxParticles
    );
    
    for (let i = 0; i < initialCount; i++) {
      this.spawn(i);
    }
    
    this.count = initialCount;
  }
  
  spawn(i) {
    const preset = this.preset;
    
    // Position based on emitter type
    if (preset.emitterType === 'spread') {
      this.x[i] = (Math.random() - 0.5) * 2.5;
      this.y[i] = (Math.random() - 0.5) * 2.5;
    } else if (preset.emitterType === 'center') {
      this.x[i] = (Math.random() - 0.5) * 0.1;
      this.y[i] = (Math.random() - 0.5) * 0.1;
    } else if (preset.emitterType === 'bottom') {
      this.x[i] = (Math.random() - 0.5) * 2.5;
      this.y[i] = -1.2;
    }
    
    this.z[i] = Math.random();
    
    // Velocity
    if (preset.velocityType === 'drift') {
      this.vx[i] = (Math.random() - 0.5) * 0.2;
      this.vy[i] = (Math.random() - 0.5) * 0.2;
    } else if (preset.velocityType === 'outward') {
      const angle = Math.atan2(this.y[i], this.x[i]) || Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      this.vx[i] = Math.cos(angle) * speed;
      this.vy[i] = Math.sin(angle) * speed;
    } else if (preset.velocityType === 'upward') {
      this.vx[i] = (Math.random() - 0.5) * 0.1;
      this.vy[i] = 0.5 + Math.random() * 1.0;
    } else {
      this.vx[i] = 0;
      this.vy[i] = 0;
    }
    
    this.life[i] = 1.0;
    this.maxLife[i] = preset.particleLife * (0.5 + Math.random() * 0.5);
    this.size[i] = preset.particleSize * (0.5 + Math.random() * 0.5);
    this.hue[i] = Math.random();
  }
  
  update(deltaTime, time, pointer, aspect) {
    if (!this.preset) return;
    
    const preset = this.preset;
    const targetCount = Math.min(
      Math.floor(preset.particleCount * this.quality.getParticleScale()),
      this.maxParticles
    );
    
    for (let i = 0; i < this.count; i++) {
      // Apply field
      if (preset.fieldType === 'curl') {
        const noiseX = this.x[i] * 2 + time * 0.2;
        const noiseY = this.y[i] * 2 + time * 0.2;
        const curl = this.curlNoise(noiseX, noiseY);
        this.vx[i] += curl.x * preset.fieldStrength * deltaTime;
        this.vy[i] += curl.y * preset.fieldStrength * deltaTime;
      } else if (preset.fieldType === 'vortex') {
        const dx = this.x[i] - (pointer.x * 2 - 1) * aspect;
        const dy = this.y[i] - (pointer.y * 2 - 1);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.5 && dist > 0.01) {
          const strength = preset.fieldStrength * (1 - dist / 0.5);
          this.vx[i] += -dy / dist * strength * deltaTime;
          this.vy[i] += dx / dist * strength * deltaTime;
        }
      } else if (preset.fieldType === 'attractor') {
        const dx = (pointer.x * 2 - 1) * aspect - this.x[i];
        const dy = (pointer.y * 2 - 1) - this.y[i];
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.01) {
          const strength = preset.fieldStrength / (dist * dist + 0.1);
          this.vx[i] += dx * strength * deltaTime;
          this.vy[i] += dy * strength * deltaTime;
        }
      }
      
      // Apply damping
      this.vx[i] *= (1 - preset.damping * deltaTime);
      this.vy[i] *= (1 - preset.damping * deltaTime);
      
      // Update position
      this.x[i] += this.vx[i] * deltaTime;
      this.y[i] += this.vy[i] * deltaTime;
      
      // Bounds
      if (preset.boundsType === 'wrap') {
        if (this.x[i] < -aspect) this.x[i] += aspect * 2;
        if (this.x[i] > aspect) this.x[i] -= aspect * 2;
        if (this.y[i] < -1) this.y[i] += 2;
        if (this.y[i] > 1) this.y[i] -= 2;
      } else if (preset.boundsType === 'bounce') {
        if (Math.abs(this.x[i]) > aspect) this.vx[i] *= -0.8;
        if (Math.abs(this.y[i]) > 1) this.vy[i] *= -0.8;
        this.x[i] = Math.max(-aspect, Math.min(aspect, this.x[i]));
        this.y[i] = Math.max(-1, Math.min(1, this.y[i]));
      } else if (preset.boundsType === 'kill') {
        if (Math.abs(this.x[i]) > aspect * 1.5 || Math.abs(this.y[i]) > 1.5) {
          this.life[i] = 0;
        }
      }
      
      // Interaction
      if (pointer.down) {
        const pdx = (pointer.x * 2 - 1) * aspect - this.x[i];
        const pdy = (1 - pointer.y * 2) - this.y[i];
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pdist < 0.4) {
          const push = (1.0 - pdist / 0.4) * 5.0;
          this.vx[i] -= pdx / pdist * push * deltaTime;
          this.vy[i] -= pdy / pdist * push * deltaTime;
        }
      }
      
      // Age
      this.life[i] -= deltaTime / this.maxLife[i];
      
      // Respawn if dead
      if (this.life[i] <= 0) {
        this.spawn(i);
      }
    }
    
    // Adjust particle count
    if (this.count < targetCount) {
      for (let i = this.count; i < targetCount; i++) {
        this.spawn(i);
      }
      this.count = targetCount;
    } else if (this.count > targetCount) {
      this.count = targetCount;
    }
  }
  
  curlNoise(x, y) {
    const eps = 0.01;
    const n1 = this.noise(x, y + eps);
    const n2 = this.noise(x, y - eps);
    const n3 = this.noise(x + eps, y);
    const n4 = this.noise(x - eps, y);
    
    return {
      x: (n1 - n2) / (2 * eps),
      y: -(n3 - n4) / (2 * eps)
    };
  }
  
  noise(x, y) {
    // Simple value noise
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    
    const hash = (x, y) => {
      let h = x * 374761393 + y * 668265263;
      h = (h ^ (h >>> 13)) * 1274126177;
      return (h ^ (h >>> 16)) / 4294967296;
    };
    
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    
    return a * (1 - u) * (1 - v) +
           b * u * (1 - v) +
           c * (1 - u) * v +
           d * u * v;
  }
  
  render(particleProgram, lineProgram, time, aspect) {
    const gl = this.gl;
    if (this.count === 0) return;

    // Prepare data
    const positions = new Float32Array(this.count * 2);
    const data = new Float32Array(this.count * 4);
    for (let i = 0; i < this.count; i++) {
      positions[i * 2] = this.x[i];
      positions[i * 2 + 1] = this.y[i];
      data[i * 4] = this.size[i];
      data[i * 4 + 1] = this.life[i];
      data[i * 4 + 2] = this.z[i];
      data[i * 4 + 3] = this.hue[i];
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.dataBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

    // 1. Render Lines if needed
    if (this.preset.showLines) {
      this.renderLines(lineProgram, aspect, positions);
    }

    // 2. Render Particles
    gl.useProgram(particleProgram);
    const posLoc = gl.getAttribLocation(particleProgram, 'a_position');
    const dataLoc = gl.getAttribLocation(particleProgram, 'a_data');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.dataBuffer);
    gl.enableVertexAttribArray(dataLoc);
    gl.vertexAttribPointer(dataLoc, 4, gl.FLOAT, false, 0, 0);

    gl.uniform1f(gl.getUniformLocation(particleProgram, 'u_time'), time);
    gl.uniform1f(gl.getUniformLocation(particleProgram, 'u_aspect'), aspect);
    gl.uniform3fv(gl.getUniformLocation(particleProgram, 'u_paletteStart'), this.preset.palette[0]);
    gl.uniform3fv(gl.getUniformLocation(particleProgram, 'u_paletteEnd'), this.preset.palette[1]);
    
    gl.drawArrays(gl.POINTS, 0, this.count);
  }

  renderLines(lineProgram, aspect, positions) {
    const gl = this.gl;
    gl.useProgram(lineProgram);
    
    const lineCoords = [];
    const maxLineDistSq = (this.preset.lineDist || 0.2) ** 2;
    const maxConnections = 3;
    
    // Performance: only check a limited number of particles for lines
    const step = Math.max(1, Math.floor(this.count / 200));
    
    for (let i = 0; i < this.count; i += step) {
      let connections = 0;
      for (let j = i + step; j < this.count; j += step) {
        const dx = this.x[i] - this.x[j];
        const dy = this.y[i] - this.y[j];
        const d2 = dx * dx + dy * dy;
        
        if (d2 < maxLineDistSq) {
          lineCoords.push(this.x[i], this.y[i], this.x[j], this.y[j]);
          connections++;
          if (connections >= maxConnections) break;
        }
      }
    }
    
    if (lineCoords.length === 0) return;
    
    const lineBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineCoords), gl.STREAM_DRAW);
    
    const posLoc = gl.getAttribLocation(lineProgram, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    
    gl.uniform1f(gl.getUniformLocation(lineProgram, 'u_aspect'), aspect);
    gl.uniform3fv(gl.getUniformLocation(lineProgram, 'u_color'), this.preset.palette[0]);
    gl.uniform1f(gl.getUniformLocation(lineProgram, 'u_opacity'), 0.2);
    
    gl.drawArrays(gl.LINES, 0, lineCoords.length / 2);
    gl.deleteBuffer(lineBuf);
  }
}