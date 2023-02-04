/** @type {import('tailwindcss').Config} */
module.exports = {
    mode: process.env.TAILWIND_MODE ? 'jit' : '',
    content: [
        './apps/playground/**/*.{html,ts}',
        './libs/heroicon/**/*.{html,ts}'
    ],
    theme: {
        extend: {}
    },
    plugins: []
};
