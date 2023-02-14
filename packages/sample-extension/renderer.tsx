import { Renderer } from "@k8slens/extensions";

export default class extends Renderer.LensExtension {
  async onActivate() {
    console.log("Activating @k8slens/sample-extension");
  }

  async onDeactivate() {
    console.log("Disabling @k8slens/sample-extension");
  }
}
