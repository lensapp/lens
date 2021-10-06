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
import { DockTabStore } from "./dock-tab.store";
import { dockStore, DockTabCreateSpecific, TabKind } from "./dock.store";
import { action, makeObservable, observable } from "mobx";

export interface TemplatesGroup {
  label: string;
  templates: Record<string/*filename*/, string /*contents*/>;
}

export class CreateResourceStore extends DockTabStore<string> {
  constructor() {
    super({ storageKey: "create_resource" });
    makeObservable(this);
  }

  readonly templateGroups: Record<string, TemplatesGroup> = observable({
    [this.appTemplatesFolder]: {
      label: "Lens Templates",
      templates: {} as Record<string/*filename*/, string /*contents*/>,
    },
    [this.userTemplatesFolder]: {
      label: "Custom templates",
      templates: {},
    },
  });

  get appTemplatesFolder(): string {
    // production: declare files to copy in "package.json" -> "build.extraResources"
    return path.resolve(__static, "../templates/create-resource");
  }

  get userTemplatesFolder(): string {
    return path.resolve(os.homedir(), "~/.k8slens/templates");
  }

  protected async init() {
    super.init();

    // scan all available templates immediately
    await this.scanTemplates(this.appTemplatesFolder);
    await this.scanTemplates(this.userTemplatesFolder);
  }

  @action
  private async scanTemplates(sourceFolder: string): Promise<void> {
    try {
      const templatesGroup = this.templateGroups[sourceFolder];

      if (!templatesGroup) return; // exit: unknown templates source folder

      await fs.ensureDir(sourceFolder);
      const fileNames = await fs.readdir(sourceFolder);

      templatesGroup.templates = Object.fromEntries(
        fileNames.map(fileName => [fileName, "" /* empty: content not loaded yet */])
      );
    } catch (error) {
      console.error(`[CREATE-RESOURCE]: scanning template folders error: ${error}`);
    }
  }

  @action
  async loadTemplate(init: { fileName: string, sourceFolder: string }): Promise<string> {
    const { fileName, sourceFolder } = init;

    const templatesGroup = this.templateGroups[sourceFolder];

    if (!templatesGroup) {
      return ""; // unknown group, exit
    }

    const template = templatesGroup.templates[fileName];

    if (template) return template; // return cache, preloaded already

    try {
      const templatePath = path.resolve(sourceFolder, fileName);
      const pathExists = await fs.pathExists(templatePath);

      if (!pathExists) return ""; // template file not exists, skip

      const textContent = await fs.readFile(templatePath, { encoding: "utf-8" });

      templatesGroup.templates[fileName] = textContent; // save cache

      return textContent;
    } catch (error) {
      console.error(`[CREATE-RESOURCE]: reading "${sourceFolder}/${fileName}" has failed: ${error}`);
    }

    return "";
  }

  // bundled app templates via webpack.renderer.ts, "?raw"-query loads content as text
  async getBundledTemplate(fileName: string, ext = "yaml"): Promise<string> {
    return import(`${this.appTemplatesFolder}/${fileName}.${ext}?raw`);
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
