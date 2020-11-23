# Renderer Extension

The renderer extension api is the interface to Lens' renderer process (Lens runs in main and renderer processes). It allows you to access, configure, and customize Lens data, add custom Lens UI elements, and generally run custom code in Lens' renderer process. The custom Lens UI elements that can be added include global pages, cluster pages, cluster page menus, cluster features, app preferences, status bar items, KubeObject menu items, and KubeObject details items. These UI elements are based on React components.

## `LensRendererExtension` Class

To create a renderer extension simply extend the `LensRendererExtension` class:

``` typescript
import { LensRendererExtension } from "@k8slens/extensions";

export default class ExampleExtensionMain extends LensRendererExtension {
  onActivate() {
    console.log('custom renderer process extension code started');
  }

  onDeactivate() {
    console.log('custom renderer process extension de-activated');
  }
}
```

There are two methods that you can implement to facilitate running your custom code. `onActivate()` is called when your extension has been successfully enabled. By implementing `onActivate()` you can initiate your custom code. `onDeactivate()` is called when the extension is disabled (typically from the [Lens Extensions Page]()) and when implemented gives you a chance to clean up after your extension, if necessary. The example above simply logs messages when the extension is enabled and disabled. 

### `clusterPages`

Cluster pages appear as part of the cluster dashboard. They are accessible from the side bar, and are shown in the menu list after *Custom Resources*. It is conventional to use a cluster page to show information or provide functionality pertaining to the active cluster, along with custom data and functionality your extension may have. However, it is not limited to the active cluster. Also, your extension can gain access to the Kubernetes resources in the active cluster in a straightforward manner using the [`clusterStore`](../stores#clusterstore). 

The following example adds a cluster page definition to a `LensRendererExtension` subclass:

``` typescript
import { LensRendererExtension } from "@k8slens/extensions";
import { ExampleIcon, ExamplePage } from "./page"
import React from "react"

export default class ExampleExtension extends LensRendererExtension {
  clusterPages = [
    {
      id: "hello",
      components: {
        Page: () => <ExamplePage extension={this}/>,
      }
    }
  ];
}
```

Cluster pages are objects matching the `PageRegistration` interface. The `id` field identiifies the page, and at its simplest is just a string identifier, as shown in the example above. The 'id' field can also convey route path details, such as variable parameters provided to a page ([See example below]()). The `components` field matches the `PageComponents` interface for wich there is one field, `Page`.  `Page` is of type ` React.ComponentType<any>`, which gives you great flexibility in defining the appearance and behaviour of your page. For the example above `ExamplePage` can be defined in `page.tsx`:

``` typescript
import { LensRendererExtension } from "@k8slens/extensions";
import React from "react"

export class ExamplePage extends React.Component<{ extension: LensRendererExtension }> {
  render() {
    return (
      <div>
        <p>Hello world!</p>
      </div>
    )
  }
}
```

Note that the `ExamplePage` class defines a property named `extension`. This allows the `ExampleExtension` object to be passed in React-style in the cluster page definition, so that `ExamplePage` can access any `ExampleExtension` subclass data.

### `clusterPageMenus`

The above example code shows how to create a cluster page but not how to make it available to the Lens user. Cluster pages are typically made available through a menu item in the cluster dashboard sidebar. Expanding on the above example a cluster page menu is added to the `ExampleExtension` definition:

``` typescript
import { LensRendererExtension } from "@k8slens/extensions";
import { ExampleIcon, ExamplePage } from "./page"
import React from "react"

export default class ExampleExtension extends LensRendererExtension {
  clusterPages = [
    {
      id: "hello",
      components: {
        Page: () => <ExamplePage extension={this}/>,
      }
    }
  ];

  clusterPageMenus = [
    {
      target: { pageId: "hello" },
      title: "Hello World",
      components: {
        Icon: ExampleIcon,
      }
    },
  ];
}
```

Cluster page menus are objects matching the `ClusterPageMenuRegistration` interface. They define the appearance of the cluster page menu item in the cluster dashboard sidebar and the behaviour when the cluster page menu item is activated (typically by a mouse click). The example above uses the `target` field to set the behaviour as a link to the cluster page with `id` of `"hello"`. This is done by setting `target`'s `pageId` field to `"hello"`. The cluster page menu item's appearance is defined by setting the `title` field to the text that is to be displayed in the cluster dashboard sidebar. The `components` field is used to set an icon that appears to the left of the `title` text in the sidebar. Thus when the `"Hello World"` menu item is activated the cluster dashboard will show the contents of `ExamplePage`. This example requires the definition of another React-based component, `ExampleIcon`, which has been added to `page.tsx`:

``` typescript
import { LensRendererExtension, Component } from "@k8slens/extensions";
import React from "react"

export function ExampleIcon(props: Component.IconProps) {
  return <Component.Icon {...props} material="pages" tooltip={"Hi!"}/>
}

export class ExamplePage extends React.Component<{ extension: LensRendererExtension }> {
  render() {
    return (
      <div>
        <p>Hello world!</p>
      </div>
    )
  }
}
```

`ExampleIcon` introduces one of Lens' built-in components available to extension developers, the `Component.Icon`. Built in are the [Material Design](https://material.io) [icons](https://material.io/resources/icons/). One can be selected by name via the `material` field. `ExampleIcon` also sets a tooltip, shown when the Lens user hovers over the icon with a mouse, by setting the `tooltip` field.

A cluster page menu can also be used to define a foldout submenu in the cluster dashboard sidebar. This enables the grouping of cluster pages. The following example shows how to specify a submenu having two menu items:

``` typescript
import { LensRendererExtension } from "@k8slens/extensions";
import { ExampleIcon, ExamplePage } from "./page"
import React from "react"

export default class ExampleExtension extends LensRendererExtension {
  clusterPages = [
    {
      id: "hello",
      components: {
        Page: () => <ExamplePage extension={this}/>,
      }
    },
    {
      id: "bonjour", 
      components: {
        Page: () => <ExemplePage extension={this}/>,
      }
    }
  ];

  clusterPageMenus = [
    {
      id: "example",
      title: "Greetings",
      components: {
        Icon: ExampleIcon,
      }
    },
    {
      parentId: "example",
      target: { pageId: "hello" },
      title: "Hello World",
      components: {
        Icon: ExampleIcon,
      }
    },
    {
      parentId: "example",
      target: { pageId: "bonjour" },
      title: "Bonjour le monde",
      components: {
        Icon: ExempleIcon,
      }
    }
  ];
}
```

The above defines two cluster pages and three cluster page menu objects. The cluster page definitons are straightforward. The first cluster page menu object defines the parent of a foldout submenu. Setting the `id` field in a cluster page menu definition implies that it is defining a foldout submenu. Also note that the `target` field is not specified (it is ignored if the `id` field is specified). This cluster page menu object specifies the `title` and `components` fields, which are used in displaying the menu item in the cluster dashboard sidebar. Initially the submenu is hidden. Activating this menu item toggles on and off the appearance of the submenu below it. The remaining two cluster page menu objects define the contents of the submenu. A cluster page menu object is defined to be a submenu item by setting the `parentId` field to the id of the parent of a foldout submenu, `"example"` in this case

### `globalPages`

Global pages appear independently of the cluster dashboard and they fill the Lens UI space. A global page is typically triggered from the cluster menu using a [global page menu](#globalpagemenus). They can also be triggered by a [custom app menu selection](../main-extension#appmenus) from a Main Extension or a [custom status bar item](#statusbaritems). Global pages can appear even when there is no active cluster, unlike cluster pages. It is conventional to use a global page to show information and provide functionality relevant across clusters, along with custom data and functionality that your extension may have. 

The following example defines a `LensRendererExtension` subclass with a single global page definition:

``` typescript
import { LensRendererExtension } from '@k8slens/extensions';
import { HelpPage } from './page';
import React from 'react';

export default class HelpExtension extends LensRendererExtension {
  globalPages = [
    {
      id: "help",
      components: {
        Page: () => <HelpPage extension={this}/>,
      }
    }
  ];
}
```

Global pages are objects matching the `PageRegistration` interface. The `id` field identiifies the page, and at its simplest is just a string identifier, as shown in the example above. The 'id' field can also convey route path details, such as variable parameters provided to a page ([See example below]()). The `components` field matches the `PageComponents` interface for which there is one field, `Page`.  `Page` is of type ` React.ComponentType<any>`, which gives you great flexibility in defining the appearance and behaviour of your page. For the example above `HelpPage` can be defined in `page.tsx`:

``` typescript
import { LensRendererExtension } from "@k8slens/extensions";
import React from "react"

export class HelpPage extends React.Component<{ extension: LensRendererExtension }> {
  render() {
    return (
      <div>
        <p>Help yourself</p>
      </div>
    )
  }
}
```

Note that the `HelpPage` class defines a property named `extension`. This allows the `HelpExtension` object to be passed in React-style in the global page definition, so that `HelpPage` can access any `HelpExtension` subclass data. 

This example code shows how to create a global page but not how to make it available to the Lens user. Global pages are typically made available through a number of ways. Menu items can be added to the Lens app menu system and set to open a global page when activated (See [`appMenus` in the Main Extension guide](../main-extension#appmenus)). Interactive elements can be placed on the status bar (the blue strip along the bottom of the Lens UI) and can be configured to link to a global page when activated (See [`statusBarItems`](#statusbaritems)). As well, global pages can be made accessible from the cluster menu, which is the vertical strip along the left side of the Lens UI showing the available cluster icons, and the Add Cluster icon. Global page menu icons that are defined using [`globalPageMenus`](#globalpagemenus) appear below the Add Cluster icon.

### `globalPageMenus`

Global page menus connect a global page to the cluster menu, which is the vertical strip along the left side of the Lens UI showing the available cluster icons, and the Add Cluster icon. Expanding on the example from [`globalPages`](#globalPages) a global page menu is added to the `HelpExtension` definition:

``` typescript
import { LensRendererExtension } from "@k8slens/extensions";
import { HelpIcon, HelpPage } from "./page"
import React from "react"

export default class HelpExtension extends LensRendererExtension {
  clusterPages = [
    {
      id: "help",
      components: {
        Page: () => <HelpPage extension={this}/>,
      }
    }
  ];

  globalPageMenus = [
    {
      target: { pageId: "help" },
      title: "Help",
      components: {
        Icon: HelpIcon,
      }
    },
  ];
}
```

Global page menus are objects matching the `PageMenuRegistration` interface. They define the appearance of the global page menu item in the cluster menu and the behaviour when the global page menu item is activated (typically by a mouse click). The example above uses the `target` field to set the behaviour as a link to the global page with `id` of `"help"`. This is done by setting `target`'s `pageId` field to `"help"`. The global page menu item's appearance is defined by setting the `title` field to the text that is to be displayed as a tooltip in the cluster menu. The `components` field is used to set an icon that appears in the cluster menu. Thus when the `"Help"` icon is activated the contents of `ExamplePage` will be shown. This example requires the definition of another React-based component, `HelpIcon`, which has been added to `page.tsx`:

``` typescript
import { LensRendererExtension, Component } from "@k8slens/extensions";
import React from "react"

export function HelpIcon(props: Component.IconProps) {
  return <Component.Icon {...props} material="help"/>
}

export class HelpPage extends React.Component<{ extension: LensRendererExtension }> {
  render() {
    return (
      <div>
        <p>Help</p>
      </div>
    )
  }
}
```

`HelpIcon` introduces one of Lens' built-in components available to extension developers, the `Component.Icon`. Built in are the [Material Design](https://material.io) [icons](https://material.io/resources/icons/). One can be selected by name via the `material` field. 




*********************************************************************
WIP below!
*********************************************************************



### `clusterFeatures`

Cluster features are Kubernetes resources that can applied and managed to the active cluster. They can be installed/uninstalled from the [cluster settings page](). 
The following example shows how to add a cluster feature:

``` typescript
import { LensRendererExtension } from "@k8slens/extensions"
import { MetricsFeature } from "./src/metrics-feature"
import React from "react"

export default class ClusterMetricsFeatureExtension extends LensRendererExtension {
  clusterFeatures = [
    {
      title: "Metrics Stack",
      components: {
        Description: () => {
          return (
            <span>
                Enable timeseries data visualization (Prometheus stack) for your cluster.
                Install this only if you don't have existing Prometheus stack installed.
                You can see preview of manifests <a href="https://github.com/lensapp/lens/tree/master/extensions/lens-metrics/resources" target="_blank">here</a>.
              </span>
          )
        }
      },
      feature: new MetricsFeature()
    }
  ];
}
```
The `title` and `components.Description` fields appear on the cluster settings page. The cluster feature must extend the abstract class `ClusterFeature.Feature`, and specifically implement the following methods:

``` typescript
  abstract install(cluster: Cluster): Promise<void>;
  abstract upgrade(cluster: Cluster): Promise<void>;
  abstract uninstall(cluster: Cluster): Promise<void>;
  abstract updateStatus(cluster: Cluster): Promise<ClusterFeatureStatus>;
```

### `appPreferences`

The Preferences page is essentially a global page. Extensions can add custom preferences to the Preferences page, thus providing a single location for users to configure global, for Lens and extensions alike.

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
  ];
}
```

### `statusBarItems`

The Status bar is the blue strip along the bottom of the Lens UI. Status bar items are `React.ReactNode` types, which can be used to convey status information, or act as a link to a global page.

The following example adds a status bar item definition, as well as a global page definition, to a `LensRendererExtension` subclass, and configures the status bar item to navigate to the global upon a mouse click:

``` typescript
import { LensRendererExtension, Navigation } from '@k8slens/extensions';
import { MyStatusBarIcon, MyPage } from './page';
import React from 'react';

export default class ExtensionRenderer extends LensRendererExtension {
  globalPages = [
    {
      path: "/my-extension-path",
      hideInMenu: true,
      components: {
        Page: () => <MyPage extension={this} />,
      },
    },
  ];

  statusBarItems = [
    {
      item: (
        <div
          className="flex align-center gaps hover-highlight"
          onClick={() => Navigation.navigate(this.globalPages[0].path)}
        >
          <MyStatusBarIcon />
          <span>My Status Bar Item</span>
        </div>
      ),
    },
  ];
}
```

### `kubeObjectMenuItems`

An extension can add custom menu items (including actions) for specified Kubernetes resource kinds/apiVersions. These menu items appear under the `...` for each listed resource, and on the title bar of the details page for a specific resource.

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
  ];
}

```

### `kubeObjectDetailItems`

An extension can add custom details (content) for specified Kubernetes resource kinds/apiVersions. These custom details appear on the details page for a specific resource.

``` typescript
import React from "react"
import { LensRendererExtension } from "@k8slens/extensions";
import { CustomKindDetails, CustomKindDetailsProps } from "./src/custom-kind-details"

export default class ExampleExtension extends LensRendererExtension {
  kubeObjectMenuItems = [
    {
      kind: "CustomKind",
      apiVersions: ["custom.acme.org/v1"],
      components: {
        Details: (props: CustomKindDetailsProps) => <CustomKindDetails {...props} />
      }
    }
  ];
}
```