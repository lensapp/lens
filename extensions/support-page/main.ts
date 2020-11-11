import { LensMainExtension } from "@k8slens/extensions";
import { pageUrl } from "./src/common-vars";

export default class SupportPageMainExtension extends LensMainExtension {
  appMenus = [
    {
      parentId: "help",
      label: "Support",
      click: () => {
        this.navigate(this.getPageUrl(pageUrl)); // todo: simplify
      }
    }
  ]
}
