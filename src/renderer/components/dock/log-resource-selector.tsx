import "./log-resource-selector.scss";

import React from "react";
import { observer } from "mobx-react";

import { Pod } from "../../api/endpoints";
import { Badge } from "../badge";
import { Select, SelectOption } from "../select";
import { LogTabData } from "./log-tab.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { dockStore, TabId } from "./dock.store";

interface Props {
  tabId: TabId
  tabData: LogTabData
  save: (data: Partial<LogTabData>) => void
  reload: () => void
}

export const LogResourceSelector = observer((props: Props) => {
  const { tabData, save, reload, tabId } = props;
  const { selectedPod, selectedContainer, containers, initContainers, pods } = tabData;
  const pod = new Pod(selectedPod);

  const onContainerChange = (option: SelectOption) => {
    save({
      selectedContainer: containers
        .concat(initContainers)
        .find(container => container.name === option.value)
    });
    reload();
  };

  const onPodChange = (option: SelectOption) => {
    const selectedPod = podsStore.getByName(option.value, pod.getNs());

    if (!selectedPod) {
      return;
    }

    const { getContainers, getInitContainers, getAllContainers } = selectedPod;

    save({
      selectedPod,
      containers: getContainers(),
      initContainers: getInitContainers(),
      selectedContainer: getAllContainers()[0]
    });

    dockStore.renameTab(tabId, `Pod ${option.value}`);

    reload();
  };


  const getSelectOptions = (items: string[]) => {
    return items.map(item => {
      return {
        value: item,
        label: item
      };
    });
  };

  const containerSelectOptions = [
    {
      label: `Containers`,
      options: getSelectOptions(containers.map(container => container.name))
    },
    {
      label: `Init Containers`,
      options: getSelectOptions(initContainers.map(container => container.name)),
    }
  ];

  const podSelectOptions = [
    {
      label: pod.getOwnerRefs()[0]?.name,
      options: getSelectOptions(pods.map(pod => pod.metadata.name))
    }
  ];

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
