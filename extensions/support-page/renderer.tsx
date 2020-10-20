import { LensRendererExtension } from "@lens/ui-extensions";

export default class SupportPageRendererExtension extends LensRendererExtension {
  async onActivate() {
    console.log("support page extension activated")
  }
}
