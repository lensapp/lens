import { useVirtualizer } from '@tanstack/react-virtual';
import AnsiUp from 'ansi_up';
import DOMPurify from 'dompurify';
import { observer } from 'mobx-react';
import React, { useRef } from 'react';
import { SearchStore } from '../../../search-store/search-store';
import { cssNames } from '../../../utils';
import type { LogTabViewModel } from './logs-view-model';

export interface LogListProps {
  model: LogTabViewModel;
}

export const LogList = observer(({ model }: LogListProps) => {
  const { logs } = model;
  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: logs.get().length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 38,
    overscan: 5
  })

  return (
    <div
      ref={parentRef}
      style={{
        flexGrow: 1,
        overflow: 'auto', // Make it scroll!
      }}
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
            className={virtualRow.index % 2 ? 'ListItemOdd' : 'ListItemEven'}
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
      </div>
    </div>
  )
});

const colorConverter = new AnsiUp();

function LogRow({ rowIndex, model }: { rowIndex: number; model: LogTabViewModel }) {
  const { searchQuery, isActiveOverlay } = model.searchStore;
  const log = model.logs.get()[rowIndex];
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