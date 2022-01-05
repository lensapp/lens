# Common Capabilities

Here we will discuss common and important building blocks for your extensions, and explain how you can use them.
Almost all extensions use some of these functionalities.

## Main Extension

The main extension runs in the background.
It adds app menu items to the Lens UI.
In order to see logs from this extension, you need to start Lens from the command line.

### Activate

This extension can register a custom callback that is executed when an extension is activated (started).

``` javascript
import { Main } from "@k8slens/extensions"

export default class ExampleMainExtension extends Main.LensExtension {
  async onActivate() {
    console.log("hello world")
  }
}
```

### Deactivate

This extension can register a custom callback that is executed when an extension is deactivated (stopped).

``` javascript
import { Main } from "@k8slens/extensions"

export default class ExampleMainExtension extends Main.LensExtension {
  async onDeactivate() {
    console.log("bye bye")
  }
}
```

### Menus

This extension can register custom app and tray menus that will be displayed on OS native menus.

Example:

```typescript
import { Main } from "@k8slens/extensions"

export default class ExampleMainExtension extends Main.LensExtension {
  appMenus = [
    {
      parentId: "help",
      label: "Example item",
      click() {
        Main.Navigation.navigate("https://k8slens.dev");
      }
    }
  ]

  trayMenus = [
    {
      label: "My links",
      submenu: [
        {
          label: "Lens",
          click() {
            Main.Navigation.navigate("https://k8slens.dev");
          }
        },
        {
          type: "separator"
        },
        {
          label: "Lens Github",
          click() {
            Main.Navigation.navigate("https://github.com/lensapp/lens");
          }
        }
      ]
    }
  ]
}
```

## Renderer Extension

The renderer extension runs in a browser context, and is visible in Lens's main window.
In order to see logs from this extension you need to check them via **View** > **Toggle Developer Tools** > **Console**.

### Activate

This extension can register a custom callback that is executed when an extension is activated (started).

``` javascript
import { Renderer } from "@k8slens/extensions"

export default class ExampleExtension extends Renderer.LensExtension {
  async onActivate() {
    console.log("hello world")
  }
}
```

### Deactivate

This extension can register a custom callback that is executed when an extension is deactivated (stopped).

``` javascript
import { Renderer } from "@k8slens/extensions"

export default class ExampleMainExtension extends Renderer.LensExtension {
  async onDeactivate() {
    console.log("bye bye")
  }
}
```

### Global Pages

This extension can register custom global pages (views) to Lens's main window.
The global page is a full-screen page that hides all other content from a window.

```typescript
import React from "react"
import { Renderer } from "@k8slens/extensions"
import { ExamplePage } from "./src/example-page"

const {
  Component: {
    Icon,
  }
} = Renderer;

export default class ExampleRendererExtension extends Renderer.LensExtension {
  globalPages = [
    {
      id: "example",
      components: {
        Page: ExamplePage,
      }
    }
  ]

  globalPageMenus = [
    {
      title: "Example page", // used in icon's tooltip
      target: { pageId: "example" }
      components: {
        Icon: () => <Icon material="arrow"/>,
      }
    }
  ]
}
```

### App Preferences

This extension can register custom app preferences.
It is responsible for storing a state for custom preferences.

```typescript
import React from "react"
import { Renderer } from "@k8slens/extensions"
import { myCustomPreferencesStore } from "./src/my-custom-preferences-store"
import { MyCustomPreferenceHint, MyCustomPreferenceInput } from "./src/my-custom-preference"


export default class ExampleRendererExtension extends Renderer.LensExtension {
  appPreferences = [
    {
      title: "My Custom Preference",
      components: {
        Hint: () => <MyCustomPreferenceHint/>,
        Input: () => <MyCustomPreferenceInput store={myCustomPreferencesStore}/>
      }
    }
  ]
}
```

### Cluster Pages

This extension can register custom cluster pages.
These pages are visible in a cluster menu when a cluster is opened.

```typescript
import React from "react"
import { Renderer } from "@k8slens/extensions";
import { ExampleIcon, ExamplePage } from "./src/page"

export default class ExampleExtension extends Renderer.LensExtension {
  clusterPages = [
    {
      id: "extension-example", // optional
      exact: true, // optional
      components: {
        Page: () => <ExamplePage extension={this}/>,
      }
    }
  ]

  clusterPageMenus = [
    {
      url: "/extension-example", // optional
      title: "Example Extension",
      components: {
        Icon: ExampleIcon,
      }
    }
  ]
}

```

### Top Bar Items

This extension can register custom components to a top bar area.

```typescript
import React from "react";
import { Renderer } from "@k8slens/extensions";

const {
  Component: {
    Icon,
  }
} = Renderer;

export default class ExampleExtension extends Renderer.LensExtension {
  topBarItems = [
    {
      components: {
        Item: () => (
          <Icon material="favorite" onClick={() => this.navigate("/example-page" />
        )
      }
    }
  ]
}

```

### Status Bar Items

This extension can register custom icons and text to a status bar area.

```typescript
import React from "react";
import { Renderer } from "@k8slens/extensions";

const {
  Component: {
    Icon,
  }
} = Renderer;

export default class ExampleExtension extends Renderer.LensExtension {
  statusBarItems = [
    {
      components: {
        Item: () => (
          <div className="flex align-center gaps hover-highlight" onClick={() => this.navigate("/example-page")} >
            <Icon material="favorite" />
          </div>
        )
      }
    }
  ]
}

```

### Kubernetes Workloads Overview Items

This extension can register custom workloads overview items.

```typescript
import React from "react"
import { Renderer } from "@k8slens/extensions";
import { CustomWorkloadsOverviewItem } from "./src/custom-workloads-overview-item"

export default class ExampleExtension extends Renderer.LensExtension {
  kubeWorkloadsOverviewItems = [
    {
      components: {
        Details: () => <CustomWorkloadsOverviewItem />
      }
    }
  ]
}

```

### Kubernetes Object Menu Items

This extension can register custom menu items (actions) for specified Kubernetes kinds/apiVersions.

```typescript
import React from "react"
import { Renderer } from "@k8slens/extensions";
import { CustomMenuItem, CustomMenuItemProps } from "./src/custom-menu-item"

export default class ExampleExtension extends Renderer.LensExtension {
  kubeObjectMenuItems = [
    {
      kind: "Node",
      apiVersions: ["v1"],
      components: {
        MenuItem: (props: CustomMenuItemProps) => <CustomMenuItem {...props} />
      }
    }
  ]
}

```

### Kubernetes Object Details

This extension can register custom details (content) for specified Kubernetes kinds/apiVersions.

```typescript
import React from "react"
import { Renderer } from "@k8slens/extensions";
import { CustomKindDetails, CustomKindDetailsProps } from "./src/custom-kind-details"

export default class ExampleExtension extends Renderer.LensExtension {
  kubeObjectDetailItems = [
    {
      kind: "CustomKind",
      apiVersions: ["custom.acme.org/v1"],
      components: {
        Details: (props: CustomKindDetailsProps) => <CustomKindDetails {...props} />
      }
    }
  ]
}
```
