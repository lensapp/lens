/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./list.scss";

import React, { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import AnsiUp from "ansi_up";
import DOMPurify from "dompurify";
import debounce from "lodash/debounce";
import { reaction, IComputedValue } from "mobx";
import { observer } from "mobx-react";
import moment from "moment-timezone";
import type { Align, ListOnScrollProps } from "react-window";
import { array, cssNames, disposer } from "../../../utils";
import { VirtualList } from "../../virtual-list";
import { ToBottom } from "./to-bottom";
import type { LogTabViewModel } from "../logs/logs-view-model";
import { Spinner } from "../../spinner";
import { escapeRegexForSearch } from "./search-store";
import { withInjectables } from "@ogre-tools/injectable-react";
import localeTimezoneInjectable from "../../locale-date/locale-timezone.injectable";

export interface LogListProps {
  model: LogTabViewModel;
}

interface Dependencies {
  localeTimezone: IComputedValue<string>;
}

const colorConverter = new AnsiUp();
const lineHeight = 18;

export interface LogListRef {
  scrollToItem: (index: number, align: Align) => void;
}

const NonInjectedLogList = observer(forwardRef(({ localeTimezone, model }: Dependencies & LogListProps, ref: ForwardedRef<LogListRef>) => {
  const [isJumpButtonVisible, setIsJumpButtonVisible] = useState(false);
  const [isLastLineVisible, setIsLastLineVisible] = useState(true);
  const virtualListDiv = useRef<HTMLDivElement>();
  const virtualListRef = useRef<VirtualList>();
  const logs = model.logs.get();

  const checkLoadIntent = (props: ListOnScrollProps) => {
    const { scrollOffset } = props;

    if (scrollOffset === 0) {
      model.loadLogs();
    }
  };
  const scrollToBottom = () => {
    if (virtualListDiv.current) {
      virtualListDiv.current.scrollTop = virtualListDiv.current.scrollHeight;
    }
  };
  const scrollToItem = (index: number, align: Align) => {
    virtualListRef.current?.scrollToItem(index, align);
  };

  // Increasing performance and giving some time for virtual list to settle down
  const onScrollDebounced = debounce((props: ListOnScrollProps) => {
    if (!virtualListDiv.current) return;
    setButtonVisibility(props);
    setLastLineVisibility(props);
    checkLoadIntent(props);
  }, 700);
  const onScroll = (props: ListOnScrollProps) => {
    setIsLastLineVisible(false);
    onScrollDebounced(props);
  };

  useImperativeHandle(ref, () => ({
    scrollToItem,
  }));

  /**
   * A function is called by VirtualList for rendering each of the row
   * @param rowIndex index of the log element in logs array
   * @returns A react element with a row itself
   */
  const getLogRow = (rowIndex: number) => {
    const { searchQuery, isActiveOverlay } = model.searchStore;
    const item = logs[rowIndex];
    const contents: React.ReactElement[] = [];
    const ansiToHtml = (ansi: string) => DOMPurify.sanitize(colorConverter.ansi_to_html(ansi));

    if (searchQuery) {
      // If search is enabled, replace keyword with backgrounded <span>
      // Case-insensitive search (lowercasing query and keywords in line)
      const regex = escapeRegexForSearch(searchQuery);
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
  const onLogsInitialLoad = (logs: string[], prevLogs: string[]) => {
    if (!prevLogs.length && logs.length) {
      setIsLastLineVisible(true);
    }
  };
  const onLogsUpdate = () => {
    if (isLastLineVisible) {
      setTimeout(() => {
        scrollToBottom();
      }, 500);  // Giving some time to VirtualList to prepare its outerRef (this.virtualListDiv) element
    }
  };
  const onUserScrolledUp = (logs: string[], prevLogs: string[]) => {
    if (!virtualListDiv.current) return;

    const newLogsAdded = prevLogs.length < logs.length;
    const scrolledToBeginning = virtualListDiv.current.scrollTop === 0;

    if (newLogsAdded && scrolledToBeginning) {
      const firstLineContents = prevLogs[0];
      const lineToScroll = logs.findIndex((value) => value == firstLineContents);

      if (lineToScroll !== -1) {
        scrollToItem(lineToScroll, "start");
      }
    }
  };
  const setButtonVisibility = (props: ListOnScrollProps) => {
    const offset = 100 * lineHeight;
    const { scrollHeight } = virtualListDiv.current;
    const { scrollOffset } = props;

    setIsJumpButtonVisible(scrollHeight - scrollOffset >= offset);
  };
  const setLastLineVisibility = (props: ListOnScrollProps) => {
    const { scrollHeight, clientHeight } = virtualListDiv.current;
    const { scrollOffset } = props;

    setIsLastLineVisible(clientHeight + scrollOffset === scrollHeight);
  };

  useEffect(() => disposer(
    reaction(() => logs, (logs, prevLogs) => {
      onLogsInitialLoad(logs, prevLogs);
      onLogsUpdate();
      onUserScrolledUp(logs, prevLogs);
    }),
  ), []);

  const logLines = (() => {
    const logTabData = model.logTabData.get();
    const timezone = localeTimezone.get();

    if (!logTabData?.showTimestamps) {
      return model.logsWithoutTimestamps.get();
    }

    return model.timestampSplitLogs
      .get()
      .map(([logTimestamp, log]) => (`${logTimestamp && moment.tz(logTimestamp, timezone).format()}${log}`));
  })();

  const isLoading = model.isLoading.get();
  const isInitLoading = isLoading && !logLines.length;
  const rowHeights = array.filled(logLines.length, lineHeight);

  if (isInitLoading) {
    return (
      <div className="LogList flex box grow align-center justify-center">
        <Spinner center />
      </div>
    );
  }

  if (!logLines.length) {
    return (
      <div className="LogList flex box grow align-center justify-center">
        There are no logs available for container
      </div>
    );
  }

  return (
    <div className={cssNames("LogList flex", { isLoading })}>
      <VirtualList
        items={logLines}
        rowHeights={rowHeights}
        getRow={getLogRow}
        onScroll={onScroll}
        outerRef={virtualListDiv}
        ref={virtualListRef}
        className="box grow"
      />
      {isJumpButtonVisible && (
        <ToBottom onClick={scrollToBottom} />
      )}
    </div>
  );
}));

export const LogList = withInjectables<Dependencies, LogListProps>(NonInjectedLogList, {
  getProps: (di, props) => ({
    localeTimezone: di.inject(localeTimezoneInjectable),
    ...props,
  }),
});
