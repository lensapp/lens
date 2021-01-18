import "./log-resource-selector.scss";

import React from "react";
import { observer } from "mobx-react";

import { Pod } from "../../api/endpoints";
import { Badge } from "../badge";
import { Select, SelectOption } from "../select";
import { LogTabData } from "./log-tab.store";
import { podsStore } from "../+workloads-pods/pods.store";

interface Props {
  tabData: LogTabData
  save: (data: Partial<LogTabData>) => void
  reload: () => void
}

export const LogResourceSelector = observer((props: Props) => {
  const { tabData, save, reload } = props;
  const { selectedPod, selectedContainer, containers, initContainers, pods } = tabData;
  const pod = new Pod(tabData.selectedPod);

  const onContainerChange = (option: SelectOption) => {
    save({
      selectedContainer: containers
        .concat(initContainers)
        .find(container => container.name === option.value)
    });
    reload();
  };

  const onPodChange = (option: SelectOption) => {
    save({ selectedPod: podsStore.getByName(option.value, selectedPod.getNs()) });
    // Change tab title
    // Refresh container list
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
      options: getSelectOptions(pods.map(pod => pod.getName()))
    }
  ];

  return (
    <div className="LogResourceSelector flex gaps align-center">
      <span>Namespace</span> <Badge label={pod.getNs()}/>
      <span>Pod</span>
      <Select
        options={podSelectOptions}
        value={{ label: pod.getName(), value: pod.getName() }}
        onChange={onPodChange}
        autoConvertOptions={false}
      />
      <span>Container</span>
      <Select
        options={containerSelectOptions}
        value={{ label: selectedContainer.name, value: selectedContainer.name }}
        onChange={onContainerChange}
        autoConvertOptions={false}
      />
    </div>
  );
});
