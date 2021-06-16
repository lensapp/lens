# Lens v4 to v5 Extension Migration Notes

*  Lens v5 inspects the version of the extension to ensure it is compatible. 
The `package.json` for your extension must have an `"engines"` field specifying the lens version that your extension is targeted for, e.g:
```
	"engines": {
		"lens": "^5.0.0-beta.7"
	},
```
Note that Lens v5 supports all the range semantics that [semver](https://www.npmjs.com/package/semver) provides.
* Types and components have been reorganized, many have been grouped by process (`Main` and `Renderer`) plus those not specific to a process (`Common`).
For example the `LensMainExtension` class is now referred to by `Main.LensExtension`.
See the [API Reference](api/README.md) for the new organization.
* The `globalPageMenus` field of the Renderer extension class (now `Renderer.LensExtension`) is removed.
Global pages can still be made accessible via the application menus and the status bar, as well as from the newly added Welcome menu.
* The `clusterFeatures` field of the Renderer extension class (now `Renderer.LensExtension`) is removed.
Cluster features can still be implemented but Lens no longer dictates how a feature's lifecycle (install/upgrade/uninstall) is managed.
`Renderer.K8sApi.ResourceStack` provides the functionality to input and apply kubernetes resources to a cluster.
It is up to the extension developer to manage the lifecycle.
It could be applied automatically to a cluster by the extension or the end-user could be expected to install it, etc. from the cluster **Settings** page.
* Lens v5 now relies on mobx 6 for state management. Extensions that use mobx will need to be modified to work with mobx 6.
See [Migrating from Mobx 4/5](https://mobx.js.org/migrating-from-4-or-5.html) for specific details.

For an example of an existing extension that is compatible with Lens v5 see the [Lens Resource Map Extension](https://github.com/nevalla/lens-resource-map-extension)
