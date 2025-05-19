/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'
    ],
    theme: {
        extend: {
            colors: {
                // Main accent color and variants
                accent: {
                    DEFAULT: 'var(--accent)',
                    dark: 'var(--accent-dark)',
                },
                // Theme colors that adapt between light/dark modes
                theme: {
                    bg: 'var(--theme-bg)',
                    text: 'var(--theme-text)',
                    accent: 'var(--theme-accent)',
                    'accent-dark': 'var(--theme-accent-dark)',
                    'code-bg': 'var(--theme-code-bg)',
                    'code-text': 'var(--theme-code-text)',
                    'selection-bg': 'var(--theme-selection-bg)',
                    'header-bg': 'var(--theme-header-bg)',
                    'header-text': 'var(--theme-header-text)',
                    border: 'var(--theme-border)',
                    'blockquote-bg': 'var(--theme-blockquote-bg)',
                    'card-bg': 'var(--theme-card-bg)',
                    'table-header-bg': 'var(--theme-table-header-bg)',
                    'table-row-even': 'var(--theme-table-row-even)',
                },
                // Base gray scale as RGB values for opacity adjustments
                black: 'rgb(var(--black) / <alpha-value>)',
                gray: {
                    DEFAULT: 'rgb(var(--gray) / <alpha-value>)',
                    light: 'rgb(var(--gray-light) / <alpha-value>)',
                    dark: 'rgb(var(--gray-dark) / <alpha-value>)',
                },
                // Code block colors
                code: {
                    bg: 'var(--code-bg)',
                    fg: 'var(--code-fg)',
                }
            },
            fontFamily: {
                // Use 'Atkinson' font from the project
                sans: ['"Atkinson"', 'sans-serif'],
                // Add any other custom fonts here
            },
            typography: {
                // Base typography scale from CSS variables
                DEFAULT: {
                    css: {
                        fontSize: 'var(--base-font-size)',
                        lineHeight: 'var(--base-line-height)',
                    }
                }
            },
            boxShadow: {
                // Custom shadows from CSS variables
                DEFAULT: 'var(--box-shadow)',
                sm: 'var(--box-shadow-small)',
                hover: 'var(--box-shadow-hover)',
            },
            // Custom breakpoints to match CSS variables
            screens: {
                'mobile-sm': 'var(--mobile-sm)',
                'mobile': 'var(--mobile)',
                'tablet-sm': 'var(--tablet-sm)',
                'tablet': 'var(--tablet)',
                'desktop-sm': 'var(--desktop-sm)',
                'desktop': 'var(--desktop)',
                'desktop-lg': 'var(--desktop-lg)',
                'desktop-xl': 'var(--desktop-xl)',
            },
            // Additional utilities for transitions
            transitionProperty: {
                'theme': 'var(--theme-transition)',
            }
        },
    },
    // Enable dark mode using class strategy to match the current implementation
    darkMode: 'class',
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/line-clamp'),
    ],
} 