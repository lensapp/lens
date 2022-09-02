import { useVirtualizer } from '@tanstack/react-virtual';
import AnsiUp from 'ansi_up';
import DOMPurify from 'dompurify';
import { observer } from 'mobx-react';
import React, { useEffect, useRef } from 'react';
import { SearchStore } from '../../../search-store/search-store';
import { cssNames } from '../../../utils';
import type { LogTabViewModel } from './logs-view-model';

export interface LogListProps {
  model: LogTabViewModel;
}

export const LogList = observer(({ model }: LogListProps) => {
  const [toBottomVisible, setToBottomVisible] = React.useState(false);
  const [lastLineVisible, setLastLineVisible] = React.useState(true);

  const { visibleLogs } = model;
  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: visibleLogs.get().length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 38,
    overscan: 5,
    scrollPaddingEnd: 0,
    scrollPaddingStart: 0,
  });

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!parentRef.current) return;

    setToBottomVisibility();
    setLastLineVisibility();
    onScrollToTop();
  }

  // TODO: Move to its own hook
  const setToBottomVisibility = () => {
    const { scrollTop, scrollHeight } = parentRef.current as HTMLDivElement;
    // console.log("scrolling", scrollHeight, scrollTop, rowVirtualizer.getTotalSize())
    if (scrollHeight - scrollTop > 4000) {
      setToBottomVisible(true);
    } else {
      setToBottomVisible(false);
    }
  }

  const setLastLineVisibility = () => {
    const { scrollTop, scrollHeight } = parentRef.current as HTMLDivElement;

    if (scrollHeight - scrollTop < 4000) {
      setLastLineVisible(true);
    } else {
      setLastLineVisible(false);
    }
  }

  /**
   * Check if user scrolled to top and new logs should be loaded
   */
   const onScrollToTop = async () => {
    const { scrollTop } = parentRef.current as HTMLDivElement;

    if (scrollTop === 0) {
      const oldLogsAmount = visibleLogs.get().length;
      await model.loadLogs();
      const newLogsAmount = visibleLogs.get().length;

      
      const scrollToIndex = newLogsAmount - oldLogsAmount;
      console.log("new logs loaded", oldLogsAmount, newLogsAmount, scrollToIndex);

      setTimeout(() => {
        rowVirtualizer.scrollToIndex(scrollToIndex, { align: 'start', smoothScroll: false });
      }, 1000)

      // rowVirtualizer.scrollToIndex(scrollToIndex, { align: 'start', smoothScroll: false });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      // Initial scroll to bottom
      rowVirtualizer.scrollToIndex(visibleLogs.get().length - 1, { align: 'end', smoothScroll: false });
    }, 200)
  }, [])

  return (
    <div
      ref={parentRef}
      style={{
        flexGrow: 1,
        overflow: 'auto', // Make it scroll!
      }}
      onScroll={onScroll}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            ref={virtualRow.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <div>
              <LogRow rowIndex={virtualRow.index} model={model} />
            </div>
          </div>
        ))}
        <div style={{
          width: "100%",
          height: "1px",
          background: "red",
          position: "absolute",
          bottom: 0,
        }}></div>
      </div>
    </div>
  )
});

const colorConverter = new AnsiUp();

function LogRow({ rowIndex, model }: { rowIndex: number; model: LogTabViewModel }) {
  const { searchQuery, isActiveOverlay } = model.searchStore;
  const log = model.visibleLogs.get()[rowIndex];
  const contents: React.ReactElement[] = [];
  const ansiToHtml = (ansi: string) => DOMPurify.sanitize(colorConverter.ansi_to_html(ansi));

  if (searchQuery) { // If search is enabled, replace keyword with backgrounded <span>
    // Case-insensitive search (lowercasing query and keywords in line)
    const regex = new RegExp(SearchStore.escapeRegex(searchQuery), "gi");
    const matches = log.matchAll(regex);
    const modified = log.replace(regex, match => match.toLowerCase());
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
        <span dangerouslySetInnerHTML={{ __html: ansiToHtml(log) }} />
      )}
      {/* For preserving copy-paste experience and keeping line breaks */}
      <br />
    </div>
  );
}