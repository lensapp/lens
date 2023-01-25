/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogEntity } from "../../../../common/catalog";

/**
 * The context given to commands when executed
 */
export interface CommandContext {
  readonly entity: CatalogEntity;
}

export interface CommandActionNavigateOptions {
  /**
   * If `true` then the navigate will only navigate on the root frame and not
   * within a cluster
   * @default false
   */
  forceRootFrame?: boolean;
}

export interface CommandActionContext extends CommandContext {
  navigate: (url: string, opts?: CommandActionNavigateOptions) => void;
}

export interface CommandRegistration {
  /**
   * The ID of the command, must be globally unique
   */
  id: string;

  /**
   * The display name of the command in the command pallet
   */
  title: string | ((context: CommandContext) => string);

  /**
   * @deprecated use `isActive` instead since there is always an entity active
   */
  scope?: "global" | "entity";

  /**
   * The function to run when this command is selected
   */
  action: (context: CommandActionContext) => void;

  /**
   * A function that determines if the command is active.
   *
   * @default () => true
   */
  isActive?: (context: CommandContext) => boolean;
}

export type RegisteredCommand = Required<Omit<CommandRegistration, "scope">>;
