/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./search-input.scss";

import React, { createRef } from "react";
import { observer } from "mobx-react";
import { cssNames, autoBind } from "../../utils";
import { Icon } from "../icon";
import type { InputProps } from "./input";
import { Input } from "./input";
import { isMac } from "../../../common/vars";

export interface SearchInputProps extends InputProps {
  compact?: boolean; // show only search-icon when not focused
  bindGlobalFocusHotkey?: boolean;
  showClearIcon?: boolean;
  onClear?(): void;
}

const defaultProps: Partial<SearchInputProps> = {
  autoFocus: true,
  bindGlobalFocusHotkey: true,
  showClearIcon: true,
  placeholder: "Search...",
};

@observer
export class SearchInput extends React.Component<SearchInputProps> {
  static defaultProps = defaultProps as object;

  private inputRef = createRef<Input>();

  constructor(props: SearchInputProps) {
    super(props);
    autoBind(this);
  }

  componentDidMount() {
    if (!this.props.bindGlobalFocusHotkey) return;
    window.addEventListener("keydown", this.onGlobalKey);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.onGlobalKey);
  }

  onGlobalKey(evt: KeyboardEvent) {
    if (evt.key === "f" && (isMac ? evt.metaKey : evt.ctrlKey)) {
      this.inputRef.current?.focus();
    }
  }

  onKeyDown(evt: React.KeyboardEvent<any>) {
    this.props.onKeyDown?.(evt);

    if (evt.nativeEvent.code === "Escape") {
      this.clear();
      evt.stopPropagation();
    }
  }

  clear() {
    if (this.props.onClear) {
      this.props.onClear();
    } else {
      this.inputRef.current?.setValue("");
    }
  }

  render() {
    const { className, compact, onClear, showClearIcon, bindGlobalFocusHotkey, value, ...inputProps } = this.props;
    let rightIcon = <Icon small material="search"/>;

    if (showClearIcon && value) {
      rightIcon = (
        <Icon
          small
          material="close"
          onClick={this.clear}
        />
      );
    }

    return (
      <Input
        {...inputProps}
        className={cssNames("SearchInput", className, { compact })}
        value={value}
        onKeyDown={this.onKeyDown}
        iconRight={rightIcon}
        ref={this.inputRef}
        blurOnEnter={false}
      />
    );
  }
}
