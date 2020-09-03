import { LensExtension } from "@lens/extensions";

export default class ExampleExtension extends LensExtension {
  async init(): Promise<any> {
    console.log('Example extension: init')
    return super.init();
  }
}
