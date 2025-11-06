export const themeColors = {
  sky: { 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7' },
  rose: { 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48' },
  teal: { 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488' },
  violet: { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed' },
  orange: { 400: '#fb923c', 500: '#f97316', 600: '#ea580c' },
  amber: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
};

export type ThemeName = keyof typeof themeColors;
