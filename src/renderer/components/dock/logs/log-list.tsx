/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./log-list.module.scss";

import throttle from "lodash/throttle";
import { useVirtualizer } from '@tanstack/react-virtual';
import { observer } from 'mobx-react';
import React, { useEffect, useRef } from 'react';
import type { LogTabViewModel } from './logs-view-model';
import { LogRow } from "./log-row";
import { cssNames } from "../../../utils";
import { v4 as getRandomId } from "uuid";
import { useJumpToBottomButton } from "./use-scroll-to-bottom";
import { useInitialScrollToBottom } from "./use-initial-scroll-to-bottom";
import { ToBottom } from "./to-bottom";
import useIntersectionObserver from "../../../hooks/useIntersectionObserver";

export interface LogListProps {
  model: LogTabViewModel;
}

export const LogList = observer(({ model }: LogListProps) => {
  const { visibleLogs } = model;
  const parentRef = useRef<HTMLDivElement>(null);
  const lastLineRef = useRef<HTMLDivElement>(null);
  const [rowKeySuffix, setRowKeySuffix] = React.useState(getRandomId());
  const [toBottomVisible, setButtonVisibility] = useJumpToBottomButton(parentRef.current);
  const entry = useIntersectionObserver(lastLineRef.current, {});

  const rowVirtualizer = useVirtualizer({
    count: visibleLogs.get().length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 38,
    overscan: 5,
  });

  const scrollTo = (index: number) => {
    rowVirtualizer.scrollToIndex(index, { align: 'start', smoothScroll: false });
  }

  const scrollToBottom = () => {
    scrollTo(visibleLogs.get().length - 1);
  }

  const onScroll = throttle(() => {
    if (!parentRef.current) return;

    setButtonVisibility();
    onScrollToTop();
  }, 1_000, { trailing: true, leading: true });

  /**
   * Loads new logs if user scrolled to the top
   */
  const onScrollToTop = async () => {
    const { scrollTop } = parentRef.current as HTMLDivElement;

    if (scrollTop === 0) {
      const logs = model.logs.get();
      const firstLog = logs[0];

      await model.loadLogs();

      const scrollToIndex = model.logs.get().findIndex(log => log === firstLog);

      scrollTo(scrollToIndex);
    }
  };

  useInitialScrollToBottom(model, scrollToBottom);

  useEffect(() => {
    // rowVirtualizer.scrollToIndex(visibleLogs.get().length - 1, { align: 'end', smoothScroll: false });
    // Refresh list
    setRowKeySuffix(getRandomId());
  }, [model.logTabData.get()]);

  useEffect(() => {
    if (!model.searchStore.occurrences.length) return;

    scrollTo(model.searchStore.occurrences[model.searchStore.activeOverlayIndex]);
  }, [model.searchStore.searchQuery, model.searchStore.activeOverlayIndex])

  useEffect(() => {
    if (entry?.isIntersecting) {
      scrollToBottom();
    }
  }, [model.visibleLogs.get().length]);

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
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index + rowKeySuffix}
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
        <div className={styles.lastLine} ref={lastLineRef}></div>
      </div>
      {toBottomVisible && (
        <ToBottom onClick={scrollToBottom} />
      )}
    </div>
  )
});

