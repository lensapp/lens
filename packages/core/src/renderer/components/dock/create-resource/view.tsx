/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { SelectOption } from "../../select";
import { Select } from "../../select";
import yaml, { dump } from "js-yaml";
import type { IComputedValue } from "mobx";
import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import type { CreateResourceTabStore } from "./store";
import { EditorPanel } from "../editor-panel";
import { InfoPanel } from "../info-panel";
import type { ShowNotification } from "../../notifications";
import type { Logger } from "../../../../common/logger";
import type { ApiManager } from "../../../../common/k8s-api/api-manager";
import { isObject, prevDefault } from "@k8slens/utilities";
import { withInjectables } from "@ogre-tools/injectable-react";
import createResourceTabStoreInjectable from "./store.injectable";
import createResourceTemplatesInjectable from "./create-resource-templates.injectable";
import { Spinner } from "../../spinner";
import type { GroupBase } from "react-select";
import type { Navigate } from "../../../navigation/navigate.injectable";
import type { GetDetailsUrl } from "../../kube-detail-params/get-details-url.injectable";
import apiManagerInjectable from "../../../../common/k8s-api/api-manager/manager.injectable";
import getDetailsUrlInjectable from "../../kube-detail-params/get-details-url.injectable";
import navigateInjectable from "../../../navigation/navigate.injectable";
import type { RequestKubeObjectCreation } from "../../../../common/k8s-api/endpoints/resource-applier.api/request-update.injectable";
import requestKubeObjectCreationInjectable from "../../../../common/k8s-api/endpoints/resource-applier.api/request-update.injectable";
import loggerInjectable from "../../../../common/logger.injectable";
import type { ShowCheckedErrorNotification } from "../../notifications/show-checked-error.injectable";
import showSuccessNotificationInjectable from "../../notifications/show-success-notification.injectable";
import showCheckedErrorNotificationInjectable from "../../notifications/show-checked-error.injectable";

export interface CreateResourceProps {
  tabId: string;
}

interface Dependencies {
  createResourceTemplates: IComputedValue<GroupBase<{ label: string; value: string }>[]>;
  createResourceTabStore: CreateResourceTabStore;
  apiManager: ApiManager;
  logger: Logger;
  navigate: Navigate;
  getDetailsUrl: GetDetailsUrl;
  requestKubeObjectCreation: RequestKubeObjectCreation;
  showSuccessNotification: ShowNotification;
  showCheckedErrorNotification: ShowCheckedErrorNotification;
}

@observer
class NonInjectedCreateResource extends React.Component<CreateResourceProps & Dependencies> {
  @observable error = "";

  constructor(props: CreateResourceProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  get tabId() {
    return this.props.tabId;
  }

  get data() {
    return this.props.createResourceTabStore.getData(this.tabId) ?? "";
  }

  onChange = (value: string) => {
    this.error = ""; // reset first, validation goes later
    this.props.createResourceTabStore.setData(this.tabId, value);
  };

  onError = (error: Error | string) => {
    this.error = error.toString();
  };

  create = async (): Promise<string | void> => {
    const { apiManager, getDetailsUrl, navigate, requestKubeObjectCreation } = this.props;

    if (this.error || !this.data?.trim()) {
      // do not save when field is empty or there is an error
      return;
    }

    // skip empty documents
    const resources = yaml.loadAll(this.data).filter(isObject);

    if (resources.length === 0) {
      return this.props.logger.info("Nothing to create");
    }

    const creatingResources = resources.map(async (resource) => {
      const result = await requestKubeObjectCreation(dump(resource));

      if (!result.callWasSuccessful) {
        this.props.logger.warn("Failed to create resource", { resource }, result.error);
        this.props.showCheckedErrorNotification(result.error, "Unknown error occurred while creating resources");

        throw result.error;
      }

      const { kind, apiVersion, metadata: { name, namespace }} = result.response;

      const close = this.props.showSuccessNotification((
        <p>
          {kind}
          {" "}
          <a
            onClick={prevDefault(() => {
              const resourceLink = apiManager.lookupApiLink({ kind, apiVersion, name, namespace });

              navigate(getDetailsUrl(resourceLink));
              close();
            })}
          >
            {name}
          </a>
          {" successfully created."}
        </p>
      ));
    });

    const results = await Promise.allSettled(creatingResources);

    if (results.some(result => result.status === "rejected")) {
      return;
    }

    return "All resources have been successfully created";
  };

  renderControls() {
    return (
      <div className="flex gaps align-center">
        <Select<string, SelectOption<string>, false>
          id="create-resource-resource-templates-input"
          controlShouldRenderValue={false} // always keep initial placeholder
          className="TemplateSelect"
          placeholder="Select Template ..."
          options={this.props.createResourceTemplates.get()}
          formatGroupLabel={group => group.label}
          menuPlacement="top"
          onChange={(option) => {
            if (option) {
              this.props.createResourceTabStore.setData(this.tabId, option.value);
            }
          }}
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

export const CreateResource = withInjectables<Dependencies, CreateResourceProps>(NonInjectedCreateResource, {
  getPlaceholder: () => <Spinner center />,

  getProps: async (di, props) => ({
    ...props,
    createResourceTabStore: di.inject(createResourceTabStoreInjectable),
    createResourceTemplates: await di.inject(createResourceTemplatesInjectable),
    apiManager: di.inject(apiManagerInjectable),
    logger: di.inject(loggerInjectable),
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
    navigate: di.inject(navigateInjectable),
    requestKubeObjectCreation: di.inject(requestKubeObjectCreationInjectable),
    showSuccessNotification: di.inject(showSuccessNotificationInjectable),
    showCheckedErrorNotification: di.inject(showCheckedErrorNotificationInjectable),
  }),
});
