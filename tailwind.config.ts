const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        sm: '0.875rem', // 14px
        base: '1rem',    // 16px
        lg: '1.125rem',  // 18px
        xl: '1.25rem',   // 20px
        '2xl': '1.5rem',   // 24px
      },
      colors: {
        primary: {
          50: '#f7fee7',
          100: '#ecfccb',
          500: '#10b981', // emerald-500과 동일
        },
        secondary: {
          500: '#3b82f6', // blue-500과 동일
        },
        neutral: {
          100: '#f3f4f6', // gray-100
          500: '#6b7280', // gray-500
          800: '#1f2937', // gray-800
        },
        status: {
          success: '#10b981', // emerald-500
          warning: '#f59e0b', // amber-500
          danger: '#ef4444', // red-500
        },
      },
      borderRadius: {
        DEFAULT: '8px', // 기본 rounded
        md: '8px',      // 버튼용
        lg: '12px',     // 카드용
      },
    },
  },
  plugins: [],
}
export default config