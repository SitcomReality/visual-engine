export const presets = [
  {
    name: 'Embers',
    background: [0.02, 0.01, 0.03],
    palette: [
      [1.0, 0.3, 0.1],  // Orange
      [1.0, 0.8, 0.2]   // Yellow
    ],
    particleCount: 3000,
    particleSize: 0.015,
    particleLife: 8.0,
    emitterType: 'spread',
    velocityType: 'drift',
    fieldType: 'curl',
    fieldStrength: 0.5,
    damping: 0.2,
    boundsType: 'wrap'
  },
  
  {
    name: 'Neural',
    background: [0.01, 0.02, 0.04],
    palette: [
      [0.02, 0.01, 1.0],  // Cyan
      [2, 0.9, 1.0]   // Bright cyan
    ],
    particleCount: 500,
    particleSize: 0.1,
    particleLife: 20.0,
    emitterType: 'spread',
    velocityType: 'drift',
    fieldType: 'none',
    fieldStrength: 0.0,
    damping: 0.8,
    boundsType: 'bounce'
  },
  
  {
    name: 'Cosmic',
    background: [0.01, 0.01, 0.02],
    palette: [
      [0.6, 0.4, 1.0],  // Purple
      [0.3, 0.8, 1.0]   // Blue
    ],
    particleCount: 5000,
    particleSize: 0.008,
    particleLife: 15.0,
    emitterType: 'spread',
    velocityType: 'slow',
    fieldType: 'none',
    fieldStrength: 0.0,
    damping: 0.95,
    boundsType: 'wrap'
  },
  
  {
    name: 'Vortex',
    background: [0.02, 0.01, 0.02],
    palette: [
      [1.0, 0.2, 0.5],  // Pink
      [0.5, 0.2, 1.0]   // Purple
    ],
    particleCount: 4000,
    particleSize: 0.012,
    particleLife: 6.0,
    emitterType: 'center',
    velocityType: 'outward',
    fieldType: 'vortex',
    fieldStrength: 2.0,
    damping: 0.3,
    boundsType: 'wrap'
  }
];