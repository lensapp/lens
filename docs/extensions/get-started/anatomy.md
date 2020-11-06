# Extension Anatomy

You've now learnt how to get basic extension running. In this topic you will learn some fundamental concepts to Lens Extension development; How does it work under the hood?

`Hello World` extension does three things:

- Hooks on `onActivate()` and ouputs message into console.
- Hooks on `onDectivate()` and ouputs message into console.
- Registers `ClusterPage` so that page is visible in the sidebars of cluster dashboards.

Let's take a closer look at Hello World sample's source code and see how to achieve these things.

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

Extension directory contains extension's entry files and few configuration files. Let's focus on `package.json`, `main.ts` and `renderer.tsx` which are essential to understanding the `Hello World` extension.

### Extension Manifest

Each Lens extension must have `package.json`. The `package.json` contains a mix of Node.js fields such as scripts and dependencies and Lens specific fields such as `publisher` and `contributes`. Here are some most important fields:

- `name` and `publisher`: Lens uses `@<publisher>/<name>` as a unique ID for the extension. For example, the Hello World sample has the ID `@lensapp-samples/helloworld-sample`. Lens uses the ID to uniquely identify your extension
- `main`: The extension's entry point run in `main` process.
- `renderer`: The extension's entry point run in `renderer` process.
- `engines.lens`: This specifies the minimum version of Lens API that the extension depends on.

``` javascript
{
  "name": "helloworld-sample",
  "publisher": "lens-samples",
  "version": "0.0.1",
  "description": "Lens helloworld-sample",
  "license": "MIT",
  "homepage": "https://github.com/lensapp/lens-extension-samples",
  "engines": {
    "lens": "^4.0.0"
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
    "@k8slens/extensions": "^4.0.0-alpha.2",
    "ts-loader": "^8.0.4",
    "typescript": "^4.0.3",
    "@types/react": "^16.9.35",
    "@types/node": "^12.0.0",
    "webpack": "^4.44.2",
    "webpack-cli": "^3.3.11"
  }
}
```

## Extension Entry Files
Lens extensions can have two separate entry files. One file that is used in `main` process of Lens application and antoher that is used in `renderer` process. `main` entry file should export class that extends `LensMainExtension` and `renderer` entry file should export class that extends `LensRendererExtension`.

Both extensions classes have `onActivate` and `onDeactivate` methods. `onActivate` is executed when your extension activation happens. You may want to initialize something in your extension at this point. `onDeactivate` gives you a chance to clean up before your extension becomes deactivated. For many extensions, explicit cleanup may not be required, and you don't need to override this method. However, if an extension needs to perform an operation when Lens is shutting down or the extension is disabled or uninstalled, this is the method to do so.

`Hello world` extension does not do anything special on `main` process, so let's focus on the `renderer` side. On `renderer` entry point, `Hello world` extension defines one `Cluster Page` object that registers `/extension-example` path that renders `ExamplePage` React component. It registers also `MenuItem` component that displays `ExampleIcon` React component and "Hello World" text in the sidebar of cluster dashboards. These React components are defined in additional `./src/page.tsx` file.

``` typescript
import { LensRendererExtension } from "@k8slens/extensions";
import { ExampleIcon, ExamplePage } from "./page"
import React from "react"

export default class ExampleExtension extends LensRendererExtension {
  clusterPages = [
    {
      path: "/extension-example",
      title: "Hello World",
      components: {
        Page: () => <ExamplePage extension={this}/>,
        MenuIcon: ExampleIcon,
      }
    }
  ]
}
```

`Hello World` extension uses only one capability (`Cluster Page`) of Lens extensions. The [Extension Capabilities Overview](/extensions/capabilities/) topic helps you find the right capabilities you can use with your own extension.