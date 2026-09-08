/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint", "react-hooks", "react-refresh"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
  ],
  settings: { react: { version: "18" } },
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
  ignorePatterns: ["dist", "node_modules", "*.cjs", "vite.config.ts"],
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.test.tsx", "src/tests/**"],
      rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/unbound-method": "off",
      },
    },
  ],
};
