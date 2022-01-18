/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./log-search.scss";

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { SearchInput } from "../input";
import type { SearchStore } from "../../search-store/search-store";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import searchStoreInjectable from "../../search-store/search-store.injectable";

export interface PodLogSearchProps {
  onSearch: (query: string) => void
  toPrevOverlay: () => void
  toNextOverlay: () => void
}

interface Props extends PodLogSearchProps {
  logs: string[]
}

interface Dependencies {
  searchStore: SearchStore
}

const NonInjectedLogSearch = observer((props: Props & Dependencies) => {
  const { logs, onSearch, toPrevOverlay, toNextOverlay, searchStore } = props;
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

export const LogSearch = withInjectables<Dependencies, Props>(
  NonInjectedLogSearch,

  {
    getProps: (di, props) => ({
      searchStore: di.inject(searchStoreInjectable),
      ...props,
    }),
  },
);
