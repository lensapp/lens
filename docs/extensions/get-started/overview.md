# Extension Development Overview

This is a general overview to how the development of an extension will proceed.
For building extensions there will be a few things that you should have installed, and some other things that might be of help.

### Required:
- [Node.js](https://www.nodejs.org/en/)
- [Git](https://www.git-scm.com/)
- Some sort of text editor – we recommend [VSCode](https://code.visualstudio.com/)
- We use [Webpack](https://www.webpack.js.org/) for compilation.
All extension need to be at least compatible with a webpack system.

### Recommended:

All Lens extensions are javascript packages.
We recommend that you program in [Typescript](https://www.typescriptlang.org/) because it catches many common errors.

Lens is a standard [Electron](https://www.electronjs.org/) application with both main and renderer processes.
An extension is made up of two parts, one for each of Lens's core processes.
When an extension is loaded, each part is first loaded and issues a notification that it has been loaded.
From there, the extension can start doing is work.

Lens uses [React](https://www.reactjs.org/) as its UI framework and provides some of Lens's own components for reuse with extensions.
An extension is responsible for the lifetime of any resources it spins up.
If an extension's main part starts new processes they all must be stopped and cleaned up when the extension is deactivated or unloaded.

See [Your First Extension](your-first-extension.md) to get started.
