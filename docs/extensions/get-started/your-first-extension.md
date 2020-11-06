# Your First Extension

In this topic, we'll teach you the fundamental concepts for building extensions.

## Installing and Building the extension

Simple Lens extension that adds "Hello World" page to a cluster menu.

### Linux

First you will need to clone the [Lens Extension samples](https://github.com/lensapp/lens-extension-samples) repository to your local machine:

```sh
git clone https://github.com/lensapp/lens-extension-samples.git
```

Next you need to create a symlink from the directory that Lens will monitor for user installed extensions to the sample extension, in this case **helloworld-sample**:

```sh
mkdir -p ~/.k8slens/extensions
cd ~/.k8slens/extensions
ln -s <lens-extension-samples directory>/helloworld-sample helloworld-sample
```

To build the extension you can use `make` or run the `npm` commands manually:

```sh
cd <lens-extension-samples directory>/helloworld-sample
make build
```

OR

```sh
cd <lens-extension-samples directory>/helloworld-sample
npm install
npm run build
```

If you want to watch for any source code changes and automatically rebuild the extension you can use:

```sh
cd <lens-extension-samples directory>/helloworld-sample
npm run dev
```

Finally, if you already have Lens open you will need to quit and restart Lens for the extension to be loaded. After this initial restart you can reload Lens and it will pick up any new builds of the extension. Within Lens connect to an existing cluster or [create a new one](../../clusters/adding-clusters.md). You should see then see the "Hello World" page in the Lens sidebar cluster menu.

## Developing the extension

Let's make a change to the message that our helloworld-sample extension displays:

* Navigate to `<lens-extension-samples directory>/helloworld-sample`.
* Change the message from HelloWorld! to **Hello Lens Extensions** in `page.tsx`.
* Rebuild the extension or, if you used `npm run dev`, the extension should automatically rebuild.
* Reload the Lens window and click on the Hello World page.
* You should see the updated message showing up.

## Next steps

In the next topic, [Extension Anatomy](anatomy.md), we'll take a closer look at the source code of the Hello World sample and explain key concepts.

You can find the source code of this tutorial at: [lensapp/lens-extension-samples](https://github.com/lensapp/lens-extension-samples/tree/master/helloworld-sample). The [Extension Guides](../guides/overview.md) topic contains other samples, each illustrating a different Lens Extension API.
