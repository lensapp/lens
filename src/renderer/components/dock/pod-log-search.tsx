import "./pod-log-search.scss";

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { SearchInput } from "../input";
import { searchStore } from "../../../common/search-store";
import { Icon } from "../icon";
import { _i18n } from "../../i18n";
import { t } from "@lingui/macro";

export interface PodLogSearchProps {
  onSearch: (query: string) => void
  toPrevOverlay: () => void
  toNextOverlay: () => void
  logs: string[]
}

export const PodLogSearch = observer((props: PodLogSearchProps) => {
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
  }

  const onNextOverlay = () => {
    setNextOverlayActive();
    toNextOverlay();
  }

  const onClear = () => {
    setSearch("");
  }

  const onKeyDown = (evt: React.KeyboardEvent<any>) => {
    if (evt.key === "Enter") {
      onNextOverlay();
    }
  }

  useEffect(() => {
    // Refresh search when logs changed
    searchStore.onSearch(logs);
  }, [logs]);

  return (
    <div className="PodLogsSearch flex box grow justify-flex-end gaps align-center">
      <SearchInput
        value={searchQuery}
        onChange={setSearch}
        closeIcon={false}
        contentRight={totalFinds > 0 && findCounts}
        onClear={onClear}
        onKeyDown={onKeyDown}
      />
      <Icon
        material="keyboard_arrow_up"
        tooltip={_i18n._(t`Previous`)}
        onClick={onPrevOverlay}
        disabled={jumpDisabled}
      />
      <Icon
        material="keyboard_arrow_down"
        tooltip={_i18n._(t`Next`)}
        onClick={onNextOverlay}
        disabled={jumpDisabled}
      />
      <Icon
        material="close"
        tooltip={_i18n._(t`Clear`)}
        onClick={onClear}
      />
    </div>
  );
});