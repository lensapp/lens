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
import groupBy from "lodash/groupBy";
import filehound from "filehound";
import { watch } from "chokidar";
import { autoBind } from "../../utils";
import { DockTabStore } from "./dock-tab.store";
import { dockStore, DockTabCreateSpecific, TabKind } from "./dock.store";

export class CreateResourceStore extends DockTabStore<string> {
  constructor() {
    super({
      storageKey: "create_resource",
    });
    autoBind(this);
    fs.ensureDirSync(this.userTemplatesFolder);
  }

  get lensTemplatesFolder():string {
    return path.resolve(__static, "../templates/create-resource");
  }

  get userTemplatesFolder():string {
    return path.join(os.homedir(), ".k8slens", "templates");
  }

  async getTemplates(templatesPath: string, defaultGroup: string) {
    const templates = await filehound.create().path(templatesPath).ext(["yaml", "json"]).depth(1).find();

    return templates ? this.groupTemplates(templates, templatesPath, defaultGroup) : {};
  }

  groupTemplates(templates: string[], templatesPath: string, defaultGroup: string) {
    return groupBy(templates, (v:string) =>
      path.relative(templatesPath, v).split(path.sep).length>1
        ? path.parse(path.relative(templatesPath, v)).dir
        : defaultGroup);
  }

  async getMergedTemplates() {
    const userTemplates = await this.getTemplates(this.userTemplatesFolder, "ungrouped");
    const lensTemplates = await this.getTemplates(this.lensTemplatesFolder, "lens");

    return { ...userTemplates, ...lensTemplates };
  }

  async watchUserTemplates(callback: ()=> void){
    watch(this.userTemplatesFolder, {
      depth: 1,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
      },
    }).on("all", () => {
      callback();
    });
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
