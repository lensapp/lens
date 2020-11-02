import { LensMainExtension, Util } from "@k8slens/extensions";

export default class LicenseLensMainExtension extends LensMainExtension {
  appMenus = [
    {
      parentId: "help",
      label: "License",
      async click() {
        Util.openExternal("https://k8slens.dev/licenses/eula.md")
      }
    }
  ]
}
