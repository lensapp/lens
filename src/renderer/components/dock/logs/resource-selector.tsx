/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./resource-selector.scss";

import React, { useEffect } from "react";
import { observer } from "mobx-react";

import { Pod } from "../../../../common/k8s-api/endpoints";
import { Badge } from "../../badge";
import { Select, SelectOption } from "../../select";
import { podsStore } from "../../+workloads-pods/pods.store";
import type { LogTabViewModel } from "./logs-view-model";

export interface LogResourceSelectorProps {
  model: LogTabViewModel;
}

export const LogResourceSelector = observer(({ model }: LogResourceSelectorProps) => {
  const tabData = model.logTabData.get();

  if (!tabData) {
    return null;
  }

  const { selectedPod, selectedContainer, pods } = tabData;
  const pod = new Pod(selectedPod);
  const containers = pod.getContainers();
  const initContainers = pod.getInitContainers();

  const onContainerChange = (option: SelectOption) => {
    model.updateLogTabData({
      selectedContainer: containers
        .concat(initContainers)
        .find(container => container.name === option.value),
    });

    model.reloadLogs();
  };

  const onPodChange = (option: SelectOption) => {
    const selectedPod = podsStore.getByName(option.value, pod.getNs());

    model.updateLogTabData({ selectedPod });
    model.updateTabName();
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
    model.reloadLogs();
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
        menuClass="pod-selector-menu"
      />
      <span>Container</span>
      <Select
        options={containerSelectOptions}
        value={{ label: selectedContainer.name, value: selectedContainer.name }}
        onChange={onContainerChange}
        autoConvertOptions={false}
        className="container-selector"
        menuClass="container-selector-menu"
      />
    </div>
  );
});

