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

  @disposeOnUnmount
  updateInput = autorun(() => this.inputVal = searchUrlParam.get());
  updateUrl = debounce((val: string) => searchUrlParam.set(val), 250);

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
