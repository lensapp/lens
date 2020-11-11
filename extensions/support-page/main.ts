import { LensMainExtension, Navigation } from "@k8slens/extensions";
import { supportPageURL } from "./src/support.route";

export default class SupportPageMainExtension extends LensMainExtension {
  appMenus = [
    {
      parentId: "help",
      label: "Support",
      click() {
        Navigation.navigate(supportPageURL());
      }
    }
  ]
}
