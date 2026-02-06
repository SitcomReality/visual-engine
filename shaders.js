export function createShaderProgram(gl, vsSource, fsSource) {
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vsSource);
  gl.compileShader(vs);
  
  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    console.error('VS compile error:', gl.getShaderInfoLog(vs));
  }
  
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fsSource);
  gl.compileShader(fs);
  
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    console.error('FS compile error:', gl.getShaderInfoLog(fs));
  }
  
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
  }
  
  return program;
}

export const particleVS = `
attribute vec2 a_position;
attribute vec4 a_data; // size, life, z, hue

uniform float u_time;
uniform float u_aspect;

varying float v_life;
varying float v_z;
varying float v_hue;

void main() {
  float size = a_data.x;
  float life = a_data.y;
  float z = a_data.z;
  float hue = a_data.w;
  
  // Depth-based size
  float depthScale = 1.0 - z * 0.5;
  float finalSize = size * depthScale;
  
  // Fade in/out
  float alpha = smoothstep(0.0, 0.1, life) * smoothstep(0.0, 0.3, 1.0 - life);
  
  vec2 pos = a_position;
  pos.x /= u_aspect;
  
  gl_Position = vec4(pos, 0.0, 1.0);
  gl_PointSize = finalSize * 300.0;
  
  v_life = alpha;
  v_z = z;
  v_hue = hue;
}
`;

export const particleFS = `
precision mediump float;

uniform vec3 u_paletteStart;
uniform vec3 u_paletteEnd;

varying float v_life;
varying float v_z;
varying float v_hue;

void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float dist = length(uv);
  
  if (dist > 1.0) discard;
  
  // Hot core with soft falloff
  float glow = exp(-dist * 4.0);
  float core = exp(-dist * 15.0) * 2.0;
  
  // Color from palette
  vec3 color = mix(u_paletteStart, u_paletteEnd, v_hue);
  
  // Depth dimming
  float depthFade = 1.0 - v_z * 0.5;
  
  float alpha = (glow + core) * v_life * depthFade;
  
  gl_FragColor = vec4(color, 1.0) * alpha;
}
`;

export const lineVS = `
attribute vec2 a_position;
uniform float u_aspect;

void main() {
  vec2 pos = a_position;
  pos.x /= u_aspect;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

export const lineFS = `
precision mediump float;
uniform vec3 u_color;
uniform float u_opacity;

void main() {
  gl_FragColor = vec4(u_color, u_opacity);
}
`;

export const bloomVS = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const bloomFS = `
precision mediump float;
uniform sampler2D u_texture;
varying vec2 v_uv;

void main() {
  gl_FragColor = texture2D(u_texture, v_uv);
}
`;