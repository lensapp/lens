import "./create-resource.scss";

import React from "react";
import path from "path";
import fs from "fs-extra";
import {Select, GroupSelectOption, SelectOption} from "../select";
import jsYaml from "js-yaml";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { createResourceStore } from "./create-resource.store";
import { IDockTab } from "./dock.store";
import { EditorPanel } from "./editor-panel";
import { InfoPanel } from "./info-panel";
import { resourceApplierApi } from "../../api/endpoints/resource-applier.api";
import { JsonApiErrorParsed } from "../../api/json-api";
import { Notifications } from "../notifications";

interface Props {
  className?: string;
  tab: IDockTab;
}

@observer
export class CreateResource extends React.Component<Props> {
  @observable currentTemplates:Map<string,SelectOption> = new Map();
  @observable error = "";
  @observable templates:GroupSelectOption<SelectOption>[] = [];

  componentDidMount() {
    createResourceStore.getMergedTemplates().then(v => this.updateGroupSelectOptions(v));
    createResourceStore.watchUserTemplates(() => createResourceStore.getMergedTemplates().then(v => this.updateGroupSelectOptions(v)));
  }

  updateGroupSelectOptions(templates :Record<string, string[]>) {
    this.templates = Object.entries(templates)
      .map(([name, grouping]) => this.convertToGroup(name, grouping));
  }

  convertToGroup(group:string, items:string[]):GroupSelectOption {
    const options = items.map(v => ({label: path.parse(v).name, value: v}));

    return {label: group, options};
  }

  get tabId() {
    return this.props.tab.id;
  }

  get data() {
    return createResourceStore.getData(this.tabId);
  }

  get currentTemplate() {
    return this.currentTemplates.get(this.tabId) ?? null;
  }

  onChange = (value: string, error?: string) => {
    createResourceStore.setData(this.tabId, value);
    this.error = error;
  };

  onSelectTemplate = (item: SelectOption) => {
    this.currentTemplates.set(this.tabId, item);
    fs.readFile(item.value,"utf8").then(v => createResourceStore.setData(this.tabId,v));
  };

  create = async () => {
    if (this.error) return;
    if (!this.data.trim()) return; // do not save when field is empty
    const resources = jsYaml.safeLoadAll(this.data)
      .filter(v => !!v); // skip empty documents if "---" pasted at the beginning or end
    const createdResources: string[] = [];
    const errors: string[] = [];

    await Promise.all(
      resources.map(data => {
        return resourceApplierApi.update(data)
          .then(item => createdResources.push(item.getName()))
          .catch((err: JsonApiErrorParsed) => errors.push(err.toString()));
      })
    );

    if (errors.length) {
      errors.forEach(error => Notifications.error(error));
      if (!createdResources.length) throw errors[0];
    }
    const successMessage = (
      <p>
        {createdResources.length === 1 ? "Resource" : "Resources"}{" "}
        <b>{createdResources.join(", ")}</b> successfully created
      </p>
    );

    Notifications.ok(successMessage);

    return successMessage;
  };

  renderControls(){
    return (
      <div className="flex gaps align-center">
        <Select
          autoConvertOptions = {false}
          className="TemplateSelect"
          placeholder="Select Template ..."
          options={this.templates}
          menuPlacement="top"
          themeName="outlined"
          onChange={v => this.onSelectTemplate(v)}
          value = {this.currentTemplate}
        />
      </div>
    );
  }


  render() {
    const { tabId, data, error, create, onChange } = this;
    const { className } = this.props;

    return (
      <div className={cssNames("CreateResource flex column", className)}>
        <InfoPanel
          tabId={tabId}
          error={error}
          controls={this.renderControls()}
          submit={create}
          submitLabel="Create"
          showNotifications={false}
        />
        <EditorPanel
          tabId={tabId}
          value={data}
          onChange={onChange}
        />
      </div>
    );
  }
}
