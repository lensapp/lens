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
  bindGlobalFocusHotkey?: boolean;
  showClearIcon?: boolean;
  onClear?(): void;
}

const defaultProps: Partial<Props> = {
  autoFocus: true,
  bindGlobalFocusHotkey: true,
  showClearIcon: true,
  get placeholder() {
    return _i18n._(t`Search...`);
  },
};

@observer
export class SearchInput extends React.Component<Props> {
  static defaultProps = defaultProps as object;

  private inputRef = createRef<Input>();

  componentDidMount() {
    if (!this.props.bindGlobalFocusHotkey) return;
    window.addEventListener("keydown", this.onGlobalKey);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.onGlobalKey);
  }

  @autobind()
  onGlobalKey(evt: KeyboardEvent) {
    const meta = evt.metaKey || evt.ctrlKey;
    if (meta && evt.key === "f") {
      this.inputRef.current.focus();
    }
  }

  @autobind()
  onKeyDown(evt: React.KeyboardEvent<any>) {
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
  clear() {
    if (this.props.onClear) {
      this.props.onClear();
    } else {
      this.inputRef.current.setValue("");
    }
  }

  render() {
    const { className, compact, onClear, showClearIcon, bindGlobalFocusHotkey, value, ...inputProps } = this.props;
    let rightIcon = <Icon small material="search"/>;
    if (showClearIcon && value) {
      rightIcon = <Icon small material="close" onClick={this.clear}/>;
    }
    return (
      <Input
        {...inputProps}
        className={cssNames("SearchInput", className, { compact })}
        value={value}
        onKeyDown={this.onKeyDown}
        iconRight={rightIcon}
        ref={this.inputRef}
      />
    );
  }
}
