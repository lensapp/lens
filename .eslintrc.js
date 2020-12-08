const packageJson = require("./package.json");

module.exports = {
  ignorePatterns: [
    "**/node_modules/**/*",
    "**/dist/**/*",
    "**/static/**/*",
  ],
  settings: {
    react: {
      version: packageJson.devDependencies.react || "detect",
    }
  },
  overrides: [
    {
      files: [
        "**/*.js"
      ],
      extends: [
        "eslint:recommended",
      ],
      env: {
        node: true
      },
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
      },
      plugins: [
        "unused-imports"
      ],
      rules: {
        "indent": ["error", 2, {
          "SwitchCase": 1,
        }],
        "no-invalid-this": "error",
        "no-unused-vars": "off",
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": [
          "warn", {
            "vars": "all",
            "args": "after-used",
            "ignoreRestSiblings": true,
          }
        ],
        "quotes": ["error", "double", {
          "avoidEscape": true,
          "allowTemplateLiterals": true,
        }],
        "semi": ["error", "always"],
        "object-shorthand": "error",
        "prefer-template": "error",
        "template-curly-spacing": "error",
        "padding-line-between-statements": [
          "error",
          { "blankLine": "always", "prev": "*", "next": "return" },
          { "blankLine": "always", "prev": "*", "next": "block-like" },
          { "blankLine": "always", "prev": "*", "next": "function" },
          { "blankLine": "always", "prev": "*", "next": "class" },
          { "blankLine": "always", "prev": ["const", "let", "var"], "next": "*" },
          { "blankLine": "any", "prev": ["const", "let", "var"], "next": ["const", "let", "var"]},
        ]
      }
    },
    {
      files: [
        "**/*.ts",
      ],
      parser: "@typescript-eslint/parser",
      extends: [
        "plugin:@typescript-eslint/recommended",
      ],
      plugins: [
        "unused-imports"
      ],
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
      },
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "unused-imports/no-unused-imports-ts": "error",
        "unused-imports/no-unused-vars-ts": [
          "warn", {
            "vars": "all",
            "args": "after-used",
            "ignoreRestSiblings": true,
          }
        ],
        "indent": ["error", 2, {
          "SwitchCase": 1,
        }],
        "no-invalid-this": "error",
        "quotes": ["error", "double", {
          "avoidEscape": true,
          "allowTemplateLiterals": true,
        }],
        "semi": "off",
        "@typescript-eslint/semi": ["error"],
        "object-shorthand": "error",
        "prefer-template": "error",
        "template-curly-spacing": "error",
        "padding-line-between-statements": [
          "error",
          { "blankLine": "always", "prev": "*", "next": "return" },
          { "blankLine": "always", "prev": "*", "next": "block-like" },
          { "blankLine": "always", "prev": "*", "next": "function" },
          { "blankLine": "always", "prev": "*", "next": "class" },
          { "blankLine": "always", "prev": ["const", "let", "var"], "next": "*" },
          { "blankLine": "any", "prev": ["const", "let", "var"], "next": ["const", "let", "var"]},
        ]
      },
    },
    {
      files: [
        "**/*.tsx",
      ],
      parser: "@typescript-eslint/parser",
      plugins: [
        "unused-imports"
      ],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
      ],
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
        jsx: true,
      },
      rules: {
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
        "unused-imports/no-unused-imports-ts": "error",
        "unused-imports/no-unused-vars-ts": [
          "warn", {
            "vars": "all",
            "args": "after-used",
            "ignoreRestSiblings": true,
          }
        ],
        "indent": ["error", 2, {
          "SwitchCase": 1,
        }],
        "quotes": ["error", "double", {
          "avoidEscape": true,
          "allowTemplateLiterals": true,
        }],
        "no-invalid-this": "error",
        "semi": "off",
        "@typescript-eslint/semi": ["error"],
        "object-shorthand": "error",
        "prefer-template": "error",
        "template-curly-spacing": "error",
        "padding-line-between-statements": [
          "error",
          { "blankLine": "always", "prev": "*", "next": "return" },
          { "blankLine": "always", "prev": "*", "next": "block-like" },
          { "blankLine": "always", "prev": "*", "next": "function" },
          { "blankLine": "always", "prev": "*", "next": "class" },
          { "blankLine": "always", "prev": ["const", "let", "var"], "next": "*" },
          { "blankLine": "any", "prev": ["const", "let", "var"], "next": ["const", "let", "var"]},
        ]
      },
    }
  ]
};
