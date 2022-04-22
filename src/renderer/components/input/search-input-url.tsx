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
import type { PageParam } from "../../navigation";
import { withInjectables } from "@ogre-tools/injectable-react";
import searchUrlPageParamInjectable from "./search-url-page-param.injectable";

export interface SearchInputUrlProps extends InputProps {
  compact?: boolean; // show only search-icon when not focused
}

interface Dependencies {
  searchUrlParam: PageParam<string>;
}

@observer
class NonInjectedSearchInputUrl extends React.Component<SearchInputUrlProps & Dependencies> {
  @observable inputVal = ""; // fix: use empty string on init to avoid react warnings

  readonly updateUrl = debounce((val: string) => this.props.searchUrlParam.set(val), 250);

  componentDidMount(): void {
    disposeOnUnmount(this, [
      autorun(() => this.inputVal = this.props.searchUrlParam.get()),
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

  constructor(props: SearchInputUrlProps & Dependencies) {
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

export const SearchInputUrl = withInjectables<Dependencies, SearchInputUrlProps>(NonInjectedSearchInputUrl, {
  getProps: (di, props) => ({
    ...props,
    searchUrlParam: di.inject(searchUrlPageParamInjectable),
  }),
});
