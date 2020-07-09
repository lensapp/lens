import "./pod-logs-dialog.scss";

import * as React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { PodContainer, Pod, podsApi } from "../../api/endpoints";
import { Icon } from "../icon";
import { Select, SelectOption } from "../select";
import { Spinner } from "../spinner";
import { cssNames, downloadFile, IntervalManager } from "../../utils";
import { default as AnsiUp } from "ansi_up";
import DOMPurify from "dompurify";

interface PodLogsDialogData {
  pod: Pod;
  container?: PodContainer;
}

interface Props extends Partial<DialogProps> {
}

@observer
export class PodLogsDialog extends React.Component<Props> {
  @observable static isOpen = false;
  @observable static data: PodLogsDialogData = null;

  static open(pod: Pod, container?: PodContainer): void {
    PodLogsDialog.isOpen = true;
    PodLogsDialog.data = { pod, container };
  }

  static close(): void {
    PodLogsDialog.isOpen = false;
  }

  get data(): PodLogsDialogData {
    return PodLogsDialog.data;
  }

  private logsArea: HTMLDivElement;
  private refresher = new IntervalManager(5, () => this.load());
  private containers: PodContainer[] = []
  private initContainers: PodContainer[] = []
  private lastLineIsShown = true; // used for proper auto-scroll content after refresh
  private colorConverter = new AnsiUp();

  @observable logs = ""; // latest downloaded logs for pod
  @observable newLogs = ""; // new logs since dialog is open
  @observable logsReady = false;
  @observable selectedContainer: PodContainer;
  @observable showTimestamps = true;
  @observable tailLines = 1000;

  lineOptions = [
    { label: _i18n._(t`All logs`), value: Number.MAX_SAFE_INTEGER },
    { label: 1000, value: 1000 },
    { label: 10000, value: 10000 },
    { label: 100000, value: 100000 },
  ]

  onOpen = async (): Promise<void> => {
    const { pod, container } = this.data;
    this.containers = pod.spec.containers;
    this.initContainers = pod.spec.initContainers;
    this.selectedContainer = container || this.containers[0];
    await this.load();
    this.refresher.start();
  }

  onClose = (): void => {
    this.resetLogs();
    this.refresher.stop();
  }

  close = (): void => {
    PodLogsDialog.close();
  }

  load = async (): Promise<void> => {
    if (!this.data) {
      return;
    }
    const { pod } = this.data;
    try {
      // if logs already loaded, check the latest timestamp for getting updates only from this point
      const logsTimestamps = this.getTimestamps(this.newLogs || this.logs);
      let lastLogDate = new Date(0);
      if (logsTimestamps) {
        lastLogDate = new Date(logsTimestamps.slice(-1)[0]);
        lastLogDate.setSeconds(lastLogDate.getSeconds() + 1); // avoid duplicates from last second
      }
      const namespace = pod.getNs();
      const name = pod.getName();
      const logs = await podsApi.getLogs({ namespace, name }, {
        container: this.selectedContainer.name,
        timestamps: true,
        tailLines: this.tailLines ? this.tailLines : undefined,
        sinceTime: lastLogDate.toISOString(),
      });
      if (!this.logs) {
        this.logs = logs;
      } else if (logs) {
        this.newLogs = `${this.newLogs}\n${logs}`.trim();
      }
    } catch (error) {
      this.logs = [
        _i18n._(t`Failed to load logs: ${error.message}`),
        _i18n._(t`Reason: ${error.reason} (${error.code})`),
      ].join("\n");
    }
    this.logsReady = true;
  }

  reload = async (): Promise<void> => {
    this.resetLogs();
    this.refresher.stop();
    await this.load();
    this.refresher.start();
  }

  componentDidUpdate(): void {
    // scroll logs only when it's already in the end,
    // otherwise it can interrupt reading by jumping after loading new logs update
    if (this.logsArea && this.lastLineIsShown) {
      this.logsArea.scrollTop = this.logsArea.scrollHeight;
    }
  }

  onScroll = (evt: React.UIEvent<HTMLDivElement>): void => {
    const logsArea = evt.currentTarget;
    const { scrollHeight, clientHeight, scrollTop } = logsArea;
    this.lastLineIsShown = clientHeight + scrollTop === scrollHeight;
  };

  getLogs(): { logs: string; newLogs: string } {
    const { logs, newLogs, showTimestamps } = this;
    return {
      logs: showTimestamps ? logs : this.removeTimestamps(logs),
      newLogs: showTimestamps ? newLogs : this.removeTimestamps(newLogs),
    };
  }

  getTimestamps(logs: string): RegExpMatchArray {
    return logs.match(/^\d+\S+/gm);
  }

  removeTimestamps(logs: string): string {
    return logs.replace(/^\d+.*?\s/gm, "");
  }

  resetLogs(): void {
    this.logs = "";
    this.newLogs = "";
    this.lastLineIsShown = true;
    this.logsReady = false;
  }

  onContainerChange = (option: SelectOption): void => {
    this.selectedContainer = this.containers
      .concat(this.initContainers)
      .find(container => container.name === option.value);
    this.reload();
  }

  onTailLineChange = (option: SelectOption): void => {
    this.tailLines = option.value;
    this.reload();
  }

  formatOptionLabel = (option: SelectOption): JSX.Element | {} => {
    const { value, label } = option;
    return label || <><Icon small material="view_carousel"/> {value}</>;
  }

  toggleTimestamps = (): void => {
    this.showTimestamps = !this.showTimestamps;
  }

  downloadLogs = (): void => {
    const { logs, newLogs } = this.getLogs();
    const fileName = this.selectedContainer.name + ".log";
    const fileContents = logs + newLogs;
    downloadFile(fileName, fileContents, "text/plain");
  }

  get containerSelectOptions(): React.ReactNode[] {
    return [
      {
        label: _i18n._(t`Containers`),
        options: this.containers.map(container => {
          return { value: container.name };
        }),
      },
      {
        label: _i18n._(t`Init Containers`),
        options: this.initContainers.map(container => {
          return { value: container.name };
        }),
      }
    ];
  }

  renderControlsPanel(): JSX.Element {
    const { logsReady, showTimestamps } = this;
    if (!logsReady) {
      return;
    }
    const timestamps = this.getTimestamps(this.logs + this.newLogs);
    let from = "";
    let to = "";
    if (timestamps) {
      from = new Date(timestamps[0]).toLocaleString();
      to = new Date(timestamps[timestamps.length - 1]).toLocaleString();
    }
    return (
      <div className="controls flex align-center">
        <div className="time-range">
          {timestamps && <Trans>From <b>{from}</b> to <b>{to}</b></Trans>}
        </div>
        <div className="control-buttons flex gaps">
          <Icon
            material="av_timer"
            onClick={this.toggleTimestamps}
            className={cssNames("timestamps-icon", { active: showTimestamps })}
            tooltip={(showTimestamps ? _i18n._(t`Hide`) : _i18n._(t`Show`)) + " " + _i18n._(t`timestamps`)}
          />
          <Icon
            material="save_alt"
            onClick={this.downloadLogs}
            tooltip={_i18n._(t`Save`)}
          />
        </div>
      </div>
    );
  }

  renderLogs(): JSX.Element {
    if (!this.logsReady) {
      return <Spinner center/>;
    }
    const { logs, newLogs } = this.getLogs();
    if (!logs && !newLogs) {
      return <p className="no-logs"><Trans>There are no logs available for container.</Trans></p>;
    }
    return (
      <>
        <div dangerouslySetInnerHTML={{ __html:  DOMPurify.sanitize(this.colorConverter.ansi_to_html(logs))}} />
        {newLogs && (
          <>
            <p className="new-logs-sep" title={_i18n._(t`New logs since opening the dialog`)}/>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(this.colorConverter.ansi_to_html(newLogs))}} />
          </>
        )}
      </>
    );
  }

  render(): JSX.Element {
    const { ...dialogProps } = this.props;
    const { selectedContainer, tailLines } = this;
    const podName = this.data ? this.data.pod.getName() : "";
    const header = <h5><Trans>{podName} Logs</Trans></h5>;
    return (
      <Dialog
        {...dialogProps}
        isOpen={PodLogsDialog.isOpen}
        className="PodLogsDialog"
        onOpen={this.onOpen}
        onClose={this.onClose}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep hideNextBtn prevLabel={<Trans>Close</Trans>}>
            <div className="log-controls flex gaps align-center justify-space-between">
              <div className="container flex gaps align-center">
                <span><Trans>Container</Trans></span>
                {selectedContainer && (
                  <Select
                    className="container-selector"
                    options={this.containerSelectOptions}
                    themeName="light"
                    value={{ value: selectedContainer.name }}
                    onChange={this.onContainerChange}
                    formatOptionLabel={this.formatOptionLabel}
                    autoConvertOptions={false}
                  />
                )}
                <span><Trans>Lines</Trans></span>
                <Select
                  value={tailLines}
                  options={this.lineOptions}
                  onChange={this.onTailLineChange}
                  themeName="light"
                />
              </div>
              {this.renderControlsPanel()}
            </div>
            <div className="logs-area" onScroll={this.onScroll} ref={(e): void => {
              this.logsArea = e;
            }}>
              {this.renderLogs()}
            </div>
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
