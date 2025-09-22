

//==============================================================
// FILE: tailwind.config.ts
// DESCRIPTION: Tailwind setup (with shadcn tokens).
//==============================================================


import type { Config } from 'tailwindcss'


const config: Config = {
darkMode: ["class"],
content: [
"./src/app/**/*.{ts,tsx}",
"./src/components/**/*.{ts,tsx}",
],
theme: {
extend: {
container: { center: true, padding: "1rem" },
borderRadius: { xl: "1rem", '2xl': "1.25rem" },
},
},
plugins: [],
}
export default config