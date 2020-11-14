import { LensMainExtension } from "@k8slens/extensions";

export default class SupportPageMainExtension extends LensMainExtension {
  appMenus = [
    {
      parentId: "help",
      label: "Support",
      click: () => {
        this.navigate("/support");
      }
    }
  ]
}
