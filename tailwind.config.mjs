/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FCFBF7',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Lora"', 'ui-serif', 'Georgia', 'serif'],
      },
      typography: (theme) => ({
        orange: {
          css: {
            '--tw-prose-body': theme('colors.slate.700'),
            '--tw-prose-headings': theme('colors.slate.900'),
            '--tw-prose-links': theme('colors.orange.600'),
            '--tw-prose-bold': theme('colors.slate.900'),
            '--tw-prose-bullets': theme('colors.orange.400'),
            '--tw-prose-quotes': theme('colors.slate.900'),
            '--tw-prose-quote-borders': theme('colors.orange.300'),
            '--tw-prose-captions': theme('colors.slate.500'),
            '--tw-prose-code': theme('colors.orange.700'),
            '--tw-prose-th-borders': theme('colors.orange.200'),
            '--tw-prose-td-borders': theme('colors.orange.100'),
            a: {
              fontWeight: '600',
              textDecoration: 'none',
              borderBottom: `1px solid ${theme('colors.orange.300')}`,
            },
            'a:hover': {
              borderBottomColor: theme('colors.orange.600'),
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
