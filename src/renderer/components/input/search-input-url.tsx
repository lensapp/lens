import React from "react";
import debounce from "lodash/debounce";
import { observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { InputProps } from "./input";
import { SearchInput } from "./search-input";
import { createPageParam } from "../../navigation";
import { getSearchInput, setSearchInput } from "./search-input.storage";

export const searchUrlParam = createPageParam({
  name: "search",
  isSystem: true,
  defaultValue: "",
});

interface Props extends InputProps {
  isEnabled?: boolean;
  compact?: boolean; // show only search-icon when not focused
}

@observer
export class SearchInputUrl extends React.Component<Props> {
  @observable inputVal = ""; // fix: use empty string on init to avoid react warnings

  componentDidMount() {
    if (getSearchInput()) {
      this.inputVal = getSearchInput();
      searchUrlParam.set(getSearchInput());
    }
    else {
      this.inputVal = searchUrlParam.get();
    }

    disposeOnUnmount(this, [
      reaction(() => this.props.isEnabled, () => {
        if (!this.props.isEnabled) {
          this.clear();
        }
      })
    ]);
  }

  updateUrl = debounce((val: string) => searchUrlParam.set(val), 250);

  setValue = (value: string) => {
    this.inputVal = value;
    this.updateUrl(value);
    setSearchInput(value);
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

  render() {
    const { isEnabled, ...props } = this.props;

    return (
      <SearchInput
        value={this.inputVal}
        onChange={this.onChange}
        onClear={this.clear}
        {...props}
      />
    );
  }
}
