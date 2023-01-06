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
            },
			backgroundImage: {
				"google": "url('/assets/google-login.svg')",
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
