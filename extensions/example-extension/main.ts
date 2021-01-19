import { LensMainExtension } from "@k8slens/extensions";

export default class ExampleExtensionMain extends LensMainExtension {
  onActivate() {
    console.log("EXAMPLE EXTENSION MAIN: ACTIVATED", this.name, this.id);
  }

  onDeactivate() {
    console.log("EXAMPLE EXTENSION MAIN: DEACTIVATED", this.name, this.id);
  }
}
