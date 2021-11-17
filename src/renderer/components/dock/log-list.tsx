/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./log-list.scss";

import React from "react";
import AnsiUp from "ansi_up";
import DOMPurify from "dompurify";
import debounce from "lodash/debounce";
import { action, observable, makeObservable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import type { Align, ListOnScrollProps } from "react-window";

import { SearchStore, searchStore } from "../../../common/search-store";
import { array, boundMethod, cssNames } from "../../utils";
import { VirtualList } from "../virtual-list";
import { ToBottom } from "./to-bottom";

interface Props {
  logs: string[]
  isLoading: boolean
  load: () => void
  selectedContainer: string
}

const colorConverter = new AnsiUp();

@observer
export class LogList extends React.Component<Props> {
  @observable isJumpButtonVisible = false;
  @observable isLastLineVisible = true;

  private virtualListDiv = React.createRef<HTMLDivElement>(); // A reference for outer container in VirtualList
  private virtualListRef = React.createRef<VirtualList>(); // A reference for VirtualList component
  private lineHeight = 18; // Height of a log line. Should correlate with styles in pod-log-list.scss

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.logs, (logs, prevLogs) => {
        this.onLogsInitialLoad(logs, prevLogs);
        this.onLogsUpdate();
        this.onUserScrolledUp(logs, prevLogs);
      }),
    ]);
  }

  @boundMethod
  onLogsInitialLoad(logs: string[], prevLogs: string[]) {
    if (!prevLogs.length && logs.length) {
      this.isLastLineVisible = true;
    }
  }

  @boundMethod
  onLogsUpdate() {
    if (this.isLastLineVisible) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 500);  // Giving some time to VirtualList to prepare its outerRef (this.virtualListDiv) element
    }
  }

  @boundMethod
  onUserScrolledUp(logs: string[], prevLogs: string[]) {
    const { current } = this.virtualListDiv;

    if (!current) {
      return;
    }

    const newLogsAdded = prevLogs.length < logs.length;
    const scrolledToBeginning = current.scrollTop === 0;

    if (newLogsAdded && scrolledToBeginning) {
      const firstLineContents = prevLogs[0];
      const lineToScroll = this.props.logs.findIndex((value) => value == firstLineContents);

      if (lineToScroll !== -1) {
        this.scrollToItem(lineToScroll, "start");
      }
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
    const { current } = this.virtualListDiv;

    if (!current) {
      return;
    }

    const { scrollHeight, clientHeight } = current;
    const { scrollOffset } = props;

    this.isLastLineVisible = (clientHeight + scrollOffset) === scrollHeight;
  };

  /**
   * Check if user scrolled to top and new logs should be loaded
   * @param props Scrolling props from virtual list core
   */
  checkLoadIntent = ({ scrollOffset }: ListOnScrollProps) => {
    if (scrollOffset === 0) {
      this.props.load();
    }
  };

  scrollToItem = (index: number, align: Align) => {
    this.virtualListRef.current?.scrollToItem(index, align);
  };

  scrollToBottom = () => {
    const { current } = this.virtualListDiv;

    if (!current) {
      return;
    }

    current.scrollTop = current.scrollHeight;
  };

  onScroll = (props: ListOnScrollProps) => {
    this.isLastLineVisible = false;
    this.setButtonVisibility(props);
    this.setLastLineVisibility(props);
    this.onScrollDebounced(props);
  };

  onScrollDebounced = debounce((props: ListOnScrollProps) => {
    this.checkLoadIntent(props);
  }, 700, {
    leading: true,
  }); // Increasing performance and giving some time for virtual list to settle down

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
          ? <span
            className={cssNames("overlay", { active })}
            dangerouslySetInnerHTML={{ __html: ansiToHtml(overlayValue) }}
          />
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
    const { logs, isLoading, selectedContainer } = this.props;

    if (isLoading) {
      // Don't show a spinner since `Logs` will instead.
      return null;
    }

    if (!logs.length) {
      return (
        <div className="LogList flex box grow align-center justify-center">
          There are no logs available for container {selectedContainer}
        </div>
      );
    }

    return (
      <div className={cssNames("LogList flex")}>
        <VirtualList
          items={logs}
          rowHeights={array.filled(logs.length, this.lineHeight)}
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
