// Extensions API -> Commands

import type { Cluster } from "../../main/cluster";
import type { Workspace } from "../../common/workspace-store";
import { BaseRegistry } from "./base-registry";
import { action } from "mobx";
import { LensExtension } from "../lens-extension";

export type CommandContext = {
  cluster?: Cluster;
  workspace?: Workspace;
};

export interface CommandRegistration {
  id: string;
  title: string;
  scope: "cluster" | "global";
  action: (context: CommandContext) => void;
  isActive?: (context: CommandContext) => boolean;
}

export class CommandRegistry extends BaseRegistry<CommandRegistration> {
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
