import { LensExtension, Icon, LensRuntimeRendererEnv } from "@lens/extensions"; // fixme: map to generated types from "extension-api.d.ts"

// todo: register custom icon in cluster-menu
// todo: register custom view by clicking the item

export default class ExampleExtension extends LensExtension {
  async enable(runtime: /*LensRuntimeRendererEnv*/ any): Promise<any> {
    try {
      super.enable(runtime);
      runtime.logger.info('EXAMPLE EXTENSION: ENABLE() override');
    } catch (err){
      console.error(err)
    }
  }
}

// <Icon material="camera" onClick={() => console.log("done")}/>