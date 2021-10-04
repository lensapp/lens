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

import fs from "fs-extra";
import path from "path";
import os from "os";
import { autoBind } from "../../utils";
import { DockTabStore } from "./dock-tab.store";
import { dockStore, DockTabCreateSpecific, TabKind } from "./dock.store";

export class CreateResourceStore extends DockTabStore<string> {
  constructor() {
    super({
      storageKey: "create_resource"
    });
    autoBind(this);
  }

  protected async init() {
    super.init();
    await fs.ensureDir(this.userTemplatesFolder);
  }

  get userTemplatesFolder(): string {
    return path.resolve(os.homedir(), "~/.k8slens/templates");
  }

  async getTemplate(fileName: string, ext = "yaml") {
    return import(`../../../../templates/create-resource/${fileName}.${ext}?raw`);
  }
}

export const createResourceStore = new CreateResourceStore();

export function createResourceTab(tabParams: DockTabCreateSpecific = {}) {
  return dockStore.createTab({
    title: "Create resource",
    ...tabParams,
    kind: TabKind.CREATE_RESOURCE,
  });
}
