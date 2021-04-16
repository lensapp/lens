import fs from "fs-extra";
import path from "path";
import os from "os";
import groupBy from "lodash/groupBy";
import filehound from "filehound";
import { watch } from "chokidar";
import { autobind } from "../../utils";
import { DockTabStore } from "./dock-tab.store";
import { dockStore, IDockTab, TabKind } from "./dock.store";

@autobind()
export class CreateResourceStore extends DockTabStore<string> {

  constructor() {
    super({
      storageKey: "create_resource"
    });
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
    return groupBy(templates,(v:string) =>
      path.relative(templatesPath,v).split(path.sep).length>1
        ? path.parse(path.relative(templatesPath,v)).dir
        : defaultGroup);
  }

  async getMergedTemplates() {
    const userTemplates = await this.getTemplates(this.userTemplatesFolder, "ungrouped");
    const lensTemplates = await this.getTemplates(this.lensTemplatesFolder, "lens");

    return {...userTemplates,...lensTemplates};
  }

  async watchUserTemplates(callback: ()=> void){
    watch(this.userTemplatesFolder, {
      depth: 1,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 500
      }
    }).on("all", () => {
      callback();
    });
  }
}

export const createResourceStore = new CreateResourceStore();

export function createResourceTab(tabParams: Partial<IDockTab> = {}) {
  return dockStore.createTab({
    kind: TabKind.CREATE_RESOURCE,
    title: "Create resource",
    ...tabParams
  });
}

export function isCreateResourceTab(tab: IDockTab) {
  return tab && tab.kind === TabKind.CREATE_RESOURCE;
}
