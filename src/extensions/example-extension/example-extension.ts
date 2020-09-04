import { LensExtension, LensRendererRuntimeEnv } from "@lens/extensions"; // fixme: map to generated types from "extension-api.d.ts"

export default class ExampleExtension extends LensExtension {
  async activate(runtime: LensRendererRuntimeEnv): Promise<any> {
    await super.activate(runtime);
    console.log('Example extension: activate');
  }

  async deactivate(): Promise<any> {
    console.log('Example extension: deactivate')
    await super.deactivate();
  }
}
