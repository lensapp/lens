import "./log-resource-selector.scss";

import React from "react";
import { observer } from "mobx-react";

import { IPodContainer, Pod } from "../../api/endpoints";
import { Badge } from "../badge";
import { Select, SelectOption } from "../select";
import { IPodLogsData } from "./log.store";

interface Props {
  tabData: IPodLogsData
  save: (data: Partial<IPodLogsData>) => void
  reload: () => void
}

export const LogResourceSelector = observer((props: Props) => {
  const { tabData, save, reload } = props;
  const { selectedContainer, containers, initContainers } = tabData;
  const pod = new Pod(tabData.pod);

  const onContainerChange = (option: SelectOption) => {
    const { containers, initContainers } = tabData;

    save({
      selectedContainer: containers
        .concat(initContainers)
        .find(container => container.name === option.value)
    });
    reload();
  };

  const getSelectOptions = (containers: IPodContainer[]) => {
    return containers.map(container => {
      return {
        value: container.name,
        label: container.name
      };
    });
  };

  const containerSelectOptions = [
    {
      label: `Containers`,
      options: getSelectOptions(containers)
    },
    {
      label: `Init Containers`,
      options: getSelectOptions(initContainers),
    }
  ];

  return (
    <div className="LogResourceSelector flex gaps align-center">
      <span>Namespace</span> <Badge label={pod.getNs()}/>
      <span>Pod</span> <Badge label={pod.getName()}/>
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
