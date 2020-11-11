import { LensMainExtension } from "@k8slens/extensions";
import { supportPageURL } from "./src/support.route";

export default class SupportPageMainExtension extends LensMainExtension {
  appMenus = [
    {
      parentId: "help",
      label: "Support",
      click: () => {
        this.navigate(supportPageURL());
      }
    }
  ]
}
