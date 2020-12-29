import "./pod-log-controls.scss";
import React from "react";
import { observer } from "mobx-react";
import { IPodLogsData, podLogsStore } from "./pod-logs.store";
import { Select, SelectOption } from "../select";
import { Badge } from "../badge";
import { Icon } from "../icon";
import { cssNames, saveFileDialog } from "../../utils";
import { Pod } from "../../api/endpoints";
import { PodLogSearch, PodLogSearchProps } from "./pod-log-search";

interface Props extends PodLogSearchProps {
  ready: boolean
  tabId: string
  tabData: IPodLogsData
  logs: string[]
  save: (data: Partial<IPodLogsData>) => void
  reload: () => void
  onSearch: (query: string) => void
}

export const PodLogControls = observer((props: Props) => {
  const { tabData, save, reload, logs } = props;
  const { selectedContainer, showTimestamps, previous } = tabData;
  const since = logs.length ? podLogsStore.getTimestamps(logs[0]) : null;
  const pod = new Pod(tabData.pod);

  const toggleTimestamps = () => {
    save({ showTimestamps: !showTimestamps });
  };

  const togglePrevious = () => {
    save({ previous: !previous });
    reload();
  };

  const downloadLogs = () => {
    const fileName = selectedContainer ? selectedContainer.name : pod.getName();
    const logsToDownload = showTimestamps ? logs : podLogsStore.logsWithoutTimestamps;

    saveFileDialog(`${fileName}.log`, logsToDownload.join("\n"), "text/plain");
  };

  const onContainerChange = (option: SelectOption) => {
    const { containers, initContainers } = tabData;

    save({
      selectedContainer: containers
        .concat(initContainers)
        .find(container => container.name === option.value)
    });
    reload();
  };

  const containerSelectOptions = () => {
    const { containers, initContainers } = tabData;

    return [
      {
        label: `Containers`,
        options: containers.map(container => {
          return { value: container.name };
        }),
      },
      {
        label: `Init Containers`,
        options: initContainers.map(container => {
          return { value: container.name };
        }),
      }
    ];
  };

  const formatOptionLabel = (option: SelectOption) => {
    const { value, label } = option;

    return label || <><Icon small material="view_carousel"/> {value}</>;
  };

  return (
    <div className="PodLogControls flex gaps align-center">
      <span>Pod:</span> <Badge label={pod.getName()}/>
      <span>Namespace:</span> <Badge label={pod.getNs()}/>
      <span>Container</span>
      <Select
        options={containerSelectOptions()}
        value={{ value: selectedContainer.name }}
        formatOptionLabel={formatOptionLabel}
        onChange={onContainerChange}
        autoConvertOptions={false}
      />
      <div className="time-range">
        {since && (
          <>
            Since{" "}
            <b>{new Date(since[0]).toLocaleString()}</b>
          </>
        )}
      </div>
      <div className="flex box grow gaps align-center">
        <Icon
          material="av_timer"
          onClick={toggleTimestamps}
          className={cssNames("timestamps-icon", { active: showTimestamps })}
          tooltip={`${showTimestamps ? `Hide` : `Show`} timestamps`}
        />
        <Icon
          material="history"
          onClick={togglePrevious}
          className={cssNames("undo-icon", { active: previous })}
          tooltip={(previous ? `Show current logs` : `Show previous terminated container logs`)}
        />
        <Icon
          material="get_app"
          onClick={downloadLogs}
          tooltip={`Save`}
          className="download-icon"
        />
        <PodLogSearch
          {...props}
          logs={showTimestamps ? logs : podLogsStore.logsWithoutTimestamps}
        />
      </div>
    </div>
  );
});
