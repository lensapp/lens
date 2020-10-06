import { LensMainExtension } from "@lens/extensions";

export default class ExampleExtensionMain extends LensMainExtension {
  onActivate() {
    console.log('EXAMPLE EXTENSION MAIN: ACTIVATED', this.getMeta());
  }

  onEvent(evt: any) {
    //
  }

  onDeactivate() {
    console.log('EXAMPLE EXTENSION MAIN: DEACTIVATED', this.getMeta());
  }
}
