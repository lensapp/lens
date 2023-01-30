# @k8slens/webpack

This package contains webpack configurations for Lens packages.

## Install

```
$ npm install @k8slens/webpack
```

## Features

### Configurations

### Node package
This configuration should be used when creating package that will be executed within **Node** environment. 

**webpack.config.js**
```javascript
module.exports = require("@k8slens/webpack").configForNode;
```
### React package
This configuration should be used when creating package tha will be executed within **Browser** environment.

**webpack.config.js**
```javascript
module.exports = require("@k8slens/webpack").configForReact;
```

### Multi export package

This configuration should be used when package contains **multiple entrypoint** e.g. for different environments. You need to add `lensMultiExportConfig` to `package.json` with configuration. Note that also `exports` property needs to be set, but the correct values are generated from `lensMultiExportConfig` when using `lens-build` -script.

**webpack.config.js**
```javascript
const packageJson = require("./package.json");

module.exports = require("@k8slens/webpack").getMultiExportConfig(packageJson);
```

**package.json**
```json
{
  "lensMultiExportConfig": {
    "./main": {
      "buildType": "node",
      "entrypoint": "./src/main/index.ts"
    },
    "./renderer": {
      "buildType": "react",
      "entrypoint": "./src/renderer/index.ts"
    }
  },

  "exports": {
    "./main": {
      "types": "./build/main/index.d.ts",
      "require": "./build/main/index.js",
      "import": "./build/main/index.js",
      "default": "./build/main/index.js"
    },
    "./renderer": {
      "types": "./build/renderer/index.d.ts",
      "require": "./build/renderer/index.js",
      "import": "./build/renderer/index.js",
      "default": "./build/renderer/index.js"
    }
  }
}
```

## Scripts

1. `lens-build` which builds the packages
2. `lens-remove-build` which removes the build directory from packages. It's useful for cleaning up.

