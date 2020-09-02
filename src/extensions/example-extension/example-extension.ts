// fixme: hook up generated types from extension-api.ts (tsc --declaration)
// fixme: provide compile or runtime import
import { LensExtension } from "@lens/extensions";

export default class ExampleExtension extends LensExtension {
  async init(): Promise<any> {
    console.log('Example extension: init')
    return super.init();
  }
}

export const someData = {
  title: "it works"
}