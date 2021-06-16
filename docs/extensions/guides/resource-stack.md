# Resource Stack (Cluster Feature) (WIP)

Cluster features are Kubernetes resources that can be applied to and managed within the active cluster.
The `Renderer.K8sApi.ResourceStack` class provides the functionality to input and apply kubernetes resources to a cluster.
It is up to the extension developer to manage the lifecycle of the resource stack.
It could be applied automatically to a cluster by the extension or the end-user could be required to install it, etc. from the cluster **Settings** page.

!!! info
    To access the cluster **Settings** page, right-click the relevant cluster in the left side menu and click **Settings**.

The following example shows how to add a cluster feature using a resource stack as part of a `Renderer.LensExtension`:

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

export class ExampleResourceStack {
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

The `ExampleResourceStack` cluster feature can be managed by the end-user on the cluster **Settings** page via a `Renderer.LensExtension.entitySettings` entry.

```typescript
 import React from "react";
 import { Common, Renderer } from "@k8slens/extensions";
 import { observer } from "mobx-react";
 import { computed, observable, makeObservable } from "mobx";
 import { ExampleResourceStack } from "./example-resource-stack";
 
 const {
   K8sApi: {
     forCluster, StatefulSet, DaemonSet, Deployment,
   },
   Component: {
     SubTitle, Button,
   }
 } = Renderer;
 
 interface Props {
   cluster: Common.Catalog.KubernetesCluster;
 }
 
 @observer
 export class ExampleResourceStackSettings extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  @observable installed = false;
  @observable inProgress = false;

  feature: ExampleResourceStack;

  async componentDidMount() {
    this.feature = new ExampleResourceStack(this.props.cluster);

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
          <SubTitle title="Example Resource Stack" />
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
