# Extension Anatomy

In the [previous section](your-first-extension.md) you learned how to create your first extension.
In this section you will learn how this extension works under the hood.

The Hello World sample extension does three things:

- Implements `onActivate()` and outputs a message to the console.
- Implements `onDeactivate()` and outputs a message to the console.
- Registers `ClusterPage` so that the page is visible in the left-side menu of the cluster dashboard.

Let's take a closer look at our Hello World sample's source code and see how these three things are achieved.

## Extension File Structure

```
.
├── .gitignore          // Ignore build output and node_modules
├── Makefile            // Config for build tasks that compiles the extension
├── README.md           // Readable description of your extension's functionality
├── src
│   └── page.tsx         // Extension's additional source code
├── main.ts              // Source code for extension's main entrypoint
├── package.json         // Extension manifest and dependencies
├── renderer.tsx         // Source code for extension's renderer entrypoint
├── tsconfig.json        // TypeScript configuration
├── webpack.config.js    // Webpack configuration
```

The extension directory contains the extension's entry files and a few configuration files.
Three files: `package.json`, `main.ts` and `renderer.tsx` are essential to understanding the Hello World sample extension.
We'll look at those first.

### Extension Manifest

Each Lens extension must have a `package.json` file.
It contains a mix of Node.js fields, including scripts and dependencies, and Lens-specific fields such as `publisher` and `contributes`.
Some of the most-important fields include:

- `name` and `publisher`: Lens uses `@<publisher>/<name>` as a unique ID for the extension.
  For example, the Hello World sample has the ID `@lensapp-samples/helloworld-sample`.
  Lens uses this ID to uniquely identify your extension.
- `main`: the extension's entry point run in `main` process.
- `renderer`: the extension's entry point run in `renderer` process.
- `engines.lens`: the minimum version of Lens API that the extension depends upon.
  We only support the `^` range, which is also optional to specify, and only major and minor version numbers.
  Meaning that `^5.4` and `5.4` both mean the same thing, and the patch version in `5.4.2` is ignored.

```javascript
{
  "name": "helloworld-sample",
  "publisher": "lens-samples",
  "version": "0.0.1",
  "description": "Lens helloworld-sample",
  "license": "MIT",
  "homepage": "https://github.com/lensapp/lens-extension-samples",
  "engines": {
    "node": "^16.14.2",
    "lens": "5.4"
  },
  "main": "dist/main.js",
  "renderer": "dist/renderer.js",
  "scripts": {
    "build": "webpack --config webpack.config.js",
    "dev": "npm run build --watch"
  },
  "dependencies": {
    "react-open-doodles": "^1.0.5"
  },
  "devDependencies": {
    "@k8slens/extensions": "^5.4.6",
    "ts-loader": "^8.0.4",
    "typescript": "^4.5.5",
    "@types/react": "^17.0.44",
    "@types/node": "^16.14.2",
    "webpack": "^4.44.2",
    "webpack-cli": "^3.3.11"
  }
}
```

## Webpack configuration

The following webpack `externals` are provided by `Lens` and must be used (when available) to make sure that the versions used are in sync.

| Package            | webpack external syntax     | Lens versions | Available in Main | Available in Renderer |
| ------------------ | --------------------------- | ------------- | ----------------- | --------------------- |
| `mobx`             | `var global.Mobx`           | `>5.0.0`      | ✅                | ✅                    |
| `mobx-react`       | `var global.MobxReact`      | `>5.0.0`      | ❌                | ✅                    |
| `react`            | `var global.React`          | `>5.0.0`      | ❌                | ✅                    |
| `react-router`     | `var global.ReactRouter`    | `>5.0.0`      | ❌                | ✅                    |
| `react-router-dom` | `var global.ReactRouterDom` | `>5.0.0`      | ❌                | ✅                    |
| `react-dom`        | `var global.ReactDOM`       | `>5.5.0`      | ❌                | ✅                    |

What is exported is the whole of the packages as a `*` import (within typescript).

For example, the following is how you would specify these within your webpack configuration files.

```json
{
  ...
  "externals": [
    ...
    {
      "mobx": "var global.Mobx"
      "mobx-react": "var global.MobxReact"
      "react": "var global.React"
      "react-router": "var global.ReactRouter"
      "react-router-dom": "var global.ReactRouterDom"
      "react-dom": "var global.ReactDOM"
    }
  ]
}
```

## Extension Entry Files

Lens extensions can have two separate entry files.
One file is used in the `main` process of the Lens application and the other is used in the `renderer` process.
The `main` entry file exports the class that extends `LensMainExtension`, and the `renderer` entry file exports the class that extends `LensRendererExtension`.

Both extension classes have `onActivate` and `onDeactivate` methods.
The `onActivate` method is executed when your extension is activated.
If you need to initialize something in your extension, this is where such an operation should occur.
The `onDeactivate` method gives you a chance to clean up before your extension becomes deactivated.
For extensions where explicit cleanup is not required, you don't need to override this method.
However, if an extension needs to perform an operation when Lens is shutting down (or if the extension is disabled or uninstalled), this is the method where such an operation should occur.

The Hello World sample extension does not do anything on the `main` process, so we'll focus on the `renderer` process, instead.
On the `renderer` entry point, the Hello World sample extension defines the `Cluster Page` object.
The `Cluster Page` object registers the `/extension-example` path, and this path renders the `ExamplePage` React component.
It also registers the `MenuItem` component that displays the `ExampleIcon` React component and the "Hello World" text in the left-side menu of the cluster dashboard.
These React components are defined in the additional `./src/page.tsx` file.

```typescript
import { Renderer } from "@k8slens/extensions";
import { ExampleIcon, ExamplePage } from "./page";
import React from "react";

export default class ExampleExtension extends Renderer.LensExtension {
  clusterPages = [
    {
      id: "extension-example",
      components: {
        Page: () => <ExamplePage extension={this} />,
      },
    },
  ];
}
```

The Hello World sample extension uses the `Cluster Page` capability, which is just one of the Lens extension API's capabilities.
The [Common Capabilities](../capabilities/common-capabilities.md) page will help you home in on the right capabilities to use with your own extensions.
