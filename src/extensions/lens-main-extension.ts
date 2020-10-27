import type { MenuRegistration } from "./registries/menu-registry";
import { observable } from "mobx";
import { LensExtension } from "./lens-extension"

export class LensMainExtension extends LensExtension {
  @observable.shallow appMenus: MenuRegistration[] = []
}
