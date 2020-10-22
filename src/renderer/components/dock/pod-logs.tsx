import "./pod-logs.scss";
import React from "react";
import { Trans } from "@lingui/macro";
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
import { VirtualList } from "../virtual-list";
import { searchStore } from "./search.store";
import { ListOnScrollProps } from "react-window";
import debounce from "lodash/debounce";

interface Props {
  className?: string
  tab: IDockTab
}

const lineHeight = 18; // Height of a log line. Should correlate with styles in pod-logs.scss

@observer
export class PodLogs extends React.Component<Props> {
  @observable ready = false;
  @observable preloading = false; // Indicator for setting Spinner (loader) at the top of the logs
  @observable showJumpToBottom = false;

  private logsElement = React.createRef<HTMLDivElement>(); // A reference for outer container in VirtualList
  private virtualListRef = React.createRef<VirtualList>(); // A reference for VirtualList component
  private lastLineIsShown = true; // used for proper auto-scroll content after refresh

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
    if (this.logsElement.current && this.lastLineIsShown) {
      this.logsElement.current.scrollTop = this.logsElement.current.scrollHeight;
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
  loadMore = async () => {
    const lines = podLogsStore.lines;
    if (lines < logRange) return;
    this.preloading = true;
    await podLogsStore.load(this.tabId);
    this.preloading = false;
    if (podLogsStore.lines > lines) {
      // Set scroll position back to place where preloading started
      this.logsElement.current.scrollTop = (podLogsStore.lines - lines) * lineHeight;
    }
  }

  /**
   * A function for various actions after search is happened
   * @param query {string} A text from search field
   */
  @autobind()
  onSearch(query: string) {
    this.toOverlay();
  }

  /**
   * Scrolling to active overlay (search word highlight)
   */
  @autobind()
  toOverlay() {
    const { activeOverlayLine } = searchStore;
    if (!this.virtualListRef.current || activeOverlayLine === undefined) return;
    this.virtualListRef.current.scrollToItem(activeOverlayLine, "center");
  }

  /**
   * Computed prop which returns logs with or without timestamps added to each line
   * @returns {Array} An array log items
   */
  @computed
  get logs(): string[] {
    if (!podLogsStore.logs.has(this.tabId)) return [];
    const logs = podLogsStore.logs.get(this.tabId);
    const { getData, removeTimestamps } = podLogsStore;
    const { showTimestamps } = getData(this.tabId);
    if (!showTimestamps) {
      return logs.map(item => removeTimestamps(item));
    }
    return logs;
  }

  onScroll = debounce((props: ListOnScrollProps) => {
    const toBottomOffset = 100 * lineHeight; // 100 lines * 18px (height of each line)
    const { scrollHeight, clientHeight, scrollTop } = this.logsElement.current;
    // Trigger loading only if scrolled by user
    if (scrollTop === 0 && !props.scrollUpdateWasRequested) {
      this.loadMore();
    }
    if (scrollHeight - scrollTop > toBottomOffset) {
      this.showJumpToBottom = true;
    } else {
      this.showJumpToBottom = false;
    }
    this.lastLineIsShown = clientHeight + scrollTop === scrollHeight;
  }, 300); // Debouncing to let virtual list do its internal works

  /**
   * A function is called by VirtualList for rendering each of the row
   * @param rowIndex {Number} index of the log element in logs array
   * @returns A react element with a row itself
   */
  getLogRow = (rowIndex: number) => {
    const isSeparator = this.logs[rowIndex] === "---newlogs---"; // TODO: Use constant separator
    const { searchQuery, isActiveOverlay } = searchStore;
    const item = this.logs[rowIndex];
    const contents: React.ReactElement[] = [];
    if (searchQuery) {
      // If search is enabled, replace keyword with backgrounded <span> to "highlight" searchable text
      const pieces = item.split(searchQuery);
      pieces.forEach((piece, index) => {
        const active = isActiveOverlay(rowIndex, index);
        const lastItem = index === pieces.length - 1;
        const overlay = !lastItem ?
          <span className={cssNames({ active })}>{searchQuery}</span> :
          null
        contents.push(
          <React.Fragment key={piece + index}>
            {piece}{overlay}
          </React.Fragment>
        );
      })
    }
    return (
      <div className={cssNames("LogRow", { separator: isSeparator })}>
        {contents.length > 1 ? contents : item}
      </div>
    );
  }

  renderJumpToBottom() {
    if (!this.logsElement) return null;
    return (
      <Button
        primary
        className={cssNames("jump-to-bottom flex gaps", {active: this.showJumpToBottom})}
        onClick={evt => {
          evt.currentTarget.blur();
          this.logsElement.current.scrollTo({
            top: this.logsElement.current.scrollHeight,
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
    // Generating equal heights for each row with ability to do multyrow logs in future
    // e. g. for wrapping logs feature
    const rowHeights = new Array(this.logs.length).fill(lineHeight);
    if (!this.ready) {
      return <Spinner center/>;
    }
    if (!this.logs.length) {
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
            <Spinner center />
          </div>
        )}
        <VirtualList
          items={this.logs}
          rowHeights={rowHeights}
          getRow={this.getLogRow}
          onScroll={this.onScroll}
          outerRef={this.logsElement}
          ref={this.virtualListRef}
        />
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
        onSearch={this.onSearch}
        toPrevOverlay={this.toOverlay}
        toNextOverlay={this.toOverlay}
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
        <div className="logs">
          {this.renderJumpToBottom()}
          {this.renderLogs()}
        </div>
      </div>
    );
  }
}
