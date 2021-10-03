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
import { Select, SelectOption } from "../select";
import jsYaml from "js-yaml";
import { computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { createResourceStore } from "./create-resource.store";
import type { DockTab } from "./dock.store";
import { MonacoEditor } from "../monaco-editor";
import { InfoPanel } from "./info-panel";
import { resourceApplierApi } from "../../../common/k8s-api/endpoints/resource-applier.api";
import type { JsonApiErrorParsed } from "../../../common/k8s-api/json-api";
import { Notifications } from "../notifications";

interface Props {
  className?: string;
  tab: DockTab;
}

@observer
export class CreateResource extends React.Component<Props> {
  @observable currentTemplates: Map<string, SelectOption> = new Map();
  @observable error = "";
  @observable templates = observable.map<string/*filename*/, string>();

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  // TODO
  @computed get selectTemplateOptions(): SelectOption<string>[] {
    return [];
  }

  get tabId() {
    return this.props.tab.id;
  }

  get data() {
    return createResourceStore.getData(this.tabId);
  }

  get selectedTemplate() {
    return this.currentTemplates.get(this.tabId) ?? null;
  }

  onChange = (value: string) => {
    createResourceStore.setData(this.tabId, value);
  };

  onError = (error: string) => {
    this.error = error;
  };

  // FIXME
  onSelectTemplate = (item: SelectOption) => {
    console.log(`SELECTED TEMPLATE: ${this.tabId}`, item);
    // this.currentTemplates.set(this.tabId, item);
    //
    // fs.readFile(item.value, "utf8").then(templateFileContent => {
    //   createResourceStore.setData(this.tabId, templateFileContent);
    // });
  };

  create = async () => {
    if (this.error || !this.data.trim()) {
      // do not save when field is empty or there is an error
      return null;
    }

    // skip empty documents if "---" pasted at the beginning or end
    const resources = jsYaml.safeLoadAll(this.data).filter(Boolean);
    const createdResources: string[] = [];
    const errors: string[] = [];

    await Promise.all(
      resources.map(data => {
        return resourceApplierApi.update(data)
          .then(item => createdResources.push(item.metadata.name))
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

  renderControls() {
    return (
      <div className="flex gaps align-center">
        <Select
          autoConvertOptions={false}
          className="SelectResourceTemplate"
          placeholder="Select Template ..."
          options={this.selectTemplateOptions}
          menuPlacement="top"
          themeName="outlined"
          onChange={v => this.onSelectTemplate(v)}
          value={this.selectedTemplate}
        />
      </div>
    );
  }

  render() {
    const { tabId, data, error, create } = this;
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
        <MonacoEditor
          id={tabId}
          value={data}
          onChange={this.onChange}
          onError={this.onError}
        />
      </div>
    );
  }
}
