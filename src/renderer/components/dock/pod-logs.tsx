import "./pod-logs.scss";
import React from "react";
import AnsiUp from "ansi_up";
import DOMPurify from "dompurify";
import { t, Trans } from "@lingui/macro";
import { computed, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { _i18n } from "../../i18n";
import { autobind, cssNames, downloadFile } from "../../utils";
import { Icon } from "../icon";
import { Select, SelectOption } from "../select";
import { Spinner } from "../spinner";
import { IDockTab } from "./dock.store";
import { InfoPanel } from "./info-panel";
import { IPodLogsData, podLogsStore } from "./pod-logs.store";

interface Props {
  className?: string
  tab: IDockTab
}

@observer
export class PodLogs extends React.Component<Props> {
  @observable ready = false;

  private logsElement: HTMLDivElement;
  private lastLineIsShown = true; // used for proper auto-scroll content after refresh
  private colorConverter = new AnsiUp();
  private lineOptions = [
    { label: _i18n._(t`All logs`), value: Number.MAX_SAFE_INTEGER },
    { label: 1000, value: 1000 },
    { label: 10000, value: 10000 },
    { label: 100000, value: 100000 },
  ];

  componentDidMount() {
    disposeOnUnmount(this,
      reaction(() => this.props.tab.id, async () => {
        if (podLogsStore.logs.has(this.tabId)) {
          this.ready = true;
          return;
        }
        await this.load();
      }, { fireImmediately: true })
    );
  }

  componentDidUpdate() {
    // scroll logs only when it's already in the end,
    // otherwise it can interrupt reading by jumping after loading new logs update
    if (this.logsElement && this.lastLineIsShown) {
      this.logsElement.scrollTop = this.logsElement.scrollHeight;
    }
  }

  get tabData() {
    return podLogsStore.getData(this.tabId);
  }

  get tabId() {
    return this.props.tab.id;
  }

  @autobind()
  save(data: Partial<IPodLogsData>) {
    podLogsStore.setData(this.tabId, { ...this.tabData, ...data });
  }

  load = async () => {
    this.ready = false;
    await podLogsStore.load(this.tabId);
    this.ready = true;
  }

  reload = async () => {
    podLogsStore.clearLogs(this.tabId);
    this.lastLineIsShown = true;
    await this.load();
  }

  @computed
  get logs() {
    if (!podLogsStore.logs.has(this.tabId)) return;
    const { oldLogs, newLogs } = podLogsStore.logs.get(this.tabId);
    const { getData, removeTimestamps } = podLogsStore;
    const { showTimestamps } = getData(this.tabId);
    return {
      oldLogs: showTimestamps ? oldLogs : removeTimestamps(oldLogs),
      newLogs: showTimestamps ? newLogs : removeTimestamps(newLogs)
    }
  }

  toggleTimestamps = () => {
    this.save({ showTimestamps: !this.tabData.showTimestamps });
  }

  togglePrevious = () => {
    this.save({ previous: !this.tabData.previous });
    this.reload();
  }

  onScroll = (evt: React.UIEvent<HTMLDivElement>) => {
    const logsArea = evt.currentTarget;
    const { scrollHeight, clientHeight, scrollTop } = logsArea;
    this.lastLineIsShown = clientHeight + scrollTop === scrollHeight;
  };

  downloadLogs = () => {
    const { oldLogs, newLogs } = this.logs;
    const { pod, selectedContainer } = this.tabData;
    const fileName = selectedContainer ? selectedContainer.name : pod.getName();
    const fileContents = oldLogs + newLogs;
    downloadFile(fileName + ".log", fileContents, "text/plain");
  }

  onContainerChange = (option: SelectOption) => {
    const { containers, initContainers } = this.tabData;
    this.save({
      selectedContainer: containers
        .concat(initContainers)
        .find(container => container.name === option.value)
    })
    this.reload();
  }

  onTailLineChange = (option: SelectOption) => {
    this.save({ tailLines: option.value })
    this.reload();
  }

  get containerSelectOptions() {
    const { containers, initContainers } = this.tabData;
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

  formatOptionLabel = (option: SelectOption) => {
    const { value, label } = option;
    return label || <><Icon small material="view_carousel"/> {value}</>;
  }

  renderControls() {
    if (!this.ready) return null;
    const { selectedContainer, showTimestamps, tailLines, previous } = this.tabData;
    const timestamps = podLogsStore.getTimestamps(podLogsStore.logs.get(this.tabId).oldLogs);
    return (
      <div className="controls flex gaps align-center">
        <span><Trans>Container</Trans></span>
        <Select
          options={this.containerSelectOptions}
          value={{ value: selectedContainer.name }}
          formatOptionLabel={this.formatOptionLabel}
          onChange={this.onContainerChange}
          autoConvertOptions={false}
        />
        <span><Trans>Lines</Trans></span>
        <Select
          value={tailLines}
          options={this.lineOptions}
          onChange={this.onTailLineChange}
        />
        <div className="time-range">
          {timestamps && (
            <>
              <Trans>Since</Trans>{" "}
              <b>{new Date(timestamps[0]).toLocaleString()}</b>
            </>
          )}
        </div>
        <div className="flex gaps">
          <Icon
            material="av_timer"
            onClick={this.toggleTimestamps}
            className={cssNames("timestamps-icon", { active: showTimestamps })}
            tooltip={(showTimestamps ? _i18n._(t`Hide`) : _i18n._(t`Show`)) + " " + _i18n._(t`timestamps`)}
          />
          <Icon
            material="undo"
            onClick={this.togglePrevious}
            className={cssNames("undo-icon", { active: previous })}
            tooltip={(previous ? _i18n._(t`Show current logs`) : _i18n._(t`Show previous terminated container logs`))}
          />
          <Icon
            material="get_app"
            onClick={this.downloadLogs}
            tooltip={_i18n._(t`Save`)}
          />
        </div>
      </div>
    );
  }

  renderLogs() {
    if (!this.ready) {
      return <Spinner center/>;
    }
    const { oldLogs, newLogs } = this.logs;
    if (!oldLogs && !newLogs) {
      return (
        <div className="flex align-center justify-center">
          <Trans>There are no logs available for container.</Trans>
        </div>
      );
    }
    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(this.colorConverter.ansi_to_html(oldLogs))}} />
        {newLogs && (
          <>
            <p className="new-logs-sep" title={_i18n._(t`New logs since opening the dialog`)}/>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(this.colorConverter.ansi_to_html(newLogs))}} />
          </>
        )}
      </>
    );
  }

  render() {
    const { className } = this.props;
    return (
      <div className={cssNames("PodLogs flex column", className)}>
        <InfoPanel
          tabId={this.props.tab.id}
          controls={this.renderControls()}
          showSubmitClose={false}
          showButtons={false}
        />
        <div className="logs" onScroll={this.onScroll} ref={e => this.logsElement = e}>
          {this.renderLogs()}
        </div>
      </div>
    );
  }
}
