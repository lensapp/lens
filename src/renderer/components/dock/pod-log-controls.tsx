import React from "react";
import { observer } from "mobx-react";
import { IPodLogsData, podLogsStore } from "./pod-logs.store";
import { t, Trans } from "@lingui/macro";
import { Select, SelectOption } from "../select";
import { Badge } from "../badge";
import { Icon } from "../icon";
import { _i18n } from "../../i18n";
import { cssNames, downloadFile } from "../../utils";
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
  if (!props.ready) return null;
  const { tabData, save, reload, tabId, logs } = props;
  const { selectedContainer, showTimestamps, previous } = tabData;
  const rawLogs = podLogsStore.logs.get(tabId);
  const since = rawLogs.length ? podLogsStore.getTimestamps(rawLogs[0]) : null;
  const pod = new Pod(tabData.pod);

  const toggleTimestamps = () => {
    save({ showTimestamps: !showTimestamps });
  }

  const togglePrevious = () => {
    save({ previous: !previous });
    reload();
  }

  const downloadLogs = () => {
    const fileName = selectedContainer ? selectedContainer.name : pod.getName();
    downloadFile(fileName + ".log", logs.join("\n"), "text/plain");
  }

  const onContainerChange = (option: SelectOption) => {
    const { containers, initContainers } = tabData;
    save({
      selectedContainer: containers
        .concat(initContainers)
        .find(container => container.name === option.value)
    })
    reload();
  }

  const containerSelectOptions = () => {
    const { containers, initContainers } = tabData;
    return [
      {
        label: _i18n._(t`Containers`),
        options: containers.map(container => {
          return { value: container.name }
        }),
      },
      {
        label: _i18n._(t`Init Containers`),
        options: initContainers.map(container => {
          return { value: container.name }
        }),
      }
    ];
  }

  const formatOptionLabel = (option: SelectOption) => {
    const { value, label } = option;
    return label || <><Icon small material="view_carousel"/> {value}</>;
  }

  return (
    <div className="PodLogControls flex gaps align-center">
      <span><Trans>Pod</Trans>:</span> <Badge label={pod.getName()}/>
      <span><Trans>Namespace</Trans>:</span> <Badge label={pod.getNs()}/>
      <span><Trans>Container</Trans></span>
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
            <Trans>Since</Trans>{" "}
            <b>{new Date(since[0]).toLocaleString()}</b>
          </>
        )}
      </div>
      <div className="flex box grow gaps align-center">
        <Icon
          material="av_timer"
          onClick={toggleTimestamps}
          className={cssNames("timestamps-icon", { active: showTimestamps })}
          tooltip={(showTimestamps ? _i18n._(t`Hide`) : _i18n._(t`Show`)) + " " + _i18n._(t`timestamps`)}
        />
        <Icon
          material="history"
          onClick={togglePrevious}
          className={cssNames("undo-icon", { active: previous })}
          tooltip={(previous ? _i18n._(t`Show current logs`) : _i18n._(t`Show previous terminated container logs`))}
        />
        <Icon
          material="get_app"
          onClick={downloadLogs}
          tooltip={_i18n._(t`Save`)}
          className="download-icon"
        />
        <PodLogSearch {...props} />
      </div>
    </div>
  );
});