# Extension Development Overview

This is a general overview to how the development of an extension will procede. For building extensions there will be a few things that you should have installed, and some that might help.

### Required:
- [Node.js](https://www.nodejs.org/en/)
- [Git](https://www.git-scm.com/)
- Some sort of text editor, we recommend [VSCode](https://code.visualstudio.com/)
- We use [Webpack](https://www.webpack.js.org/) for compilation. All extension need to be at least compatable with a webpack system.

### Recommened:
-

All *Lens* extensions are javascript packages. We recommend that you program in [Typescript](https://www.typescriptlang.org/) because it catches quite a few easily to make errors around passing data around in javascript.

*Lens* is a standard [Electron](https://www.electronjs.org/) application which both main and renderer processes. An extension is made up of two parts, one for each of *Lens*'s core processes. When an extension is loaded each part is loaded and then notified that it has been loaded. From there the extension can start doing is work.

*Lens* uses [React](https://www.reactjs.org/) as it UI framework and even provides some of our own components for reuse by extensions. An extension is resonsible for the lifetime of any resources it spins up. If an extension's main part starts new processes they all must be stopped and cleaned up when the extension is deactivated or unloaded.

See [Your First Extension](your-first-extension.md) to get started.
