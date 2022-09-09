/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./log-list.module.scss";

import { useVirtualizer } from "@tanstack/react-virtual";
import { observer } from "mobx-react";
import React, { useRef } from "react";
import { cssNames } from "../../../utils";
import { LogRow } from "./log-row";
import type { LogTabViewModel } from "./logs-view-model";
import { ToBottom } from "./to-bottom";
import { useInitialScrollToBottom } from "./use-initial-scroll-to-bottom";
import { useOnScrollTop } from "./use-on-scroll-top";
import { useRefreshListOnDataChange } from "./use-refresh-list-on-data-change";
import { useScrollOnSearch } from "./use-scroll-on-search";
import { useJumpToBottomButton } from "./use-scroll-to-bottom";
import { useStickToBottomOnLogsLoad } from "./use-stick-to-bottom-on-logs-load";

export interface LogListProps {
  model: LogTabViewModel;
}

export const LogList = observer(({ model }: LogListProps) => {
  const { visibleLogs } = model;
  const parentRef = useRef<HTMLDivElement>(null);
  const topLineRef = useRef<HTMLDivElement>(null);
  const bottomLineRef = useRef<HTMLDivElement>(null);
  const [toBottomVisible, setButtonVisibility] = useJumpToBottomButton(parentRef.current);
  const uniqRowKey = useRefreshListOnDataChange(model.logTabData.get());

  const rowVirtualizer = useVirtualizer({
    count: visibleLogs.get().length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 38,
    overscan: 5,
    enableSmoothScroll: false,
  });

  const scrollTo = (index: number) => {
    rowVirtualizer.scrollToIndex(index, { align: "start", smoothScroll: false });
  };

  const scrollToBottom = () => {
    scrollTo(visibleLogs.get().length - 1);
  };

  const onScroll = () => {
    if (!parentRef.current) return;

    setButtonVisibility();
  };

  useInitialScrollToBottom(model, scrollToBottom);
  useScrollOnSearch(model.searchStore, scrollTo);
  useStickToBottomOnLogsLoad({ bottomLineRef, model, scrollToBottom });
  useOnScrollTop({ topLineRef, model, scrollTo });

  return (
    <div
      ref={parentRef}
      className={styles.LogList}
      onScroll={onScroll}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
        className={styles.virtualizer}
      >
        <div
          className={styles.anchorLine}
          ref={topLineRef}
          style={{ top: 0 }}
        />
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index + uniqRowKey}
            ref={virtualRow.measureElement}
            style={{
              transform: `translateY(${virtualRow.start}px)`,
            }}
            className={cssNames(styles.rowWrapper, { [styles.wrap]: model.logTabData.get()?.wrap })}
          >
            <div>
              <LogRow rowIndex={virtualRow.index} model={model} />
            </div>
          </div>
        ))}
        <div
          className={styles.anchorLine}
          ref={bottomLineRef}
          style={{ bottom: 0 }}
        />
      </div>
      {toBottomVisible && (
        <ToBottom onClick={scrollToBottom} />
      )}
    </div>
  );
});

