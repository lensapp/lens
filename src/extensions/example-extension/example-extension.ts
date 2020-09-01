import { LensExtension } from "@lens"; // todo: handle runtime import

export default class ExampleExtension extends LensExtension {
  async init(): Promise<any> {
    console.log('Example extension: init')
    return super.init();
  }
}
