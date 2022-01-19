# Extension Guides

This section explains how to use specific Lens Extension APIs.
It includes detailed guides and code samples.
For introductory information about the Lens Extension API, please see [Your First Extension](../get-started/your-first-extension.md).

Each guide or code sample includes the following:

- Clearly commented source code.
- Instructions for running the sample extension.
- An image showing the sample extension's appearance and usage.
- A listing of the Extension API being used.
- An explanation of the concepts relevant to the Extension.

## Guides

| Guide                                                           | APIs                   |
| --------------------------------------------------------------- | ---------------------- |
| [Generate new extension project](generator.md)                  |                        |
| [Main process extension](main-extension.md)                     | Main.LensExtension     |
| [Renderer process extension](renderer-extension.md)             | Renderer.LensExtension |
| [Resource stack (cluster feature)](resource-stack.md)           |                        |
| [Extending KubernetesCluster)](extending-kubernetes-cluster.md) |                        |
| [Stores](stores.md)                                             |                        |
| [Components](components.md)                                     |                        |
| [KubeObjectListLayout](kube-object-list-layout.md)              |                        |
| [Working with mobx](working-with-mobx.md)                       |                        |
| [Protocol Handlers](protocol-handlers.md)                       |                        |
| [Sending Data between main and renderer](ipc.md)                |                        |
| [Catalog Entities and Categories](catalog.md)                   |                        |

## Samples

| Sample                                                                                                                 | APIs                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [hello-world](https://github.com/lensapp/lens-extension-samples/tree/master/helloworld-sample)                         | LensMainExtension <br> LensRendererExtension <br> Renderer.Component.Icon <br> Renderer.Component.IconProps                                                                                                           |
| [styling-css-modules-sample](https://github.com/lensapp/lens-extension-samples/tree/master/styling-css-modules-sample) | LensMainExtension <br> LensRendererExtension <br> Renderer.Component.Icon <br> Renderer.Component.IconProps                                                                                                           |
| [styling-emotion-sample](https://github.com/lensapp/lens-extension-samples/tree/master/styling-emotion-sample)         | LensMainExtension <br> LensRendererExtension <br> Renderer.Component.Icon <br> Renderer.Component.IconProps                                                                                                           |
| [styling-sass-sample](https://github.com/lensapp/lens-extension-samples/tree/master/styling-sass-sample)               | LensMainExtension <br> LensRendererExtension <br> Renderer.Component.Icon <br> Renderer.Component.IconProps                                                                                                           |
| [custom-resource-page](https://github.com/lensapp/lens-extension-samples/tree/master/custom-resource-page)             | LensRendererExtension <br> Renderer.K8sApi.KubeApi <br> Renderer.K8sApi.KubeObjectStore <br> Renderer.Component.KubeObjectListLayout <br> Renderer.Component.KubeObjectDetailsProps <br> Renderer.Component.IconProps |
