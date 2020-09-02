// import { LensExtension } from "@lens"; // fixme: provide runtime import

export default class ExampleExtension /*extends LensExtension*/ {
  async init(): Promise<any> {
    console.log('Example extension: init')
    // return super.init();
  }
}

export const someData = {
  title: "it works"
}