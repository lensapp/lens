# Common Capabilities

Here we will discuss common and important building blocks for your extensions, and explain how you can use them. Almost all extensions use some of these functionalities.

## Main Extension

The main extension runs in the background. It adds app menu items to the Lens UI. In order to see logs from this extension, you need to start Lens from the command line.

### Activate

This extension can register a custom callback that is executed when an extension is activated (started).

``` javascript
import { LensMainExtension } from "@k8slens/extensions"

export default class ExampleMainExtension extends LensMainExtension {
  async onActivate() {
    console.log("hello world")
  }
}
```

### Deactivate

This extension can register a custom callback that is executed when an extension is deactivated (stopped).

``` javascript
import { LensMainExtension } from "@k8slens/extensions"

export default class ExampleMainExtension extends LensMainExtension {
  async onDeactivate() {
    console.log("bye bye")
  }
}
```

### App Menus

This extension can register custom app menus that will be displayed on OS native menus.

Example:

```typescript
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

The renderer extension runs in a browser context, and is visible in Lens's main window. In order to see logs from this extension you need to check them via **View** > **Toggle Developer Tools** > **Console**.

### Activate

This extension can register a custom callback that is executed when an extension is activated (started).

``` javascript
import { LensRendererExtension } from "@k8slens/extensions"

export default class ExampleExtension extends LensRendererExtension {
  async onActivate() {
    console.log("hello world")
  }
}
```

### Deactivate

This extension can register a custom callback that is executed when an extension is deactivated (stopped).

``` javascript
import { LensRendererExtension } from "@k8slens/extensions"

export default class ExampleMainExtension extends LensRendererExtension {
  async onDeactivate() {
    console.log("bye bye")
  }
}
```

### Global Pages

This extension can register custom global pages (views) to Lens's main window. The global page is a full-screen page that hides all other content from a window.

```typescript
import React from "react"
import { Component, LensRendererExtension } from "@k8slens/extensions"
import { ExamplePage } from "./src/example-page"

export default class ExampleRendererExtension extends LensRendererExtension {
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
        Icon: () => <Component.Icon material="arrow"/>,
      }
    }
  ]
}
```

### App Preferences

This extension can register custom app preferences. It is responsible for storing a state for custom preferences.

```typescript
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

This extension can register custom cluster pages. These pages are visible in a cluster menu when a cluster is opened.

```typescript
import React from "react"
import { LensRendererExtension } from "@k8slens/extensions";
import { ExampleIcon, ExamplePage } from "./src/page"

export default class ExampleExtension extends LensRendererExtension {
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

### Cluster Features

This extension can register installable features for a cluster. These features are visible in the "Cluster Settings" page.

```typescript
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

This extension can register custom icons and text to a status bar area.

```typescript
import React from "react";
import { Component, LensRendererExtension, Navigation } from "@k8slens/extensions";

export default class ExampleExtension extends LensRendererExtension {
  statusBarItems = [
    {
      components: {
        Item: (
          <div className="flex align-center gaps hover-highlight" onClick={() => this.navigate("/example-page")} >
            <Component.Icon material="favorite" />
          </div>
        )
      }
    }
  ]
}

```

### Kubernetes Object Menu Items

This extension can register custom menu items (actions) for specified Kubernetes kinds/apiVersions.

```typescript
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

This extension can register custom details (content) for specified Kubernetes kinds/apiVersions.

```typescript
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
