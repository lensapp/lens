import fs from "fs-extra";
import path from "path";
import os from "os"
import chokidar from "chokidar"
import filehound from "filehound"
import { autobind } from "../../utils";
import { DockTabStore } from "./dock-tab.store";
import { dockStore, IDockTab, TabKind } from "./dock.store";
import { GroupSelectOption, SelectOption} from "../select";

export interface BadgedSelectOption extends SelectOption {
  badge?: string;
}

export interface BadgedGroupSelectOption extends GroupSelectOption<BadgedSelectOption> {
  badge?: string;
}


@autobind()
export class CreateResourceStore extends DockTabStore<string> {

  constructor() {
    super({
      storageKey: "create_resource"
    });
  }

  get lensTemplatesFolder():string {
    return path.resolve(__static, "../templates/create-resource");
  }

  get userTemplatesFolder():string {
    return path.join(os.homedir(), ".k8slens", "templates");
  }


  async getTemplates(templatesPath: string):Promise<GroupSelectOption[]>{
    const ungroupedTemplates:SelectOption[] = [];
    const templates:GroupSelectOption[] = [];
    let groups = await fs.readdir(templatesPath);
    await Promise.all(groups.map(async (group) =>{
      const groupAbsPath = path.join(templatesPath, group);
      if((await fs.stat(groupAbsPath)).isDirectory()){
        const files = await fs.readdir(groupAbsPath);
        const templateSelectOptions = await Promise.all(files.map(
            (template) => ({
              value: path.join(groupAbsPath,template),
              label: path.parse(template).name
            })
          )
        );
        templates.push({label: group.replace("-", " "), options: templateSelectOptions});
      } else {
        ungroupedTemplates.push({ value: groupAbsPath, label: path.parse(group).name});
      }
    }))
    if (ungroupedTemplates.length > 0){
      templates.push({label: "ungrouped", options: ungroupedTemplates})
    }
    return templates;
  }

  async getMergedTemplates():Promise<BadgedGroupSelectOption[]> {
    const lensTemplates =  await this.getTemplates(this.lensTemplatesFolder);
    const userTemplates = await this.getTemplates(this.userTemplatesFolder);
    const userGroupOptions:BadgedGroupSelectOption[] = userTemplates.filter(
      ({label}) => !lensTemplates.map(({label}) => label.toString().toLowerCase()).includes(label.toString().toLowerCase())
    ).map(({label,options}) => ({label, badge:"user", options}));
    // merge lens and user templates within lens groups, then merge lens and user groups
    const badgedTemplates:BadgedGroupSelectOption[] = lensTemplates.map( ({label, options}) => {
      const userOptions = userTemplates.find(userTemplate => userTemplate.label.toString().toLowerCase() == label.toString().toLowerCase())
      return {
        label,
        options: userOptions ? options.concat(userOptions.options.map((userOption) => ({label: userOption.label, badge: "user", value: userOption.value}))) : options
      };
    })
    return this.orderTemplatesGroups(userGroupOptions).concat(this.orderTemplatesGroups(badgedTemplates));
  }

  async watchUserTemplates(calback: ()=> void){

    chokidar.watch(this.userTemplatesFolder).on('all', () => {
        calback();
    });
  }

  orderTemplatesGroups(templates:BadgedGroupSelectOption[]): BadgedGroupSelectOption[] {
    const compare = (a:BadgedGroupSelectOption|BadgedSelectOption, b:BadgedGroupSelectOption|BadgedSelectOption) => {
      return a.label.toString() > b.label.toString() ? 1 : a.label.toString() < b.label.toString() ? -1 : 0
    }
    return templates.map( group => {
      group.options = group.options.sort((a, b) => compare(a,b));
      return group;
    }).sort((a, b) => compare(a,b));
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
