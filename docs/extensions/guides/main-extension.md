# Main Extension

The main extension api is the interface to Lens' main process (Lens runs in main and renderer processes). It allows you to access, configure, and customize Lens data, add custom application menu items, and generally run custom code in Lens' main process.

## `LensMainExtension` Class

To create a main extension simply extend the `LensMainExtension` class:

``` typescript
import { LensMainExtension } from "@k8slens/extensions";

export default class ExampleExtensionMain extends LensMainExtension {
  onActivate() {
    console.log('custom main process extension code started');
  }

  onDeactivate() {
    console.log('custom main process extension de-activated');
  }
}
```

There are two methods that you can implement to facilitate running your custom code. `onActivate()` is called when your extension has been successfully enabled. By overriding `onActivate()` you can initiate your custom code. `onDeactivate()` is called when the extension is disabled (typically from the [Lens Extensions Page]()) and when implemented gives you a chance to clean up after your extension, if necessary. The example above simply logs messages when the extension is enabled and disabled. Note that to see standard output from the main process there must be a console connected to it. This is typically achieved by starting Lens from the command prompt.

The following example is a little more interesting in that it accesses some Lens state data and periodically logs the name of the currently active cluster in Lens.

``` typescript
import { LensMainExtension, Store } from "@k8slens/extensions";

const clusterStore = Store.clusterStore

export default class ActiveClusterExtensionMain extends LensMainExtension {

  timer: NodeJS.Timeout

  onActivate() {
    console.log("Cluster logger activated");
    this.timer = setInterval(() => {
      if (!clusterStore.active) {
        console.log("No active cluster");
        return;
      }
      console.log("active cluster is", clusterStore.active.contextName)
    }, 5000)
  }

  onDeactivate() {
      clearInterval(this.timer)
      console.log("Cluster logger deactivated");
  }
}
```

See the [Stores](../stores) guide for more details on accessing Lens state data.

### `appMenus`

The only UI feature customizable in the main extension api is the application menu. Custom menu items can be inserted and linked to custom functionality, such as navigating to a specific page. The following example demonstrates adding a menu item to the Help menu.

``` typescript
import { LensMainExtension } from "@k8slens/extensions";

export default class SamplePageMainExtension extends LensMainExtension {
  appMenus = [
    {
      parentId: "help",
      label: "Sample",
      click() {
        console.log("Sample clicked");
      }
    }
  ]
}
```

`appMenus` is an array of objects satisfying the `MenuRegistration` interface. `MenuRegistration` extends React's `MenuItemConstructorOptions` interface. `parentId` is the id of the menu to put this menu item under (todo: is this case sensitive and how do we know what the available ids are?), `label` is the text to show on the menu item, and `click()` is called when the menu item is selected. In this example we simply log a message, but typically you would navigate to a specific page or perform some operation. Pages are associated with the [`LensRendererExtension`](renderer-extension.md) class and can be defined when you extend it. 