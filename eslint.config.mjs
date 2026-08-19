import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import noShellNavigation from "./eslint-rules/no-shell-navigation.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["components/apps/**/*.{ts,tsx}"],
    plugins: {
      shell: { rules: { "no-shell-navigation": noShellNavigation } },
    },
    rules: {
      "shell/no-shell-navigation": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
