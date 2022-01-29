/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import debounce from "lodash/debounce";
import { autorun, observable, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import type { InputProps } from "./input";
import { SearchInput } from "./search-input";
import { createPageParam } from "../../navigation";

export const searchUrlParam = createPageParam({
  name: "search",
  defaultValue: "",
});

export interface SearchInputUrlProps extends InputProps {
  compact?: boolean; // show only search-icon when not focused
}

@observer
export class SearchInputUrl extends React.Component<SearchInputUrlProps> {
  @observable inputVal = ""; // fix: use empty string on init to avoid react warnings

  updateUrl = debounce((val: string) => searchUrlParam.set(val), 250);

  componentDidMount(): void {
    disposeOnUnmount(this, [
      autorun(() => this.inputVal = searchUrlParam.get()),
    ]);
  }

  setValue = (value: string) => {
    this.inputVal = value;
    this.updateUrl(value);
  };

  clear = () => {
    this.setValue("");
    this.updateUrl.flush();
  };

  onChange = (val: string, evt: React.ChangeEvent<any>) => {
    this.setValue(val);

    if (this.props.onChange) {
      this.props.onChange(val, evt);
    }
  };

  constructor(props: SearchInputUrlProps) {
    super(props);
    makeObservable(this);
  }

  render() {
    const { inputVal } = this;

    return (
      <SearchInput
        value={inputVal}
        onChange={this.onChange}
        onClear={this.clear}
        {...this.props}
      />
    );
  }
}
