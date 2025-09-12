import type { GradientConfig } from '../types';

// Beautiful predefined gradients inspired by popular design systems
export const GRADIENT_PRESETS: Array<{ name: string; gradient: GradientConfig }> = [
  // Sunset & Dawn Collection
  {
    name: 'Sunset Glow',
    gradient: {
      type: 'linear',
      angle: 45,
      stops: [
        { color: '#ff6b6b', position: 0 },
        { color: '#ffa500', position: 50 },
        { color: '#ffdd59', position: 100 },
      ],
    },
  },
  {
    name: 'Purple Dawn',
    gradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#667eea', position: 0 },
        { color: '#764ba2', position: 100 },
      ],
    },
  },
  {
    name: 'Ocean Sunrise',
    gradient: {
      type: 'linear',
      angle: 90,
      stops: [
        { color: '#4facfe', position: 0 },
        { color: '#00f2fe', position: 100 },
      ],
    },
  },

  // Ocean & Water Collection
  {
    name: 'Deep Ocean',
    gradient: {
      type: 'linear',
      angle: 180,
      stops: [
        { color: '#2196f3', position: 0 },
        { color: '#21cbf3', position: 50 },
        { color: '#2196f3', position: 100 },
      ],
    },
  },
  {
    name: 'Aqua Marine',
    gradient: {
      type: 'linear',
      angle: 45,
      stops: [
        { color: '#1dd1a1', position: 0 },
        { color: '#55a3ff', position: 100 },
      ],
    },
  },
  {
    name: 'Tropical Water',
    gradient: {
      type: 'linear',
      angle: 90,
      stops: [
        { color: '#00c9ff', position: 0 },
        { color: '#92fe9d', position: 100 },
      ],
    },
  },

  // Fire & Energy Collection
  {
    name: 'Fire Burst',
    gradient: {
      type: 'linear',
      angle: 45,
      stops: [
        { color: '#ff416c', position: 0 },
        { color: '#ff4b2b', position: 100 },
      ],
    },
  },
  {
    name: 'Lava Flow',
    gradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#ff9a9e', position: 0 },
        { color: '#fecfef', position: 50 },
        { color: '#fecfef', position: 100 },
      ],
    },
  },
  {
    name: 'Electric Energy',
    gradient: {
      type: 'linear',
      angle: 90,
      stops: [
        { color: '#a8edea', position: 0 },
        { color: '#fed6e3', position: 100 },
      ],
    },
  },

  // Nature & Forest Collection
  {
    name: 'Forest Canopy',
    gradient: {
      type: 'linear',
      angle: 45,
      stops: [
        { color: '#134e5e', position: 0 },
        { color: '#71b280', position: 100 },
      ],
    },
  },
  {
    name: 'Spring Meadow',
    gradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#56ab2f', position: 0 },
        { color: '#a8e6cf', position: 100 },
      ],
    },
  },
  {
    name: 'Mountain Mist',
    gradient: {
      type: 'linear',
      angle: 180,
      stops: [
        { color: '#606c88', position: 0 },
        { color: '#3f4c6b', position: 100 },
      ],
    },
  },

  // Space & Galaxy Collection
  {
    name: 'Nebula',
    gradient: {
      type: 'linear',
      angle: 45,
      stops: [
        { color: '#667eea', position: 0 },
        { color: '#764ba2', position: 50 },
        { color: '#f093fb', position: 100 },
      ],
    },
  },
  {
    name: 'Galaxy Far Away',
    gradient: {
      type: 'linear',
      angle: 90,
      stops: [
        { color: '#2c3e50', position: 0 },
        { color: '#4ca1af', position: 100 },
      ],
    },
  },
  {
    name: 'Cosmic Aurora',
    gradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#8360c3', position: 0 },
        { color: '#2ebf91', position: 100 },
      ],
    },
  },

  // Warm & Cozy Collection
  {
    name: 'Autumn Leaves',
    gradient: {
      type: 'linear',
      angle: 45,
      stops: [
        { color: '#f12711', position: 0 },
        { color: '#f5af19', position: 100 },
      ],
    },
  },
  {
    name: 'Golden Hour',
    gradient: {
      type: 'linear',
      angle: 90,
      stops: [
        { color: '#ffecd2', position: 0 },
        { color: '#fcb69f', position: 100 },
      ],
    },
  },
  {
    name: 'Warm Embrace',
    gradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#ff8a80', position: 0 },
        { color: '#ffb74d', position: 100 },
      ],
    },
  },

  // Cool & Modern Collection
  {
    name: 'Ice Crystal',
    gradient: {
      type: 'linear',
      angle: 180,
      stops: [
        { color: '#e0eafc', position: 0 },
        { color: '#cfdef3', position: 100 },
      ],
    },
  },
  {
    name: 'Arctic Wind',
    gradient: {
      type: 'linear',
      angle: 45,
      stops: [
        { color: '#74b9ff', position: 0 },
        { color: '#0984e3', position: 100 },
      ],
    },
  },
  {
    name: 'Midnight Blue',
    gradient: {
      type: 'linear',
      angle: 90,
      stops: [
        { color: '#2c3e50', position: 0 },
        { color: '#3498db', position: 100 },
      ],
    },
  },
];

// Color theory based random gradient generator
export class GradientGenerator {
  // Helper function to clamp values between 0 and 100
  private static clamp(value: number, min: number = 0, max: number = 100): number {
    return Math.max(min, Math.min(max, value));
  }

  // Convert hex to HSL for better color manipulation
  private static hexToHsl(hex: string): [number, number, number] {
    // Validate hex input
    if (!hex || !hex.startsWith('#') || hex.length !== 7) {
      console.warn('Invalid hex color input:', hex);
      return [240, 70, 50]; // Default blue color as fallback
    }
    
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  }

  // Convert HSL back to hex
  private static hslToHex(h: number, s: number, l: number): string {
    // Validate inputs and handle edge cases
    if (isNaN(h) || isNaN(s) || isNaN(l)) {
      console.warn('Invalid HSL values:', { h, s, l });
      return '#3b82f6'; // Default blue color as fallback
    }
    
    h = (h % 360) / 360; // Ensure h is between 0 and 1
    s = Math.max(0, Math.min(100, s)) / 100; // Clamp s between 0 and 1
    l = Math.max(0, Math.min(100, l)) / 100; // Clamp l between 0 and 1

    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number): string => {
      const clamped = Math.max(0, Math.min(1, c)); // Ensure c is between 0 and 1
      const hex = Math.round(clamped * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    const result = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    
    // Debug logging - remove later
    if (result.includes('NaN') || result.length !== 7) {
      console.warn('Invalid hex color generated:', { h, s, l, r, g, b, result });
    }
    
    return result;
  }

  // Generate analogous colors (colors next to each other on color wheel)
  static generateAnalogous(baseColor: string): GradientConfig {
    const [h, s, l] = this.hexToHsl(baseColor);
    const hueShift = 30 + Math.random() * 30; // 30-60 degree shift
    
    const color1 = this.hslToHex(h, s, l);
    const color2 = this.hslToHex((h + hueShift) % 360, this.clamp(s * 0.8), this.clamp(l * 1.1));
    const color3 = this.hslToHex((h + hueShift * 2) % 360, this.clamp(s * 0.9), this.clamp(l * 0.9));

    return {
      type: 'linear',
      angle: Math.floor(Math.random() * 360),
      stops: [
        { color: color1, position: 0 },
        { color: color2, position: 50 },
        { color: color3, position: 100 },
      ],
    };
  }

  // Generate complementary colors (opposite on color wheel)
  static generateComplementary(baseColor: string): GradientConfig {
    const [h, s, l] = this.hexToHsl(baseColor);
    const complementaryHue = (h + 180) % 360;
    
    const color1 = this.hslToHex(h, s, l);
    const color2 = this.hslToHex(complementaryHue, this.clamp(s * 0.8), this.clamp(l * 1.1));

    return {
      type: 'linear',
      angle: Math.floor(Math.random() * 360),
      stops: [
        { color: color1, position: 0 },
        { color: color2, position: 100 },
      ],
    };
  }

  // Generate triadic colors (120 degrees apart)
  static generateTriadic(baseColor: string): GradientConfig {
    const [h, s, l] = this.hexToHsl(baseColor);
    
    const color1 = this.hslToHex(h, s, l);
    const color2 = this.hslToHex((h + 120) % 360, this.clamp(s * 0.9), this.clamp(l * 1.05));
    const color3 = this.hslToHex((h + 240) % 360, this.clamp(s * 0.85), this.clamp(l * 0.95));

    return {
      type: 'linear',
      angle: Math.floor(Math.random() * 360),
      stops: [
        { color: color1, position: 0 },
        { color: color2, position: 50 },
        { color: color3, position: 100 },
      ],
    };
  }

  // Generate monochromatic gradient (same hue, different saturation/lightness)
  static generateMonochromatic(baseColor: string): GradientConfig {
    const [h, s, l] = this.hexToHsl(baseColor);
    
    const color1 = this.hslToHex(h, this.clamp(s * 0.7), this.clamp(l * 1.2));
    const color2 = this.hslToHex(h, s, l);
    const color3 = this.hslToHex(h, this.clamp(s * 1.2), this.clamp(l * 0.8));

    return {
      type: 'linear',
      angle: Math.floor(Math.random() * 360),
      stops: [
        { color: color1, position: 0 },
        { color: color2, position: 50 },
        { color: color3, position: 100 },
      ],
    };
  }

  // Generate a completely random but harmonious gradient
  static generateRandom(): GradientConfig {
    const baseHue = Math.floor(Math.random() * 360);
    const baseSaturation = 60 + Math.random() * 40; // 60-100%
    const baseLightness = 50 + Math.random() * 30;  // 50-80%
    
    const baseColor = this.hslToHex(baseHue, baseSaturation, baseLightness);
    
    // Randomly choose a color harmony type
    const harmonyTypes = ['analogous', 'complementary', 'triadic', 'monochromatic'];
    const randomHarmony = harmonyTypes[Math.floor(Math.random() * harmonyTypes.length)];
    
    switch (randomHarmony) {
      case 'analogous':
        return this.generateAnalogous(baseColor);
      case 'complementary':
        return this.generateComplementary(baseColor);
      case 'triadic':
        return this.generateTriadic(baseColor);
      case 'monochromatic':
        return this.generateMonochromatic(baseColor);
      default:
        return this.generateAnalogous(baseColor);
    }
  }
}
