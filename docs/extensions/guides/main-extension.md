# Main Extension

The Main Extension API is the interface to Lens's main process.
Lens runs in both main and renderer processes.
The Main Extension API allows you to access, configure, and customize Lens data, add custom application menu items and [protocol handlers](protocol-handlers.md), and run custom code in Lens's main process.
It also provides convenient methods for navigating to built-in Lens pages and extension pages, as well as adding and removing sources of catalog entities.

## `Main.LensExtension` Class

### `onActivate()` and `onDeactivate()` Methods

To create a main extension simply extend the `Main.LensExtension` class:

```typescript
import { Main } from "@k8slens/extensions";

export default class ExampleExtensionMain extends Main.LensExtension {
  onActivate() {
    console.log("custom main process extension code started");
  }

  onDeactivate() {
    console.log("custom main process extension de-activated");
  }
}
```

Two methods enable you to run custom code: `onActivate()` and `onDeactivate()`.
Enabling your extension calls `onActivate()` and disabling your extension calls `onDeactivate()`.
You can initiate custom code by implementing `onActivate()`.
Implementing `onDeactivate()` gives you the opportunity to clean up after your extension.

Disable extensions from the Lens Extensions page:

1. Navigate to **File** > **Extensions** in the top menu bar.
   (On Mac, it is **Lens** > **Extensions**.)
2. Click **Disable** on the extension you want to disable.

The example above logs messages when the extension is enabled and disabled.
To see standard output from the main process there must be a console connected to it.
Achieve this by starting Lens from the command prompt.

For more details on accessing Lens state data, please see the [Stores](stores.md) guide.

### `appMenus`

The Main Extension API allows you to customize the UI application menu.
The following example demonstrates adding an item to the **Help** menu.

```typescript
import { Main } from "@k8slens/extensions";

export default class SamplePageMainExtension extends Main.LensExtension {
  appMenus = [
    {
      parentId: "help",
      label: "Sample",
      click() {
        console.log("Sample clicked");
      },
    },
  ];
}
```

`appMenus` is an array of objects that satisfy the `MenuRegistration` interface.
`MenuRegistration` extends Electron's `MenuItemConstructorOptions` interface.
The properties of the appMenus array objects are defined as follows:

- `parentId` is the name of the menu where your new menu item will be listed.
  Valid values include: `"file"`, `"edit"`, `"view"`, and `"help"`.
  `"lens"` is valid on Mac only.
- `label` is the name of your menu item.
- `click()` is called when the menu item is selected.
  In this example, we simply log a message.
  However, you would typically have this navigate to a specific page or perform another operation.
  Note that pages are associated with the [`Renderer.LensExtension`](renderer-extension.md) class and can be defined in the process of extending it.

The following example demonstrates how an application menu can be used to navigate to such a page:

```typescript
import { Main } from "@k8slens/extensions";

export default class SamplePageMainExtension extends Main.LensExtension {
  appMenus = [
    {
      parentId: "help",
      label: "Sample",
      click: () => this.navigate("myGlobalPage"),
    },
  ];
}
```

When the menu item is clicked the `navigate()` method looks for and displays a global page with id `"myGlobalPage"`.
This page would be defined in your extension's `Renderer.LensExtension` implementation (See [`Renderer.LensExtension`](renderer-extension.md)).

### `trayMenus`

`trayMenus` is an array of `TrayMenuRegistration` objects. Most importantly you can define a `label` and a `click` handler. Other properties are `submenu`, `enabled`, `toolTip`, `id` and `type`.

```typescript
interface TrayMenuRegistration {
  label?: string;
  click?: (menuItem: TrayMenuRegistration) => void;
  id?: string;
  type?: "normal" | "separator" | "submenu";
  toolTip?: string;
  enabled?: boolean;
  submenu?: TrayMenuRegistration[];
}
```

The following example demonstrates how tray menus can be added from extension:

```typescript
import { Main } from "@k8slens/extensions";

export default class SampleTrayMenuMainExtension extends Main.LensExtension {
  trayMenus = [
    {
      label: "menu from the extension",
      click: () => {
        console.log("tray menu clicked!");
      },
    },
  ];
}
```

### `addCatalogSource()` and `removeCatalogSource()` Methods

The `Main.LensExtension` class also provides the `addCatalogSource()` and `removeCatalogSource()` methods, for managing custom catalog items (or entities).
See the [`Catalog`](catalog.md) documentation for full details about the catalog.
