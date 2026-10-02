/** @type {import('tailwindcss').Config} */
// Design tokens follow Ant Design v6 design.md (docs/antd-design.md):
// primary #1677FF, rgba-black neutrals, 14px base, weights 400/600, radius 4/6/8, 4px grid, flat-first.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#1677FF', 'brand-hover': '#4096FF', 'brand-press': '#0958D9', 'brand-weak': '#E6F4FF', 'brand-border': '#91CAFF',
        // neutrals: surface-container / layout / outline-variant / outline / disabled / tertiary / secondary / on-surface
        g50: '#FAFAFA', g100: '#F5F5F5', g200: '#F0F0F0', g300: '#D9D9D9', g400: '#BFBFBF',
        g500: '#8C8C8C', g600: '#8C8C8C', g700: '#595959', g800: '#434343', g900: '#1F1F1F',
        danger: '#FF4D4F', success: '#52C41A', warning: '#FAAD14',
        pa: '#F5222D', pb: '#2F54EB', pc: '#52C41A',
      },
      fontFamily: { sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', '"Apple SD Gothic Neo"', '"Malgun Gothic"', '"Noto Sans KR"', 'sans-serif'] },
      fontWeight: { bold: '600', semibold: '600', medium: '400' },
      fontSize: {
        display: ['38px', { lineHeight: '46px', fontWeight: '600' }],
        h1: ['30px', { lineHeight: '38px', fontWeight: '600' }],
        h2: ['24px', { lineHeight: '32px', fontWeight: '600' }],
        h3: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        t1: ['16px', { lineHeight: '24px', fontWeight: '600' }],
        t2: ['14px', { lineHeight: '22px', fontWeight: '600' }],
        b1: ['16px', { lineHeight: '24px' }],
        b2: ['14px', { lineHeight: '22px' }],
        b3: ['12px', { lineHeight: '20px' }],
        cap: ['12px', { lineHeight: '20px' }],
      },
      // tags 4px · controls 6px · surfaces 8px (full pill only for avatars, badges, dots)
      borderRadius: { xs: '2px', s: '4px', m: '6px', l: '6px', xl: '8px', '2xl': '8px', '3xl': '8px', '4xl': '8px' },
      boxShadow: {
        e1: '0 1px 2px 0 rgba(0,0,0,0.05), 0 1px 6px -1px rgba(0,0,0,0.03), 0 2px 4px 0 rgba(0,0,0,0.03)',
        e2: '0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)',
        focus: '0 0 0 2px rgba(5,145,255,0.1)',
      },
      transitionTimingFunction: { DEFAULT: 'cubic-bezier(0.645, 0.045, 0.355, 1)' },
      maxWidth: { prose2: '44rem' },
    },
  },
  plugins: [],
}
