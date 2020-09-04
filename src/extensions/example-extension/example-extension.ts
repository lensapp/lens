import { LensExtension } from "@lens/extensions"; // fixme: map to generated types from "extension-api.d.ts"

// todo: register custom icon in cluster-menu
// todo: register custom view by clicking the item

export default class ExampleExtension extends LensExtension {
  async activate(): Promise<any> {
    await super.activate();
    console.warn('EXAMPLE EXTENSION: ACTIVATE'.padStart(10, "-"));
  }

  async deactivate(): Promise<any> {
    console.warn('EXAMPLE EXTENSION: DEACTIVATE'.padStart(10, "-"))
    await super.deactivate();
  }
}
