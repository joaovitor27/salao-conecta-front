import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  // Coloque aqui os caminhos para os arquivos que usam classes do Panda
  include: ["./src/**/*.{js,jsx,ts,tsx}"],

  // Adicione seus tokens de design
  theme: {
    tokens: {
      colors: {
        // Core Brand Colors
        background: { value: 'hsl(0 0% 100%)' },
        foreground: { value: 'hsl(220 25% 15%)' },

        // Primary - Elegant Navy Blue
        primary: {
          DEFAULT: { value: 'hsl(215 45% 25%)' },
          foreground: { value: 'hsl(0 0% 98%)' },
          light: { value: 'hsl(215 35% 35%)' },
          glow: { value: 'hsl(215 55% 65%)' },
        },

        // Secondary - Rose Gold
        secondary: {
          DEFAULT: { value: 'hsl(345 35% 75%)' },
          foreground: { value: 'hsl(220 25% 15%)' },
          deep: { value: 'hsl(345 45% 65%)' },
          light: { value: 'hsl(345 25% 85%)' },
        },
        // Adicione as outras cores aqui...
        accent: {
          DEFAULT: { value: 'hsl(12 85% 60%)' },
          foreground: { value: 'hsl(0 0% 98%)' },
          hover: { value: 'hsl(12 75% 50%)' },
        },
        beauty: {
          purple: { value: 'hsl(280 25% 70%)' },
          pink: { value: 'hsl(330 40% 80%)' },
          gold: { value: 'hsl(45 65% 75%)' },
        },
        muted: {
          DEFAULT: { value: 'hsl(220 10% 95%)' },
          foreground: { value: 'hsl(220 15% 55%)' },
        },
        border: { value: 'hsl(220 13% 91%)' },
        input: { value: 'hsl(220 13% 91%)' },
        ring: { value: 'hsl(215 45% 25%)' },
        destructive: {
          DEFAULT: { value: 'hsl(0 84.2% 60.2%)' },
          foreground: { value: 'hsl(210 40% 98%)' },
        },

      },
      // Defina outras propriedades como sombras, raios, etc
      // exemplo:
      // radii: {
      //   'radius': { value: '0.75rem' },
      //   'radius-xl': { value: '1.5rem' },
      // }
    },
  },
})