# Your First Extension

In this topic, we'll teach you the fundamental concepts for building extensions. Make sure you have [Node.js](https://nodejs.org/en/) and [Git](https://git-scm.com/) installed....

## Installing and Building the extension

Simple Lens extension that adds "hello-world" page to a cluster menu.

### Linux

```sh
mkdir -p ~/.k8slens/extensions
git clone https://github.com/lensapp/lens-extension-samples.git
cp -pr lens-extension-samples/helloworld-sample ~/.k8slens/extensions
```

To build the extension you can use `make` or run the `npm` commands manually:

```sh
cd ~/.k8slens/extensions/helloworld-sample
make build
```

OR

```sh
cd ~/.k8slens/extensions/helloworld-sample
npm install
npm run build
```

Open Lens application and navigate to a cluster. You should see "Hello World" in the Lens sidebar menu.

## Developing the extension

Let's make a change to the message:

* Change the message from Hello World from HelloWorld! to **Hello Lens Extensions** in `page.tsx`
* Rebuild the extension
* Reload the Lens window
* You should see the updated message showing up.

## Next steps

In the next topic, [Extension Anatomy](anatomy.md), we'll take a closer look at the source code of the Hello World sample and explain key concepts.

You can find the source code of this tutorial at: [lensapp/lens-extension-samples](https://github.com/lensapp/lens-extension-samples/tree/master/helloworld-sample). The [Extension Guides](../guides/overview.md) topic contains other samples, each illustrating a different Lens Extension API.
