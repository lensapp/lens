/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { CatalogEntity } from "../../../../common/catalog";

/**
 * The context given to commands when executed
 */
export interface CommandContext {
  entity?: CatalogEntity;
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
