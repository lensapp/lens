/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./search.scss";

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { SearchInput } from "../../input";
import { Icon } from "../../icon";
import type { LogTabViewModel } from "./logs-view-model";

export interface PodLogSearchProps {
  onSearch?: (query: string) => void;
  scrollToOverlay: (lineNumber: number | undefined) => void;
  model: LogTabViewModel;
}

export const LogSearch = observer(({ onSearch, scrollToOverlay, model: { logTabData, searchStore, ...model }}: PodLogSearchProps) => {
  const tabData = logTabData.get();

  if (!tabData) {
    return null;
  }

  const logs = tabData.showTimestamps
    ? model.logs.get()
    : model.logsWithoutTimestamps.get();
  const { setNextOverlayActive, setPrevOverlayActive, searchQuery, occurrences, activeFind, totalFinds } = searchStore;
  const jumpDisabled = !searchQuery || !occurrences.length;

  const setSearch = (query: string) => {
    searchStore.onSearch(logs, query);
    onSearch?.(query);
    scrollToOverlay(searchStore.activeOverlayLine);
  };

  const onPrevOverlay = () => {
    setPrevOverlayActive();
    scrollToOverlay(searchStore.activeOverlayLine);
  };

  const onNextOverlay = () => {
    setNextOverlayActive();
    scrollToOverlay(searchStore.activeOverlayLine);
  };

  const onClear = () => {
    setSearch("");
  };

  const onKeyDown = (evt: React.KeyboardEvent<any>) => {
    if (evt.key === "Enter") {
      if (evt.shiftKey) {
        onPrevOverlay();
      } else {
        onNextOverlay();
      }
    }
  };

  useEffect(() => {
    // Refresh search when logs changed
    searchStore.onSearch(logs);
  }, [logs]);

  return (
    <div className="LogSearch flex box grow justify-flex-end gaps align-center">
      <SearchInput
        value={searchQuery}
        onChange={setSearch}
        showClearIcon={true}
        contentRight={totalFinds > 0 && (
          <div className="find-count">
            {`${activeFind} / ${totalFinds}`}
          </div>
        )}
        onClear={onClear}
        onKeyDown={onKeyDown}
      />
      <Icon
        material="keyboard_arrow_up"
        tooltip="Previous"
        onClick={onPrevOverlay}
        disabled={jumpDisabled}
      />
      <Icon
        material="keyboard_arrow_down"
        tooltip="Next"
        onClick={onNextOverlay}
        disabled={jumpDisabled}
      />
    </div>
  );
});
