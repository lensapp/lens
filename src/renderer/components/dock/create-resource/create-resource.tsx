/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./create-resource.scss";

import React, { useEffect, useState } from "react";
import path from "path";
import fs from "fs-extra";
import { GroupSelectOption, Select, SelectOption } from "../../select";
import yaml from "js-yaml";
import { observable } from "mobx";
import { observer } from "mobx-react";
import type { CreateResourceStore } from "./store";
import type { DockTabData } from "../dock/store";
import { EditorPanel } from "../editor/editor/editor-panel";
import { InfoPanel } from "../info-panel/info-panel";
import * as resourceApplierApi from "../../../../common/k8s-api/endpoints/resource-applier.api";
import { Notifications } from "../../notifications";
import logger from "../../../../common/logger";
import type { KubeJsonApiData } from "../../../../common/k8s-api/kube-json-api";
import { getDetailsUrl } from "../../kube-detail-params";
import type { ApiManager } from "../../../../common/k8s-api/api-manager";
import { prevDefault } from "../../../utils";
import { navigate } from "../../../navigation";
import { withInjectables } from "@ogre-tools/injectable-react";
import apiManagerInjectable from "../../../../common/k8s-api/api-manager.injectable";
import createResourceStoreInjectable from "./store.injectable";

export interface CreateResourceProps {
  tab: DockTabData;
}

interface Dependencies {
  apiManager: ApiManager;
  createResourceStore: CreateResourceStore;
}

const NonInjectedCreateResource = observer(({ tab, apiManager, createResourceStore }: Dependencies & CreateResourceProps) => {
  const [currentTemplates] = useState(observable.map());
  const [error, setError] = useState("");
  const [templates] = useState(observable.array<GroupSelectOption<SelectOption>>());

  const convertToGroup = (group: string, items: string[]) => ({
    label: group,
    options: items.map(v => ({ label: path.parse(v).name, value: v })),
  });
  const updateGroupSelectOptions = (templates: Record<string, string[]>) => {
    currentTemplates.replace(
      Object.entries(templates)
        .map(([name, grouping]) => convertToGroup(name, grouping)),
    );
  };

  useEffect(() => {
    createResourceStore.getMergedTemplates().then(v => updateGroupSelectOptions(v));
    createResourceStore.watchUserTemplates(() => createResourceStore.getMergedTemplates().then(v => updateGroupSelectOptions(v)));
  }, []);

  const onChange = (value: string) => {
    setError("");
    createResourceStore.setData(tab.id, value);
  };

  const onError = (error: Error | string) => {
    setError(error.toString());
  };

  const onSelectTemplate = (item: SelectOption) => {
    currentTemplates.set(tab.id, item);
    fs.readFile(item.value, "utf8").then(v => {
      createResourceStore.setData(tab.id, v);
    });
  };

  const create = async (): Promise<void> => {
    if (error || !data.trim()) {
      // do not save when field is empty or there is an error
      return;
    }

    // skip empty documents
    const resources = yaml.loadAll(data).filter(Boolean);

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
  };

  const currentTemplate = currentTemplates.get(tab.id);
  const data = createResourceStore.getData(tab.id);

  return (
    <div className="CreateResource flex column">
      <InfoPanel
        tabId={tab.id}
        error={error}
        controls={
          <div className="flex gaps align-center">
            <Select
              autoConvertOptions={false}
              controlShouldRenderValue={false} // always keep initial placeholder
              className="TemplateSelect"
              placeholder="Select Template ..."
              options={templates}
              menuPlacement="top"
              themeName="outlined"
              onChange={v => onSelectTemplate(v)}
              value={currentTemplate}
            />
          </div>
        }
        submit={create}
        submitLabel="Create"
        showNotifications={false}
      />
      <EditorPanel
        tabId={tab.id}
        value={data}
        onChange={onChange}
        onError={onError}
      />
    </div>
  );
});

export const CreateResource = withInjectables<Dependencies, CreateResourceProps>(NonInjectedCreateResource, {
  getProps: (di, props) => ({
    apiManager: di.inject(apiManagerInjectable),
    createResourceStore: di.inject(createResourceStoreInjectable),
    ...props,
  }),
});
