# Lens Code Style

**Note:** This package contains Eslint and Prettier configurations, name of package is `@k8slens/eslint-config` just because Eslint has arbitrary requirement (https://eslint.org/docs/latest/extend/shareable-configs).

## Usage

1. Install `@k8slens/eslint-config`
2. Create `.prettierrc` that contains `"@k8slens/eslint-config/prettier"`
3. Add a `.eslintrc.js` that extends `@k8slens/eslint-config/eslint`, for example:

```
module.exports = {
  extends: "@k8slens/eslint-config/eslint",
  parserOptions: {
    project: "./tsconfig.json"
  }
};
```

4. Add linting and formatting scripts to `package.json`

```
{
  "scripts": {
    "lint": "lens-lint",
    "lint:fix": "lens-lint --fix"
  }
}
```

6. Run `npm run lint` to lint
7. Run `npm run format` to fix all formatting
