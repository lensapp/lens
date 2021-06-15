# Resource Stack (Cluster Feature)

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



Cluster features are Kubernetes resources that can be applied to and managed within the active cluster.
They can be installed and uninstalled by the Lens user from the cluster **Settings** page.

!!! info
    To access the cluster **Settings** page, right-click the relevant cluster in the left side menu and click **Settings**.

The following example shows how to add a cluster feature as part of a `LensRendererExtension`:

```typescript
import { Renderer } from "@k8slens/extensions"
import { ExampleFeature } from "./src/example-feature"
import React from "react"

export default class ExampleFeatureExtension extends Renderer.LensExtension {
  clusterFeatures = [
    {
      title: "Example Feature",
      components: {
        Description: () => {
          return (
            <span>
                Enable an example feature.
            </span>
          )
        }
      },
      feature: new ExampleFeature()
    }
  ];
}
```

The properties of the `clusterFeatures` array objects are defined as follows:

* `title` and `components.Description` provide content that appears on the cluster settings page, in the **Features** section.
* `feature` specifies an instance which extends the abstract class `ClusterFeature.Feature`, and specifically implements the following methods:

```typescript
  abstract install(cluster: Cluster): Promise<void>;
  abstract upgrade(cluster: Cluster): Promise<void>;
  abstract uninstall(cluster: Cluster): Promise<void>;
  abstract updateStatus(cluster: Cluster): Promise<ClusterFeatureStatus>;
```

The four methods listed above are defined as follows:

* The `install()` method installs Kubernetes resources using the `applyResources()` method, or by directly accessing the [Kubernetes API](../api/README.md).
This method is typically called when a user indicates that they want to install the feature (i.e., by clicking **Install** for the feature in the cluster settings page).

* The `upgrade()` method upgrades the Kubernetes resources already installed, if they are relevant to the feature.
This method is typically called when a user indicates that they want to upgrade the feature (i.e., by clicking **Upgrade** for the feature in the cluster settings page).

* The `uninstall()` method uninstalls Kubernetes resources using the [Kubernetes API](../api/README.md).
This method is typically called when a user indicates that they want to uninstall the feature (i.e., by clicking **Uninstall** for the feature in the cluster settings page).

* The `updateStatus()` method provides the current status information in the `status` field of the `ClusterFeature.Feature` parent class.
Lens periodically calls this method to determine details about the feature's current status.
The implementation of this method should uninstall Kubernetes resources using the Kubernetes api (`K8sApi`)
Consider using the following properties with `updateStatus()`:

    * `status.currentVersion` and `status.latestVersion` may be displayed by Lens in the feature's description.

    * `status.installed` should be set to `true` if the feature is installed, and `false` otherwise.

    * `status.canUpgrade` is set according to a rule meant to determine whether the feature can be upgraded.
    This rule can involve `status.currentVersion` and `status.latestVersion`, if desired.

The following shows a very simple implementation of a `ClusterFeature`:

```typescript
import { Renderer, Common } from "@k8slens/extensions";
import * as path from "path";

const {
  K8sApi: {
    ResourceStack, 
    forCluster, 
    StorageClass, 
    Namespace,
  }
} = Renderer;

type ResourceStack = Renderer.K8sApi.ResourceStack;
type Pod = Renderer.K8sApi.Pod;
type KubernetesCluster = Common.Catalog.KubernetesCluster;

export interface MetricsStatus {
  installed: boolean;
  canUpgrade: boolean;
}

export class ExampleFeature {
  protected stack: ResourceStack;

  constructor(protected cluster: KubernetesCluster) {
    this.stack = new ResourceStack(cluster, this.name);
  }

  install(): Promise<string> {
    return this.stack.kubectlApplyFolder(path.join(__dirname, "../resources/"));
  }

  upgrade(): Promise<string> {
    return this.install(config);
  }

  async getStatus(): Promise<MetricsStatus> {
    const status: MetricsStatus = { installed: false, canUpgrade: false};
    
    try {
      const pod = forCluster(cluster, Pod);
      const examplePod = await pod.get({name: "example-pod", namespace: "default"});
      
      if (examplePod?.kind) {
        status.installed = true;
        status.currentVersion = examplePod.spec.containers[0].image.split(":")[1];
        status.canUpgrade = true;  // a real implementation would perform a check here that is relevant to the specific feature
      } else {
        status.installed = false;
        status.canUpgrade = false;
      }
    } catch(e) {
      if (e?.error?.code === 404) {
        status.installed = false;
        status.canUpgrade = false;
      }
    }

    return status;
  }

  async uninstall(): Promise<string> {
    return this.stack.kubectlDeleteFolder(this.resourceFolder);
  }
}
```

This example implements the `install()` method by invoking the helper `applyResources()` method.
`applyResources()` tries to apply all resources read from all files found in the folder path provided.
In this case the folder path is the `../resources` subfolder relative to the current source code's folder.
The file `../resources/example-pod.yml` could contain:

``` yaml
apiVersion: v1
kind: Pod
metadata:
  name: example-pod
spec:
  containers:
  - name: example-pod
    image: nginx
```

The example above implements the four methods as follows:

* It implements `upgrade()` by invoking the `install()` method.
Depending on the feature to be supported by an extension, upgrading may require additional and/or different steps.

* It implements `uninstall()` by utilizing the [Kubernetes API](../api/README.md) which Lens provides to delete the `example-pod` applied by the `install()` method.

* It implements `updateStatus()` by using the [Kubernetes API](../api/README.md) which Lens provides to determine whether the `example-pod` is installed, what version is associated with it, and whether it can be upgraded.
The implementation determines what the status is for a specific cluster feature.

