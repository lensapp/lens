import { LensMainExtension, windowManager } from "@k8slens/extensions";
import { pageUrl } from "./src/common-vars";

export default class SupportPageMainExtension extends LensMainExtension {
  appMenus = [
    {
      parentId: "help",
      label: "Support",
      click: () => {
        windowManager.navigate(this.getPageUrl(pageUrl)); // todo: simplify
      }
    }
  ]
}
