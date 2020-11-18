# New Extension Project with Generator

The [Lens Extension Generator](https://github.com/lensapp/generator-lens-ext) scaffolds a project ready for development. Install Yeoman and Lens Extension Generator with:

```bash
npm install -g yo generator-lens-ext
```

Run the generator and fill out a few fields for a TypeScript project:

```bash
yo lens-ext
# ? What type of extension do you want to create? New Extension (TypeScript)
# ? What's the name of your extension? my-first-lens-ext
# ? What's the description of your extension? My hello world extension
# ? What's your extension's publisher name? @my-org/my-first-lens-ext
# ? Initialize a git repository? Yes
# ? Install dependencies after initialization? Yes
# ? Which package manager to use? yarn
# ? symlink created extension folder to ~/.k8slens/extensions (mac/linux) or :User
s\<user>\.k8slens\extensions (windows)? Yes
```

Start webpack, which watches the `my-first-lens-ext` folder.

```bash
cd my-first-lens-ext
npm start # start the webpack server in watch mode
```

Then, open Lens, you should see a Hello World item in the menu:

![Hello World](images/hello-world.png)

## Developing the Extension

Try to change `my-first-lens-ext/renderer.tsx` to "Hello Lens!":

```tsx
clusterPageMenus = [
    {
        target: { pageId: "hello" },
        title: "Hello Lens",
        components: {
            Icon: ExampleIcon,
        }
    }
]
```

Then, Reload Lens by CMD+R (Mac) / Ctrl+R (Linux/Windows), you should see the menu item text changes:

![Hello World](images/hello-lens.png)

## Debugging the Extension

[Testing](../testing-and-publishing/testing.md)

## Next steps

You can take a closer look at [Common Capabilities](../capabilities/common-capabilities.md) of extension, how to [style](../capabilities/styling.md) the extension. Or the [Extension Anatomy](anatomy.md).

You are welcome to raise an [issue](https://github.com/lensapp/generator-lens-ext/issues) for Lens Extension Generator, if you find problems, or have feature requests.

The source code of the generator is hosted at [Github](https://github.com/lensapp/generator-lens-ext)
