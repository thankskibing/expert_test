/** @type {import('tailwindcss').Config} */
// Design tokens follow the Toss Design System (toss.md): cool-blue greys, single brand blue, rounded ladder.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#3182F6', 'brand-weak': '#E8F3FF', 'brand-press': '#1B64DA',
        g50: '#F9FAFB', g100: '#F2F4F6', g200: '#E5E8EB', g300: '#D1D6DB', g400: '#B0B8C1',
        g500: '#8B95A1', g600: '#6B7684', g700: '#4E5968', g800: '#333D4B', g900: '#191F28',
        danger: '#F04452', success: '#03B26C', warning: '#FF9F2E',
        pa: '#F04452', pb: '#3182F6', pc: '#03B26C',
      },
      fontFamily: { sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', '"Apple SD Gothic Neo"', '"Noto Sans KR"', 'sans-serif'] },
      fontSize: {
        display: ['40px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        h1: ['28px', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '700' }],
        h2: ['24px', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '700' }],
        h3: ['20px', { lineHeight: '1.35', letterSpacing: '-0.015em', fontWeight: '700' }],
        t1: ['18px', { lineHeight: '1.45', letterSpacing: '-0.01em', fontWeight: '600' }],
        t2: ['17px', { lineHeight: '1.45', letterSpacing: '-0.01em', fontWeight: '600' }],
        b1: ['17px', { lineHeight: '1.5', letterSpacing: '-0.005em' }],
        b2: ['15px', { lineHeight: '1.5', letterSpacing: '-0.005em' }],
        b3: ['13px', { lineHeight: '1.5' }],
        cap: ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderRadius: { xs: '4px', s: '8px', m: '12px', l: '14px', xl: '16px', '2xl': '20px', '3xl': '24px', '4xl': '32px' },
      boxShadow: {
        e1: '0 1px 2px rgba(2,32,71,0.04), 0 1px 1px rgba(2,32,71,0.04)',
        e2: '0 4px 12px rgba(2,32,71,0.06), 0 1px 2px rgba(2,32,71,0.04)',
      },
      transitionTimingFunction: { toss: 'cubic-bezier(0.22, 0.61, 0.36, 1)' },
      maxWidth: { prose2: '44rem' },
    },
  },
  plugins: [],
}
