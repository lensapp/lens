/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./create-resource.scss";

import React from "react";
import path from "path";
import fs from "fs-extra";
import { GroupSelectOption, Select, SelectOption } from "../select";
import yaml from "js-yaml";
import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import type { CreateResourceStore } from "./create-resource-store/create-resource.store";
import type { DockTab } from "./dock-store/dock.store";
import { EditorPanel } from "./editor-panel";
import { InfoPanel } from "./info-panel";
import * as resourceApplierApi from "../../../common/k8s-api/endpoints/resource-applier.api";
import { Notifications } from "../notifications";
import logger from "../../../common/logger";
import type { KubeJsonApiData } from "../../../common/k8s-api/kube-json-api";
import { getDetailsUrl } from "../kube-detail-params";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { prevDefault } from "../../utils";
import { navigate } from "../../navigation";
import { withInjectables } from "@ogre-tools/injectable-react";
import createResourceStoreInjectable
  from "./create-resource-store/create-resource-store.injectable";

interface Props {
  tab: DockTab;
}

interface Dependencies {
  createResourceStore: CreateResourceStore
}

@observer
class NonInjectedCreateResource extends React.Component<Props & Dependencies> {
  @observable currentTemplates: Map<string, SelectOption> = new Map();
  @observable error = "";
  @observable templates: GroupSelectOption<SelectOption>[] = [];

  constructor(props: Props & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    this.props.createResourceStore.getMergedTemplates().then(v => this.updateGroupSelectOptions(v));
    this.props.createResourceStore.watchUserTemplates(() => this.props.createResourceStore.getMergedTemplates().then(v => this.updateGroupSelectOptions(v)));
  }

  updateGroupSelectOptions(templates: Record<string, string[]>) {
    this.templates = Object.entries(templates)
      .map(([name, grouping]) => this.convertToGroup(name, grouping));
  }

  convertToGroup(group: string, items: string[]): GroupSelectOption {
    const options = items.map(v => ({ label: path.parse(v).name, value: v }));

    return { label: group, options };
  }

  get tabId() {
    return this.props.tab.id;
  }

  get data() {
    return this.props.createResourceStore.getData(this.tabId);
  }

  get currentTemplate() {
    return this.currentTemplates.get(this.tabId) ?? null;
  }

  onChange = (value: string) => {
    this.error = ""; // reset first, validation goes later
    this.props.createResourceStore.setData(this.tabId, value);
  };

  onError = (error: Error | string) => {
    this.error = error.toString();
  };

  onSelectTemplate = (item: SelectOption) => {
    this.currentTemplates.set(this.tabId, item);
    fs.readFile(item.value, "utf8").then(v => {
      this.props.createResourceStore.setData(this.tabId, v);
    });
  };

  create = async (): Promise<undefined> => {
    if (this.error || !this.data.trim()) {
      // do not save when field is empty or there is an error
      return null;
    }

    // skip empty documents
    const resources = yaml.loadAll(this.data).filter(Boolean);

    if (resources.length === 0) {
      return void logger.info("Nothing to create");
    }

    const creatingResources = resources.map(async (resource: string) => {
      try {
        const data: KubeJsonApiData = await resourceApplierApi.update(resource);
        const { kind, apiVersion, metadata: { name, namespace }} = data;
        const resourceLink = apiManager.lookupApiLink({ kind, apiVersion, name, namespace });

        const showDetails = () => {
          navigate(getDetailsUrl(resourceLink));
          close();
        };

        const close = Notifications.ok(
          <p>
            {kind} <a onClick={prevDefault(showDetails)}>{name}</a> successfully created.
          </p>,
        );
      } catch (error) {
        Notifications.error(error?.toString() ?? "Unknown error occured");
      }
    });

    await Promise.allSettled(creatingResources);

    return undefined;
  };

  renderControls() {
    return (
      <div className="flex gaps align-center">
        <Select
          autoConvertOptions={false}
          controlShouldRenderValue={false} // always keep initial placeholder
          className="TemplateSelect"
          placeholder="Select Template ..."
          options={this.templates}
          menuPlacement="top"
          themeName="outlined"
          onChange={v => this.onSelectTemplate(v)}
          value={this.currentTemplate}
        />
      </div>
    );
  }

  render() {
    const { tabId, data, error } = this;

    return (
      <div className="CreateResource flex column">
        <InfoPanel
          tabId={tabId}
          error={error}
          controls={this.renderControls()}
          submit={this.create}
          submitLabel="Create"
          showNotifications={false}
        />
        <EditorPanel
          tabId={tabId}
          value={data}
          onChange={this.onChange}
          onError={this.onError}
        />
      </div>
    );
  }
}

export const CreateResource = withInjectables<Dependencies, Props>(
  NonInjectedCreateResource,

  {
    getProps: (di, props) => ({
      createResourceStore: di.inject(createResourceStoreInjectable),
      ...props,
    }),
  },
);
