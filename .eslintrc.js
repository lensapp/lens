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
    "extensions/*/*.tgz",
  ],
  settings: {
    react: {
      version: packageJson.devDependencies.react || "detect",
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
        "**/*.tsx",
      ],
      parser: "@typescript-eslint/parser",
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
      ],
      plugins: [
        "header",
        "unused-imports",
        "react-hooks",
      ],
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
      },
      rules: {
        "no-constant-condition": ["error", {
          "checkLoops": false,
        }],
        "header/header": [2, "./license-header"],
        "react/prop-types": "off",
        "no-invalid-this": "off",
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
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "no-restricted-imports": ["error", {
          "paths": [
            {
              "name": ".",
              "message": "No importing from local index.ts(x?) file. A common way to make circular dependencies.",
            },
          ],
        }],
        "@typescript-eslint/member-delimiter-style": ["error", {
          "multiline": {
            "delimiter": "semi",
            "requireLast": true,
          },
          "singleline": {
            "delimiter": "semi",
            "requireLast": false,
          },
        }],
        "react/jsx-max-props-per-line": ["error", {
          "maximum": {
            "single": 2,
            "multi": 1,
          },
        }],
        "react/jsx-first-prop-new-line": ["error", "multiline"],
        "react/jsx-one-expression-per-line": ["error", {
          "allow": "single-child",
        }],
        "react/jsx-indent": ["error", 2],
        "react/jsx-indent-props": ["error", 2],
        "react/jsx-closing-tag-location": "error",
        "react/jsx-wrap-multilines": ["error", {
          "declaration": "parens-new-line",
          "assignment": "parens-new-line",
          "return": "parens-new-line",
          "arrow": "parens-new-line",
          "condition": "parens-new-line",
          "logical": "parens-new-line",
          "prop": "parens-new-line",
        }],
        "react/display-name": "off",
        "space-before-function-paren": "off",
        "@typescript-eslint/space-before-function-paren": ["error", {
          "anonymous": "always",
          "named": "never",
          "asyncArrow": "always",
        }],
        "@typescript-eslint/naming-convention": ["error",
          {
            "selector": "interface",
            "format": ["PascalCase"],
            "leadingUnderscore": "forbid",
            "trailingUnderscore": "forbid",
            "custom": {
              "regex": "^Props$",
              "match": false,
            },
          },
          {
            "selector": "typeAlias",
            "format": ["PascalCase"],
            "leadingUnderscore": "forbid",
            "trailingUnderscore": "forbid",
            "custom": {
              "regex": "^(Props|State)$",
              "match": false,
            },
          },
        ],
        "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
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
        "@typescript-eslint/consistent-type-imports": "error",
      },
    },
    {
      files: [
        "src/{common,main,renderer}/**/*.ts",
        "src/{common,main,renderer}/**/*.tsx",
      ],
      rules: {
        "no-restricted-imports": ["error", {
          "paths": [
            {
              "name": ".",
              "message": "No importing from local index.ts(x?) file. A common way to make circular dependencies.",
            },
          ],
          "patterns": [
            {
              "group": [
                "**/extensions/renderer-api/**/*",
                "**/extensions/main-api/**/*",
                "**/extensions/common-api/**/*",
              ],
              message: "No importing from the extension api definitions in application code",
            },
          ],
        }],
      },
    },
  ],
};
