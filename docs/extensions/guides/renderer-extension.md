# Renderer Extension

The renderer extension api is the interface to Lens' renderer process (Lens runs in main and renderer processes). It allows you to access, configure, and customize Lens data, add custom Lens UI elements, and generally run custom code in Lens' renderer process. The custom Lens UI elements that can be added include global pages, cluster pages, cluster features, app preferences, status bar items, KubeObject menu items, and KubeObject details items.

## LensRendererExtension Class

To create a renderer extension simply extend the `LensRendererExtension` class:

```
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

### globalPages

### clusterPages

### clusterFeatures

### appPreferences

### statusBarItems

### kubeObjectMenuItems

### kubeObjectDetailItems
