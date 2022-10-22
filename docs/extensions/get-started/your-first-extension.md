# Your First Extension

We recommend to always use [Yeoman generator for Lens Extension](https://github.com/lensapp/generator-lens-ext) to start new extension project.
[Read the generator guide here](../guides/generator.md).

If you want to setup the project manually, please continue reading.

## First Extension

In this topic, you'll learn the basics of building extensions by creating an extension that adds a "Hello World" page to a cluster menu.

## Install the Extension

To install the extension, clone the [Lens Extension samples](https://github.com/lensapp/lens-extension-samples) repository to your local machine:

```sh
git clone https://github.com/lensapp/lens-extension-samples.git
```

Next you need to create a symlink.
A symlink connects the directory that Lens will monitor for user-installed extensions to the sample extension.
In this case the sample extension is `helloworld-sample`.

### Linux & macOS

```sh
mkdir -p ~/.k8slens/extensions
cd ~/.k8slens/extensions
ln -s lens-extension-samples/helloworld-sample helloworld-sample
```

### Windows

Create the directory that Lens will monitor for user-installed extensions:

```sh
mkdir C:\Users\<user>\.k8slens\extensions -force
cd C:\Users\<user>\.k8slens\extensions
```

If you have administrator rights, you can create symlink to the sample extension – in this case `helloworld-sample`:

```sh
cmd /c mklink /D helloworld-sample lens-extension-samples\helloworld-sample
```

Without administrator rights, you need to copy the extensions sample directory into `C:\Users\<user>\.k8slens\extensions`:

```sh
Copy-Item 'lens-extension-samples\helloworld-sample' 'C:\Users\<user>\.k8slens\extensions\helloworld-sample'
```

## Build the Extension

To build the extension you can use `make` or run the `npm` commands manually:

```sh
cd <lens-extension-samples directory>/helloworld-sample
make build
```

To run the `npm` commands, enter:

```sh
cd <lens-extension-samples directory>/helloworld-sample
npm install
npm run build
```

Optionally, automatically rebuild the extension by watching for changes to the source code.
To do so, enter:

```sh
cd <lens-extension-samples directory>/helloworld-sample
npm run dev
```

You must restart Lens for the extension to load.
After this initial restart, reload Lens and it will automatically pick up changes any time the extension rebuilds.

With Lens running, either connect to an existing cluster or create a new one - refer to the latest [Lens Documentation](https://docs.k8slens.dev/getting-started/add-cluster/) for details on how to add a cluster in Lens IDE.
You will see the "Hello World" page in the left-side cluster menu.

## Develop the Extension

Finally, you'll make a change to the message that our Hello World sample extension displays:

1. Navigate to `<lens-extension-samples directory>/helloworld-sample`.
2. In `page.tsx`, change the message from `HelloWorld!` to `Hello Lens Extensions`.
3. Rebuild the extension. If you used `npm run dev`, the extension will rebuild automatically.
4. Reload the Lens window.
5. Click on the Hello World page.
6. The updated message will appear.

## Next Steps

In the [next topic](anatomy.md), we'll take a closer look at the source code of our Hello World sample.

You can find the source code for this tutorial at: [lensapp/lens-extension-samples](https://github.com/lensapp/lens-extension-samples/tree/master/helloworld-sample).
[Extension Guides](../guides/README.md) contains additional samples.
