import "./search-input.scss";

import React from "react";
import debounce from "lodash/debounce"
import { autorun, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { t } from "@lingui/macro";
import { Icon } from "../icon";
import { cssNames } from "../../utils";
import { Input, InputProps } from "./input";
import { getSearch, setSearch } from "../../navigation";
import { _i18n } from '../../i18n';

interface Props extends InputProps {
  compact?: boolean; // show only search-icon when not focused
}

const defaultProps: Partial<Props> = {
  autoFocus: true,
  get placeholder() {
    return _i18n._(t`Search...`)
  },
}

@observer
export class SearchInput extends React.Component<Props> {
  static defaultProps = defaultProps as object;

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

  onKeyDown = (evt: React.KeyboardEvent<any>) => {
    if (this.props.onKeyDown) {
      this.props.onKeyDown(evt);
    }
    // clear on escape-key
    const escapeKey = evt.nativeEvent.code === "Escape";
    if (escapeKey) {
      this.clear();
      evt.stopPropagation();
    }
  }

  render() {
    const { inputVal } = this;
    const { className, compact, ...inputProps } = this.props;
    const icon = inputVal
      ? <Icon small material="close" onClick={this.clear}/>
      : <Icon small material="search"/>
    return (
      <Input
        {...inputProps}
        className={cssNames("SearchInput", className, { compact })}
        value={inputVal}
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        iconRight={icon}
      />
    )
  }
}
