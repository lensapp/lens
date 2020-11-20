import React from "react";
import debounce from "lodash/debounce";
import { autorun, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { getSearch, setSearch } from "../../navigation";
import { InputProps } from "./input";
import { SearchInput } from "./search-input";

interface Props extends InputProps {
  compact?: boolean; // show only search-icon when not focused
}

@observer
export class SearchInputUrl extends React.Component<Props> {
  @observable inputVal = ""; // fix: use empty string to avoid react warnings

  @disposeOnUnmount
  updateInput = autorun(() => this.inputVal = getSearch())
  updateUrl = debounce((val: string) => setSearch(val), 250)

  setValue = (value: string) => {
    this.inputVal = value;
    this.updateUrl(value);
  }

  clear = () => {
    this.setValue("");
    this.updateUrl.flush();
  }

  onChange = (val: string, evt: React.ChangeEvent<any>) => {
    this.setValue(val);
    if (this.props.onChange) {
      this.props.onChange(val, evt);
    }
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
    )
  }
}