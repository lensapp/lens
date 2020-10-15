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
import { IPodLogsData, logRange, podLogsStore } from "./pod-logs.store";
import { Button } from "../button";

interface Props {
  className?: string
  tab: IDockTab
}

@observer
export class PodLogs extends React.Component<Props> {
  @observable ready = false;
  @observable preloading = false; // Indicator for setting Spinner (loader) at the top of the logs
  @observable showJumpToBottom = false;

  private logsElement: HTMLDivElement;
  private lastLineIsShown = true; // used for proper auto-scroll content after refresh
  private colorConverter = new AnsiUp();

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.tab.id, async () => {
        if (podLogsStore.logs.has(this.tabId)) {
          this.ready = true;
          return;
        }
        await this.load();
      }, { fireImmediately: true })
    ]);
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

  /**
   * Function loads more logs (usually after user scrolls to top) and sets proper
   * scrolling position
   * @param scrollHeight previous scrollHeight position before adding new lines
   */
  loadMore = async (scrollHeight: number) => {
    if (podLogsStore.lines < logRange) return;
    this.preloading = true;
    await podLogsStore.load(this.tabId).then(() => this.preloading = false);
    if (this.logsElement.scrollHeight > scrollHeight) {
      // Set scroll position back to place where preloading started
      this.logsElement.scrollTop = this.logsElement.scrollHeight - scrollHeight - 48;
    }
  }

  /**
   * Computed prop which returns logs with or without timestamps added to each line and
   * does separation between new and old logs
   * @returns {Array} An array with 2 string items - [oldLogs, newLogs]
   */
  @computed
  get logs() {
    if (!podLogsStore.logs.has(this.tabId)) return [];
    const logs = podLogsStore.logs.get(this.tabId);
    const { getData, removeTimestamps, newLogSince } = podLogsStore;
    const { showTimestamps } = getData(this.tabId);
    let oldLogs: string[] = logs;
    let newLogs: string[] = [];
    if (newLogSince.has(this.tabId)) {
      // Finding separator timestamp in logs
      const index = logs.findIndex(item => item.includes(newLogSince.get(this.tabId)));
      if (index !== -1) {
        // Splitting logs to old and new ones
        oldLogs = logs.slice(0, index);
        newLogs = logs.slice(index);


      }
    }
    if (!showTimestamps) {
      return [oldLogs, newLogs].map(logs => logs.map(item => removeTimestamps(item)))
    }
    return [oldLogs, newLogs];
  }

  toggleTimestamps = () => {
    this.save({ showTimestamps: !this.tabData.showTimestamps });
  }

  /**
   * Setting 'previous' param to load API request fetching logs from previous container
   */
  togglePrevious = () => {
    this.save({ previous: !this.tabData.previous });
    this.reload();
  }

  onScroll = (evt: React.UIEvent<HTMLDivElement>) => {
    const logsArea = evt.currentTarget;
    const toBottomOffset = 100 * 16; // 100 lines * 16px (height of each line)
    const { scrollHeight, clientHeight, scrollTop } = logsArea;
    if (scrollTop === 0) {
      this.loadMore(scrollHeight);
    }
    if (scrollHeight - scrollTop > toBottomOffset) {
      this.showJumpToBottom = true;
    } else {
      this.showJumpToBottom = false;
    }
    this.lastLineIsShown = clientHeight + scrollTop === scrollHeight;
  };

  downloadLogs = () => {
    const { pod, selectedContainer } = this.tabData;
    const fileName = selectedContainer ? selectedContainer.name : pod.getName();
    const [oldLogs, newLogs] = this.logs;
    downloadFile(fileName + ".log", [...oldLogs, ...newLogs].join("\n"), "text/plain");
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

  renderJumpToBottom() {
    if (!this.logsElement) return null;
    return (
      <Button
        primary
        className={cssNames("jump-to-bottom flex gaps", {active: this.showJumpToBottom})}
        onClick={evt => {
          evt.currentTarget.blur();
          this.logsElement.scrollTo({
            top: this.logsElement.scrollHeight,
            behavior: "auto"
          });
        }}
      >
        <Trans>Jump to bottom</Trans>
        <Icon material="expand_more" />
      </Button>
    );
  }

  renderControls() {
    if (!this.ready) return null;
    const { selectedContainer, showTimestamps, previous } = this.tabData;
    const timestamps = podLogsStore.getTimestamps(podLogsStore.logs.get(this.tabId).join("\n"));
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
    const [oldLogs, newLogs] = this.logs;
    if (!this.ready) {
      return <Spinner center/>;
    }
    if (!oldLogs.length && !newLogs.length) {
      return (
        <div className="flex align-center justify-center">
          <Trans>There are no logs available for container.</Trans>
        </div>
      );
    }
    return (
      <>
        {this.preloading && (
          <div className="flex justify-center">
            <Spinner />
          </div>
        )}
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(this.colorConverter.ansi_to_html(oldLogs.join("\n"))) }} />
        {newLogs.length > 0 && (
          <>
            <p className="new-logs-sep" title={_i18n._(t`New logs since opening the dialog`)}/>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(this.colorConverter.ansi_to_html(newLogs.join("\n"))) }} />
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
          {this.renderJumpToBottom()}
          {this.renderLogs()}
        </div>
      </div>
    );
  }
}
