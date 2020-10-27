import "./pod-logs.scss";
import React from "react";
import AnsiUp from "ansi_up";
import DOMPurify from "dompurify";
import { t, Trans } from "@lingui/macro";
import { computed, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { _i18n } from "../../i18n";
import { autobind, cssNames } from "../../utils";
import { Icon } from "../icon";
import { Spinner } from "../spinner";
import { IDockTab } from "./dock.store";
import { InfoPanel } from "./info-panel";
import { IPodLogsData, logRange, podLogsStore } from "./pod-logs.store";
import { Button } from "../button";
import { PodLogControls } from "./pod-log-controls";

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
      }, { fireImmediately: true }),

      // Check if need to show JumpToBottom if new log amount is less than previous one
      reaction(() => podLogsStore.logs.get(this.tabId), () => {
        const { tabId } = this;
        if (podLogsStore.logs.has(tabId) && podLogsStore.logs.get(tabId).length < logRange) {
          this.showJumpToBottom = false;
        }
      })
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
   * @returns {Array} An array with 2 items - [oldLogs, newLogs]
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
            <p className="new-logs-sep" title={_i18n._(t`New logs since opening logs tab`)}/>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(this.colorConverter.ansi_to_html(newLogs.join("\n"))) }} />
          </>
        )}
      </>
    );
  }

  render() {
    const { className } = this.props;
    const controls = (
      <PodLogControls
        ready={this.ready}
        tabId={this.tabId}
        tabData={this.tabData}
        logs={this.logs}
        save={this.save}
        reload={this.reload}
      />
    )
    return (
      <div className={cssNames("PodLogs flex column", className)}>
        <InfoPanel
          tabId={this.props.tab.id}
          controls={controls}
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
