import { LensMainExtension } from "@k8slens/extensions";
import { shell } from "electron";

export default class LicenseLensMainExtension extends LensMainExtension {
  appMenus = [
    {
      parentId: "help",
      label: "License",
      async click() {
        shell.openExternal("https://k8slens.dev/licenses/eula.md");
      }
    }
  ]
}
