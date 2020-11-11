import type { MenuRegistration } from "./registries/menu-registry";
import { observable } from "mobx";
import { LensExtension } from "./lens-extension"
import { WindowManager } from "../main/window-manager";

export class LensMainExtension extends LensExtension {
  @observable.shallow appMenus: MenuRegistration[] = []

  async navigate(location: string, frameId?: number) {
    await WindowManager.getInstance<WindowManager>().navigate(location, frameId)
  }
}
