import { LensExtension } from "@lens/extensions";

export default class ExampleExtensionMain extends LensExtension {
  onActivate() {
    console.log('EXAMPLE EXTENSION MAIN: ACTIVATED', this.getMeta());
  }

  onDeactivate() {
    console.log('EXAMPLE EXTENSION MAIN: DEACTIVATED', this.getMeta());
  }
}
