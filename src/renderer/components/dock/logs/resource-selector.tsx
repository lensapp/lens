/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./resource-selector.scss";

import React from "react";
import { observer } from "mobx-react";

import { Badge } from "../../badge";
import { Select } from "../../select";
import type { LogTabViewModel } from "./logs-view-model";
import type { PodContainer, Pod } from "../../../../common/k8s-api/endpoints";
import type { GroupBase } from "react-select";

export interface LogResourceSelectorProps {
  model: LogTabViewModel;
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

  const allContainers = pod.getAllContainers();
  const container = allContainers.find(container => container.name === selectedContainer) ?? null;
  const onContainerChange = (container: PodContainer | null) => {
    if (!container) {
      return;
    }

    model.updateLogTabData({
      selectedContainer: container.name,
    });
    model.reloadLogs();
  };

  const onPodChange = (value: Pod | null) => {
    if (!value) {
      return;
    }

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
      options: pod.getContainers(),
    },
    {
      label: "Init Containers",
      options: pod.getInitContainers(),
    },
  ];

  return (
    <div className="LogResourceSelector flex gaps align-center">
      <span>Namespace</span>
      {" "}
      <Badge data-testid="namespace-badge" label={pod.getNs()} />
      {
        owner && (
          <>
            <span>Owner</span>
            {" "}
            <Badge data-testid="namespace-badge" label={`${owner.kind} ${owner.name}`} />
          </>
        )
      }
      <span>Pod</span>
      <Select
        options={pods}
        value={pod}
        isClearable={false}
        formatOptionLabel={option => option.getName()}
        onChange={onPodChange}
        className="pod-selector"
        menuClass="pod-selector-menu"
      />
      <span>Container</span>
      <Select<PodContainer, false, GroupBase<PodContainer>>
        id="container-selector-input"
        options={containerSelectOptions}
        value={container}
        onChange={onContainerChange}
        getOptionLabel={opt => opt.name}
        className="container-selector"
        menuClass="container-selector-menu"
        controlShouldRenderValue
      />
    </div>
  );
});

