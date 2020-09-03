import { LensExtension, LensRendererRuntimeEnv } from "@lens/extensions";

export default class ExampleExtension extends LensExtension {
  todo(){
    console.log(this.runtime.apiManager); // fixme: incorrect types import, "runtime" doesn't exists
  }

  async activate(runtime: LensRendererRuntimeEnv): Promise<any> {
    await super.activate(runtime);
    console.log('Example extension: activate');
  }

  async deactivate(): Promise<any> {
    console.log('Example extension: deactivate')
    await super.deactivate();
  }
}
