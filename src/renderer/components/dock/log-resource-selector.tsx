/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./log-resource-selector.scss";

import React, { useEffect } from "react";
import { observer } from "mobx-react";

import { Pod } from "../../../common/k8s-api/endpoints";
import { Badge } from "../badge";
import { Select, SelectOption } from "../select";
import type { LogTabData, LogTabStore } from "./log-tab-store/log-tab.store";
import { podsStore } from "../+workloads-pods/pods.store";
import type { TabId } from "./dock-store/dock.store";
import logTabStoreInjectable from "./log-tab-store/log-tab-store.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import logStoreInjectable from "./log-store/log-store.injectable";

interface Props {
  tabId: TabId
  tabData: LogTabData
  save: (data: Partial<LogTabData>) => void
}

interface Dependencies {
  logTabStore: LogTabStore
  reloadLogs: () => Promise<void>
}

const NonInjectedLogResourceSelector = observer((props: Props & Dependencies) => {
  const { tabData, save, tabId, logTabStore, reloadLogs } = props;
  const { selectedPod, selectedContainer, pods } = tabData;
  const pod = new Pod(selectedPod);
  const containers = pod.getContainers();
  const initContainers = pod.getInitContainers();

  const onContainerChange = (option: SelectOption) => {
    save({
      selectedContainer: containers
        .concat(initContainers)
        .find(container => container.name === option.value),
    });

    reloadLogs();
  };

  const onPodChange = (option: SelectOption) => {
    const selectedPod = podsStore.getByName(option.value, pod.getNs());

    save({ selectedPod });

    logTabStore.renameTab(tabId);
  };

  const getSelectOptions = (items: string[]) => {
    return items.map(item => {
      return {
        value: item,
        label: item,
      };
    });
  };

  const containerSelectOptions = [
    {
      label: `Containers`,
      options: getSelectOptions(containers.map(container => container.name)),
    },
    {
      label: `Init Containers`,
      options: getSelectOptions(initContainers.map(container => container.name)),
    },
  ];

  const podSelectOptions = [
    {
      label: pod.getOwnerRefs()[0]?.name,
      options: getSelectOptions(pods.map(pod => pod.metadata.name)),
    },
  ];

  useEffect(() => {
    reloadLogs();
  }, [selectedPod]);

  return (
    <div className="LogResourceSelector flex gaps align-center">
      <span>Namespace</span> <Badge data-testid="namespace-badge" label={pod.getNs()}/>
      <span>Pod</span>
      <Select
        options={podSelectOptions}
        value={{ label: pod.getName(), value: pod.getName() }}
        onChange={onPodChange}
        autoConvertOptions={false}
        className="pod-selector"
      />
      <span>Container</span>
      <Select
        options={containerSelectOptions}
        value={{ label: selectedContainer.name, value: selectedContainer.name }}
        onChange={onContainerChange}
        autoConvertOptions={false}
        className="container-selector"
      />
    </div>
  );
});

export const LogResourceSelector = withInjectables<Dependencies, Props>(
  NonInjectedLogResourceSelector,

  {
    getProps: (di, props) => ({
      logTabStore: di.inject(logTabStoreInjectable),
      reloadLogs: di.inject(logStoreInjectable).reload,
      ...props,
    }),
  },
);

