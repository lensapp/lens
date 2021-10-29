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

import "./create-resource.scss";

import React from "react";
import path from "path";
import fs from "fs-extra";
import { Select, GroupSelectOption, SelectOption } from "../select";
import yaml from "js-yaml";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { createResourceStore } from "./create-resource.store";
import type { DockTab } from "./dock.store";
import { EditorPanel } from "./editor-panel";
import { InfoPanel } from "./info-panel";
import * as resourceApplierApi from "../../../common/k8s-api/endpoints/resource-applier.api";
import { Notifications } from "../notifications";
import { monacoModelsManager } from "./monaco-model-manager";
import logger from "../../../common/logger";

interface Props {
  className?: string;
  tab: DockTab;
}

@observer
export class CreateResource extends React.Component<Props> {
  @observable currentTemplates:Map<string, SelectOption> = new Map();
  @observable error = "";
  @observable templates:GroupSelectOption<SelectOption>[] = [];

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    createResourceStore.getMergedTemplates().then(v => this.updateGroupSelectOptions(v));
    createResourceStore.watchUserTemplates(() => createResourceStore.getMergedTemplates().then(v => this.updateGroupSelectOptions(v)));
  }

  updateGroupSelectOptions(templates :Record<string, string[]>) {
    this.templates = Object.entries(templates)
      .map(([name, grouping]) => this.convertToGroup(name, grouping));
  }

  convertToGroup(group:string, items:string[]):GroupSelectOption {
    const options = items.map(v => ({ label: path.parse(v).name, value: v }));

    return { label: group, options };
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
    fs.readFile(item.value, "utf8").then(v => {
      createResourceStore.setData(this.tabId, v);
      monacoModelsManager.getModel(this.tabId).setValue(v ?? "");
    });
  };

  create = async (): Promise<undefined> => {
    if (this.error || !this.data.trim()) {
      // do not save when field is empty or there is an error
      return null;
    }

    // skip empty documents
    const resources = yaml.loadAll(this.data).filter(Boolean);
    const createdResources: string[] = [];

    if (resources.length === 0) {
      return void logger.info("Nothing to create");
    }

    for (const result of await Promise.allSettled(resources.map(resourceApplierApi.update))) {
      if (result.status === "fulfilled") {
        createdResources.push(result.value.metadata.name);
      } else {
        Notifications.error(result.reason.toString());
      }
    }

    if (createdResources.length > 0) {
      Notifications.ok((
        <p>
          {createdResources.length === 1 ? "Resource" : "Resources"}{" "}
          <b>{createdResources.join(", ")}</b> successfully created
        </p>
      ));
    }

    return undefined;
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
