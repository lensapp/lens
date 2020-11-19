# Renderer Extension

The renderer extension api is the interface to Lens' renderer process (Lens runs in main and renderer processes). It allows you to access, configure, and customize Lens data, add custom Lens UI elements, and generally run custom code in Lens' renderer process. The custom Lens UI elements that can be added include global pages, cluster pages, cluster features, app preferences, status bar items, KubeObject menu items, and KubeObject details items. These UI elements are based on React components.

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

There are two methods that you can override to facilitate running your custom code. `onActivate()` is called when your extension has been successfully enabled. By overriding `onActivate()` you can initiate your custom code. `onDeactivate()` is called when the extension is disabled (typically from the [Lens Extensions Page]()) and when overridden gives you a chance to clean up after your extension, if necessary. The example above simply logs messages when the extension is enabled and disabled. 

### `clusterPages`

Cluster pages appear as part of the cluster dashboard. They are accessible from the side bar, and are shown in the list after *Custom Resources*. It is conventional to use a cluster page to show information or provide functionality pertaining to the active cluster, along with custom data and functionality your extension may have. However, it is not limited to the active cluster. Your extension can gain access to the Kubernetes resources in the active cluster in a straightforward manner using the [`clusterStore`](../stores#clusterstore). 

The following example adds a cluster page definition to a `LensRendererExtension` subclass:

``` typescript
import { LensRendererExtension } from "@k8slens/extensions";
import { ExampleIcon, ExamplePage } from "./page"
import React from "react"

export default class ExampleExtension extends LensRendererExtension {
  clusterPages = [
    {
      path: "/extension-example",
      title: "Hello World",
      components: {
        Page: () => <ExamplePage extension={this}/>,
        MenuIcon: ExampleIcon,
      }
    }
  ]
}
```
Cluster pages are objects matching the `PageRegistration` interface. The `path` field sets the page route, and is used in associating the page with an invocation action such as a menu selection. The `title` field is what is shown in the side bar used to activate the page. The `components` field specifies `Page`, the page definition, and an optional icon (`MenuIcon` field) that is shown next to the 'title' in the side bar list. Both `Page` and `MenuIcon` are `React.ComponentType`s.
In this example `ExamplePage` and `ExampleIcon` are defined in `page.tsx`:

``` typescript
import { LensRendererExtension, Component } from "@k8slens/extensions";
import React from "react"

export function ExampleIcon(props: Component.IconProps) {
  return <Component.Icon {...props} material="pages" tooltip="Hello"/>
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

Note that the `ExamplePage` class defines a property named `extension`. This allows the `ExampleExtension` object to be passed in React-style in the cluster page definition, so that `ExamplePage` can access any `ExampleExtension` subclass data.

### `globalPages`

Global pages appear independently of the cluster dashboard. A global page is typically triggered by a [custom app menu selection](../main-extension#appmenus) from a Main Extension or a [custom status bar item](#statusbaritems). Global pages can be visible even when there is no active cluster. It is conventional to use a global page to show information and provide functionality relevant across clusters, along with custom data and functionality your extension may have. 

The following example adds a global page definition to a `LensRendererExtension` subclass:

``` typescript
import { LensRendererExtension } from '@k8slens/extensions';
import { MyPage } from './page';
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
}
```

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
  ]
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
  ]
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
  ]
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
  ]
}
```