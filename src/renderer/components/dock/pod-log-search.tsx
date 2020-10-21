import React from "react";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { Input } from "../input";
import { Button } from "@material-ui/core";
import { searchStore } from "./search.store";

export interface PodLogSearchProps {
  onSearch: (query: string) => void
  toPrevOverlay: () => void
  toNextOverlay: () => void
  logs: string[]
}

export const PodLogSearch = observer((props: PodLogSearchProps) => {
  const { logs, onSearch, toPrevOverlay, toNextOverlay } = props;
  const { setNextOverlayActive, setPrevOverlayActive } = searchStore;

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

  return (
    <div className="PodLogsSearch">
      <Input
        className={cssNames("SearchInput")}
        value={searchStore.searchQuery}
        onChange={setSearch}
      />
      {/* <span>{activeOverlay} / {totalOverlays}</span> */}
      <Button onClick={onPrevOverlay}>prev</Button>
      <Button onClick={onNextOverlay}>next</Button>
    </div>
  );
});