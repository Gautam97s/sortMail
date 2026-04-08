import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// Core palette (backed by CSS variables in src/styles/globals.css)
				primary: {
					DEFAULT: 'var(--primary)',
					fixed: 'var(--primary-fixed)',
					dim: 'color-mix(in srgb, var(--primary) 65%, white 35%)',
					container: 'var(--primary-container)',
					foreground: 'var(--primary-foreground)'
				},
				'on-primary': 'var(--on-primary)',
				secondary: {
					DEFAULT: 'var(--secondary)',
					fixed: 'var(--secondary-fixed)',
					'fixed-dim': 'color-mix(in srgb, var(--secondary) 55%, white 45%)',
					container: 'var(--secondary-container)',
					foreground: 'var(--secondary-foreground)'
				},
				'on-secondary': 'var(--on-secondary)',
				tertiary: {
					DEFAULT: 'var(--tertiary)',
					fixed: 'var(--tertiary-fixed)',
					'fixed-dim': 'color-mix(in srgb, var(--tertiary) 60%, white 40%)',
					container: 'var(--tertiary-container)',
				},
				'on-tertiary': 'var(--on-tertiary)',
				surface: {
					DEFAULT: 'var(--surface)',
					bright: 'var(--surface-bright)',
					dim: 'var(--surface-dim)',
					variant: 'var(--surface-variant)',
					container: {
						DEFAULT: 'var(--surface-container)',
						low: 'var(--surface-container-low)',
						lowest: 'var(--surface-container-lowest)',
						high: 'var(--surface-container-high)',
						highest: 'var(--surface-container-highest)',
					},
					tint: 'var(--primary)',
				},
				'on-surface': {
					DEFAULT: 'var(--on-surface)',
					variant: 'var(--on-surface-variant)',
				},
				outline: {
					DEFAULT: 'var(--outline)',
					variant: 'var(--outline-variant)',
				},
				error: {
					DEFAULT: 'var(--error)',
					container: 'var(--error-container)',
				},

				// Shadcn/Legacy mappings
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				card: {
					DEFAULT: 'var(--card)',
					foreground: 'var(--card-foreground)'
				},
				popover: {
					DEFAULT: 'var(--popover)',
					foreground: 'var(--popover-foreground)'
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					foreground: 'var(--destructive-foreground)'
				},
				'muted-foreground': 'var(--muted-foreground)',
				input: 'var(--input)',
				ring: 'var(--ring)',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			fontFamily: {
				headline: ['var(--font-jakarta)', 'sans-serif'],
				body: ['var(--font-inter)', 'sans-serif'],
				label: ['var(--font-inter)', 'sans-serif'],
				display: ['var(--font-jakarta)', 'sans-serif'],
				mono: ['var(--font-jetbrains)', 'monospace']
			},
			fontSize: {
				xs: '12px',
				sm: '14px',
				base: '16px',
				md: '18px',
				lg: '24px',
				xl: '32px',
				'2xl': '40px'
			},
			spacing: {
				'sb': '256px',
				'tb': '64px',
			},
			borderRadius: {
				sm: '0.25rem',
				md: '0.5rem',
				lg: '0.75rem',
				xl: '1rem',
				'2xl': '1.5rem',
				full: '9999px'
			},
			boxShadow: {
				sm: '0 1px 3px rgba(10, 10, 15, 0.06)',
				md: '0 4px 12px rgba(10, 10, 15, 0.08)',
				lg: '0 8px 32px rgba(10, 10, 15, 0.12)',
				xl: '0 16px 48px rgba(10, 10, 15, 0.16)'
			},
			transitionDuration: {
				instant: '80ms',
				fast: '150ms',
				normal: '250ms',
				slow: '400ms'
			},
			transitionTimingFunction: {
				'ease-out-custom': 'cubic-bezier(0, .6, .4, 1)',
				'ease-spring': 'cubic-bezier(.34, 1.56, .64, 1)'
			},
			animation: {
				'fade-up': 'fadeUp 300ms ease-out',
				'fade-in': 'fadeIn 200ms ease-out',
				'slide-in-right': 'slideInRight 250ms ease-out',
				'shimmer': 'shimmer 1.4s ease-in-out infinite',
				'pulse-dot': 'pulse-dot 2s ease-in-out infinite'
			},
			keyframes: {
				fadeUp: {
					'0%': {
						opacity: '0',
						transform: 'translateY(12px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				fadeIn: {
					'0%': {
						opacity: '0'
					},
					'100%': {
						opacity: '1'
					}
				},
				slideInRight: {
					'0%': {
						opacity: '0',
						transform: 'translateX(16px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				shimmer: {
					'0%': {
						backgroundPosition: '-200% 0'
					},
					'100%': {
						backgroundPosition: '200% 0'
					}
				},
				'pulse-dot': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '.4'
					}
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};

export default config;
