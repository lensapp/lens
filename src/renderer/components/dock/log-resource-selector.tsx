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

import "./log-resource-selector.scss";

import React, { useEffect } from "react";
import { observer } from "mobx-react";

import { Pod } from "../../../common/k8s-api/endpoints";
import { Badge } from "../badge";
import { Select, SelectOption } from "../select";
import { LogTabData, logTabStore } from "./log-tab.store";
import { podsStore } from "../+workloads-pods/pods.store";
import type { TabId } from "./dock.store";

interface Props {
  tabId: TabId
  tabData: LogTabData
  save: (data: Partial<LogTabData>) => void
  reload: () => void
}

export const LogResourceSelector = observer((props: Props) => {
  const { tabData, save, reload, tabId } = props;
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
    reload();
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
    reload();
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
