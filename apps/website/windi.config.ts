import { defineConfig } from 'vite-plugin-windicss'
import defaultTheme from 'windicss/defaultTheme'

export default defineConfig({
  darkMode: 'class',
  extract: {
    include: ['index.html', 'src/**/*.{vue,html,js,ts}'],
  },
  plugins: [
    require('windicss/plugin/typography'),
    require('windicss/plugin/forms'),
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: false,
            h1: {
              fontWeight: '700',
              marginTop: false,
              marginBottom: false,
              margin: '0',
            },
            figure: {
              marginTop: false,
            },
            img: {
              borderRadius: '.25rem',
              border: '1px solid #D1D5DB',
            },
          },
        },
      },
    },
    fontFamily: {
      sans: ['Merriweather Sans', ...defaultTheme.fontFamily.sans],
      mono: ['Fira Code', defaultTheme.fontFamily.mono],
    },
    screens: {
      sm: '640px',
      md: '768px',
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
      },
      css: {
        padding: '1rem',
      },
    },
  },
})
