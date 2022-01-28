/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

const packageJson = require("./package.json");

module.exports = {
  ignorePatterns: [
    "**/node_modules/**/*",
    "**/dist/**/*",
    "**/static/**/*",
    "**/site/**/*",
    "**/__mocks__/**/*",
  ],
  settings: {
    react: {
      version: packageJson.devDependencies.react || "detect",
    },
    // the package eslint-import-resolver-typescript is required for this line which fixes errors when using .d.ts files
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true,
      },
    },
  },
  overrides: [
    {
      files: [
        "**/*.js",
      ],
      extends: [
        "eslint:recommended",
      ],
      env: {
        node: true,
      },
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
      },
      plugins: [
        "header",
        "unused-imports",
        "react-hooks",
      ],
      rules: {
        "no-constant-condition": ["error", { "checkLoops": false }],
        "header/header": [2, "./license-header"],
        "comma-dangle": ["error", "always-multiline"],
        "comma-spacing": "error",
        "indent": ["error", 2, {
          "SwitchCase": 1,
        }],
        "no-unused-vars": "off",
        "space-before-function-paren": ["error", {
          "anonymous": "always",
          "named": "never",
          "asyncArrow": "always",
        }],
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": [
          "warn", {
            "vars": "all",
            "args": "after-used",
            "ignoreRestSiblings": true,
          },
        ],
        "quotes": ["error", "double", {
          "avoidEscape": true,
          "allowTemplateLiterals": true,
        }],
        "object-curly-spacing": ["error", "always", {
          "objectsInObjects": false,
          "arraysInObjects": true,
        }],
        "linebreak-style": ["error", "unix"],
        "eol-last": ["error", "always"],
        "semi": ["error", "always"],
        "object-shorthand": "error",
        "prefer-template": "error",
        "template-curly-spacing": "error",
        "no-unused-expressions": "error",
        "padding-line-between-statements": [
          "error",
          { "blankLine": "always", "prev": "*", "next": "return" },
          { "blankLine": "always", "prev": "*", "next": "block-like" },
          { "blankLine": "always", "prev": "*", "next": "function" },
          { "blankLine": "always", "prev": "*", "next": "class" },
          { "blankLine": "always", "prev": ["const", "let", "var"], "next": "*" },
          { "blankLine": "any", "prev": ["const", "let", "var"], "next": ["const", "let", "var"] },
        ],
        "no-template-curly-in-string": "error",
      },
    },
    {
      files: [
        "**/*.ts",
      ],
      parser: "@typescript-eslint/parser",
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
      ],
      plugins: [
        "header",
        "unused-imports",
      ],
      parserOptions: {
        ecmaVersion: 2018,
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
        sourceType: "module",
      },
      rules: {
        "no-constant-condition": ["error", { "checkLoops": false }],
        "header/header": [2, "./license-header"],
        "no-invalid-this": "off",
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/no-invalid-this": ["error"],
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "space-before-function-paren": "off",
        "@typescript-eslint/space-before-function-paren": ["error", {
          "anonymous": "always",
          "named": "never",
          "asyncArrow": "always",
        }],
        "require-await": "error",
        "unused-imports/no-unused-imports-ts": process.env.PROD === "true" ? "error" : "warn",
        "unused-imports/no-unused-vars-ts": [
          "warn", {
            "vars": "all",
            "args": "after-used",
            "ignoreRestSiblings": true,
          },
        ],
        "comman-dangle": "off",
        "@typescript-eslint/comma-dangle": ["error", "always-multiline"],
        "comma-spacing": "off",
        "@typescript-eslint/comma-spacing": "error",
        "indent": ["error", 2, {
          "SwitchCase": 1,
        }],
        "quotes": ["error", "double", {
          "avoidEscape": true,
          "allowTemplateLiterals": true,
        }],
        "object-curly-spacing": "off",
        "@typescript-eslint/object-curly-spacing": ["error", "always", {
          "objectsInObjects": false,
          "arraysInObjects": true,
        }],
        "react/prop-types": "off",
        "semi": "off",
        "@typescript-eslint/semi": ["error"],
        "linebreak-style": ["error", "unix"],
        "eol-last": ["error", "always"],
        "object-shorthand": "error",
        "prefer-template": "error",
        "template-curly-spacing": "error",
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": "error",
        "padding-line-between-statements": [
          "error",
          { "blankLine": "always", "prev": "*", "next": "return" },
          { "blankLine": "always", "prev": "*", "next": "block-like" },
          { "blankLine": "always", "prev": "*", "next": "function" },
          { "blankLine": "always", "prev": "*", "next": "class" },
          { "blankLine": "always", "prev": ["const", "let", "var"], "next": "*" },
          { "blankLine": "any", "prev": ["const", "let", "var"], "next": ["const", "let", "var"] },
        ],
        "no-template-curly-in-string": "error",
      },
    },
    {
      files: [
        "**/*.tsx",
      ],
      parser: "@typescript-eslint/parser",
      plugins: [
        "header",
        "unused-imports",
      ],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
      ],
      parserOptions: {
        ecmaVersion: 2018,
        tsconfigRootDir: __dirname,
        sourceType: "module",
        project: ["./tsconfig.json"],
        jsx: true,
      },
      rules: {
        "no-constant-condition": ["error", { "checkLoops": false }],
        "header/header": [2, "./license-header"],
        "react/prop-types": "off",
        "no-invalid-this": "off",
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/no-invalid-this": ["error"],
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-empty-function": "off",
        "react/display-name": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "space-before-function-paren": "off",
        "@typescript-eslint/space-before-function-paren": ["error", {
          "anonymous": "always",
          "named": "never",
          "asyncArrow": "always",
        }],
        "require-await": "error",
        "unused-imports/no-unused-imports-ts": process.env.PROD === "true" ? "error" : "warn",
        "unused-imports/no-unused-vars-ts": [
          "warn", {
            "vars": "all",
            "args": "after-used",
            "ignoreRestSiblings": true,
          },
        ],
        "comman-dangle": "off",
        "@typescript-eslint/comma-dangle": ["error", "always-multiline"],
        "comma-spacing": "off",
        "@typescript-eslint/comma-spacing": "error",
        "indent": ["error", 2, {
          "SwitchCase": 1,
        }],
        "quotes": ["error", "double", {
          "avoidEscape": true,
          "allowTemplateLiterals": true,
        }],
        "object-curly-spacing": "off",
        "@typescript-eslint/object-curly-spacing": ["error", "always", {
          "objectsInObjects": false,
          "arraysInObjects": true,
        }],
        "semi": "off",
        "@typescript-eslint/semi": ["error"],
        "linebreak-style": ["error", "unix"],
        "eol-last": ["error", "always"],
        "object-shorthand": "error",
        "prefer-template": "error",
        "template-curly-spacing": "error",
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": "error",
        "padding-line-between-statements": [
          "error",
          { "blankLine": "always", "prev": "*", "next": "return" },
          { "blankLine": "always", "prev": "*", "next": "block-like" },
          { "blankLine": "always", "prev": "*", "next": "function" },
          { "blankLine": "always", "prev": "*", "next": "class" },
          { "blankLine": "always", "prev": ["const", "let", "var"], "next": "*" },
          { "blankLine": "any", "prev": ["const", "let", "var"], "next": ["const", "let", "var"] },
        ],
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "off",
        "no-template-curly-in-string": "error",
      },
    },
  ],
};
