/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./resource-selector.scss";

import React from "react";
import { observer } from "mobx-react";

import { Badge } from "../../badge";
import { Select, SelectOption } from "../../select";
import type { LogTabViewModel } from "./logs-view-model";
import type { IPodContainer, Pod } from "../../../../common/k8s-api/endpoints";

export interface LogResourceSelectorProps {
  model: LogTabViewModel;
}

function getSelectOptions(containers: IPodContainer[]): SelectOption<string>[] {
  return containers.map(container => ({
    value: container.name,
    label: container.name,
  }));
}

export const LogResourceSelector = observer(({ model }: LogResourceSelectorProps) => {
  const tabData = model.logTabData.get();

  if (!tabData) {
    return null;
  }

  const { selectedContainer, owner } = tabData;
  const pods = model.pods.get();
  const pod = model.pod.get();

  if (!pod) {
    return null;
  }

  const onContainerChange = (option: SelectOption<string>) => {
    model.updateLogTabData({
      selectedContainer: option.value,
    });
    model.reloadLogs();
  };

  const onPodChange = ({ value }: SelectOption<Pod>) => {
    model.updateLogTabData({
      selectedPodId: value.getId(),
      selectedContainer: value.getAllContainers()[0]?.name,
    });
    model.renameTab(`Pod ${value.getName()}`);
    model.reloadLogs();
  };

  const containerSelectOptions = [
    {
      label: "Containers",
      options: getSelectOptions(pod.getContainers()),
    },
    {
      label: "Init Containers",
      options: getSelectOptions(pod.getInitContainers()),
    },
  ];

  const podSelectOptions = pods.map(pod => ({
    label: pod.getName(),
    value: pod,
  }));

  return (
    <div className="LogResourceSelector flex gaps align-center">
      <span>Namespace</span> <Badge data-testid="namespace-badge" label={pod.getNs()}/>
      {
        owner && (
          <>
            <span>Owner</span> <Badge data-testid="namespace-badge" label={`${owner.kind} ${owner.name}`}/>
          </>
        )
      }
      <span>Pod</span>
      <Select
        options={podSelectOptions}
        value={podSelectOptions.find(opt => opt.value === pod)}
        formatOptionLabel={option => option.label}
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

