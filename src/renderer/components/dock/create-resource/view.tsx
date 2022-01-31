/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { GroupSelectOption, Select, SelectOption } from "../../select";
import yaml from "js-yaml";
import { IComputedValue, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import type { CreateResourceTabStore } from "./store";
import type { DockTab } from "../dock/store";
import { EditorPanel } from "../editor-panel";
import { InfoPanel } from "../info-panel";
import * as resourceApplierApi from "../../../../common/k8s-api/endpoints/resource-applier.api";
import { Notifications } from "../../notifications";
import logger from "../../../../common/logger";
import type { KubeJsonApiData } from "../../../../common/k8s-api/kube-json-api";
import { getDetailsUrl } from "../../kube-detail-params";
import { apiManager } from "../../../../common/k8s-api/api-manager";
import { prevDefault } from "../../../utils";
import { navigate } from "../../../navigation";
import { withInjectables } from "@ogre-tools/injectable-react";
import createResourceTabStoreInjectable from "./store.injectable";
import createResourceTemplatesInjectable from "./create-resource-templates.injectable";
import { Spinner } from "../../spinner";

interface Props {
  tab: DockTab;
}

interface Dependencies {
  createResourceTemplates: IComputedValue<GroupSelectOption<SelectOption>[]>;
  createResourceTabStore: CreateResourceTabStore;
}

@observer
class NonInjectedCreateResource extends React.Component<Props & Dependencies> {
  @observable error = "";

  constructor(props: Props & Dependencies) {
    super(props);
    makeObservable(this);
  }

  get tabId() {
    return this.props.tab.id;
  }

  get data() {
    return this.props.createResourceTabStore.getData(this.tabId);
  }

  onChange = (value: string) => {
    this.error = ""; // reset first, validation goes later
    this.props.createResourceTabStore.setData(this.tabId, value);
  };

  onError = (error: Error | string) => {
    this.error = error.toString();
  };

  onSelectTemplate = (item: SelectOption<string>) => {
    this.props.createResourceTabStore.setData(this.tabId, item.value);
  };

  create = async (): Promise<void> => {
    if (this.error || !this.data.trim()) {
      // do not save when field is empty or there is an error
      return;
    }

    // skip empty documents
    const resources = yaml.loadAll(this.data).filter(Boolean);

    if (resources.length === 0) {
      return void logger.info("Nothing to create");
    }

    const creatingResources = resources.map(async (resource: string) => {
      try {
        const data = await resourceApplierApi.update(resource) as KubeJsonApiData;
        const { kind, apiVersion, metadata: { name, namespace }} = data;

        const showDetails = () => {
          const resourceLink = apiManager.lookupApiLink({ kind, apiVersion, name, namespace });

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
  };

  renderControls() {
    return (
      <div className="flex gaps align-center">
        <Select
          autoConvertOptions={false}
          controlShouldRenderValue={false} // always keep initial placeholder
          className="TemplateSelect"
          placeholder="Select Template ..."
          options={this.props.createResourceTemplates.get()}
          menuPlacement="top"
          themeName="outlined"
          onChange={ this.onSelectTemplate}
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

export const CreateResource = withInjectables<Dependencies, Props>(NonInjectedCreateResource, {
  getPlaceholder: () => <Spinner center />,

  getProps: async (di, props) => ({
    createResourceTabStore: di.inject(createResourceTabStoreInjectable),
    createResourceTemplates: await di.inject(createResourceTemplatesInjectable),
    ...props,
  }),
});
