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

import "./log-search.scss";

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { SearchInput } from "../input";
import { searchStore } from "../../../common/search-store";
import { Icon } from "../icon";

export interface PodLogSearchProps {
  onSearch: (query: string) => void
  toPrevOverlay: () => void
  toNextOverlay: () => void
}

interface Props extends PodLogSearchProps {
  logs: string[]
}

export const LogSearch = observer((props: Props) => {
  const { logs, onSearch, toPrevOverlay, toNextOverlay } = props;
  const { setNextOverlayActive, setPrevOverlayActive, searchQuery, occurrences, activeFind, totalFinds } = searchStore;
  const jumpDisabled = !searchQuery || !occurrences.length;
  const findCounts = (
    <div className="find-count">
      {activeFind}/{totalFinds}
    </div>
  );

  const setSearch = (query: string) => {
    searchStore.onSearch(logs, query);
    onSearch(query);
  };

  const onPrevOverlay = () => {
    setPrevOverlayActive();
    toPrevOverlay();
  };

  const onNextOverlay = () => {
    setNextOverlayActive();
    toNextOverlay();
  };

  const onClear = () => {
    setSearch("");
  };

  const onKeyDown = (evt: React.KeyboardEvent<any>) => {
    if (evt.key === "Enter") {
      onNextOverlay();
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
        contentRight={totalFinds > 0 && findCounts}
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
