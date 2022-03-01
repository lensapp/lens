# Resource Stack (Cluster Feature)

A cluster feature is a set of Kubernetes resources that can be applied to and managed within the active cluster.
The `Renderer.K8sApi.ResourceStack` class provides the functionality to input and apply kubernetes resources to a cluster.
It is up to the extension developer to manage the life cycle of the resource stack.
It could be applied automatically to a cluster by the extension, or the end-user could be required to install it.

The code examples in this section show how to create a resource stack, and define a cluster feature that is configurable from the cluster **Settings** page.

!!! info
    To access the cluster **Settings** page, right-click the relevant cluster in the left side menu and click **Settings**.

The resource stack in this example consists of a single kubernetes resource:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: example-pod
spec:
  containers:
  - name: example-pod
    image: nginx
```

It is simply a pod named `example-pod`, running nginx. Assume this content is in the file `../resources/example-pod.yml`.

The following code sample shows how to use the `Renderer.K8sApi.ResourceStack` to manage installing and uninstalling this resource stack:

```typescript
import { Renderer, Common } from "@k8slens/extensions";
import * as path from "path";

const {
  K8sApi: {
    ResourceStack,
    forCluster,
    Pod,
  }
} = Renderer;

type ResourceStack = Renderer.K8sApi.ResourceStack;
type Pod = Renderer.K8sApi.Pod;
type KubernetesCluster = Common.Catalog.KubernetesCluster;

export class ExampleClusterFeature {
  protected stack: ResourceStack;

  constructor(protected cluster: KubernetesCluster) {
    this.stack = new ResourceStack(cluster, "example-resource-stack");
  }

  get resourceFolder() {
    return path.join(__dirname, "../resources/");
  }

  install(): Promise<string> {
    console.log("installing example-pod");
    return this.stack.kubectlApplyFolder(this.resourceFolder);
  }

  async isInstalled(): Promise<boolean> {
    try {
      const podApi = forCluster(this.cluster, Pod);
      const examplePod = await podApi.get({name: "example-pod", namespace: "default"});

      if (examplePod?.kind) {
        console.log("found example-pod");
        return true;
      }
    } catch(e) {
      console.log("Error getting example-pod:", e);
    }
    console.log("didn't find example-pod");

    return false;
  }

  async uninstall(): Promise<string> {
    console.log("uninstalling example-pod");
    return this.stack.kubectlDeleteFolder(this.resourceFolder);
  }
}
```

The `ExampleClusterFeature` class constructor takes a `Common.Catalog.KubernetesCluster` argument.
This is the cluster that the resource stack will be applied to, and the constructor instantiates a `Renderer.K8sApi.ResourceStack` as such.
`ExampleClusterFeature` implements an `install()` method which simply invokes the `kubectlApplyFolder()` method of the `Renderer.K8sApi.ResourceStack` class.
`kubectlApplyFolder()` applies to the cluster all kubernetes resources found in the folder passed to it, in this case `../resources`.
Similarly, `ExampleClusterFeature` implements an `uninstall()` method which simply invokes the `kubectlDeleteFolder()` method of the `Renderer.K8sApi.ResourceStack` class.
`kubectlDeleteFolder()` tries to delete from the cluster all kubernetes resources found in the folder passed to it, again in this case `../resources`.

`ExampleClusterFeature` also implements an `isInstalled()` method, which demonstrates how you can utilize the kubernetes api to inspect the resource stack status.
`isInstalled()` simply tries to find a pod named `example-pod`, as a way to determine if the pod is already installed.
This method can be useful in creating a context-sensitive UI for installing/uninstalling the feature, as demonstrated in the next sample code.

To allow the end-user to control the life cycle of this cluster feature the following code sample shows how to implement a user interface based on React and custom Lens UI components:

```typescript
 import React from "react";
 import { Common, Renderer } from "@k8slens/extensions";
 import { observer } from "mobx-react";
 import { computed, observable, makeObservable } from "mobx";
 import { ExampleClusterFeature } from "./example-cluster-feature";

 const {
   Component: {
     SubTitle, Button,
   }
 } = Renderer;

 interface ExampleClusterFeatureSettingsProps {
   cluster: Common.Catalog.KubernetesCluster;
 }

 @observer
 export class ExampleClusterFeatureSettings extends React.Component<ExampleClusterFeatureSettingsProps> {
  constructor(props: ExampleClusterFeatureSettingsProps) {
    super(props);
    makeObservable(this);
  }

  @observable installed = false;
  @observable inProgress = false;

  feature: ExampleClusterFeature;

  async componentDidMount() {
    this.feature = new ExampleClusterFeature(this.props.cluster);

    await this.updateFeatureState();
  }

  async updateFeatureState() {
    this.installed = await this.feature.isInstalled();
  }

   async save() {
    this.inProgress = true;

    try {
      if (this.installed) {
        await this.feature.uninstall();
      } else {
        await this.feature.install();
      }
    } finally {
      this.inProgress = false;

      await this.updateFeatureState();
    }
  }

  @computed get buttonLabel() {
    if (this.inProgress && this.installed) return "Uninstalling ...";
    if (this.inProgress) return "Applying ...";

    if (this.installed) {
      return "Uninstall";
    }

    return "Apply";
  }

  render() {
    return (
      <>
        <section>
          <SubTitle title="Example Cluster Feature using a Resource Stack" />
          <Button
            label={this.buttonLabel}
            waiting={this.inProgress}
            onClick={() => this.save()}
            primary />
        </section>
      </>
    );
  }
}
```

The `ExampleClusterFeatureSettings` class extends `React.Component` and simply renders a subtitle and a button.
`ExampleClusterFeatureSettings` takes the cluster as a prop and when the React component has mounted the `ExampleClusterFeature` is instantiated using this cluster (in `componentDidMount()`).
The rest of the logic concerns the button appearance and action, based on the `ExampleClusterFeatureSettings` fields `installed` and `inProgress`.
The `installed` value is of course determined using the aforementioned `ExampleClusterFeature` method `isInstalled()`.
The `inProgress` value is true while waiting for the feature to be installed (or uninstalled).

Note that the button is a `Renderer.Component.Button` element and this example takes advantage of its `waiting` prop to show a "waiting" animation while the install (or uninstall) is in progress.
Using elements from `Renderer.Component` is encouraged, to take advantage of their built-in properties, and to ensure a common look and feel.

Also note that [MobX 6](https://mobx.js.org/README.html) is used for state management, ensuring that the UI is rerendered when state has changed.
The `ExampleClusterFeatureSettings` class is marked as an `@observer`, and its constructor must call `makeObservable()`.
As well, the `installed` and `inProgress` fields are marked as `@observable`, ensuring that the button gets rerendered any time these fields change.

Finally, `ExampleClusterFeatureSettings` needs to be connected to the extension, and would typically appear on the cluster **Settings** page via a `Renderer.LensExtension.entitySettings` entry.
The `ExampleExtension` would look like this:

```typescript
import { Common, Renderer } from "@k8slens/extensions";
import { ExampleClusterFeatureSettings } from "./src/example-cluster-feature-settings"
import React from "react"

export default class ExampleExtension extends Renderer.LensExtension {
  entitySettings = [
    {
      apiVersions: ["entity.k8slens.dev/v1alpha1"],
      kind: "KubernetesCluster",
      title: "Example Cluster Feature",
      priority: 5,
      components: {
        View: ({ entity = null }: { entity: Common.Catalog.KubernetesCluster}) => (
           <ExampleClusterFeatureSettings cluster={entity} />
        )
      }
    }
  ];

}
```

An entity setting is added to the `entitySettings` array field of the `Renderer.LensExtension` class.
Because Lens's catalog can contain different kinds of entities, the kind must be identified.
For more details about the catalog see the [Catalog Guide](catalog.md).
Clusters are a built-in kind, so the `apiVersions` and `kind` fields should be set as above.
The `title` is shown as a navigation item on the cluster **Settings** page and the `components.View` is displayed when the navigation item is clicked on.
The `components.View` definition above shows how the `ExampleClusterFeatureSettings` element is included, and how its `cluster` prop is set.
`priority` determines the order of the entity settings, the higher the number the higher in the navigation panel the setting is placed. The default value is 50.

The final result looks like this:

![Cluster Feature Settings](images/clusterfeature.png)

`ExampleClusterFeature` and `ExampleClusterFeatureSettings` demonstrate a cluster feature for a simple resource stack.
In practice a resource stack can include many resources, and require more sophisticated life cycle management (upgrades, partial installations, etc.)
Using `Renderer.K8sApi.ResourceStack` and `entitySettings` it is possible to implement solutions for more complex cluster features.
The **Lens Metrics** setting (on the cluster **Settings** page) is a good example of an advanced solution.
