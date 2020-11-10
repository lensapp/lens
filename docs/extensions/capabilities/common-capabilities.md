# Common Capabilities

Common Capabilities are important building blocks for your extensions. Almost all extensions use some of these functionalities. Here is how you can take advantage of them.

## Main Extension

A main extension runs in the background and, apart from app menu items, does not add content to the Lens UI. If you want to see logs from this extension you need to start Lens from the command line.

### Activate

An extension can register a custom callback that is executed when an extension is activated (started).

``` javascript
import { LensMainExtension } from "@k8slens/extensions"

export default class ExampleMainExtension extends LensMainExtension {
  async onActivate() {
    console.log("hello world")
  }
}
```

### Deactivate

An extension can register a custom callback that is executed when an extension is deactivated (stopped).

``` javascript
import { LensMainExtension } from "@k8slens/extensions"

export default class ExampleMainExtension extends LensMainExtension {
  async onDeactivate() {
    console.log("bye bye")
  }
}
```

### App Menus

An extension can register custom App menus that will be displayed on OS native menus.

Example:

``` typescript
import { LensMainExtension, windowManager } from "@k8slens/extensions"

export default class ExampleMainExtension extends LensMainExtension {
  appMenus = [
    {
      parentId: "help",
      label: "Example item",
      click() {
        windowManager.navigate("https://k8slens.dev");
      }
    }
  ]
}
```

## Renderer Extension

A renderer extension runs in a browser context and it's visible directly via Lens main window. If you want to see logs from this extension you need to check them via View -> Toggle Developer Tools -> Console.

### Activate

An extension can register a custom callback that is executed when an extension is activated (started).

``` javascript
import { LensRendererExtension } from "@k8slens/extensions"

export default class ExampleExtension extends LensRendererExtension {
  async onActivate() {
    console.log("hello world")
  }
}
```

### Deactivate

An extension can register a custom callback that is executed when an extension is deactivated (stopped).

``` javascript
import { LensRendererExtension } from "@k8slens/extensions"

export default class ExampleMainExtension extends LensRendererExtension {
  async onDeactivate() {
    console.log("bye bye")
  }
}
```

### Global Pages

An extension can register custom global pages (views) to Lens main window. Global page is a full screen page that hides all the other content from a window.

``` typescript
import React from "react"
import { Component, LensRendererExtension } from "@k8slens/extensions"
import { ExamplePage } from "./src/example-page"

export default class ExampleRendererExtension extends LensRendererExtension {
  globalPages = [
    {
      path: "/example-route",
      hideInMenu: true,
      components: {
        Page: ExamplePage,
      }
    }
  ]
}
```

### App Preferences

An extension can register custom app preferences. An extension is responsible for storing a state for custom preferences.

``` typescript
import React from "react"
import { LensRendererExtension } from "@k8slens/extensions"
import { myCustomPreferencesStore } from "./src/my-custom-preferences-store"
import { MyCustomPreferenceHint, MyCustomPreferenceInput } from "./src/my-custom-preference"


export default class ExampleRendererExtension extends LensRendererExtension {
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

An extension can register custom cluster pages which are visible in a cluster menu when a cluster is opened.

``` typescript
import React from "react"
import { LensRendererExtension } from "@k8slens/extensions";
import { ExampleIcon, ExamplePage } from "./src/page"

export default class ExampleExtension extends LensRendererExtension {
  clusterPages = [
    {
      path: "/extension-example",
      title: "Example Extension",
      components: {
        Page: () => <ExamplePage extension={this}/>,
        MenuIcon: ExampleIcon,
      }
    }
  ]
}

```

### Cluster Features

An extension can register installable features for a cluster. A cluster feature is visible in "Cluster Settings" page.

``` typescript
import React from "react"
import { LensRendererExtension } from "@k8slens/extensions"
import { MyCustomFeature } from "./src/my-custom-feature"

export default class ExampleExtension extends LensRendererExtension {
  clusterFeatures = [
    {
      title: "My Custom Feature",
      components: {
        Description: () => {
          return (
            <span>
              Just an example.
            </span>
          )
        }
      },
      feature: new MyCustomFeature()
    }
  ]
}

```

### Status Bar Items

An extension can register custom icons/texts to a status bar area.

``` typescript
import React from "react";
import { Component, LensRendererExtension, Navigation } from "@k8slens/extensions";

export default class ExampleExtension extends LensRendererExtension {
  statusBarItems = [
    {
      item: (
        <div
          className="flex align-center gaps hover-highlight"
          onClick={() => Navigation.navigate("/example-page")}
        >
          <Component.Icon material="favorite" smallest />
        </div>
      )
    }
  ]
}

```

### Kubernetes Object Menu Items

An extension can register custom menu items (actions) for specified Kubernetes kinds/apiVersions.

``` typescript
import React from "react"
import { LensRendererExtension } from "@k8slens/extensions";
import { CustomMenuItem, CustomMenuItemProps } from "./src/custom-menu-item"

export default class ExampleExtension extends LensRendererExtension {
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

An extension can register custom details (content) for specified Kubernetes kinds/apiVersions.

``` typescript
import React from "react"
import { LensRendererExtension } from "@k8slens/extensions";
import { CustomKindDetails, CustomKindDetailsProps } from "./src/custom-kind-details"

export default class ExampleExtension extends LensRendererExtension {
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
