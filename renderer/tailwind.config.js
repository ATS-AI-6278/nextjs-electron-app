/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    bg: '#0f172a',
                    card: '#1e293b',
                    border: '#334155',
                },
            },
        },
    },
    plugins: [],
}
