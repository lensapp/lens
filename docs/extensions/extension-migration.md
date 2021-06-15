# Lens v4 to v5 Extension Migration Notes

* Types and components have been reorganized, many have been grouped by process (`Main` and `Renderer`).
For example the `LensMainExtension` class is now referred to by `Main.LensExtension`.
* The `globalPageMenus` field of the Renderer extension class (now `Renderer.LensExtension`) is removed.
Global pages can still be made accessible via the application menus and the status bar, as well as from the newly added Welcome menu.
* The `clusterFeatures` field of the Renderer extension class (now `Renderer.LensExtension`) is removed.
Cluster features can still be implemented but Lens no longer dictates how the feature's lifecycle (install/upgrade/uninstall) is managed.
`Renderer.K8sApi.ResourceStack` provides the functionality to input and apply kubernetes resources to a cluster.
It is up to the extension developer to manage the lifecycle (i.e. done automatically by the extension or allow the end-user to control via a `Renderer.LensExtension.entitySettings` entry).