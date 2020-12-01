import "./pod-log-list.scss";

import React from "react";
import AnsiUp from "ansi_up";
import DOMPurify from "dompurify";
import debounce from "lodash/debounce";
import { Trans } from "@lingui/macro";
import { action, observable } from "mobx";
import { observer } from "mobx-react";
import { Align, ListOnScrollProps } from "react-window";

import { searchStore } from "../../../common/search-store";
import { cssNames } from "../../utils";
import { Button } from "../button";
import { Icon } from "../icon";
import { Spinner } from "../spinner";
import { VirtualList } from "../virtual-list";
import { logRange } from "./pod-logs.store";

interface Props {
  logs: string[]
  isLoading: boolean
  load: () => void
  id: string
}

const colorConverter = new AnsiUp();

@observer
export class PodLogList extends React.Component<Props> {
  @observable isJumpButtonVisible = false;
  @observable isLastLineVisible = true;

  private virtualListDiv = React.createRef<HTMLDivElement>(); // A reference for outer container in VirtualList
  private virtualListRef = React.createRef<VirtualList>(); // A reference for VirtualList component
  private lineHeight = 18; // Height of a log line. Should correlate with styles in pod-log-list.scss

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate(prevProps: Props) {
    const { logs, id } = this.props;

    if (id != prevProps.id) {
      this.isLastLineVisible = true;

      return;
    }
    if (logs == prevProps.logs || !this.virtualListDiv.current) return;
    const newLogsLoaded = prevProps.logs.length < logs.length;
    const scrolledToBeginning = this.virtualListDiv.current.scrollTop === 0;
    const fewLogsLoaded = logs.length < logRange;

    if (this.isLastLineVisible) {
      this.scrollToBottom(); // Scroll down to keep user watching/reading experience

      return;
    }

    if (scrolledToBeginning && newLogsLoaded) {
      this.virtualListDiv.current.scrollTop = (logs.length - prevProps.logs.length) * this.lineHeight;
    }

    if (fewLogsLoaded) {
      this.isJumpButtonVisible = false;
    }

    if (!logs.length) {
      this.isLastLineVisible = false;
    }
  }

  /**
   * Checks if JumpToBottom button should be visible and sets its observable
   * @param props Scrolling props from virtual list core
   */
  @action
  setButtonVisibility = (props: ListOnScrollProps) => {
    const offset = 100 * this.lineHeight;
    const { scrollHeight } = this.virtualListDiv.current;
    const { scrollOffset } = props;

    if (scrollHeight - scrollOffset < offset) {
      this.isJumpButtonVisible = false;
    } else {
      this.isJumpButtonVisible = true;
    }
  };

  /**
   * Checks if last log line considered visible to user, setting its observable
   * @param props Scrolling props from virtual list core
   */
  @action
  setLastLineVisibility = (props: ListOnScrollProps) => {
    const { scrollHeight, clientHeight } = this.virtualListDiv.current;
    const { scrollOffset, scrollDirection } = props;

    if (scrollDirection == "backward") {
      this.isLastLineVisible = false;
    } else {
      if (clientHeight + scrollOffset === scrollHeight) {
        this.isLastLineVisible = true;
      }
    }
  };

  /**
   * Check if user scrolled to top and new logs should be loaded
   * @param props Scrolling props from virtual list core
   */
  checkLoadIntent = (props: ListOnScrollProps) => {
    const { scrollOffset } = props;

    if (scrollOffset === 0) {
      this.props.load();
    }
  };

  @action
  scrollToBottom = () => {
    if (!this.virtualListDiv.current) return;
    this.isJumpButtonVisible = false;
    this.virtualListDiv.current.scrollTop = this.virtualListDiv.current.scrollHeight;
  };

  scrollToItem = (index: number, align: Align) => {
    this.virtualListRef.current.scrollToItem(index, align);
  };

  onScroll = debounce((props: ListOnScrollProps) => {
    if (!this.virtualListDiv.current) return;
    this.setButtonVisibility(props);
    this.setLastLineVisibility(props);
    this.checkLoadIntent(props);
  }, 700); // Increasing performance and giving some time for virtual list to settle down

  /**
   * A function is called by VirtualList for rendering each of the row
   * @param rowIndex index of the log element in logs array
   * @returns A react element with a row itself
   */
  getLogRow = (rowIndex: number) => {
    const { searchQuery, isActiveOverlay } = searchStore;
    const item = this.props.logs[rowIndex];
    const contents: React.ReactElement[] = [];
    const ansiToHtml = (ansi: string) => DOMPurify.sanitize(colorConverter.ansi_to_html(ansi));

    if (searchQuery) { // If search is enabled, replace keyword with backgrounded <span>
      // Case-insensitive search (lowercasing query and keywords in line)
      const regex = new RegExp(searchStore.escapeRegex(searchQuery), "gi");
      const matches = item.matchAll(regex);
      const modified = item.replace(regex, match => match.toLowerCase());
      // Splitting text line by keyword
      const pieces = modified.split(searchQuery.toLowerCase());

      pieces.forEach((piece, index) => {
        const active = isActiveOverlay(rowIndex, index);
        const lastItem = index === pieces.length - 1;
        const overlayValue = matches.next().value;
        const overlay = !lastItem
          ? <span
            className={cssNames("overlay", { active })}
            dangerouslySetInnerHTML={{ __html: ansiToHtml(overlayValue) }}
          />
          : null;

        contents.push(
          <React.Fragment key={piece + index}>
            <span dangerouslySetInnerHTML={{ __html: ansiToHtml(piece) }} />
            {overlay}
          </React.Fragment>
        );
      });
    }

    return (
      <div className={cssNames("LogRow")}>
        {contents.length > 1 ? contents : (
          <span dangerouslySetInnerHTML={{ __html: ansiToHtml(item) }} />
        )}
      </div>
    );
  };

  render() {
    const { logs, isLoading } = this.props;
    const isInitLoading = isLoading && !logs.length;
    const rowHeights = new Array(logs.length).fill(this.lineHeight);

    if (isInitLoading) {
      return <Spinner center/>;
    }

    if (!logs.length) {
      return (
        <div className="PodLogList flex box grow align-center justify-center">
          <Trans>There are no logs available for container</Trans>
        </div>
      );
    }

    return (
      <div className={cssNames("PodLogList flex", { isLoading })}>
        <VirtualList
          items={logs}
          rowHeights={rowHeights}
          getRow={this.getLogRow}
          onScroll={this.onScroll}
          outerRef={this.virtualListDiv}
          ref={this.virtualListRef}
          className="box grow"
        />
        {this.isJumpButtonVisible && (
          <JumpToBottom onClick={this.scrollToBottom} />
        )}
      </div>
    );
  }
}

interface JumpToBottomProps {
  onClick: () => void
}

const JumpToBottom = ({ onClick }: JumpToBottomProps) => {
  return (
    <Button
      primary
      className="JumpToBottom flex gaps"
      onClick={evt => {
        evt.currentTarget.blur();
        onClick();
      }}
    >
      <Trans>Jump to bottom</Trans>
      <Icon material="expand_more" />
    </Button>
  );
};