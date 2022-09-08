/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "./log-row.module.scss";

import AnsiUp from "ansi_up";
import DOMPurify from "dompurify";
import React from "react";
import { SearchStore } from "../../../search-store/search-store";
import { cssNames } from "../../../utils";
import type { LogTabViewModel } from "./logs-view-model";

const colorConverter = new AnsiUp();

export function LogRow({ rowIndex, model }: { rowIndex: number; model: LogTabViewModel }) {
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
            className={cssNames(styles.overlay, { [styles.active]: active })}
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
    <div className={styles.LogRow}>
      {contents.length > 1 ? contents : (
        <span dangerouslySetInnerHTML={{ __html: ansiToHtml(log) }} />
      )}
      {/* For preserving copy-paste experience and keeping line breaks */}
      <br />
    </div>
  );
}
