/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary: '#2563eb',
				'primary-dark': '#1d4ed8',
				secondary: '#8b5cf6',
				accent: '#06b6d4',
				background: '#0f172a',
				surface: '#1e293b',
				text: '#f8fafc',
				'text-muted': '#94a3b8',
				border: '#334155',
				success: '#10b981',
				warning: '#f59e0b',
				error: '#ef4444',
			},
			animation: {
				'gradient-shift': 'gradientShift 15s ease infinite',
				'float': 'float 8s ease-in-out infinite',
				'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'sparkle': 'sparkle 3s linear infinite',
				'drift': 'drift 20s linear infinite',
				'shimmer': 'shimmer 3s ease-in-out infinite',
				'particle-move': 'particleMove 20s ease-in-out infinite',
			},
			keyframes: {
				gradientShift: {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'50%': { transform: 'translateY(-20px) rotate(2deg)' },
				},
				sparkle: {
					'0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
					'50%': { opacity: '1', transform: 'scale(1.1)' },
				},
				drift: {
					'0%': { transform: 'translateX(-50px) translateY(-50px)' },
					'100%': { transform: 'translateX(100vw) translateY(100vh)' },
				},
				shimmer: {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
				},
				particleMove: {
					'0%, 100%': { 
						backgroundPosition: '0% 0%, 100% 100%, 50% 100%',
						opacity: '0.5'
					},
					'25%': { 
						backgroundPosition: '100% 0%, 0% 100%, 0% 50%',
						opacity: '0.8'
					},
					'50%': { 
						backgroundPosition: '100% 100%, 0% 0%, 100% 0%',
						opacity: '0.6'
					},
					'75%': { 
						backgroundPosition: '0% 100%, 100% 0%, 50% 50%',
						opacity: '0.9'
					},
				},
			},
			backdropBlur: {
				'xs': '2px',
			},
			boxShadow: {
				'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
				'glow-purple': '0 0 20px rgba(147, 51, 234, 0.5)',
				'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.5)',
				'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
				'glass-hover': '0 12px 48px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
			},
		},
	},
	plugins: [],
}