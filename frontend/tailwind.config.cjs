/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
        extend: {
            transitionProperty: {
                height: 'height'
            }
        }
  	},
  variants: {
		extend: {
			display: ["group-hover"],
		},
	},
  plugins: [],
}
