# Lens Extension API

Customize and enhance the Lens experience with the Lens Extension API.
Use the extension API to create menus or page content.
The same extension API was used to create many of Lens's core features.
To install your first extension you should goto the [extension page](lens://app/extensions) in lens.

This documentation describes:

- How to build, run, test, and publish an extension.
- How to take full advantage of the Lens Extension API.
- Where to find [guides](extensions/guides/README.md) and [code samples](https://github.com/lensapp/lens-extension-samples) to help get you started.

## What Extensions Can Do

Here are some examples of what you can achieve with the Extension API:

- Add custom components & views in the UI - Extending the Lens Workbench

For an overview of the Lens Extension API, refer to the [Common Capabilities](extensions/capabilities/common-capabilities.md) page. [Extension Guides Overview](extensions/guides/README.md) also includes a list of code samples and guides that illustrate various ways of using the Lens Extension API.

## How to Build Extensions

Here is what each section of the Lens Extension API docs can help you with:

- **Getting Started** teaches fundamental concepts for building extensions with the Hello World sample.
- **Extension Capabilities** dissects Lens's Extension API into smaller categories and points you to more detailed topics.
- **Extension Guides** includes guides and code samples that explain specific usages of Lens Extension API.
- **Testing and Publishing** includes in-depth guides on various extension development topics, such as testing and publishing extensions.
- **API Reference** contains exhaustive references for the Lens Extension API, Contribution Points, and many other topics.

## What's New

Just like Lens itself, the extension API updates on a monthly cadence, rolling out new features with every release.

Keep up with Lens and the Lens Extension API by reviewing the [release notes](https://github.com/lensapp/lens/releases).

## Important changes since Lens v4

Lens has undergone major design improvements in v5, which have resulted in several large changes to the extension API.
Workspaces are gone, and the catalog is introduced for containing clusters, as well as other items, including custom entities.
Lens has migrated from using mobx 5 to mobx 6 for internal state management, and this may have ramifications for extension implementations.
Although the API retains many components from v4, given these changes, extensions written for Lens v4 are not compatible with the Lens v5 extension API.
See the [Lens v4 to v5 extension migration notes](extensions/extension-migration.md) on getting old extensions working in Lens v5.

## Looking for Help

If you have questions for extension development, try asking on the [Lens Forums](http://forums.k8slens.dev/). It's a public chatroom for Lens developers, where Lens team members chime in from time to time.

To provide feedback on the documentation or issues with the Lens Extension API, create new issues at [lensapp/lens](https://github.com/lensapp/lens/issues). Please use the labels `area/documentation` and/or `area/extension`.

## Downloading Lens

[Download Lens](https://k8slens.dev/) for macOS, Windows, or Linux.
