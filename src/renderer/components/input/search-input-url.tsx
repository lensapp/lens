/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import debounce from "lodash/debounce";
import { action, autorun, makeObservable, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { SearchInput, type SearchInputProps } from "./search-input";
import { createPageParam } from "../../navigation";
import { autoBind } from "../../../common/utils";

export const searchUrlParam = createPageParam({
  name: "search",
  defaultValue: "",
});

export interface SearchInputUrlProps extends SearchInputProps {
}

@observer
export class SearchInputUrl extends React.Component<SearchInputUrlProps> {
  @observable inputValueFromLocation = this.props.value ?? "";

  updateUrl = debounce((val: string) => searchUrlParam.set(val), 250);

  constructor(props: SearchInputProps) {
    super(props);
    makeObservable(this);
    autoBind(this);

    disposeOnUnmount(this, [
      autorun(() => this.inputValueFromLocation = searchUrlParam.get()),
    ]);
  }

  @action
  setValue(value: string) {
    this.inputValueFromLocation = value;
    this.updateUrl(value);
    this.updateUrl.flush();
  }

  clear() {
    this.setValue("");
    this.props.onClear?.();
  }

  onChange(val: string, evt: React.ChangeEvent<any>) {
    this.setValue(val);
    this.props.onChange?.(val, evt);
  }

  render() {
    const { value, ...searchInputProps } = this.props;

    return (
      <SearchInput
        {...searchInputProps}
        value={this.inputValueFromLocation}
        onChange={this.onChange}
        onClear={this.clear}
      />
    );
  }
}
