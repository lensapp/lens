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

// Extensions API -> Commands

import { BaseRegistry } from "./base-registry";
import type { LensExtension } from "../lens-extension";
import type { CatalogEntity } from "../../common/catalog";

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
  add(items: CommandRegistration | CommandRegistration[], extension?: LensExtension) {
    const itemArray = [items].flat();

    const newIds = itemArray.map((item) => item.id);
    const currentIds = this.getItems().map((item) => item.id);

    const filteredIds = newIds.filter((id) => !currentIds.includes(id));
    const filteredItems = itemArray.filter((item) => filteredIds.includes(item.id));

    return super.add(filteredItems, extension);
  }
}
