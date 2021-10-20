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

import React from "react";
import { GroupSelectOption, Select, SelectOption } from "../select";
import yaml from "js-yaml";
import { computed, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { createResourceStore } from "./create-resource.store";
import { InfoPanel, InfoPanelProps } from "./info-panel";
import * as resourceApplierApi from "../../../common/k8s-api/endpoints/resource-applier.api";
import { Notifications } from "../notifications";
import { TabKind } from "./dock.store";
import { dockViewsManager } from "./dock.views-manager";
import logger from "../../../common/logger";

interface Props extends InfoPanelProps {
}

type SelectOptionTemplate = SelectOption<SelectOptionTemplateValue>;

interface SelectOptionTemplateValue {
  sourceFolder: string;
  filePath: string; // relative to `sourceFolder`
  content?: string; // available after loading (template selection)
}

@observer
export class CreateResourceInfoPanel extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  get tabId() {
    return this.props.tabId;
  }

  get draft() {
    return createResourceStore.getData(this.tabId);
  }

  create = async (): Promise<undefined> => {
    if (!this.draft) {
      // do not save when field is empty or there is an error
      return null;
    }

    // skip empty documents
    const resources = yaml.loadAll(this.draft).filter(Boolean);
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
        options: Object.entries(group.templates).map(([filePath]) => {
          return {
            label: filePath,
            value: { filePath, sourceFolder },
          };
        }),
      };
    });
  }

  onSelectTemplate = async ({ value }: SelectOptionTemplate) => {
    const { filePath, sourceFolder, content } = value;
    const templateContent = content ?? await createResourceStore.loadTemplate({ filePath, sourceFolder });

    createResourceStore.setData(this.tabId, templateContent); // update draft
  };

  render() {
    return (
      <InfoPanel
        {...this.props}
        controls={this.renderControls()}
        submit={this.create}
        submitLabel="Create"
        showNotifications={false}
      />
    );
  }
}

dockViewsManager.register(TabKind.CREATE_RESOURCE, {
  InfoPanel: CreateResourceInfoPanel,
  editor: {
    getValue(tabId) {
      return createResourceStore.getData(tabId);
    },
    setValue(tabId, value) {
      createResourceStore.setData(tabId, value);
    },
  }
});
