import "./pod-logs.scss";
import React from "react";
import AnsiUp from "ansi_up";
import DOMPurify from "dompurify";
import { t, Trans } from "@lingui/macro";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { _i18n } from "../../i18n";
import { IPodContainer, podsApi } from "../../api/endpoints";
import { cssNames, downloadFile, interval } from "../../utils";
import { Icon } from "../icon";
import { Select, SelectOption } from "../select";
import { Spinner } from "../spinner";
import { IDockTab } from "./dock.store";
import { InfoPanel } from "./info-panel";
import { podLogsStore } from "./pod-logs.store";

interface Props {
  className?: string
  tab: IDockTab
}

@observer
export class PodLogs extends React.Component<Props> {
  @observable logs = ""; // latest downloaded logs for pod
  @observable newLogs = ""; // new logs since dialog is open
  @observable ready = false;
  @observable selectedContainer: IPodContainer;
  @observable showTimestamps = false;
  @observable tailLines = 1000;

  private logsElement: HTMLDivElement;
  private refresher = interval(5, () => this.load());
  private containers: IPodContainer[] = []
  private initContainers: IPodContainer[] = []
  private lastLineIsShown = true; // used for proper auto-scroll content after refresh
  private colorConverter = new AnsiUp();
  private lineOptions = [
    { label: _i18n._(t`All logs`), value: Number.MAX_SAFE_INTEGER },
    { label: 1000, value: 1000 },
    { label: 10000, value: 10000 },
    { label: 100000, value: 100000 },
  ]

  componentDidMount() {
    this.onOpen();
  }

  componentDidUpdate() {
    // scroll logs only when it's already in the end,
    // otherwise it can interrupt reading by jumping after loading new logs update
    if (this.logsElement && this.lastLineIsShown) {
      this.logsElement.scrollTop = this.logsElement.scrollHeight;
    }
  }

  get tabData() {
    return podLogsStore.getData(this.props.tab.id);
  }

  onOpen = async () => {
    const { pod, container } = this.tabData;
    this.containers = pod.getContainers();
    this.initContainers = pod.getInitContainers();
    this.selectedContainer = container || this.containers[0];
    await this.load();
    this.refresher.start();
  }

  load = async () => {
    const data = this.tabData;
    if (!data) return;
    try {
      // if logs already loaded, check the latest timestamp for getting updates only from this point
      const logsTimestamps = this.getTimestamps(this.newLogs || this.logs);
      let lastLogDate = new Date(0)
      if (logsTimestamps) {
        lastLogDate = new Date(logsTimestamps.slice(-1)[0]);
        lastLogDate.setSeconds(lastLogDate.getSeconds() + 1); // avoid duplicates from last second
      }
      const namespace = data.pod.getNs();
      const name = data.pod.getName();
      const logs = await podsApi.getLogs({ namespace, name }, {
        timestamps: true,
        container: this.selectedContainer?.name,
        tailLines: this.tailLines ? this.tailLines : undefined,
        sinceTime: lastLogDate.toISOString(),
      });
      if (!this.logs) {
        this.logs = logs;
      }
      else if (logs) {
        this.newLogs = `${this.newLogs}\n${logs}`.trim();
      }
    } catch (error) {
      this.logs = [
        _i18n._(t`Failed to load logs: ${error.message}`),
        _i18n._(t`Reason: ${error.reason} (${error.code})`),
      ].join("\n")
    }
    this.ready = true;
  }

  reload = async () => {
    this.logs = "";
    this.newLogs = "";
    this.lastLineIsShown = true;
    this.ready = false;
    this.refresher.stop();
    await this.load();
    this.refresher.start();
  }

  getLogs() {
    const { logs, newLogs, showTimestamps } = this;
    return {
      logs: showTimestamps ? logs : this.removeTimestamps(logs),
      newLogs: showTimestamps ? newLogs : this.removeTimestamps(newLogs),
    }
  }

  getTimestamps(logs: string) {
    return logs.match(/^\d+\S+/gm);
  }

  removeTimestamps(logs: string) {
    return logs.replace(/^\d+.*?\s/gm, "");
  }

  toggleTimestamps = () => {
    this.showTimestamps = !this.showTimestamps;
  }

  onScroll = (evt: React.UIEvent<HTMLDivElement>) => {
    const logsArea = evt.currentTarget;
    const { scrollHeight, clientHeight, scrollTop } = logsArea;
    this.lastLineIsShown = clientHeight + scrollTop === scrollHeight;
  };

  downloadLogs = () => {
    const { logs, newLogs } = this.getLogs();
    const podName = this.tabData.pod.getName();
    const fileName = this.selectedContainer ? this.selectedContainer.name : podName;
    const fileContents = logs + newLogs;
    downloadFile(fileName + ".log", fileContents, "text/plain");
  }

  onContainerChange = (option: SelectOption) => {
    this.selectedContainer = this.containers
      .concat(this.initContainers)
      .find(container => container.name === option.value);
    this.reload();
  }

  onTailLineChange = (option: SelectOption) => {
    this.tailLines = option.value;
    this.reload();
  }

  get containerSelectOptions() {
    return [
      {
        label: _i18n._(t`Containers`),
        options: this.containers.map(container => {
          return { value: container.name }
        }),
      },
      {
        label: _i18n._(t`Init Containers`),
        options: this.initContainers.map(container => {
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
    const timestamps = this.getTimestamps(this.logs + this.newLogs);
    return (
      <div className="controls flex gaps align-center">
        <span><Trans>Container</Trans></span>
        <Select
          options={this.containerSelectOptions}
          value={{ value: this.selectedContainer.name }}
          formatOptionLabel={this.formatOptionLabel}
          onChange={this.onContainerChange}
          autoConvertOptions={false}
        />
        <span><Trans>Lines</Trans></span>
        <Select
          value={this.tailLines}
          options={this.lineOptions}
          onChange={this.onTailLineChange}
        />
        <div className="time-range">
          {timestamps && (
            <>
              <Trans>From</Trans>{" "}
              <b>{new Date(timestamps[0]).toLocaleString()}</b>{" "}
              <Trans>to</Trans>{" "}
              <b>{new Date(timestamps[timestamps.length - 1]).toLocaleString()}</b>
            </>
          )}
        </div>
        <div className="flex gaps">
          <Icon
            material="av_timer"
            onClick={this.toggleTimestamps}
            className={cssNames("timestamps-icon", { active: this.showTimestamps })}
            tooltip={(this.showTimestamps ? _i18n._(t`Hide`) : _i18n._(t`Show`)) + " " + _i18n._(t`timestamps`)}
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
    const { logs, newLogs } = this.getLogs();
    if (!logs && !newLogs) {
      return (
        <div className="flex align-center justify-center">
          <Trans>There are no logs available for container.</Trans>
        </div>
      );
    }
    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(this.colorConverter.ansi_to_html(logs))}} />
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
          showSubmit={false}
        />
        <div className="logs" onScroll={this.onScroll} ref={e => this.logsElement = e}>
          {this.renderLogs()}
        </div>
      </div>
    );
  }
}
