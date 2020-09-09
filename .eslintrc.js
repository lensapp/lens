module.exports = {
  overrides: [
    {
      files: [
        "src/renderer/**/*.js",
        "build/**/*.js",
      ],
      extends: [
        "eslint:recommended",
      ],
      env: {
        node: true
      },
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
      },
      rules: {
        "indent": ["error", 2],
        "no-unused-vars": "off",
        "semi": ["error", "never"],
      }
    },
    {
      files: [
        "src/renderer/**/*.tsx",
        "build/*.ts",
        "src/**/*.ts",
        "integration/**/*.ts"
      ],
      parser: "@typescript-eslint/parser",
      plugins: [
        "react",
        "unused-imports",
      ],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
      ],
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        jsx: true,
      },
      settings: {
        react: {
          version: "16.13",
        },
      },
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "no-unused-vars": "off",
        "comma-dangle": ["error", "always-multiline"],
        "object-shorthand": ["error", "always"],
        "@typescript-eslint/no-unused-vars": "off",
        "unused-imports/no-unused-vars-ts": [
          "error",
          {
            "varsIgnorePattern": "^_",
            "argsIgnorePattern": "^_",
            "ignoreRestSiblings": true,
          }
        ],
        "unused-imports/no-unused-imports-ts": "error",
        "quotes": [
          "error",
          "double",
          {
            "avoidEscape": true,
          }
        ],
        "prefer-template": "error",
        "no-useless-concat": "error",
        "@typescript-eslint/no-use-before-define": [
          "error",
          {
            "functions": false,
            "classes": false,
          }
        ],
        "no-multiple-empty-lines": [
          "error",
          {
            "max": 1,
          }
        ],
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/explicit-module-boundary-types": ["error"],
        "@typescript-eslint/ban-types": ["error"],
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/naming-convention": [
          "error",
          {
            "selector": "interface",
            "format": ["PascalCase"],
            "custom": {
              "regex": "^I[A-Z]",
              "match": false,
            },
          }
        ],
        "indent": [
          "error",
          2,
          {
            "SwitchCase": 1,
          }
        ],
        "semi": ["error", "never"],
        "react/jsx-uses-react": "error",
        "react/jsx-uses-vars": "error",
        "react/no-set-state": "error",
      },
    }
  ]
};
