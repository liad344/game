export default {
    content: [
      './index.html',
      './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        keyframes: {
          splash: {
            '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
            '100%': { transform: 'translateY(-50px) scale(1.5)', opacity: '0' },
          },
          shake: {
            '0%, 100%': { transform: 'translateX(0)' },
            '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
            '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
          }
        },
        animation: {
          splash: 'splash 0.8s ease-out',
          shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        },
      },
    },
    plugins: [],
  }
  