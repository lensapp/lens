import { LensExtension } from "@lens/extensions"; // fixme: map to generated types from "extension-api.d.ts"

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
