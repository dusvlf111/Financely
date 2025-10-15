import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './pages/**/*.{ts,tsx,js,jsx}',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f7fee7',
          100: '#ecfccb',
          500: '#10b981',
        },
        secondary: {
          500: '#3b82f6'
        },
        neutral: {
          100: '#f3f4f6',
          500: '#6b7280'
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      },
      spacing: {
        '4': '1rem',
        '8': '2rem'
      },
      borderRadius: {
        sm: '8px',
        md: '12px'
      }
    }
  },
  plugins: [],
}

export default config
