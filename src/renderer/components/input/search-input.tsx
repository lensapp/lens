import "./search-input.scss";

import React, { createRef } from "react";
import { t } from "@lingui/macro";
import { observer } from "mobx-react";
import { _i18n } from "../../i18n";
import { autobind, cssNames } from "../../utils";
import { Icon } from "../icon";
import { Input, InputProps } from "./input";

interface Props extends InputProps {
  compact?: boolean; // show only search-icon when not focused
  closeIcon?: boolean;
  onClear?: () => void;
}

const defaultProps: Partial<Props> = {
  autoFocus: true,
  closeIcon: true,
  get placeholder() {
    return _i18n._(t`Search...`)
  },
}

@observer
export class SearchInput extends React.Component<Props> {
  static defaultProps = defaultProps as object;

  private input = createRef<Input>();

  componentDidMount() {
    addEventListener("keydown", this.focus);
  }

  componentWillUnmount() {
    removeEventListener("keydown", this.focus);
  }

  clear = () => {
    if (this.props.onClear) {
      this.props.onClear();
    }
  }

  onChange = (val: string, evt: React.ChangeEvent<any>) => {
    this.props.onChange(val, evt);
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

  @autobind()
  focus(evt: KeyboardEvent) {
    const meta = evt.metaKey || evt.ctrlKey;
    if (meta && evt.key == "f") {
      this.input.current.focus();
    }
  }

  render() {
    const { className, compact, closeIcon, onClear, ...inputProps } = this.props;
    const icon = this.props.value
      ? closeIcon ? <Icon small material="close" onClick={this.clear}/> : null
      : <Icon small material="search"/>
    return (
      <Input
        {...inputProps}
        className={cssNames("SearchInput", className, { compact })}
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        iconRight={icon}
        ref={this.input}
      />
    )
  }
}
