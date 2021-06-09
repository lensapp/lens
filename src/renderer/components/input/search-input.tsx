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

import "./search-input.scss";

import React, { createRef } from "react";
import { observer } from "mobx-react";
import { boundMethod, cssNames } from "../../utils";
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
    return `Search...`;
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

  @boundMethod
  onGlobalKey(evt: KeyboardEvent) {
    const meta = evt.metaKey || evt.ctrlKey;

    if (meta && evt.key === "f") {
      this.inputRef.current.focus();
    }
  }

  @boundMethod
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

  @boundMethod
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
