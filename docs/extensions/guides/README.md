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
| [Generate new extension project](generator.md) ||
| [Main process extension](main-extension.md) | LensMainExtension |
| [Renderer process extension](renderer-extension.md) | LensRendererExtension |
| [Stores](stores.md) | |
| [Components](components.md) | |
| [KubeObjectListLayout](kube-object-list-layout.md) | |
| [Working with mobx](working-with-mobx.md) | |

## Samples

| Sample | APIs |
| ----- | ----- |
[helloworld](https://github.com/lensapp/lens-extension-samples/tree/master/helloworld-sample) | LensMainExtension <br> LensRendererExtension <br> Component.Icon <br> Component.IconProps |
[minikube](https://github.com/lensapp/lens-extension-samples/tree/master/minikube-sample) | LensMainExtension <br> Store.clusterStore <br> Store.workspaceStore |
[styling-css-modules-sample](https://github.com/lensapp/lens-extension-samples/tree/master/styling-css-modules-sample) | LensMainExtension <br> LensRendererExtension <br> Component.Icon <br> Component.IconProps |
[styling-emotion-sample](https://github.com/lensapp/lens-extension-samples/tree/master/styling-emotion-sample) | LensMainExtension <br> LensRendererExtension <br> Component.Icon <br> Component.IconProps |
[styling-sass-sample](https://github.com/lensapp/lens-extension-samples/tree/master/styling-sass-sample) | LensMainExtension <br> LensRendererExtension <br> Component.Icon <br> Component.IconProps |
[custom-resource-page](https://github.com/lensapp/lens-extension-samples/tree/master/custom-resource-page) | LensRendererExtension <br> K8sApi.KubeApi <br> K8sApi.KubeObjectStore <br> Component.KubeObjectListLayout <br> Component.KubeObjectDetailsProps <br> Component.IconProps |
