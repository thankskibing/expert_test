/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F7F9',
        ink: '#1B2230',
        slate: '#5B6475',
        rule: '#DCE0E7',
        pa: '#E0533F',
        pb: '#3A74D8',
        pc: '#22A06B',
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif KR"', 'serif'],
      },
      maxWidth: { prose2: '46rem' },
    },
  },
  plugins: [],
}
