import { LensMainExtension } from "@k8slens/extensions";

export default class ExampleExtensionMain extends LensMainExtension {
  onActivate() {
    console.log('EXAMPLE EXTENSION MAIN: ACTIVATED');
  }

  onDeactivate() {
    console.log('EXAMPLE EXTENSION MAIN: DEACTIVATED');
  }
}
