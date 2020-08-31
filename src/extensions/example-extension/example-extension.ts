import { LensExtension } from "@lens"; // todo: handle runtime import

export class ExampleExtension extends LensExtension {
  async init(): Promise<any> {
    console.log('Example extension: init')
    return super.init();
  }
}
