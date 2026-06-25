import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "node_modules/**", "public/**"]),
  {
    rules: {
      // Allow explicit use of 'any'
      "@typescript-eslint/no-explicit-any": "off",
      // Allow declared variables to remain unused
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
])

export default eslintConfig
