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
import { GroupSelectOption, Select, SelectOption } from "../select";
import jsYaml from "js-yaml";
import { computed, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { createResourceStore } from "./create-resource.store";
import { InfoPanel } from "./info-panel";
import { resourceApplierApi } from "../../../common/k8s-api/endpoints/resource-applier.api";
import type { JsonApiErrorParsed } from "../../../common/k8s-api/json-api";
import { Notifications } from "../notifications";
import { TabKind } from "./dock.store";
import type { DockTabContentProps } from "./dock-tab-content";
import { dockViewsManager } from "./dock.views-manager";

interface Props extends DockTabContentProps {
}

type SelectOptionTemplate = SelectOption<SelectOptionTemplateValue>;

interface SelectOptionTemplateValue {
  sourceFolder: string;
  fileName: string;
  content?: string; // available after loading (template selection)
}

@observer
export class CreateResource extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  get tabId() {
    return this.props.tab.id;
  }

  get draft() {
    return createResourceStore.getData(this.tabId);
  }

  create = async (): Promise<any> => {
    const isEmpty = !this.draft?.trim();

    if (!isEmpty) {
      return null;
    }

    // skip empty documents if "---" pasted at the beginning or end
    const resources = jsYaml.safeLoadAll(this.draft).filter(Boolean);
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
          controlShouldRenderValue={false} // always keep initial placeholder
          className="SelectResourceTemplate"
          placeholder="Select Template ..."
          menuPlacement="top"
          themeName="outlined"
          options={this.templateOptions}
          onChange={v => this.onSelectTemplate(v)}
        />
      </div>
    );
  }

  @computed get templateOptions(): GroupSelectOption<SelectOptionTemplate>[] {
    return Object.entries(createResourceStore.templateGroups).map(([sourceFolder, group]) => {
      return {
        label: group.label,
        options: Object.entries(group.templates).map(([fileName]) => {
          return {
            label: fileName,
            value: { fileName, sourceFolder },
          };
        }),
      };
    });
  }

  onSelectTemplate = async ({ value }: SelectOptionTemplate) => {
    const { fileName, sourceFolder, content } = value;
    const templateContent = content ?? await createResourceStore.loadTemplate({ fileName, sourceFolder });

    createResourceStore.setData(this.tabId, templateContent); // update draft
  };

  render() {
    return (
      <div className="CreateResource">
        <InfoPanel
          tabId={this.tabId}
          controls={this.renderControls()}
          submit={this.create}
          submitLabel="Create"
          showNotifications={false}
        />
      </div>
    );
  }
}

dockViewsManager.register(TabKind.CREATE_RESOURCE, {
  Content: CreateResource,
  editor: {
    getValue(tabId) {
      return createResourceStore.getData(tabId);
    },
    setValue(tabId, value) {
      createResourceStore.setData(tabId, value);
    },
  }
});
