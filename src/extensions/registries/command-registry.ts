// Extensions API -> Commands

import { BaseRegistry } from "./base-registry";
import { action, observable } from "mobx";
import { LensExtension } from "../lens-extension";
import { CatalogEntity } from "../../common/catalog";

export type CommandContext = {
  entity?: CatalogEntity;
};

export interface CommandRegistration {
  id: string;
  title: string;
  scope: "entity" | "global";
  action: (context: CommandContext) => void;
  isActive?: (context: CommandContext) => boolean;
}

export class CommandRegistry extends BaseRegistry<CommandRegistration> {
  @observable activeEntity: CatalogEntity;

  @action
  add(items: CommandRegistration | CommandRegistration[], extension?: LensExtension) {
    const itemArray = [items].flat();

    const newIds = itemArray.map((item) => item.id);
    const currentIds = this.getItems().map((item) => item.id);

    const filteredIds = newIds.filter((id) => !currentIds.includes(id));
    const filteredItems = itemArray.filter((item) => filteredIds.includes(item.id));

    return super.add(filteredItems, extension);
  }
}

export const commandRegistry = new CommandRegistry();
