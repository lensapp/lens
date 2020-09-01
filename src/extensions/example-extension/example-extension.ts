// import { LensExtension } from "@lens"; // fixme: provide runtime import
import { LensExtension } from "../extension";

export default class ExampleExtension extends LensExtension {
  async init(): Promise<any> {
    console.log('Example extension: init')
    return super.init();
  }
}
