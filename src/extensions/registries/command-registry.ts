// Extensions API -> Commands

import type { Cluster } from "../../main/cluster";
import type { Workspace } from "../../common/workspace-store";
import { BaseRegistry } from "./base-registry";

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
}

export const commandRegistry = new CommandRegistry();
