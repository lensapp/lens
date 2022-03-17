/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./list.scss";

import React from "react";
import AnsiUp from "ansi_up";
import DOMPurify from "dompurify";
import debounce from "lodash/debounce";
import { action, computed, observable, makeObservable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import moment from "moment-timezone";
import type { Align, ListOnScrollProps } from "react-window";
import { SearchStore } from "../../../search-store/search-store";
import { UserStore } from "../../../../common/user-store";
import { array, autoBind, cssNames } from "../../../utils";
import type { VirtualListRef } from "../../virtual-list";
import { VirtualList } from "../../virtual-list";
import { ToBottom } from "./to-bottom";
import type { LogTabViewModel } from "../logs/logs-view-model";
import { Spinner } from "../../spinner";

export interface LogListProps {
  model: LogTabViewModel;
}

const colorConverter = new AnsiUp();

@observer
export class LogList extends React.Component<LogListProps> {
  @observable isJumpButtonVisible = false;
  @observable isLastLineVisible = true;

  private virtualListDiv = React.createRef<HTMLDivElement>(); // A reference for outer container in VirtualList
  private virtualListRef = React.createRef<VirtualListRef>(); // A reference for VirtualList component
  private lineHeight = 18; // Height of a log line. Should correlate with styles in pod-log-list.scss

  constructor(props: LogListProps) {
    super(props);
    makeObservable(this);
    autoBind(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.model.logs.get(), (logs, prevLogs) => {
        this.onLogsInitialLoad(logs, prevLogs);
        this.onLogsUpdate();
        this.onUserScrolledUp(logs, prevLogs);
      }),
    ]);
  }

  onLogsInitialLoad(logs: string[], prevLogs: string[]) {
    if (!prevLogs.length && logs.length) {
      this.isLastLineVisible = true;
    }
  }

  onLogsUpdate() {
    if (this.isLastLineVisible) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 500);  // Giving some time to VirtualList to prepare its outerRef (this.virtualListDiv) element
    }
  }

  onUserScrolledUp(logs: string[], prevLogs: string[]) {
    if (!this.virtualListDiv.current) return;

    const newLogsAdded = prevLogs.length < logs.length;
    const scrolledToBeginning = this.virtualListDiv.current.scrollTop === 0;

    if (newLogsAdded && scrolledToBeginning) {
      const firstLineContents = prevLogs[0];
      const lineToScroll = logs.findIndex((value) => value == firstLineContents);

      if (lineToScroll !== -1) {
        this.scrollToItem(lineToScroll, "start");
      }
    }
  }

  /**
   * Returns logs with or without timestamps regarding to showTimestamps prop
   */
  @computed
  get logs(): string[] {
    const { showTimestamps } = this.props.model.logTabData.get() ?? {};

    if (!showTimestamps) {
      return this.props.model.logsWithoutTimestamps.get();
    }

    return this.props.model.timestampSplitLogs
      .get()
      .map(([logTimestamp, log]) => (`${logTimestamp && moment.tz(logTimestamp, UserStore.getInstance().localeTimezone).format()}${log}`));
  }

  /**
   * Checks if JumpToBottom button should be visible and sets its observable
   * @param props Scrolling props from virtual list core
   */
  setButtonVisibility = action(({ scrollOffset }: ListOnScrollProps, { scrollHeight }: HTMLDivElement) => {
    const offset = 100 * this.lineHeight;

    if (scrollHeight - scrollOffset < offset) {
      this.isJumpButtonVisible = false;
    } else {
      this.isJumpButtonVisible = true;
    }
  });

  /**
   * Checks if last log line considered visible to user, setting its observable
   * @param props Scrolling props from virtual list core
   */
  setLastLineVisibility = action(({ scrollOffset }: ListOnScrollProps, { scrollHeight, clientHeight }: HTMLDivElement) => {
    this.isLastLineVisible = (clientHeight + scrollOffset) === scrollHeight;
  });

  /**
   * Check if user scrolled to top and new logs should be loaded
   * @param props Scrolling props from virtual list core
   */
  checkLoadIntent = (props: ListOnScrollProps) => {
    const { scrollOffset } = props;

    if (scrollOffset === 0) {
      this.props.model.loadLogs();
    }
  };

  scrollToBottom = () => {
    if (!this.virtualListDiv.current) return;
    this.virtualListDiv.current.scrollTop = this.virtualListDiv.current.scrollHeight;
  };

  scrollToItem = (index: number, align: Align) => {
    this.virtualListRef.current?.scrollToItem(index, align);
  };

  onScroll = (props: ListOnScrollProps) => {
    this.isLastLineVisible = false;
    this.onScrollDebounced(props);
  };

  onScrollDebounced = debounce((props: ListOnScrollProps) => {
    const virtualList = this.virtualListDiv.current;

    if (virtualList) {
      this.setButtonVisibility(props, virtualList);
      this.setLastLineVisibility(props, virtualList);
      this.checkLoadIntent(props);
    }
  }, 700); // Increasing performance and giving some time for virtual list to settle down

  /**
   * A function is called by VirtualList for rendering each of the row
   * @param rowIndex index of the log element in logs array
   * @returns A react element with a row itself
   */
  getLogRow = (rowIndex: number) => {
    const { searchQuery, isActiveOverlay } = this.props.model.searchStore;
    const item = this.logs[rowIndex];
    const contents: React.ReactElement[] = [];
    const ansiToHtml = (ansi: string) => DOMPurify.sanitize(colorConverter.ansi_to_html(ansi));

    if (searchQuery) { // If search is enabled, replace keyword with backgrounded <span>
      // Case-insensitive search (lowercasing query and keywords in line)
      const regex = new RegExp(SearchStore.escapeRegex(searchQuery), "gi");
      const matches = item.matchAll(regex);
      const modified = item.replace(regex, match => match.toLowerCase());
      // Splitting text line by keyword
      const pieces = modified.split(searchQuery.toLowerCase());

      pieces.forEach((piece, index) => {
        const active = isActiveOverlay(rowIndex, index);
        const lastItem = index === pieces.length - 1;
        const overlayValue = matches.next().value;
        const overlay = !lastItem
          ? (
            <span
              className={cssNames("overlay", { active })}
              dangerouslySetInnerHTML={{ __html: ansiToHtml(overlayValue) }}
            />
          )
          : null;

        contents.push(
          <React.Fragment key={piece + index}>
            <span dangerouslySetInnerHTML={{ __html: ansiToHtml(piece) }} />
            {overlay}
          </React.Fragment>,
        );
      });
    }

    return (
      <div className={cssNames("LogRow")}>
        {contents.length > 1 ? contents : (
          <span dangerouslySetInnerHTML={{ __html: ansiToHtml(item) }} />
        )}
        {/* For preserving copy-paste experience and keeping line breaks */}
        <br />
      </div>
    );
  };

  render() {
    if (this.props.model.isLoading.get()) {
      return (
        <div className="LogList flex box grow align-center justify-center">
          <Spinner />
        </div>
      );
    }

    if (!this.logs.length) {
      return (
        <div className="LogList flex box grow align-center justify-center">
          There are no logs available for container
          {" "}
          {this.props.model.logTabData.get()?.selectedContainer}
        </div>
      );
    }

    return (
      <div className={cssNames("LogList flex" )}>
        <VirtualList
          items={this.logs}
          rowHeights={array.filled(this.logs.length, this.lineHeight)}
          getRow={this.getLogRow}
          onScroll={this.onScroll}
          outerRef={this.virtualListDiv}
          ref={this.virtualListRef}
          className="box grow"
        />
        {this.isJumpButtonVisible && (
          <ToBottom onClick={this.scrollToBottom} />
        )}
      </div>
    );
  }
}
