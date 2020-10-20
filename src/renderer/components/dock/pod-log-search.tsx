import React from "react";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { Input } from "../input";

interface Props {
  onSearch: (query: string) => void
  search: string
}

export const PodLogSearch = observer((props: Props) => {
  const { onSearch, search } = props;
  const setSearch = (query: string) => {
    onSearch(query);
  };
  return (
    <div className="PodLogsSearch">
      <Input
        className={cssNames("SearchInput")}
        value={search}
        onChange={setSearch}
      />
    </div>
  )
});