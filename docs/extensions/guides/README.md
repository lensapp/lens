# Extension Guides

The basics of the Lens Extension API are covered in [Your First Extension](../get-started/your-first-extension.md). In this section detailed code guides and samples are used to explain how to use specific Lens Extension APIs.

Each guide or sample will include:

- Clearly commented source code.
- Instructions for running the sample extension.
- Image of the sample extension's appearance and usage.
- Listing of Extension API being used.
- Explanation of Extension API concepts.

## Guides

| Guide | APIs |
| ----- | ----- |
| [Main process extension](main-extension.md) | LensMainExtension |
| [Renderer process extension](renderer-extension.md) | LensRendererExtension |
| [Stores](stores.md) | |
| [Components](components.md) | |
| [KubeObjectListLayout](kube-object-list-layout.md) | |

## Samples

| Sample | APIs |
| ----- | ----- |
[helloworld](https://github.com/lensapp/lens-extension-samples/tree/master/helloworld-sample) | LensMainExtension <br> LensRendererExtension <br> Component.Icon <br> Component.IconProps |
[minikube](https://github.com/lensapp/lens-extension-samples/tree/master/minikube-sample) | LensMainExtension <br> Store.clusterStore <br> Store.workspaceStore |