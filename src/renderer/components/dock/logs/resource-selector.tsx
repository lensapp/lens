/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./resource-selector.scss";

import React, { useEffect } from "react";
import { observer } from "mobx-react";

import { Badge } from "../../badge";
import { Select, SelectOption } from "../../select";
import type { LogTabViewModel } from "./logs-view-model";
import { action } from "mobx";

export interface LogResourceSelectorProps {
  model: LogTabViewModel;
}

export const LogResourceSelector = observer(({ model }: LogResourceSelectorProps) => {
  const tabData = model.logTabData.get();

  if (!tabData) {
    return null;
  }

  const { selectedContainer } = tabData;
  const pods = model.pods.get();
  const pod = model.pod.get();
  const containers = pod.getContainers();
  const initContainers = pod.getInitContainers();

  const onContainerChange = (option: SelectOption<string>) => {
    model.updateLogTabData({
      selectedContainer: option.value,
    });

    model.reloadLogs();
  };

  const onPodChange = action((option: SelectOption<string>) => {
    model.updateLogTabData({
      selectedPodId: option.value,
    });
    model.updateTabName();
  });

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
  }, [pod.getId()]);

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
        value={{ label: selectedContainer, value: selectedContainer }}
        onChange={onContainerChange}
        autoConvertOptions={false}
        className="container-selector"
        menuClass="container-selector-menu"
      />
    </div>
  );
});

